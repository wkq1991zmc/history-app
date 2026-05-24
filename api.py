from fastapi import FastAPI, Header, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from openai import AsyncOpenAI
import os
import httpx
import asyncio
import json
import re
import secrets
import smtplib
import ssl
import time
import tempfile
import uuid
import hashlib
import sqlite3
from email.message import EmailMessage
from collections import defaultdict
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from load_data import EVENTS_DB 

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def serve_frontend():
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "找不到前端构建，请确保 static/index.html 存在"}

@app.get("/admin")
async def serve_admin():
    admin_path = os.path.join("static", "admin.html")
    if os.path.exists(admin_path):
        return FileResponse(admin_path)
    return {"message": "找不到后台页面"}

DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY")
DASHSCOPE_MODEL = os.environ.get("MINIPROGRAM_MODEL", "qwen-turbo")
dashscope_client = AsyncOpenAI(
    api_key=DASHSCOPE_API_KEY,
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    timeout=httpx.Timeout(180.0, connect=10.0),
)

GEMINI_API_KEY = os.environ.get("WEB_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("DASHSCOPE_API_KEY")
GEMINI_MODEL = os.environ.get("WEB_MODEL", "qwen3.6-plus") # 默认换成qwen的
WEB_FAST_MODEL = os.environ.get("WEB_FAST_MODEL", "qwen3.6-flash")
WEB_FAST_ENABLE_THINKING = os.environ.get("WEB_FAST_ENABLE_THINKING", "").lower() in ("1", "true", "yes", "on")
GEMINI_BASE_URL = os.environ.get("WEB_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
gemini_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=GEMINI_BASE_URL,
    timeout=httpx.Timeout(180.0, connect=10.0),
)

def _chat_model_extra_body(model: str, answer_mode: Optional[str]) -> Dict:
    if answer_mode == "fast" and model.startswith("qwen3") and not WEB_FAST_ENABLE_THINKING:
        return {"enable_thinking": False}
    return {}

# ======== API 限流保护 ========
rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 30
GUESS_GAME_PEOPLE = [
    "秦始皇", "李斯", "扶苏", "项羽", "刘邦", "韩信", "张良", "汉武帝", "司马迁", "王莽",
    "曹操", "刘备", "孙权", "诸葛亮", "周瑜", "司马懿", "王羲之", "谢安", "杨坚", "李世民",
    "武则天", "玄奘", "安禄山", "郭子仪", "赵匡胤", "王安石", "苏轼", "岳飞", "成吉思汗", "忽必烈",
    "朱元璋", "朱棣", "于谦", "王阳明", "张居正", "郑成功", "康熙", "乾隆", "林则徐", "曾国藩"
]
GUESS_PERSON_DYNASTIES = {
    "秦始皇": ["秦朝"], "李斯": ["秦朝"], "扶苏": ["秦朝"],
    "项羽": ["秦末汉初", "秦朝", "西汉"], "刘邦": ["秦末汉初", "西汉", "汉朝"],
    "韩信": ["西汉", "汉朝"], "张良": ["西汉", "汉朝"],
    "汉武帝": ["西汉", "汉朝"], "司马迁": ["西汉", "汉朝"], "王莽": ["新朝", "西汉"],
    "曹操": ["东汉", "三国"], "刘备": ["三国", "蜀汉"], "孙权": ["三国", "东吴"],
    "诸葛亮": ["三国", "蜀汉"], "周瑜": ["三国", "东吴"], "司马懿": ["三国", "曹魏", "西晋"],
    "王羲之": ["东晋", "晋朝"], "谢安": ["东晋", "晋朝"],
    "杨坚": ["隋朝"], "李世民": ["唐朝"], "武则天": ["唐朝", "武周"],
    "玄奘": ["唐朝"], "安禄山": ["唐朝"], "郭子仪": ["唐朝"],
    "赵匡胤": ["宋朝", "北宋"], "王安石": ["宋朝", "北宋"], "苏轼": ["宋朝", "北宋"], "岳飞": ["宋朝", "南宋"],
    "成吉思汗": ["蒙古帝国", "元朝"], "忽必烈": ["元朝", "蒙古帝国"],
    "朱元璋": ["明朝"], "朱棣": ["明朝"], "于谦": ["明朝"], "王阳明": ["明朝"], "张居正": ["明朝"],
    "郑成功": ["明末清初", "南明", "清朝"], "康熙": ["清朝"], "乾隆": ["清朝"], "林则徐": ["清朝"], "曾国藩": ["清朝"],
}
GUESS_DYNASTY_WORDS = [
    "秦朝", "西汉", "东汉", "汉朝", "新朝", "三国", "曹魏", "蜀汉", "东吴",
    "西晋", "东晋", "晋朝", "隋朝", "唐朝", "武周", "五代十国", "宋朝",
    "北宋", "南宋", "辽朝", "金朝", "蒙古帝国", "元朝", "明朝", "南明", "清朝"
]
guess_game_sessions = {}
time_travel_sessions = {}

# ======== 轻量访问统计，仅管理员可见 ========
ANALYTICS_DATA_DIR = Path("analytics_data").resolve()
ANALYTICS_DATA_DIR.mkdir(exist_ok=True)
ANALYTICS_SQLITE_FILE = Path(os.environ.get("ANALYTICS_SQLITE_FILE", ANALYTICS_DATA_DIR / "analytics.db")).resolve()
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
ADMIN_ANALYTICS_KEY = os.environ.get("ADMIN_ANALYTICS_KEY", "")
AUTH_DATA_DIR = Path("auth_data").resolve()
AUTH_SQLITE_FILE = Path(os.environ.get("AUTH_SQLITE_FILE", AUTH_DATA_DIR / "auth.db")).resolve()
AUTH_SECRET = os.environ.get("AUTH_SECRET", "local-dev-auth-secret")
AUTH_SESSION_DAYS = int(os.environ.get("AUTH_SESSION_DAYS", "30"))
AUTH_CODE_TTL_SECONDS = int(os.environ.get("AUTH_CODE_TTL_SECONDS", "600"))
AUTH_USE_MEMORY_DB = os.environ.get("AUTH_USE_MEMORY_DB", "").lower() in ("true", "1", "yes")
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip()
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USERNAME).strip()
SMTP_USE_SSL = os.environ.get("SMTP_USE_SSL", "").lower() in ("true", "1", "yes")
SMTP_STARTTLS = os.environ.get("SMTP_STARTTLS", "true").lower() not in ("false", "0", "no")
AUTH_EMAIL_DEV_MODE = os.environ.get("AUTH_EMAIL_DEV_MODE", "").lower() in ("true", "1", "yes")
TIME_TRAVEL_MODEL_TIMEOUT = float(os.environ.get("TIME_TRAVEL_MODEL_TIMEOUT", "120"))
TIME_TRAVEL_FAST_MODEL = os.environ.get("TIME_TRAVEL_FAST_MODEL", "qwen3.6-flash")
TIME_TRAVEL_FAST_TIMEOUT = float(os.environ.get("TIME_TRAVEL_FAST_TIMEOUT", "45"))
TIME_TRAVEL_FAST_ENABLE_THINKING = os.environ.get("TIME_TRAVEL_FAST_ENABLE_THINKING", "").lower() in ("1", "true", "yes", "on")
_AUTH_MEMORY_CONN = None
_AUTH_SQLITE_DISK_FAILED = False

class AnalyticsVisitRequest(BaseModel):
    path: Optional[str] = "/"
    referrer: Optional[str] = ""

class AnalyticsEventRequest(BaseModel):
    event_type: str
    event_name: Optional[str] = ""
    character: Optional[str] = ""
    detail: Optional[str] = ""

class FeedbackRequest(BaseModel):
    message: str
    email: Optional[str] = ""
    page: Optional[str] = ""
    event_name: Optional[str] = ""

class EmailCodeRequest(BaseModel):
    email: str

class EmailLoginRequest(BaseModel):
    email: str
    code: str

def _today_key() -> str:
    return time.strftime("%Y-%m-%d", time.localtime())

def _safe_analytics_key(value: str) -> str:
    text = (value or "unknown").strip()
    if not text:
        text = "unknown"
    return text[:120]

def _hash_visitor_id(visitor_id: str) -> str:
    return hashlib.sha256((visitor_id or "unknown").encode("utf-8")).hexdigest()[:16]

def _is_postgres() -> bool:
    return bool(DATABASE_URL) and DATABASE_URL.startswith(("postgres://", "postgresql://"))

def _postgres_url() -> str:
    if DATABASE_URL.startswith("postgres://"):
        return "postgresql://" + DATABASE_URL[len("postgres://"):]
    return DATABASE_URL

def _connect_db():
    if _is_postgres():
        import psycopg
        return psycopg.connect(_postgres_url())
    ANALYTICS_SQLITE_FILE.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(ANALYTICS_SQLITE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def _db_placeholder() -> str:
    return "%s" if _is_postgres() else "?"

def _connect_auth_memory_db():
    global _AUTH_MEMORY_CONN
    if _AUTH_MEMORY_CONN is None:
        _AUTH_MEMORY_CONN = sqlite3.connect(":memory:", check_same_thread=False)
        _AUTH_MEMORY_CONN.row_factory = sqlite3.Row
    return _AUTH_MEMORY_CONN

def _connect_auth_db():
    if _is_postgres():
        import psycopg
        return psycopg.connect(_postgres_url())
    if AUTH_USE_MEMORY_DB or _AUTH_SQLITE_DISK_FAILED:
        return _connect_auth_memory_db()
    AUTH_SQLITE_FILE.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(AUTH_SQLITE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def _init_analytics_db():
    with _connect_db() as conn:
        cur = conn.cursor()
        if _is_postgres():
            cur.execute("""
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id BIGSERIAL PRIMARY KEY,
                    action TEXT NOT NULL,
                    visitor_hash TEXT NOT NULL,
                    event_name TEXT DEFAULT '',
                    character TEXT DEFAULT '',
                    detail TEXT DEFAULT '',
                    day_key TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS feedback_messages (
                    id BIGSERIAL PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    message TEXT NOT NULL,
                    email TEXT DEFAULT '',
                    page TEXT DEFAULT '',
                    event_name TEXT DEFAULT '',
                    visitor_hash TEXT NOT NULL
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS chat_questions (
                    id BIGSERIAL PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    question TEXT NOT NULL,
                    event_name TEXT DEFAULT '',
                    character TEXT DEFAULT '',
                    answer_mode TEXT DEFAULT '',
                    visitor_hash TEXT NOT NULL
                )
            """)
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT NOT NULL,
                    visitor_hash TEXT NOT NULL,
                    event_name TEXT DEFAULT '',
                    character TEXT DEFAULT '',
                    detail TEXT DEFAULT '',
                    day_key TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS feedback_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TEXT NOT NULL,
                    message TEXT NOT NULL,
                    email TEXT DEFAULT '',
                    page TEXT DEFAULT '',
                    event_name TEXT DEFAULT '',
                    visitor_hash TEXT NOT NULL
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS chat_questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TEXT NOT NULL,
                    question TEXT NOT NULL,
                    event_name TEXT DEFAULT '',
                    character TEXT DEFAULT '',
                    answer_mode TEXT DEFAULT '',
                    visitor_hash TEXT NOT NULL
                )
            """)
        conn.commit()

def _fetch_all(cur) -> List[Dict]:
    columns = [item[0] for item in cur.description]
    return [dict(zip(columns, row)) for row in cur.fetchall()]

def _init_auth_db():
    global _AUTH_SQLITE_DISK_FAILED
    try:
        with _connect_auth_db() as conn:
            cur = conn.cursor()
            if _is_postgres():
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        created_at TEXT NOT NULL,
                        last_login_at TEXT NOT NULL
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS email_login_codes (
                        id BIGSERIAL PRIMARY KEY,
                        email TEXT NOT NULL,
                        code_hash TEXT NOT NULL,
                        expires_at DOUBLE PRECISION NOT NULL,
                        used_at TEXT DEFAULT '',
                        created_at TEXT NOT NULL,
                        attempts INTEGER DEFAULT 0
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        id BIGSERIAL PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        token_hash TEXT UNIQUE NOT NULL,
                        expires_at DOUBLE PRECISION NOT NULL,
                        created_at TEXT NOT NULL,
                        revoked_at TEXT DEFAULT ''
                    )
                """)
            else:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        created_at TEXT NOT NULL,
                        last_login_at TEXT NOT NULL
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS email_login_codes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT NOT NULL,
                        code_hash TEXT NOT NULL,
                        expires_at REAL NOT NULL,
                        used_at TEXT DEFAULT '',
                        created_at TEXT NOT NULL,
                        attempts INTEGER DEFAULT 0
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id TEXT NOT NULL,
                        token_hash TEXT UNIQUE NOT NULL,
                        expires_at REAL NOT NULL,
                        created_at TEXT NOT NULL,
                        revoked_at TEXT DEFAULT ''
                    )
                """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_email_login_codes_email ON email_login_codes(email)")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash)")
            conn.commit()
    except sqlite3.OperationalError as exc:
        if _is_postgres() or _AUTH_SQLITE_DISK_FAILED:
            raise
        print(f"本地登录数据库不可用，已切换到内存数据库: {exc}")
        _AUTH_SQLITE_DISK_FAILED = True
        _init_auth_db()

def _row_to_dict(row) -> Dict:
    if row is None:
        return {}
    if isinstance(row, sqlite3.Row):
        return dict(row)
    return dict(row) if hasattr(row, "keys") else {}

def _normalize_email(email: str) -> str:
    value = (email or "").strip().lower()
    if len(value) > 120 or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value):
        raise HTTPException(status_code=400, detail="邮箱格式不正确")
    return value

def _now_text() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

def _hash_login_code(email: str, code: str) -> str:
    raw = f"{email}:{code}:{AUTH_SECRET}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def _hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def _make_login_code() -> str:
    return f"{secrets.randbelow(1000000):06d}"

def _smtp_configured() -> bool:
    return bool(SMTP_HOST and SMTP_FROM)

def _auth_dev_code_enabled() -> bool:
    return AUTH_EMAIL_DEV_MODE or (not _smtp_configured() and not _is_postgres())

def _send_login_code_email(email: str, code: str):
    if not _smtp_configured():
        if _auth_dev_code_enabled():
            return
        raise HTTPException(status_code=503, detail="邮件服务还没有配置")

    msg = EmailMessage()
    msg["Subject"] = "时空印证系统登录验证码"
    msg["From"] = SMTP_FROM
    msg["To"] = email
    msg.set_content(
        f"你的登录验证码是：{code}\n\n"
        f"验证码将在 {AUTH_CODE_TTL_SECONDS // 60} 分钟后过期。"
    )

    try:
        if SMTP_USE_SSL:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context, timeout=15) as server:
                if SMTP_USERNAME and SMTP_PASSWORD:
                    server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
                if SMTP_STARTTLS:
                    server.starttls(context=ssl.create_default_context())
                if SMTP_USERNAME and SMTP_PASSWORD:
                    server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
    except Exception as exc:
        print(f"发送登录邮件失败: {exc}")
        raise HTTPException(status_code=503, detail="验证码邮件发送失败，请稍后再试")

def _create_or_update_user(email: str) -> Dict:
    _init_auth_db()
    now = _now_text()
    p = _db_placeholder()
    with _connect_auth_db() as conn:
        cur = conn.cursor()
        cur.execute(f"SELECT id, email, created_at, last_login_at FROM users WHERE email = {p}", (email,))
        row = cur.fetchone()
        if row:
            user_id = row[0]
            cur.execute(f"UPDATE users SET last_login_at = {p} WHERE id = {p}", (now, user_id))
        else:
            user_id = str(uuid.uuid4())
            cur.execute(
                f"INSERT INTO users (id, email, created_at, last_login_at) VALUES ({p}, {p}, {p}, {p})",
                (user_id, email, now, now),
            )
        conn.commit()
        cur.execute(f"SELECT id, email, created_at, last_login_at FROM users WHERE id = {p}", (user_id,))
        row = cur.fetchone()
    return {
        "id": row[0],
        "email": row[1],
        "created_at": row[2],
        "last_login_at": row[3],
    }

def _create_user_session(user_id: str) -> str:
    _init_auth_db()
    token = secrets.token_urlsafe(32)
    token_hash = _hash_session_token(token)
    expires_at = time.time() + AUTH_SESSION_DAYS * 86400
    p = _db_placeholder()
    with _connect_auth_db() as conn:
        conn.execute(
            f"INSERT INTO user_sessions (user_id, token_hash, expires_at, created_at) VALUES ({p}, {p}, {p}, {p})",
            (user_id, token_hash, expires_at, _now_text()),
        )
        conn.commit()
    return token

def _get_auth_token(authorization: Optional[str], x_auth_token: Optional[str]) -> str:
    if x_auth_token:
        return x_auth_token.strip()
    text = (authorization or "").strip()
    if text.lower().startswith("bearer "):
        return text[7:].strip()
    return ""

def _get_user_by_token(token: str) -> Optional[Dict]:
    if not token:
        return None
    _init_auth_db()
    p = _db_placeholder()
    token_hash = _hash_session_token(token)
    with _connect_auth_db() as conn:
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT u.id, u.email, u.created_at, u.last_login_at
            FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = {p}
              AND s.revoked_at = ''
              AND s.expires_at > {p}
            LIMIT 1
            """,
            (token_hash, time.time()),
        )
        row = cur.fetchone()
    if not row:
        return None
    return {
        "id": row[0],
        "email": row[1],
        "created_at": row[2],
        "last_login_at": row[3],
    }

def _record_analytics(action: str, visitor_id: str = "", event_name: str = "", character: str = "", detail: str = ""):
    _init_analytics_db()
    now = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    values = (
        action,
        _hash_visitor_id(visitor_id),
        _safe_analytics_key(event_name),
        _safe_analytics_key(character),
        (detail or "")[:200],
        _today_key(),
        now,
    )
    p = _db_placeholder()
    with _connect_db() as conn:
        conn.execute(
            f"""INSERT INTO analytics_events
                (action, visitor_hash, event_name, character, detail, day_key, created_at)
                VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p})""",
            values,
        )
        conn.commit()

def _log_analytics_failure(context: str, exc: Exception):
    print(f"统计记录失败 [{context}]: {exc}")

def _safe_record_analytics(action: str, visitor_id: str = "", event_name: str = "", character: str = "", detail: str = "") -> bool:
    try:
        _record_analytics(action, visitor_id, event_name, character, detail)
        return True
    except Exception as exc:
        _log_analytics_failure(action, exc)
        return False

def _safe_record_chat_question(request, visitor_id: str) -> bool:
    try:
        _record_chat_question(request, visitor_id)
        return True
    except Exception as exc:
        _log_analytics_failure("chat_question", exc)
        return False

def _record_feedback(req: FeedbackRequest, visitor_id: str):
    message = (req.message or "").strip()
    email = (req.email or "").strip()
    if len(message) < 2:
        raise HTTPException(status_code=400, detail="反馈内容太短")
    if len(message) > 1200:
        raise HTTPException(status_code=400, detail="反馈内容请控制在1200字以内")
    if email and (len(email) > 120 or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email)):
        raise HTTPException(status_code=400, detail="邮箱格式不正确")

    _init_analytics_db()
    now = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    p = _db_placeholder()
    values = (
        now,
        message,
        email,
        (req.page or "")[:200],
        (req.event_name or "")[:120],
        _hash_visitor_id(visitor_id),
    )
    with _connect_db() as conn:
        conn.execute(
            f"""INSERT INTO feedback_messages
                (created_at, message, email, page, event_name, visitor_hash)
                VALUES ({p}, {p}, {p}, {p}, {p}, {p})""",
            values,
        )
        conn.commit()
    _safe_record_analytics("feedback", visitor_id, req.event_name or "", "", message[:40])

def _should_record_chat_question(message: str) -> bool:
    text = (message or "").strip()
    if len(text) < 2:
        return False
    synthetic_prefixes = ("前辈", "前輩")
    if any(text.startswith(prefix) for prefix in synthetic_prefixes):
        return False
    return not ("刚才" in text and "高见" in text)

def _record_chat_question(request, visitor_id: str):
    if getattr(request, "track_question", True) is False:
        return
    if not _should_record_chat_question(request.message):
        return
    _init_analytics_db()
    now = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    p = _db_placeholder()
    values = (
        now,
        request.message.strip()[:800],
        _safe_analytics_key(request.event_name),
        _safe_analytics_key(request.character),
        _safe_analytics_key(request.answer_mode or ""),
        _hash_visitor_id(visitor_id),
    )
    with _connect_db() as conn:
        conn.execute(
            f"""INSERT INTO chat_questions
                (created_at, question, event_name, character, answer_mode, visitor_hash)
                VALUES ({p}, {p}, {p}, {p}, {p}, {p})""",
            values,
        )
        conn.commit()

def _require_admin_key(key: Optional[str], x_admin_key: Optional[str]):
    expected = ADMIN_ANALYTICS_KEY.strip()
    provided = (x_admin_key or key or "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="管理员统计密码未配置")
    if provided != expected:
        raise HTTPException(status_code=403, detail="无权查看统计后台")

def _analytics_count(cur, action: str) -> int:
    p = _db_placeholder()
    cur.execute(f"SELECT COUNT(*) AS count FROM analytics_events WHERE action = {p}", (action,))
    return int(cur.fetchone()[0])

def _analytics_totals(cur) -> Dict:
    cur.execute("SELECT COUNT(DISTINCT visitor_hash) AS count FROM analytics_events")
    unique_visitors = int(cur.fetchone()[0])
    cur.execute("SELECT COUNT(*) AS count FROM feedback_messages")
    feedbacks = int(cur.fetchone()[0])
    cur.execute("SELECT COUNT(*) AS count FROM chat_questions")
    questions = int(cur.fetchone()[0])
    return {
        "visits": _analytics_count(cur, "visit"),
        "unique_visitors": unique_visitors,
        "event_views": _analytics_count(cur, "event_view"),
        "chats": _analytics_count(cur, "chat"),
        "guess_actions": _analytics_count(cur, "guess_action"),
        "feedbacks": feedbacks,
        "questions": questions,
    }

def _admin_analytics_payload() -> Dict:
    _init_analytics_db()
    with _connect_db() as conn:
        cur = conn.cursor()
        totals = _analytics_totals(cur)
        cur.execute("""
            SELECT
                day_key AS date,
                SUM(CASE WHEN action = 'visit' THEN 1 ELSE 0 END) AS visits,
                COUNT(DISTINCT visitor_hash) AS unique_visitors,
                SUM(CASE WHEN action = 'event_view' THEN 1 ELSE 0 END) AS event_views,
                SUM(CASE WHEN action = 'chat' THEN 1 ELSE 0 END) AS chats,
                SUM(CASE WHEN action = 'guess_action' THEN 1 ELSE 0 END) AS guess_actions
            FROM analytics_events
            GROUP BY day_key
            ORDER BY day_key DESC
            LIMIT 14
        """)
        days = _fetch_all(cur)
        cur.execute("""
            SELECT event_name AS name, COUNT(*) AS views
            FROM analytics_events
            WHERE action = 'event_view'
            GROUP BY event_name
            ORDER BY views DESC
            LIMIT 8
        """)
        top_events_by_views = _fetch_all(cur)
        cur.execute("""
            SELECT event_name AS name, COUNT(*) AS chats
            FROM analytics_events
            WHERE action = 'chat'
            GROUP BY event_name
            ORDER BY chats DESC
            LIMIT 8
        """)
        top_events_by_chats = _fetch_all(cur)
        cur.execute("""
            SELECT character AS name, COUNT(*) AS chats
            FROM analytics_events
            WHERE action = 'chat'
            GROUP BY character
            ORDER BY chats DESC
            LIMIT 8
        """)
        top_characters = _fetch_all(cur)
        cur.execute("""
            SELECT created_at AS time, action, event_name, character, detail
            FROM analytics_events
            ORDER BY id DESC
            LIMIT 50
        """)
        recent = _fetch_all(cur)
        cur.execute("""
            SELECT created_at AS time, message, email, page, event_name
            FROM feedback_messages
            ORDER BY id DESC
            LIMIT 50
        """)
        feedbacks = _fetch_all(cur)
        cur.execute("""
            SELECT created_at AS time, question, event_name, character, answer_mode
            FROM chat_questions
            ORDER BY id DESC
            LIMIT 80
        """)
        questions = _fetch_all(cur)
    return {
        "success": True,
        "totals": totals,
        "days": days,
        "top_events_by_views": top_events_by_views,
        "top_events_by_chats": top_events_by_chats,
        "top_characters": top_characters,
        "recent": recent,
        "feedbacks": feedbacks,
        "questions": questions,
    }

@app.post("/analytics/visit")
async def analytics_visit(req: AnalyticsVisitRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    recorded = _safe_record_analytics("visit", x_client_id or "anonymous", detail=req.path or "/")
    return {"success": True, "recorded": recorded}

@app.post("/analytics/event")
async def analytics_event(req: AnalyticsEventRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    if req.event_type not in ("event_view", "guess_action", "time_travel"):
        raise HTTPException(status_code=400, detail="未知统计事件")
    recorded = _safe_record_analytics(req.event_type, x_client_id or "anonymous", req.event_name or "", req.character or "", req.detail or "")
    return {"success": True, "recorded": recorded}

@app.post("/feedback")
async def submit_feedback(req: FeedbackRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    visitor_id = x_client_id or "anonymous"
    if not check_rate_limit(f"feedback-{visitor_id}"):
        raise HTTPException(status_code=429, detail="提交太频繁，请稍后再试")
    _record_feedback(req, visitor_id)
    return {"success": True, "message": "反馈已收到，感谢你愿意帮我改进。"}

@app.get("/site_config")
async def site_config():
    return {
        "success": True,
        "contact_email": os.environ.get("PUBLIC_CONTACT_EMAIL", "").strip()
    }

@app.post("/auth/email/request_code")
async def request_email_code(req: EmailCodeRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    email = _normalize_email(req.email)
    visitor_id = x_client_id or "anonymous"
    if not check_rate_limit(f"email-code-{visitor_id}") or not check_rate_limit(f"email-code-{email}"):
        raise HTTPException(status_code=429, detail="验证码请求太频繁，请稍后再试")

    _init_auth_db()
    code = _make_login_code()
    p = _db_placeholder()
    with _connect_auth_db() as conn:
        conn.execute(
            f"""INSERT INTO email_login_codes
                (email, code_hash, expires_at, created_at)
                VALUES ({p}, {p}, {p}, {p})""",
            (email, _hash_login_code(email, code), time.time() + AUTH_CODE_TTL_SECONDS, _now_text()),
        )
        conn.commit()

    _send_login_code_email(email, code)
    payload = {
        "success": True,
        "message": "验证码已发送，请查看邮箱。"
    }
    if _auth_dev_code_enabled():
        payload["dev_code"] = code
        payload["message"] = "本地开发验证码已生成。"
    return payload

@app.post("/auth/email/login")
async def email_login(req: EmailLoginRequest):
    email = _normalize_email(req.email)
    code = (req.code or "").strip()
    if not re.match(r"^\d{6}$", code):
        raise HTTPException(status_code=400, detail="验证码格式不正确")

    _init_auth_db()
    p = _db_placeholder()
    with _connect_auth_db() as conn:
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT id, code_hash, attempts
            FROM email_login_codes
            WHERE email = {p}
              AND used_at = ''
              AND expires_at > {p}
            ORDER BY id DESC
            LIMIT 1
            """,
            (email, time.time()),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="验证码已过期，请重新获取")
        code_id, code_hash, attempts = row[0], row[1], int(row[2] or 0)
        if attempts >= 5:
            raise HTTPException(status_code=400, detail="验证码尝试次数过多，请重新获取")
        if code_hash != _hash_login_code(email, code):
            cur.execute(f"UPDATE email_login_codes SET attempts = attempts + 1 WHERE id = {p}", (code_id,))
            conn.commit()
            raise HTTPException(status_code=400, detail="验证码不正确")
        cur.execute(f"UPDATE email_login_codes SET used_at = {p} WHERE id = {p}", (_now_text(), code_id))
        conn.commit()

    user = _create_or_update_user(email)
    token = _create_user_session(user["id"])
    return {"success": True, "token": token, "user": user}

@app.get("/auth/me")
async def auth_me(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_auth_token: Optional[str] = Header(None, alias="X-AUTH-TOKEN"),
):
    token = _get_auth_token(authorization, x_auth_token)
    user = _get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="未登录")
    return {"success": True, "user": user}

@app.post("/auth/logout")
async def auth_logout(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_auth_token: Optional[str] = Header(None, alias="X-AUTH-TOKEN"),
):
    token = _get_auth_token(authorization, x_auth_token)
    if token:
        _init_auth_db()
        p = _db_placeholder()
        with _connect_auth_db() as conn:
            conn.execute(
                f"UPDATE user_sessions SET revoked_at = {p} WHERE token_hash = {p}",
                (_now_text(), _hash_session_token(token)),
            )
            conn.commit()
    return {"success": True}

@app.get("/admin/analytics")
async def admin_analytics(key: Optional[str] = None, x_admin_key: Optional[str] = Header(None, alias="X-ADMIN-KEY")):
    _require_admin_key(key, x_admin_key)
    try:
        return _admin_analytics_payload()
    except Exception as exc:
        _log_analytics_failure("admin_payload", exc)
        raise HTTPException(status_code=503, detail="统计数据库暂时不可用，请检查 analytics_data 或数据库配置")

def check_rate_limit(player_id: str) -> bool:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    rate_limit_store[player_id] = [t for t in rate_limit_store[player_id] if t > window_start]
    if len(rate_limit_store[player_id]) >= RATE_LIMIT_MAX:
        return False
    rate_limit_store[player_id].append(now)
    return True

def get_request_user_id(
    x_wx_openid: Optional[str] = Header(None, alias="X-WX-OPENID"),
    x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID"),
) -> str:
    user_id = (x_wx_openid or x_client_id or "").strip()
    if not user_id:
        raise HTTPException(status_code=401, detail="缺少用户身份")
    if not USER_ID_PATTERN.match(user_id):
        raise HTTPException(status_code=400, detail="非法用户ID")
    return user_id

# ======== 🌟 用户隔离系统全局配置 ========
WX_APP_ID = os.environ.get("WX_APP_ID", "")
WX_APP_SECRET = os.environ.get("WX_APP_SECRET", "")
DEV_MODE = os.environ.get("DEV_MODE", "").lower() in ("true", "1", "yes")

class LoginRequest(BaseModel):
    code: str

class GuessGameStartRequest(BaseModel):
    user_seed: Optional[str] = ""

class GuessGameAskRequest(BaseModel):
    session_id: str
    question: str

class GuessGameTurnRequest(BaseModel):
    session_id: str
    transcript: List[Dict]

class GuessGameGuessRequest(BaseModel):
    session_id: str
    guess: str

class GuessGameRevealRequest(BaseModel):
    session_id: str

class TimeTravelStartRequest(BaseModel):
    seed: Optional[str] = ""

class TimeTravelChoiceRequest(BaseModel):
    session_id: str
    choice_id: str

class TimeTravelTalkRequest(BaseModel):
    session_id: str
    message: str
    person: Optional[str] = ""

def _normalize_person_name(name: str) -> str:
    return re.sub(r"[\s·・，。！？、,.!?《》〈〉“”\"'’‘]", "", name or "").lower()

def _format_event_deep_context(event_data: Dict, character: str) -> str:
    lines = []
    source_notes = event_data.get("source_notes") or []
    misconceptions = event_data.get("common_misconceptions") or []
    debate_points = event_data.get("debate_points") or []
    key_questions = event_data.get("key_questions") or []
    variables = event_data.get("counterfactual_variables") or []
    character_cards = event_data.get("character_cards") or {}
    character_card = character_cards.get(character) if isinstance(character_cards, dict) else None

    if source_notes:
        lines.append("【史实依据与边界】")
        lines.extend(f"- {item}" for item in source_notes[:4])
    if misconceptions:
        lines.append("【常见误解修正】")
        lines.extend(f"- {item}" for item in misconceptions[:4])
    if debate_points:
        lines.append("【可讨论的争议点】")
        lines.extend(f"- {item}" for item in debate_points[:4])
    if key_questions:
        lines.append("【适合深入回答的问题方向】")
        lines.extend(f"- {item}" for item in key_questions[:5])
    if variables:
        lines.append("【历史推演变量】")
        for item in variables[:4]:
            if isinstance(item, dict):
                variable = item.get("variable", "")
                effect = item.get("likely_effect", "")
                lines.append(f"- {variable}：{effect}")
    if isinstance(character_card, dict):
        lines.append(f"【{character}人物卡】")
        for key, label in (
            ("stance", "立场"),
            ("fear", "恐惧"),
            ("blind_spot", "盲点"),
            ("answer_style", "回答风格"),
        ):
            if character_card.get(key):
                lines.append(f"- {label}：{character_card[key]}")

    return "\n".join(lines)

def _format_event_fast_context(event_data: Dict, character: str) -> str:
    lines = []
    source_notes = event_data.get("source_notes") or []
    misconceptions = event_data.get("common_misconceptions") or []
    character_cards = event_data.get("character_cards") or {}
    character_card = character_cards.get(character) if isinstance(character_cards, dict) else None

    if source_notes:
        lines.append("【核心史实边界】")
        lines.extend(f"- {item}" for item in source_notes[:2])
    if misconceptions:
        lines.append("【容易误解处】")
        lines.extend(f"- {item}" for item in misconceptions[:2])
    if isinstance(character_card, dict):
        lines.append(f"【{character}人物口吻】")
        for key, label in (
            ("stance", "立场"),
            ("fear", "顾虑"),
            ("blind_spot", "盲点"),
            ("answer_style", "回答风格"),
        ):
            if character_card.get(key):
                lines.append(f"- {label}: {character_card[key]}")

    return "\n".join(lines)

def _chat_mode_instruction(answer_mode: Optional[str]) -> str:
    if answer_mode == "fast":
        return (
            "本轮是快速模式：回答要快，但不能浅。请用2到4句讲清楚，至少包含一个具体史实依据、"
            "一个因果判断或处境判断。不要只回一句空泛结论，不要展开成长篇。"
        )
    return (
        "本轮是专家模式：短而准，重史实、重处境、重因果。"
        "【半原文】控制在80字以内，【白话文解】控制在120字以内；"
        "除非用户明确要求展开，否则不要铺陈长背景。"
    )

def _chat_turn_instruction(followup_question_rule: str, answer_mode: Optional[str]) -> str:
    return f"{_chat_mode_instruction(answer_mode)}\n{followup_question_rule}"

def _yes_no_only(raw_answer: str) -> str:
    answer = (raw_answer or "").strip()
    first_yes = answer.find("是")
    first_no = answer.find("不是")
    if first_no != -1 and (first_yes == -1 or first_no <= first_yes):
        return "不是"
    if first_yes != -1:
        return "是"
    return "不是"

def _brief_judge_answer(raw_answer: str, secret_person: str) -> str:
    answer = re.sub(r"\s+", " ", (raw_answer or "").strip())
    answer = re.sub(r"^(AI\s*答[:：]\s*)", "", answer)
    if secret_person:
        answer = answer.replace(secret_person, "此人")
    if not re.match(r"^(是|不是|有争议|不确定)", answer):
        answer = _yes_no_only(answer)
    sentences = re.split(r"(?<=[。！？!?])", answer)
    clean = "".join(sentences[:2]).strip(" ，,;；")
    if len(clean) > 48:
        clean = clean[:48].rstrip("，,。；;") + "。"
    return clean or "不确定。"

def _is_specific_person_guess(text: str) -> bool:
    compact = re.sub(r"\s+", "", text or "")
    guess_patterns = [
        r"你的.{0,4}(人物|角色|答案).{0,4}是.{1,12}[吗么？?]",
        r"^(是不是|是否是|是).{2,12}[吗么？?]$",
    ]
    return any(re.search(pattern, compact) for pattern in guess_patterns)

def _looks_like_yes_no_question(text: str) -> bool:
    compact = re.sub(r"\s+", "", text or "")
    if not compact:
        return False
    blocked = ("是谁", "叫什么", "答案", "设定的是谁", "告诉我", "透露", "我的是")
    if any(word in compact for word in blocked):
        return False
    yes_no_markers = ("吗", "么", "是否", "是不是", "能否", "能不能", "有没有", "有没有可能", "是", "不是")
    return any(marker in compact for marker in yes_no_markers)

def _answer_known_guess_fact(person: str, question: str) -> Optional[str]:
    compact = re.sub(r"\s+", "", question or "")
    if any(word in compact for word in ("之前", "以后", "之后", "以前", "早于", "晚于")):
        return None
    asked_dynasties = [dynasty for dynasty in GUESS_DYNASTY_WORDS if dynasty in compact]
    if not asked_dynasties:
        return None
    person_dynasties = GUESS_PERSON_DYNASTIES.get(person, [])
    is_match = any(dynasty in person_dynasties for dynasty in asked_dynasties)
    if is_match:
        dynasty_text = "、".join(asked_dynasties)
        if person == "成吉思汗" and "元朝" in asked_dynasties:
            return "是。严格说生前元朝未建，但通常归入蒙古/元脉络。"
        return f"是。常见分类可归入{dynasty_text}。"
    return f"不是。常见分类更接近{'、'.join(person_dynasties) or '其他时代'}。"

def _fallback_guess_question(transcript: List[Dict]) -> str:
    used = {item.get("text", "") for item in transcript if item.get("side") == "ai_question"}
    questions = [
        "此人是否主要活跃在秦汉以后？",
        "此人是否以政治或军事成就闻名？",
        "此人是否生活在唐宋以前？",
        "此人是否曾经掌握过国家最高权力？",
        "此人是否更常被归为文臣或思想家？",
        "此人是否和战争或军事指挥关系密切？",
        "此人是否活跃在三国两晋南北朝附近？",
        "此人是否主要活跃在明清时期？",
    ]
    for question in questions:
        if question not in used:
            return question
    return "此人是否在中国历史上拥有很高知名度？"

def _pick_guess_person(seed_text: str = "") -> str:
    seed = sum(ord(ch) for ch in (seed_text or str(time.time())))
    return GUESS_GAME_PEOPLE[seed % len(GUESS_GAME_PEOPLE)]

def _get_guess_session(session_id: str) -> Dict:
    session = guess_game_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="游戏会话不存在，请重新开始")
    return session

def _extract_json_object(raw_text: str) -> Dict:
    clean = (raw_text or "").strip()
    fence_match = re.search(r"```(?:json)?\s*(.*?)\s*```", clean, re.DOTALL)
    if fence_match:
        clean = fence_match.group(1).strip()
    brace_match = re.search(r"\{.*\}", clean, re.DOTALL)
    if brace_match:
        clean = brace_match.group(0)
    return json.loads(clean)

INTRIGUE_SCENES = [
    {
        "scene_id": "qin_shaqiu_edict",
        "title": "沙丘诏书",
        "era": "秦朝",
        "year": "公元前210年",
        "location": "上郡军中",
        "brief": "始皇帝巡游在外，行在消息迟迟未明。一封由中车府令赵高、丞相李斯相关的诏书抵达上郡，命公子扶苏自尽，蒙恬交出兵权。军中人心震动，但诏书名义上来自皇帝。",
        "public_state": "始皇帝巡游在外，行在消息迟迟未明。一封诏书抵达上郡，命公子扶苏自尽，蒙恬交出兵权。军中人心震动，但诏书名义上来自皇帝。",
        "hidden_truth": "秦始皇已死，赵高、李斯、胡亥秘不发丧，并以始皇帝名义矫诏夺权。",
        "stakes": "扶苏要在守法守孝、诏书真伪、边军安危和宫廷夺权风险之间做决断。",
        "npc_context": "公开可知：始皇帝巡游在外，行在消息迟迟未明；上郡只收到命扶苏自尽、蒙恬交兵权的诏书。局中人可以怀疑诏书来路、印信、使者和赵高李斯相关安排，但不能确认始皇帝已经驾崩，也不能知道胡亥即位等后事。",
        "forbidden_knowledge": [
            "始皇帝已经死亡、驾崩、崩逝、大行、宾天",
            "赵高、李斯、胡亥伪造诏书是已经坐实的事实",
            "胡亥即位、赵高得势、秦朝崩解等后续正史"
        ],
        "forbidden_patterns": [
            "始皇帝(已|已经|早已)?(死|驾崩|崩逝|大行|宾天|殡天)[了]?",
            "皇帝(已|已经|早已)?(死|驾崩|崩逝|大行|宾天|殡天)[了]?",
            "陛下(已|已经|早已)?(死|驾崩|崩逝|大行|宾天|殡天)[了]?",
            "始皇(已|已经|早已)?(死|驾崩|崩逝|大行|宾天|殡天)[了]?",
            "胡亥(即位|登基|继位)",
            "赵高(得势|专权)",
            "秦朝(很快)?(崩解|灭亡)"
        ],
        "branch_axes": [
            {"key": "verify_in_xianyang", "label": "亲赴咸阳核验", "keywords": ["咸阳", "面圣", "进京", "亲自", "查明", "核验"], "plan": "扶苏暂不自尽，由蒙恬稳住上郡军，扶苏亲自赴咸阳核验诏书来源，并要求公开始皇帝行在真实状况。", "impact": "扶苏离开上郡核验诏书，会逼迫沙丘一方提前暴露或动用道路与宫禁控制拦截扶苏。"},
            {"key": "detain_envoy", "label": "扣留使者验诏", "keywords": ["扣留", "使者", "印信", "诏书", "封泥"], "plan": "先扣留使者并验明印信、诏书来路，再决定是否奉诏。", "impact": "上郡军暂时压住诏书执行，但抗诏名义会迅速升高，军中也会分化。"},
            {"key": "public_council", "label": "公开召集将吏议诏", "keywords": ["召集", "将吏", "公开", "共议", "军议"], "plan": "召集军中将吏共同验诏，把奉诏与否变成公开军议。", "impact": "责任被摊开，军心更稳，但消息也更容易外泄。"}
        ],
        "historical_anchor": [
            "《史记》记载，秦始皇死于沙丘平台后，赵高、李斯与胡亥秘不发丧。",
            "扶苏、蒙恬收到赐死诏书后，扶苏自杀，蒙恬疑诏而被囚。",
            "胡亥即位后，秦政更急，帝国内部裂痕迅速扩大。"
        ],
        "orthodox_history": "正史中，扶苏接诏后自杀，蒙恬虽怀疑诏书却未能扭转局面。胡亥即位，赵高得势，秦朝很快走向崩解。",
        "roles": [
            {"name": "扶苏", "identity": "秦始皇长子", "power": "有名分，但受诏书压制", "goal": "既要守孝守法，又要判断诏书真假。"},
            {"name": "蒙恬", "identity": "北边主将", "power": "握有边军威望", "goal": "保全军心，避免被伪诏夺兵。"},
            {"name": "军中使者", "identity": "传诏来使", "power": "手持皇帝诏书", "goal": "催促扶苏、蒙恬立刻奉诏。"},
            {"name": "上郡军吏", "identity": "边军属吏", "power": "熟悉军中粮道与士气", "goal": "避免边防动荡，也怕卷入宫廷大变。"}
        ],
        "openings": [
            {"speaker": "军中使者", "text": "诏书已至，公子与将军不可迟疑。若军中再议，便是抗诏。"},
            {"speaker": "蒙恬", "text": "陛下在外，诏书来得急促，印信虽在，事理却未必无疑。公子，当先问清来路。"},
            {"speaker": "上郡军吏", "text": "边军一乱，匈奴在北，咸阳在南。此事若处置失当，未必只伤一人。"}
        ],
        "choices": [
            {"id": "A", "text": "先不奉诏，扣留使者，派亲信快马去咸阳核验。", "risk": "高", "hint": "有机会识破伪诏，也可能被定为抗命。"},
            {"id": "B", "text": "扶苏暂避锋芒，由蒙恬控制军营，等待始皇帝公开消息。", "risk": "中高", "hint": "保留筹码，但军中名义压力很大。"},
            {"id": "C", "text": "按诏书行事，以守臣子之礼。", "risk": "极高", "hint": "最合表面法度，却会把主动权交给胡亥、赵高。"},
            {"id": "D", "text": "召集军中将吏共同验诏，把责任变成公开议决。", "risk": "中", "hint": "能稳住部分军心，也会拖长冲突。"}
        ],
    },
    {
        "scene_id": "han_baideng_court",
        "title": "白登之后的朝议",
        "era": "西汉",
        "year": "公元前200年后",
        "location": "长安朝堂",
        "brief": "刘邦刚从白登之围脱身。匈奴骑兵的压力真实存在，汉朝又刚结束楚汉战争，民力、财力和军心都在恢复边缘。朝堂必须决定：立刻复仇、暂行和亲、整顿边防，还是另寻牵制之策。",
        "public_state": "刘邦刚从白登之围脱身。匈奴骑兵的压力真实存在，汉朝又刚结束楚汉战争，民力、财力和军心都在恢复边缘。",
        "hidden_truth": "汉初国力尚弱，长期和亲、边防与休养生息为后来反击匈奴积累条件。",
        "stakes": "朝堂争论的是皇帝威望、军心、边防安全和新朝承受长期战争的能力。",
        "npc_context": "公开可知：刘邦刚从白登之围脱身，朝堂知道汉军受挫、国力未复、匈奴仍强。局中人不能知道后世文景之治或汉武帝大规模反击的完整结果，只能从当下国力和边患推断。",
        "forbidden_knowledge": [
            "后世文景之治的完整结果",
            "汉武帝时期主动反击匈奴的完整后事"
        ],
        "forbidden_patterns": [
            "文景之治",
            "汉武帝(时期)?(大规模)?(反击|北伐|征伐)匈奴",
            "后世"
        ],
        "branch_axes": [
            {"key": "immediate_revenge", "label": "立即北上复仇", "keywords": ["北上", "北伐", "回击", "反击", "复仇", "报仇", "雪耻", "出兵", "主战", "大获全胜"], "plan": "立即北上回击匈奴，吸取白登之围中皇帝与主力脱节的教训，集中主力主动寻战，争取一战雪耻。", "impact": "汉军会重新集结主力，试图用粮道、斥候和步骑配合弥补白登之失，但汉初民力未复，风险极高。"},
            {"key": "limited_counterattack", "label": "有限反击", "keywords": ["小规模", "有限", "夺回", "军心", "声势"], "plan": "以有限反击夺回军心和边境声势，但避免立刻陷入全面决战。", "impact": "军心会得到安抚，也可能刺激匈奴报复，朝廷仍要准备后续边防。"},
            {"key": "heqin_recover", "label": "和亲休养", "keywords": ["和亲", "休养", "稳住", "国力", "百姓", "粮草"], "plan": "暂行和亲以稳边，同时保护民力粮仓，等待国力恢复。", "impact": "朝廷会承受屈辱和军中不满，但能把危机转为长期准备。"},
            {"key": "mixed_strategy", "label": "外和内备", "keywords": ["边防", "骑兵", "马政", "暗修", "训练", "互市"], "plan": "表面和亲稳边，暗中整顿边防、蓄养马政与骑兵。", "impact": "短期避战，长期积累反制匈奴的条件。"}
        ],
        "historical_anchor": [
            "《史记》《汉书》记载，刘邦曾被匈奴围于白登，后脱险。",
            "汉初国力未稳，长期采用和亲、边防、休养生息并行的策略。",
            "到汉武帝时期，汉朝才转入大规模主动反击匈奴。"
        ],
        "orthodox_history": "正史中，汉初没有立刻全面北伐，而是以和亲、互市、边防和休养生息争取时间。这个选择屈辱但现实，为文景之治和后来的反击积累了条件。",
        "roles": [
            {"name": "刘邦", "identity": "汉帝国开国皇帝", "power": "最终拍板", "goal": "既要保住皇帝威望，又不能把新朝拖入无底战事。"},
            {"name": "萧何", "identity": "相国", "power": "掌财政与后方", "goal": "保护民力粮仓，避免新朝财政被北伐耗空。"},
            {"name": "樊哙", "identity": "武将", "power": "代表军中血气", "goal": "维护军心和汉军尊严，反对过度退让。"},
            {"name": "张良", "identity": "谋臣", "power": "以谋略影响皇帝", "goal": "用时间换空间，避免被匈奴牵着走。"}
        ],
        "openings": [
            {"speaker": "樊哙", "text": "陛下新脱白登之围，军中皆以为耻。若此时只言和亲，边将如何抬头？"},
            {"speaker": "萧何", "text": "楚汉之战才息，关中仓廪未实。今日若轻言大举北伐，明年百姓又从何处出粮？"},
            {"speaker": "张良", "text": "匈奴强在骑兵与草原纵深，汉强在田亩、城邑与制度。此时争一日之气，未必胜过争十年之势。"}
        ],
        "choices": [
            {"id": "A", "text": "主张暂行和亲，先稳边境，再整顿国力。", "risk": "低", "hint": "现实稳妥，但会被武将视为屈辱。"},
            {"id": "B", "text": "主张小规模反击，夺回声势，但避免全面决战。", "risk": "中", "hint": "能安抚军心，也可能刺激匈奴报复。"},
            {"id": "C", "text": "主张全国动员北伐，趁皇帝威望尚在雪耻。", "risk": "极高", "hint": "最振奋，也最可能耗空新朝。"},
            {"id": "D", "text": "主张一边和亲，一边暗修边塞、训练骑兵。", "risk": "中低", "hint": "表面退让，实则换取准备时间。"}
        ],
    },
    {
        "scene_id": "han_tui_en_ling",
        "title": "推恩令前夜",
        "era": "西汉",
        "year": "汉武帝时期",
        "location": "未央宫议政殿",
        "brief": "诸侯王势力仍大，直接削藩容易激起反叛；放任不管，又会让中央权威被慢慢架空。主父偃提出让诸侯把封地分给更多子弟，名义上是施恩，实际上是切碎诸侯国。",
        "public_state": "诸侯王势力仍大，直接削藩容易激起反叛；放任不管，又会让中央权威被慢慢架空。主父偃提出让诸侯把封地分给更多子弟，名义上是施恩。",
        "hidden_truth": "推恩令会让诸侯国在继承中不断分小，中央逐步收回控制力。",
        "stakes": "汉武帝要在中央集权、诸侯反弹、制度名义和削藩速度之间选择。",
        "proposal_stage": "未颁布",
        "npc_context": "公开可知：诸侯王势力仍大，七国之乱的记忆未远，主父偃刚提出以推恩名义分封诸侯子弟；推恩令尚未颁布，仍是朝议中的方案。局中人不能说“收回成命”“前功尽弃”或把它当成既定国策，只能根据制度逻辑和当下风险判断。",
        "forbidden_knowledge": [
            "推恩令最终长期奏效的完整后世结果",
            "推恩令已经发布或已经成为成命"
        ],
        "forbidden_patterns": [
            "最终(会|将)?长期奏效",
            "后世",
            "正史证明",
            "收回成命",
            "前功尽弃",
            "已经(颁布|施行|推行|下诏)",
            "既然陛下已经(决定|下诏|颁令)",
            "成命"
        ],
        "branch_axes": [
            {"key": "postpone", "label": "暂缓推恩", "keywords": ["暂缓", "暂时不要", "不要实施", "不实施", "先不", "放弃", "搁置", "缓行"], "plan": "暂缓推恩令，不立刻把主父偃的方案变成正式诏令，先观察诸侯反应并另设约束。", "impact": "朝廷不会立刻启动推恩分封，诸侯短期松一口气，但中央削弱封国的窗口也会被拖延。"},
            {"key": "tui_en", "label": "推恩分封", "keywords": ["推恩", "分封", "子弟", "继承", "施恩"], "plan": "以推恩令名义分封诸侯子弟，让封国在继承中自然分小。", "impact": "中央以恩赏名义改写继承规则，诸侯短期较难公开反对，但制度拉扯会持续加深。"},
            {"key": "direct_cut", "label": "直接削藩", "keywords": ["削藩", "削地", "夺地", "强压", "武力"], "plan": "直接削去强藩土地，以皇权压服诸侯。", "impact": "见效快，但会显著提高诸侯联合反弹的风险。"},
            {"key": "appease", "label": "暂缓安抚", "keywords": ["暂缓", "赏赐", "联姻", "安抚"], "plan": "暂缓削藩，先用赏赐和联姻安抚诸侯。", "impact": "短期平稳，但中央权威被架空的问题仍会积累。"},
            {"key": "system_combo", "label": "制度组合削藩", "keywords": ["监察", "财政", "迁徙", "配合", "一起推进"], "plan": "推恩令配合监察、迁徙和财政控制一起推进。", "impact": "更系统，但更容易让诸侯察觉中央收权意图。"}
        ],
        "historical_anchor": [
            "汉景帝时期七国之乱显示，诸侯王问题已经威胁中央。",
            "汉武帝采纳主父偃建议，推行推恩令。",
            "推恩令以制度方式削弱诸侯，比直接强攻更稳。"
        ],
        "orthodox_history": "正史中，汉武帝采用主父偃的推恩令，让诸侯国在继承中不断分小，中央逐步收回控制力。这是削藩史上很聪明的一步。",
        "roles": [
            {"name": "汉武帝", "identity": "皇帝", "power": "最高决策", "goal": "加强中央权力，同时避免立刻引发诸侯反弹。"},
            {"name": "主父偃", "identity": "谋臣", "power": "提出制度方案", "goal": "用看似施恩的办法拆解诸侯根基。"},
            {"name": "诸侯王使者", "identity": "封国代表", "power": "能传达诸侯不满", "goal": "保住封国完整和王室利益。"},
            {"name": "朝中老臣", "identity": "谨慎派大臣", "power": "影响朝议风向", "goal": "担心削藩过急，重演七国之乱。"}
        ],
        "openings": [
            {"speaker": "主父偃", "text": "陛下若明削诸侯，天下皆知中央逼迫；若名为推恩，使诸侯子弟皆得封土，则势分而怨轻。"},
            {"speaker": "诸侯王使者", "text": "诸侯世守宗庙，若朝廷一纸令下便分割国土，恐怕各国都难安心。"},
            {"speaker": "朝中老臣", "text": "七国之乱未远。削藩要削，但一步踏错，便是兵连祸结。"}
        ],
        "choices": [
            {"id": "A", "text": "支持推恩令，用继承规则慢慢拆小诸侯国。", "risk": "中低", "hint": "温和而有效，但需要长期执行。"},
            {"id": "B", "text": "主张直接削去强藩土地，以皇权压服诸侯。", "risk": "高", "hint": "见效快，也最容易逼反。"},
            {"id": "C", "text": "暂缓削藩，先用赏赐和联姻安抚诸侯。", "risk": "中", "hint": "短期平稳，长期问题仍在。"},
            {"id": "D", "text": "推恩令配合监察、迁徙和财政控制一起推进。", "risk": "中", "hint": "更系统，但会引发更多贵族不满。"}
        ],
    },
]

def _pick_intrigue_scene(seed_text: str = "") -> Dict:
    seed = int(hashlib.sha256((seed_text or str(time.time())).encode("utf-8")).hexdigest()[:8], 16)
    return INTRIGUE_SCENES[seed % len(INTRIGUE_SCENES)]

def _decision_maker_name(scene: Dict) -> str:
    return {
        "qin_shaqiu_edict": "扶苏",
        "han_baideng_court": "刘邦",
        "han_tui_en_ling": "汉武帝",
    }.get(scene.get("scene_id", ""), "")

def _role_by_name(scene: Dict, name: str) -> Dict:
    return next((role for role in scene.get("roles", []) if role.get("name") == name), {})

def _build_initial_adviser_debate(scene: Dict, user_role: Dict) -> List[Dict]:
    scene_id = scene.get("scene_id", "")
    if scene_id == "qin_shaqiu_edict":
        return [
            {"speaker": "军中使者", "role": "传诏来使", "text": "诏书已至，公子不可迟疑。若军中再议，便是抗诏。", "kind": "ai"},
            {"speaker": "蒙恬", "role": "北边主将", "text": "诏命关乎公子性命与边军安危。臣以为，诏书来得急促，仍当验明来路。", "kind": "ai"},
            {"speaker": "上郡军吏", "role": "边军属吏", "text": "若奉诏，公子性命不保；若不奉诏，军中便有抗命之名。此事须先稳住营中人心。", "kind": "ai"},
        ]
    if scene_id == "han_baideng_court":
        return [
            {"speaker": "樊哙", "role": "武将", "text": "白登之围，军中皆以为耻。若今日只言和亲，边将如何抬头？", "kind": "ai"},
            {"speaker": "萧何", "role": "相国", "text": "国库未丰，百姓未安。若此时倾力北伐，粮草从何而出？", "kind": "ai"},
            {"speaker": "张良", "role": "谋臣", "text": "匈奴强在骑兵与草原纵深。若要复仇，先要问能否不再落入白登之局。", "kind": "ai"},
        ]
    if scene_id == "han_tui_en_ling":
        return [
            {"speaker": "主父偃", "role": "谋臣", "text": "明削诸侯，诸侯必怨；名为推恩，使其子弟皆得封土，则势分而怨轻。", "kind": "ai"},
            {"speaker": "诸侯王使者", "role": "封国代表", "text": "诸侯世守宗庙，若朝廷以推恩为名分割国土，各国岂能安心？", "kind": "ai"},
            {"speaker": "朝中老臣", "role": "谨慎派大臣", "text": "七国之乱未远。削藩要削，但若一步太急，便是兵连祸结。", "kind": "ai"},
        ]
    people = [role for role in scene.get("roles", []) if role.get("name") != user_role.get("name")]
    return [
        {"speaker": role.get("name", "局中人"), "role": role.get("identity", "参与者"), "text": role.get("goal", "臣愿听候决断。"), "kind": "ai"}
        for role in people[:3]
    ]

def _build_intrigue_payload(scene: Dict, seed_text: str = "") -> Dict:
    seed = int(hashlib.sha256((seed_text + scene["scene_id"]).encode("utf-8")).hexdigest()[:8], 16)
    roles = scene.get("roles", [])
    decision_name = _decision_maker_name(scene)
    decision_maker = _role_by_name(scene, decision_name) or (roles[0] if roles else {})
    user_role = decision_maker or {"name": "决策者", "identity": "历史现场决策者", "power": "最高决策", "goal": "在约束中做出判断。"}
    people = [role for role in roles if role.get("name") != user_role.get("name")]
    counterpart_candidates = [
        role for role in roles
        if role.get("name") != user_role.get("name")
    ]
    counterpart = counterpart_candidates[(seed // 7) % len(counterpart_candidates)] if counterpart_candidates else {}
    public_state = scene.get("public_state") or scene.get("brief", "")
    scene_text = (
        f"{public_state}\n\n"
        f"你的任务：你就是「{user_role.get('name')}」，需要听取众人意见，亲自追问并做出决定。"
        "你可以继续询问，也可以直接下令；一旦下令，本局历史会按你的决定推演。"
    ).strip()
    dialogue = _build_initial_adviser_debate(scene, user_role)
    return {
        "mode": "intrigue",
        "scene_id": scene.get("scene_id", ""),
        "title": scene.get("title", "入局"),
        "era": scene.get("era", ""),
        "year": scene.get("year", ""),
        "location": scene.get("location", ""),
        "brief": scene.get("brief", ""),
        "public_state": public_state,
        "hidden_truth": scene.get("hidden_truth", ""),
        "stakes": scene.get("stakes", ""),
        "proposal_stage": scene.get("proposal_stage", ""),
        "npc_context": scene.get("npc_context", ""),
        "forbidden_knowledge": scene.get("forbidden_knowledge", []),
        "forbidden_patterns": scene.get("forbidden_patterns", []),
        "branch_axes": scene.get("branch_axes", []),
        "historical_anchor": scene.get("historical_anchor", []),
        "orthodox_history": scene.get("orthodox_history", ""),
        "user_role": user_role,
        "decision_maker": decision_maker,
        "counterpart": counterpart,
        "round": 0,
        "dialogue": dialogue,
        "character": {
            "age": "",
            "gender": "",
            "height": "",
            "weight": "",
            "identity": f"{user_role.get('name')} · {user_role.get('identity')}",
            "appearance": f"权力边界：{user_role.get('power')}。目标：{user_role.get('goal')}"
        },
        "status": {},
        "scene": scene_text,
        "encountered": [
            {"name": role.get("name", "局中人"), "role": role.get("identity", "参与者"), "attitude": role.get("goal", "观望")}
            for role in people[:4]
        ],
        "choices": [],
        "ended": False,
        "ending": ""
    }

def _travel_default_payload() -> Dict:
    return _build_intrigue_payload(INTRIGUE_SCENES[1], "default")

def _travel_system_prompt() -> str:
    return """你是一个严谨的中国历史“入局”玩法导演。
游戏定位：用户进入一个有正史约束的历史决策现场，并扮演最终决策者。AI 只扮演臣子、将领、使者、旁白，不替用户做决定。
硬规则：
1. 不许出现现代物品、现代制度、玄幻能力、系统面板梗。
2. 正史是参照，不是剧情枷锁；本局历史可以因玩家的决定而改变。若玩家下令，必须让本局行动真的发生，并继续推演改变后的局势。
3. NPC 必须按自己的身份、利益和时代见识说话，不能替用户开天眼。
4. 必须直接回应玩家刚才的问题或命令，不要只说“有理但仍受约束”这类空话。
5. 叙事要有历史质感，但语言要让现代用户能读懂。
6. 如果用户越出现实条件、身份职责或时代知识，NPC 或旁白要指出来。
7. 旁白可以说“正史中如何”，但不能用正史强行覆盖本局已经发生的分支。
8. 不得随意编造夸张兵力、财政或地理条件；若没有明确依据，用“主力”“亲卫”“边军”“数路兵马”等模糊但可信的表述。
9. 必须只返回 JSON，不要解释。"""

def _clamp_int(value, low=0, high=100) -> int:
    try:
        number = int(value)
    except Exception:
        number = low
    return max(low, min(high, number))

def _normalize_travel_payload(data: Dict, fallback: Optional[Dict] = None) -> Dict:
    base = fallback or _travel_default_payload()
    if not isinstance(data, dict):
        data = {}
    payload = dict(base)
    for key in (
        "mode", "scene_id", "title", "era", "year", "location", "scene", "ending",
        "brief", "public_state", "hidden_truth", "stakes", "npc_context",
        "orthodox_history", "result", "narration", "player_plan", "branch_key"
    ):
        if data.get(key):
            payload[key] = str(data.get(key))[:1600]
    for list_key in ("forbidden_knowledge", "forbidden_patterns", "branch_axes"):
        if isinstance(data.get(list_key), list):
            payload[list_key] = data[list_key][:12]
    if isinstance(data.get("historical_anchor"), list):
        payload["historical_anchor"] = [str(item)[:220] for item in data["historical_anchor"][:5]]
    for role_key in ("user_role", "decision_maker", "counterpart"):
        if isinstance(data.get(role_key), dict):
            role_data = dict(base.get(role_key, {}))
            role_data.update({k: str(v)[:160] for k, v in data[role_key].items() if v is not None})
            payload[role_key] = role_data
    if "round" in data:
        payload["round"] = _clamp_int(data.get("round"), 0, 20)
    if isinstance(data.get("dialogue"), list):
        dialogue = []
        for item in data["dialogue"][-24:]:
            if isinstance(item, dict):
                dialogue.append({
                    "speaker": str(item.get("speaker") or "局中人")[:24],
                    "role": str(item.get("role") or "")[:36],
                    "text": str(item.get("text") or "")[:1200],
                    "kind": str(item.get("kind") or "ai")[:16],
                })
        payload["dialogue"] = dialogue
    payload["ended"] = bool(data.get("ended", payload.get("ended", False)))
    if isinstance(data.get("character"), dict):
        character = dict(base.get("character", {}))
        character.update({k: str(v)[:120] for k, v in data["character"].items() if v is not None})
        payload["character"] = character
    if isinstance(data.get("status"), dict):
        status = dict(base.get("status", {}))
        for key in ("health", "hunger", "money", "reputation", "danger", "historical_fit", "role_fit", "persuasion", "risk_control", "tension"):
            if key in data["status"]:
                status[key] = _clamp_int(data["status"][key], 0, 100)
        payload["status"] = status
    if isinstance(data.get("encountered"), list):
        people = []
        for item in data["encountered"][:4]:
            if isinstance(item, dict):
                people.append({
                    "name": str(item.get("name") or "陌生人")[:24],
                    "role": str(item.get("role") or "路人")[:36],
                    "attitude": str(item.get("attitude") or "观望")[:60],
                })
        if people:
            payload["encountered"] = people
    choices = []
    if isinstance(data.get("choices"), list):
        for index, item in enumerate(data["choices"][:4]):
            if not isinstance(item, dict):
                continue
            choices.append({
                "id": str(item.get("id") or chr(65 + index))[:8],
                "text": str(item.get("text") or "")[:120],
                "risk": str(item.get("risk") or "中")[:12],
                "hint": str(item.get("hint") or "")[:120],
            })
    if len(choices) >= 2:
        payload["choices"] = choices[:4]
    return payload

def _intrigue_choice_fallback(current: Dict, selected: Dict) -> Dict:
    status = dict(current.get("status", {}))
    choice_text = selected.get("text", "谨慎发言")
    risk_text = selected.get("risk", "中")
    tension_delta = 8 if "高" in risk_text or "极高" in risk_text else 2
    status["persuasion"] = _clamp_int(status.get("persuasion", 55) + 7)
    status["role_fit"] = _clamp_int(status.get("role_fit", 70) + 4)
    status["risk_control"] = _clamp_int(status.get("risk_control", 55) - tension_delta + 4)
    status["tension"] = _clamp_int(status.get("tension", 65) + tension_delta)
    result = f"你提出「{choice_text}」。朝堂没有立刻定论，但这句话把争论从情绪拉回到利害权衡。"
    scene = (
        f"{result}\n\n"
        "局中人开始重新估量这一步的代价：有人看重名分与军心，有人担心粮草、边防和朝廷威信。"
        "这不是一键改写历史的时刻，而是一次在有限条件里争取更好结果的发言。"
    )
    return _normalize_travel_payload({
        **current,
        "result": result,
        "scene": scene,
        "narration": f"旁白：若此议被采纳，局势大概率会短暂偏向你的立场，但仍要受兵力、财政与名义约束。正史中，{current.get('orthodox_history', '')}",
        "status": status,
        "choices": [
            {"id": "A", "text": "补充理由，把主张说得更能落地。", "risk": "低", "hint": "提高说服力，但不会制造奇迹。"},
            {"id": "B", "text": "请反对者先说出最大担忧，再逐条回应。", "risk": "中", "hint": "能打开局面，也可能暴露弱点。"},
            {"id": "C", "text": "退一步提出折中方案，保住核心目标。", "risk": "中低", "hint": "更稳，但立场会显得不够强。"},
            {"id": "D", "text": "要求立刻拍板执行，抢占主动。", "risk": "高", "hint": "有气势，也容易激化反弹。"}
        ],
        "ended": False,
    }, fallback=current)

def _intrigue_talk_fallback(current: Dict, person_name: str, message: str) -> Dict:
    round_no = int(current.get("round") or 0) + 1
    counterpart = current.get("counterpart") or {"name": person_name or "另一位大臣", "identity": "朝臣", "goal": "谨慎观望"}
    plan = _intrigue_player_plan(current, message)
    short_message = (message or "你的主张").strip()[:80]
    if _intrigue_is_player_decision(message):
        resolution = _intrigue_resolution_text(current, message)
        messages = [
            {
                "speaker": counterpart.get("name", "另一位大臣"),
                "role": counterpart.get("identity", "朝臣"),
                "text": f"臣明白您的决断：{plan}。此令一出，局势便会转向新路；但臣仍要提醒：{counterpart.get('goal', '此策不能只看一时得失。')}",
                "kind": "ai",
            },
            {
                "speaker": "旁白",
                "role": "本局推演 / 正史对照",
                "text": resolution,
                "kind": "system",
            },
        ]
        return {
            "messages": messages,
            "ended": True,
            "ending": "你已经做出决定，本局进入新的历史分支。",
            "round": round_no,
        }
    if _intrigue_wants_all_advisers(message):
        people = current.get("encountered") or []
        address = _intrigue_address(current)
        messages = []
        for person in people[:4]:
            concern = person.get("attitude") or person.get("goal") or "此事仍要看兵力、民力与名义能否相合"
            messages.append({
                "speaker": person.get("name", "朝臣"),
                "role": person.get("role") or person.get("identity") or "朝臣",
                "text": f"{address}既命臣等各陈所见，臣以为：{concern}。若要继续推进，还需先定第一步由谁执行、若有反复由谁收束。",
                "kind": "ai",
            })
        if messages:
            return {
                "messages": messages,
                "ended": False,
                "ending": "",
                "round": round_no,
            }
    messages = [
        {
            "speaker": counterpart.get("name", "另一位大臣"),
            "role": counterpart.get("identity", "朝臣"),
            "text": f"臣听见您问「{short_message}」。若按此思路推进，关键不在口号，而在第一步由谁执行、失败时如何收场。臣所忧者是：{counterpart.get('goal', '此事必须说明风险由谁承担。')}",
            "kind": "ai",
        },
    ]
    return {
        "messages": messages,
        "ended": False,
        "ending": "",
        "round": round_no,
    }

def _intrigue_player_plan(current: Dict, message: str) -> str:
    text = message or ""
    scene_id = current.get("scene_id", "")
    if text.startswith(("扶苏暂不自尽", "立即北上回击匈奴", "以推恩令名义", "削藩不单靠武力")):
        return text[:180]
    branch = _intrigue_branch_axis(current, text)
    if branch and branch.get("plan"):
        return str(branch.get("plan"))[:220]
    if scene_id == "qin_shaqiu_edict":
        if any(word in text for word in ("京城", "咸阳", "面圣", "进京", "查明", "核验", "亲自")):
            if any(word in text for word in ("亲自", "自己", "扶苏", "面圣", "进京", "咸阳")):
                return "扶苏暂不自尽，由蒙恬稳住上郡军，扶苏亲自赴咸阳核验诏书来源，并要求公开始皇帝真实状况"
            return "暂不奉诏，先扣留使者、稳住军中，再派可信之人赴咸阳核验诏书来源"
        if any(word in text for word in ("扣留", "使者", "印信", "诏书")):
            return "先扣留使者并验明印信、诏书来路，再决定是否奉诏"
        return "暂缓自尽与交兵权，先查清诏命来源，再决定下一步"
    if scene_id == "han_baideng_court":
        war_words = ("北上", "北伐", "回击", "反击", "复仇", "报仇", "雪耻", "报白登", "大获全胜", "攻打", "出兵", "主战")
        full_war_words = ("必须", "决定", "定能", "大获全胜", "主力", "全面", "立刻", "马上", "倾国", "举兵")
        if any(word in text for word in war_words) and any(word in text for word in full_war_words):
            return "立即北上回击匈奴，吸取白登之围中皇帝与主力脱节的教训，集中主力主动寻战，争取一战雪耻"
        if any(word in text for word in war_words):
            return "不做全面北伐，只以有限反击夺回军心，并避免再次陷入匈奴主场"
        if any(word in text for word in ("和亲", "休养", "稳住", "国力", "边防", "骑兵")):
            return "暂行和亲以稳边，同时整顿边防、蓄养马政与骑兵，等待国力恢复"
        return "先保全汉初国力，再寻找反制匈奴的时机"
    if scene_id == "han_tui_en_ling":
        if any(word in text for word in ("推恩", "分封", "子弟", "继承")):
            return "以推恩令名义分封诸侯子弟，让封国在继承中自然分小"
        if any(word in text for word in ("削藩", "监察", "财政", "迁徙")):
            return "削藩不单靠武力，而以监察、财政和迁徙制度配合推进"
        return "削弱诸侯但避免立刻逼反，以制度方式慢慢收权"
    return text.strip()[:120] or "先稳住局面，再作下一步判断"

def _intrigue_branch_axis(current: Dict, message: str) -> Optional[Dict]:
    text = message or ""
    best_axis = None
    best_score = 0
    for axis in current.get("branch_axes") or []:
        if not isinstance(axis, dict):
            continue
        keywords = axis.get("keywords") or []
        score = sum(1 for word in keywords if str(word) and str(word) in text)
        if axis.get("key") in ("postpone", "appease"):
            score += sum(2 for word in ("不", "不要", "暂缓", "暂时", "先不", "放弃", "搁置", "缓行") if word in text)
        if score > best_score:
            best_axis = axis
            best_score = score
    return best_axis if best_score > 0 else None

def _intrigue_intent(current: Dict, message: str) -> str:
    text = (message or "").strip()
    if _intrigue_is_unclear_message(current, text):
        return "unclear"
    if _intrigue_wants_all_advisers(text):
        return "ask_all"
    if _intrigue_is_player_decision(text):
        return "command"
    if any(mark in text for mark in ("？", "?", "如何", "为何", "为什么", "可否", "是否", "吗", "么")):
        return "ask"
    return "debate"

def _intrigue_is_player_decision(message: str) -> bool:
    text = message or ""
    decision_words = (
        "我决定", "朕决定", "孤决定", "下令", "传令", "命", "采纳", "准奏",
        "就这么办", "照此", "按此", "必须", "立刻", "马上", "我要", "我不",
        "我意已决", "决意", "不自尽", "北上", "出兵", "推行", "实行", "颁布",
        "暂缓", "放弃", "不要实施", "不实施", "先不"
    )
    question_marks = ("?", "？", "如何", "可否", "是否", "吗", "么")
    return any(word in text for word in decision_words) and not text.strip().endswith(question_marks)

def _intrigue_wants_all_advisers(message: str) -> bool:
    text = message or ""
    all_words = ("各位", "诸位", "大家", "所有人", "你们都", "都说", "分别说", "逐一", "每个人", "一人一句")
    ask_words = ("想法", "意见", "看法", "怎么想", "说说", "陈奏", "表态", "怎么看")
    return any(word in text for word in all_words) and any(word in text for word in ask_words)

def _intrigue_address(current: Dict) -> str:
    user = current.get("user_role", {}) or {}
    name = user.get("name") or current.get("character", {}).get("name") or ""
    identity = user.get("identity") or ""
    if "皇帝" in identity or name in ("刘邦", "汉武帝"):
        return "陛下"
    if name == "扶苏" or "公子" in identity:
        return "公子"
    return "主上"

def _intrigue_prompt_state(current: Dict) -> Dict:
    visible_roles = []
    role_sources = current.get("encountered") or []
    for role in role_sources:
        if not isinstance(role, dict):
            continue
        visible_roles.append({
            "name": role.get("name", ""),
            "role": role.get("role", ""),
            "position": role.get("attitude", ""),
        })
    branch_options = []
    for axis in current.get("branch_axes") or []:
        if not isinstance(axis, dict):
            continue
        branch_options.append({
            "key": axis.get("key", ""),
            "label": axis.get("label", ""),
        })
    state = {
        "scene_id": current.get("scene_id", ""),
        "title": current.get("title", ""),
        "era": current.get("era", ""),
        "year": current.get("year", ""),
        "location": current.get("location", ""),
        "public_state": current.get("public_state") or current.get("brief") or current.get("scene", ""),
        "stakes": current.get("stakes", ""),
        "proposal_stage": current.get("proposal_stage", ""),
        "user_role": current.get("user_role", {}),
        "visible_roles": visible_roles,
        "branch_options": branch_options,
        "dialogue": list(current.get("dialogue") or [])[-12:],
        "round": int(current.get("round") or 0),
    }
    if current.get("scene_id") == "qin_shaqiu_edict" and not state.get("public_state"):
        state["public_state"] = "始皇帝巡游在外，行在消息迟迟未明；上郡只收到命扶苏自尽、蒙恬交兵权的诏书。"
    return state

def _intrigue_npc_context(current: Dict) -> str:
    if current.get("npc_context"):
        return str(current.get("npc_context"))
    if current.get("scene_id") == "qin_shaqiu_edict":
        return "公开可知：始皇帝巡游在外，行在消息迟迟未明；上郡只收到命扶苏自尽、蒙恬交兵权的诏书。局中人可以怀疑诏书来路、印信、使者和赵高李斯相关安排，但不能确认始皇帝已经驾崩，也不能知道胡亥即位等后事。"
    return "只允许依据当下公开信息与自身身份判断。"

def _intrigue_forbidden_knowledge(current: Dict) -> List[str]:
    if current.get("forbidden_knowledge"):
        return list(current.get("forbidden_knowledge") or [])
    if current.get("scene_id") == "qin_shaqiu_edict":
        return [
            "始皇帝已经死亡、驾崩、崩逝、大行、宾天",
            "赵高、李斯、胡亥伪造诏书是已经坐实的事实",
            "胡亥即位、赵高得势、秦朝崩解等后续正史",
        ]
    return []

def _sanitize_intrigue_forbidden_knowledge(current: Dict, messages: List[Dict]) -> List[Dict]:
    configured_patterns = [str(item) for item in (current.get("forbidden_patterns") or []) if item]
    if not configured_patterns and current.get("scene_id") != "qin_shaqiu_edict":
        return messages
    patterns = configured_patterns or [
        r"始皇帝(已|已经|早已)?(死|驾崩|崩逝|大行|宾天|殡天)[了]?",
        r"皇帝(已|已经|早已)?(死|驾崩|崩逝|大行|宾天|殡天)[了]?",
        r"陛下(已|已经|早已)?(死|驾崩|崩逝|大行|宾天|殡天)[了]?",
        r"始皇(已|已经|早已)?(死|驾崩|崩逝|大行|宾天|殡天)[了]?",
        r"胡亥(即位|登基|继位)",
        r"赵高(得势|专权)",
        r"秦朝(很快)?(崩解|灭亡)",
    ]
    replacement = "当下尚不可知"
    if current.get("scene_id") == "qin_shaqiu_edict":
        replacement = "行在消息未明"
    elif current.get("scene_id") == "han_tui_en_ling":
        replacement = "日后"
    cleaned = []
    for item in messages:
        new_item = dict(item)
        if new_item.get("kind") == "system":
            cleaned.append(new_item)
            continue
        text = str(new_item.get("text") or "")
        for pattern in patterns:
            text = re.sub(pattern, replacement, text)
        text = text.replace("皇帝至体违和", "行在消息不明")
        text = text.replace("皇帝遗体", "行在消息")
        new_item["text"] = text
        cleaned.append(new_item)
    return cleaned

def _repair_intrigue_stage_language(current: Dict, messages: List[Dict]) -> List[Dict]:
    stage = str(current.get("proposal_stage") or "")
    if not stage:
        return messages
    repaired = []
    for item in messages:
        new_item = dict(item)
        if new_item.get("kind") == "system":
            repaired.append(new_item)
            continue
        text = str(new_item.get("text") or "")
        if "未颁布" in stage:
            text = text.replace("收回成命", "暂缓此议")
            text = text.replace("前功尽弃", "此议难以成局")
            text = text.replace("成命", "议案")
            text = re.sub(r"既然陛下已经(决定|下诏|颁令)[，,。；;]?", "若陛下决定暂缓，", text)
            text = re.sub(r"已经(颁布|施行|推行|下诏)", "尚未正式颁布", text)
            text = text.replace("既定国策", "朝议方案")
        new_item["text"] = text
        repaired.append(new_item)
    return repaired

def _repair_all_adviser_messages(current: Dict, messages: List[Dict]) -> List[Dict]:
    role_map = {
        str(person.get("name") or ""): person
        for person in (current.get("encountered") or [])
        if isinstance(person, dict)
    }
    repaired = []
    for item in messages:
        new_item = dict(item)
        if new_item.get("kind") == "system":
            repaired.append(new_item)
            continue
        text = str(new_item.get("text") or "").strip()
        text = re.sub(r"^(陛下|公子|主上)(圣明|明鉴)?[，,。；;\s]*臣(谨)?(附议|赞同|同意)(前议|此议)?[，,。；;\s]*", r"\1\2，臣以为，", text)
        text = re.sub(r"^臣(谨)?(附议|赞同|同意)(前议|此议)?[，,。；;\s]*", "臣以为，", text)
        text = re.sub(r"^(附议|赞同|同意)(前议|此议)?[，,。；;\s]*", "臣以为，", text)
        text = re.sub(r"(今|既然)?陛下意在[“\"「][^”\"」]+[”\"」][，,。；;]?", "陛下垂询群臣，臣以为，", text)
        text = re.sub(r"(今|既然)?(公子|主上)意在[“\"「][^”\"」]+[”\"」][，,。；;]?", r"\2垂询群臣，臣以为，", text)
        text = re.sub(r"(赐|拨|给|发|调)(臣)?(精兵|精锐|骑兵|铁骑)(数十万|[一二三四五六七八九十百千万0-9]+万)", r"\1\2一支精锐兵马", text)
        text = re.sub(r"(精兵|精锐|骑兵|铁骑)(数十万|[一二三四五六七八九十百千万0-9]+万)", "精锐兵马", text)
        text = re.sub(r"(领|率|发|调)(十万|数十万|[一二三四五六七八九十百千万0-9]+万)(精骑|铁骑|骑兵)", r"\1精锐骑兵", text)
        text = re.sub(r"(十万|数十万|[一二三四五六七八九十百千万0-9]+万)(精骑|铁骑)", "精锐骑兵", text)
        if text in ("臣以为，", "臣以为。", ""):
            person = role_map.get(str(new_item.get("speaker") or ""), {})
            concern = person.get("attitude") or person.get("goal") or "此事仍要看名义、民力与风险能否相称"
            address = _intrigue_address(current)
            text = f"{address}明鉴。臣的看法是：{concern}。"
        new_item["text"] = text
        repaired.append(new_item)
    return repaired

def _intrigue_is_unclear_message(current: Dict, message: str) -> bool:
    text = (message or "").strip()
    if not text:
        return True
    if _intrigue_wants_all_advisers(text) or _intrigue_is_player_decision(text):
        return False
    if len(text) <= 1:
        return True
    if re.fullmatch(r"[\W\dA-Za-z_]+", text):
        return True
    if text in {"哈哈", "测试", "随便", "不知道", "无所谓", "嗯", "哦", "啊"}:
        return True
    question_words = ("怎么", "如何", "为何", "为什么", "说说", "想法", "意见", "可否", "是否", "吗", "？", "?")
    if any(word in text for word in question_words):
        return False
    relevance_terms = {
        "诏书", "使者", "咸阳", "面圣", "自尽", "蒙恬", "扶苏", "赵高", "胡亥", "秦始皇",
        "匈奴", "白登", "和亲", "北上", "复仇", "出兵", "边防", "粮草", "骑兵", "刘邦",
        "削藩", "推恩", "诸侯", "封国", "继承", "汉武帝", "主父偃", "采纳", "下令",
    }
    for person in current.get("encountered") or []:
        if person.get("name"):
            relevance_terms.add(str(person["name"]))
        if person.get("role"):
            relevance_terms.add(str(person["role"]))
    return len(text) <= 12 and not any(term in text for term in relevance_terms)

def _intrigue_clarification_messages(current: Dict, message: str, person_name: str) -> List[Dict]:
    people = current.get("encountered") or []
    counterpart = current.get("counterpart") or {}
    person = next((item for item in people if item.get("name") == person_name), None) or counterpart or (people[0] if people else {})
    address = _intrigue_address(current)
    quoted = (message or "").strip()[:40]
    return [{
        "speaker": person.get("name") or person_name or "朝臣",
        "role": person.get("role") or person.get("identity") or "朝臣",
        "text": f"{address}所言「{quoted}」，臣不敢妄解。您是要臣等按某一策再议，还是另有所指？请把想问或想令的事说清，臣等再据此陈奏。",
        "kind": "ai",
    }]

def _merge_intrigue_plan(current: Dict, new_plan: str) -> str:
    previous = str(current.get("player_plan") or "")
    if not previous:
        return new_plan
    scene_id = current.get("scene_id", "")
    if scene_id == "qin_shaqiu_edict":
        if "扶苏亲自赴咸阳" in previous and "扶苏亲自赴咸阳" not in new_plan:
            return previous
        if "扶苏亲自赴咸阳" in new_plan:
            return new_plan
    if scene_id == "han_baideng_court":
        if "立即北上回击匈奴" in new_plan:
            return new_plan
        if "立即北上回击匈奴" in previous and "立即北上回击匈奴" not in new_plan:
            return previous
    return new_plan if len(new_plan) >= len(previous) * 0.7 else previous

def _orthodox_history_text(current: Dict) -> str:
    text = str(current.get("orthodox_history") or "").strip()
    return re.sub(r"^正史中[，,：:\s]*", "", text)

def _trim_sentence_end(text: str) -> str:
    return re.sub(r"[。；;，,\s]+$", "", str(text or ""))

def _intrigue_ruler_acceptance_text(current: Dict, plan: str) -> str:
    scene_id = current.get("scene_id", "")
    decision_maker = current.get("decision_maker", {}) or {}
    ruler_name = decision_maker.get("name") or "我"
    if scene_id == "qin_shaqiu_edict":
        return (
            f"我采纳此议：{plan}。"
            "我暂不奉死诏，先由蒙恬稳住上郡军心，挑选可信骑从，亲赴咸阳核验诏书来路。"
            "若途中有诈，便以此举反证宫中有变。"
        )
    if scene_id == "han_baideng_court" and any(word in plan for word in ("立即北上", "集中主力", "主动寻战")):
        return (
            f"我采纳此议：{plan}。"
            "但此战不可再犯白登之失，粮道、斥候、主力联络必须先定，再命诸将北上。"
        )
    return f"{ruler_name}采纳此议：{plan}。今日起，本局便照此推进，后续风险由相关人等共同承担。"

def _intrigue_resolution_text(current: Dict, message: str) -> str:
    plan = _trim_sentence_end(_intrigue_player_plan(current, message))
    branch = _intrigue_branch_axis(current, message)
    if not branch and current.get("branch_key"):
        branch = next((axis for axis in current.get("branch_axes") or [] if axis.get("key") == current.get("branch_key")), None)
    impact = str((branch or {}).get("impact") or "")
    scene_id = current.get("scene_id", "")
    orthodox = _orthodox_history_text(current)
    if scene_id == "qin_shaqiu_edict":
        return (
            f"本局推演：决策者采纳了你的方案，{plan}。"
            f"{_trim_sentence_end(impact) or '扶苏不再立即自尽，而是先稳住上郡军心，查验诏书来路'}。"
            f"幕后真相是：{current.get('hidden_truth') or '沙丘一方正在隐瞒关键消息。'}"
            f"正史中，{orthodox}"
        )
    if scene_id == "han_baideng_court":
        if any(word in plan for word in ("立即北上", "集中主力", "主动寻战")):
            return (
                f"本局推演：刘邦采纳了你的方案，{plan}。"
                f"{_trim_sentence_end(impact) or '汉军会开始重新集结主力，试图弥补白登之围的失误，但汉初民力未复，风险极高'}。"
                f"正史中，{orthodox}"
            )
        return (
            f"本局推演：刘邦采纳了你的方案，{plan}。"
            f"{_trim_sentence_end(impact) or '这不会让汉朝立刻战胜匈奴，但会把朝议从泄愤转向长期准备'}。"
            f"正史中，{orthodox}"
        )
    if scene_id == "han_tui_en_ling":
        return (
            f"本局推演：汉武帝采纳了你的方案，{plan}。"
            f"{_trim_sentence_end(impact) or '诸侯短期未必立刻反叛，但中央与封国之间的制度拉扯会持续加深'}。"
            f"正史中，{orthodox}"
        )
    return f"本局推演：决策者采纳了你的方案，{plan}。{_trim_sentence_end(impact)}。正史中，{orthodox}"

def _sanitize_intrigue_messages(
    current: Dict,
    raw_messages: List[Dict],
    round_no: int,
    person_name: str,
    allow_system: bool = False,
    all_advisers: bool = False,
) -> List[Dict]:
    user_name = current.get("user_role", {}).get("name") or ""
    user_identity = current.get("user_role", {}).get("identity") or ""
    user_key = _normalize_person_name(user_name)
    user_identity_key = _normalize_person_name(user_identity)
    cleaned = []
    for item in raw_messages:
        if not isinstance(item, dict):
            continue
        speaker = str(item.get("speaker") or person_name or "局中人")[:24]
        text = str(item.get("text") or "").strip()[:1200]
        if not text:
            continue
        speaker_key = _normalize_person_name(speaker)
        role_key = _normalize_person_name(str(item.get("role") or ""))
        if user_key and speaker_key and (speaker_key == user_key or user_key in speaker_key or speaker_key in user_key):
            continue
        if user_identity_key and role_key and role_key == user_identity_key:
            continue
        kind = str(item.get("kind") or "ai")[:16]
        if kind == "ruler":
            continue
        if not allow_system and kind == "system":
            continue
        cleaned.append({
            "speaker": speaker,
            "role": str(item.get("role") or "")[:36],
            "text": text,
            "kind": kind,
        })

    adviser_limit = max(2, len(current.get("encountered") or [])) if all_advisers else 2
    advisers = [item for item in cleaned if item["kind"] not in ("ruler", "system")][:adviser_limit]
    if not allow_system:
        if advisers:
            return advisers
        return _intrigue_talk_fallback(current, person_name, "").get("messages", [])[:adviser_limit]
    system = next((item for item in reversed(cleaned) if item["kind"] == "system" and "本局推演" in item.get("text", "")), None)
    if not system:
        system = next((item for item in reversed(cleaned) if item["kind"] == "system"), None)
    compact = [*advisers, *([system] if system else [])]
    return compact[:3] if compact else _intrigue_talk_fallback(current, person_name, "").get("messages", [])

def _get_travel_session(session_id: str) -> Dict:
    session = time_travel_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="穿越记录不存在，请重新开始。")
    return session

async def _call_travel_model(
    messages: List[Dict],
    max_tokens: int = 1100,
    model: str = "qwen3.6-plus",
    timeout_seconds: Optional[float] = None,
) -> Dict:
    extra_body = {}
    if model.startswith("qwen3") and "flash" in model and not TIME_TRAVEL_FAST_ENABLE_THINKING:
        extra_body = {"enable_thinking": False}
    resp = await asyncio.wait_for(
        gemini_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.92,
            **({"extra_body": extra_body} if extra_body else {}),
        ),
        timeout=timeout_seconds or TIME_TRAVEL_MODEL_TIMEOUT,
    )
    return _extract_json_object(resp.choices[0].message.content)

@app.post("/time_travel/start")
async def time_travel_start(req: TimeTravelStartRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    player_id = x_client_id if x_client_id else "unknown_player"
    if not check_rate_limit(player_id):
        raise HTTPException(status_code=429, detail="触发太快了，请稍等一下。")
    seed = req.seed or f"{player_id}-{time.time()}"
    scene = _pick_intrigue_scene(seed)
    payload = _build_intrigue_payload(scene, seed)
    session_id = str(uuid.uuid4())
    time_travel_sessions[session_id] = {
        "payload": payload,
        "history": [{"type": "start", "scene": payload.get("scene", "")}],
        "created_at": time.time(),
    }
    _safe_record_analytics("time_travel", player_id, payload.get("title", "入局"), payload.get("user_role", {}).get("name", ""), "start")
    return {"success": True, "session_id": session_id, **payload}

@app.post("/time_travel/choose")
async def time_travel_choose(req: TimeTravelChoiceRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    player_id = x_client_id if x_client_id else "unknown_player"
    if not check_rate_limit(player_id):
        raise HTTPException(status_code=429, detail="触发太快了，请稍等一下。")
    session = _get_travel_session(req.session_id)
    current = session["payload"]
    selected = next((item for item in current.get("choices", []) if str(item.get("id")) == str(req.choice_id)), None)
    if not selected:
        raise HTTPException(status_code=400, detail="这个选择已经失效，请重新选择。")
    prompt = f"""{_travel_system_prompt()}

这是当前游戏状态：
{json.dumps(current, ensure_ascii=False)}

最近历史：
{json.dumps(session.get("history", [])[-6:], ensure_ascii=False)}

用户选择了：
{json.dumps(selected, ensure_ascii=False)}

请推进一轮“入局”朝议/军议。你要判断这个主张的说服力、角色贴合度、风险控制和对正史的偏离。
不要让用户轻易改写大历史。请写出局中人的反应，并用 narration 说明“若此议被采纳，可能如何”和“正史中如何”。
如果这场讨论已经自然收束，ended 为 true，并写 ending；否则 ended 为 false。
返回 JSON 字段：
result, title, era, year, location, character, user_role, status, scene, encountered, choices, narration, ended, ending
"""
    try:
        data = await _call_travel_model(
            [{"role": "user", "content": prompt}],
            max_tokens=760,
            model=TIME_TRAVEL_FAST_MODEL,
            timeout_seconds=TIME_TRAVEL_FAST_TIMEOUT,
        )
        fallback = dict(current)
        if data.get("result"):
            fallback["scene"] = f"{data.get('result')}\n\n{data.get('scene', '')}".strip()
        payload = _normalize_travel_payload(data, fallback=fallback)
        if data.get("result"):
            payload["result"] = str(data.get("result"))[:1200]
    except Exception:
        payload = _intrigue_choice_fallback(current, selected)
    session["payload"] = payload
    session["history"].append({"type": "choice", "choice": selected, "result": payload.get("result", ""), "scene": payload.get("scene", "")})
    _safe_record_analytics("time_travel", player_id, payload.get("title", "入局"), "", "choose")
    return {"success": True, "session_id": req.session_id, **payload}

@app.post("/time_travel/talk")
async def time_travel_talk(req: TimeTravelTalkRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    player_id = x_client_id if x_client_id else "unknown_player"
    if not check_rate_limit(player_id):
        raise HTTPException(status_code=429, detail="说话太快了，请稍等一下。")
    if not req.message.strip() or len(req.message) > 2000:
        raise HTTPException(status_code=400, detail="对话内容不能为空，且不要超过 2000 字。")
    session = _get_travel_session(req.session_id)
    current = session["payload"]
    people = current.get("encountered") or []
    counterpart = current.get("counterpart") or {}
    person_name = req.person or counterpart.get("name") or (people[0].get("name") if people else "朝臣")
    intent = _intrigue_intent(current, req.message.strip())
    if intent == "unclear":
        messages = _intrigue_clarification_messages(current, req.message.strip(), person_name)
        user_message = {
            "speaker": current.get("user_role", {}).get("name") or "你",
            "role": current.get("user_role", {}).get("identity") or "玩家",
            "text": req.message.strip(),
            "kind": "user",
        }
        current_dialogue = list(current.get("dialogue") or [])
        current_dialogue.extend([user_message, *messages])
        current["dialogue"] = current_dialogue[-24:]
        session["payload"] = current
        session["history"].append({"type": "talk", "speaker": user_message["speaker"], "message": req.message.strip(), "messages": messages})
        first_speaker = messages[0].get("speaker", "") if messages else ""
        _safe_record_analytics("time_travel", player_id, current.get("title", "入局"), first_speaker, "talk")
        return {
            "success": True,
            "messages": messages,
            "ended": False,
            "ending": "",
            "round": int(current.get("round") or 0),
        }
    round_no = int(current.get("round") or 0) + 1
    wants_all_advisers = intent == "ask_all"
    branch = _intrigue_branch_axis(current, req.message.strip())
    if branch:
        current["branch_key"] = branch.get("key", "")
    player_plan = _merge_intrigue_plan(current, _intrigue_player_plan(current, req.message.strip()))
    current["player_plan"] = player_plan
    adviser_instruction = ""
    if wants_all_advisers:
        adviser_names = "、".join(str(person.get("name") or "") for person in people if person.get("name"))
        adviser_instruction = (
            f"\n玩家正在要求所有在场者表态。本轮必须让这些人各自发言一次：{adviser_names}。不要漏人。"
            "每个人都必须独立给出自己的判断和理由，不得用“附议”“赞同前议”“同意此议”作为开头或主体。"
            "玩家此时只是垂询群臣，不代表已经有倾向；不得写“陛下意在……”“公子已经主张……”。"
        )
    prompt = f"""{_travel_system_prompt()}

当前游戏状态（这是局中人可见的信息，不包含后世正史真相）：
{json.dumps(_intrigue_prompt_state(current), ensure_ascii=False)}

局中人知识边界：
{_intrigue_npc_context(current)}

绝对禁止让局中人说出的后世或幕后知识：
{json.dumps(_intrigue_forbidden_knowledge(current), ensure_ascii=False)}

用户扮演「{current.get('user_role', {}).get('name') or current.get('character', {}).get('identity')}」，也就是本局最终决策者。
这是第 {round_no} 轮玩家发言。
系统识别到的玩家意图类型：{intent}
系统识别到的玩家具体方案是：{player_plan}
系统识别到的分支方向：{json.dumps({"key": (branch or {}).get("key", ""), "label": (branch or {}).get("label", "")}, ensure_ascii=False)}
你必须把玩家理解为正在主张这个方案。若方案里出现“立即北上回击匈奴”，不得把玩家理解成主张和亲、退让或“不作为”。
请生成臣子/将领/使者的回应。你不能扮演玩家本人，也不能替玩家拍板。
绝对不要代替用户角色发言；messages 里不允许出现 speaker 为「{current.get('user_role', {}).get('name') or '用户角色'}」的内容。
每轮最多返回 {len(people) if wants_all_advisers and people else 2} 条发言；如果玩家已经下令，最多返回 1 条臣子反应和 1 条旁白推演。{adviser_instruction}
回应结构：
1. 如果意图是 ask 或 debate，让臣子围绕玩家具体问题回答或互相驳论，不得结局。
2. 如果意图是 ask_all，所有在场者必须各自表态一次，不得漏人，不得结局；每个人都要独立说明自己的立场，不得只说“附议”，也不得假定玩家已经有倾向。
3. 如果意图是 command，臣子只能反应、提醒风险；旁白必须写出本局行动真的发生，例如“扶苏决定亲赴咸阳核验诏书”。
4. 旁白要区分“本局推演”与“正史中实际发生”，但不能把本局分支强行拉回正史。
用户的话：{req.message.strip()}

返回 JSON：
{{
    "messages": [
    {{"speaker":"人物名","role":"身份","text":"发言内容","kind":"ai|system"}}
  ],
  "ended": false,
  "ending": ""
}}
"""
    try:
        data = await _call_travel_model(
            [{"role": "user", "content": prompt}],
            max_tokens=760,
            model=TIME_TRAVEL_FAST_MODEL,
            timeout_seconds=TIME_TRAVEL_FAST_TIMEOUT,
        )
        messages = []
        if isinstance(data.get("messages"), list):
            for item in data["messages"][:4]:
                if isinstance(item, dict):
                    messages.append({
                        "speaker": str(item.get("speaker") or person_name)[:24],
                        "role": str(item.get("role") or "")[:36],
                        "text": str(item.get("text") or "")[:1200],
                        "kind": str(item.get("kind") or "ai")[:16],
                    })
        player_decided = intent == "command"
        messages = _sanitize_intrigue_messages(
            current,
            messages,
            round_no,
            person_name,
            allow_system=player_decided,
            all_advisers=wants_all_advisers,
        )
        messages = _sanitize_intrigue_forbidden_knowledge(current, messages)
        messages = _repair_intrigue_stage_language(current, messages)
        if wants_all_advisers:
            messages = _repair_all_adviser_messages(current, messages)
        if wants_all_advisers and not player_decided:
            present = {_normalize_person_name(item.get("speaker", "")) for item in messages}
            for fallback_item in _intrigue_talk_fallback(current, person_name, req.message.strip()).get("messages", []):
                speaker_key = _normalize_person_name(fallback_item.get("speaker", ""))
                if speaker_key and speaker_key not in present:
                    messages.append(fallback_item)
                    present.add(speaker_key)
        if not messages:
            raise ValueError("empty intrigue messages")
        ended = bool(data.get("ended", False)) if player_decided else False
        ending = str(data.get("ending") or "")[:800] if player_decided else ""
        if player_decided:
            adviser_messages = [item for item in messages if item.get("kind") not in ("ruler", "system")][:1]
            resolution_text = _intrigue_resolution_text(current, player_plan)
            final_messages = [
                {
                    "speaker": "旁白",
                    "role": "本局推演 / 正史对照",
                    "text": resolution_text,
                    "kind": "system",
                },
            ]
            messages = adviser_messages + final_messages
            ended = True
            ending = "你已经做出决定，本局进入新的历史分支。"
    except Exception:
        data = _intrigue_talk_fallback(current, person_name, req.message.strip())
        messages = _sanitize_intrigue_forbidden_knowledge(current, data["messages"])
        messages = _repair_intrigue_stage_language(current, messages)
        ended = bool(data.get("ended", False))
        ending = str(data.get("ending") or "")[:800]
    user_message = {
        "speaker": current.get("user_role", {}).get("name") or "你",
        "role": current.get("user_role", {}).get("identity") or "玩家",
        "text": req.message.strip(),
        "kind": "user",
    }
    current_dialogue = list(current.get("dialogue") or [])
    current_dialogue.extend([user_message, *messages])
    current["dialogue"] = current_dialogue[-24:]
    current["round"] = round_no
    current["ended"] = ended
    current["ending"] = ending
    session["payload"] = current
    session["history"].append({"type": "talk", "speaker": user_message["speaker"], "message": req.message.strip(), "messages": messages})
    first_speaker = messages[0].get("speaker", "") if messages else ""
    _safe_record_analytics("time_travel", player_id, current.get("title", "入局"), first_speaker, "talk")
    return {"success": True, "messages": messages, "ended": ended, "ending": ending, "round": round_no}

@app.post("/time_travel/talk_stream")
async def time_travel_talk_stream(req: TimeTravelTalkRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    result = await time_travel_talk(req, x_client_id)

    async def event_stream():
        for item in result.get("messages", []):
            meta = {
                "type": "message_start",
                "speaker": item.get("speaker", ""),
                "role": item.get("role", ""),
                "kind": item.get("kind", "ai"),
            }
            yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"
            for char in str(item.get("text", "")):
                yield f"data: {json.dumps({'type': 'delta', 'delta': char}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0.004)
            yield f"data: {json.dumps({'type': 'message_end'}, ensure_ascii=False)}\n\n"
        done = {
            "type": "done",
            "success": True,
            "ended": result.get("ended", False),
            "ending": result.get("ending", ""),
            "round": result.get("round", 0),
            "messages": result.get("messages", []),
        }
        yield f"data: {json.dumps(done, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.post("/guess_game/start")
async def guess_game_start(req: GuessGameStartRequest):
    session_id = str(uuid.uuid4())
    ai_person = _pick_guess_person(req.user_seed)
    guess_game_sessions[session_id] = {
        "ai_person": ai_person,
        "created_at": time.time(),
    }
    return {
        "success": True,
        "session_id": session_id,
        "message": "我已经选好了一个中国历史人物。你可以先问我一个能简短裁判的问题。"
    }

@app.post("/guess_game/ask_ai")
async def guess_game_ask_ai(req: GuessGameAskRequest):
    session = _get_guess_session(req.session_id)
    question = req.question.strip()
    if not question or len(question) > 120:
        raise HTTPException(status_code=400, detail="问题不能为空，且不超过120字")
    if not _looks_like_yes_no_question(question):
        return {
            "success": True,
            "valid": False,
            "answer": "请换成一个能判断范围的问题，或者用“猜答案”按钮直接猜人物。"
        }
    known_answer = _answer_known_guess_fact(session["ai_person"], question)
    if known_answer:
        return {"success": True, "valid": True, "answer": known_answer}

    prompt = f"""你正在玩猜中国历史人物游戏。
你的秘密人物是：{session['ai_person']}。
这个人物的常用分类是：{"、".join(GUESS_PERSON_DYNASTIES.get(session['ai_person'], [])) or "未知"}。
用户会问一个判断范围的问题。
你必须用“是 / 不是 / 有争议 / 不确定”之一开头，并且最多补充一句不超过25字的历史解释。
禁止透露人物姓名，禁止给出过度提示，不能主动说出具体答案。

用户问题：{question}
"""
    resp = await gemini_client.chat.completions.create(
        model="qwen-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=60,
        temperature=0.2,
    )
    answer = _brief_judge_answer(resp.choices[0].message.content, session["ai_person"])
    return {"success": True, "valid": True, "answer": answer}

@app.post("/guess_game/guess_ai")
async def guess_game_guess_ai(req: GuessGameGuessRequest):
    session = _get_guess_session(req.session_id)
    guess = req.guess.strip()
    if not guess:
        raise HTTPException(status_code=400, detail="请输入要猜的人物")
    correct = _normalize_person_name(guess) == _normalize_person_name(session["ai_person"])
    return {
        "success": True,
        "correct": correct,
        "answer": session["ai_person"] if correct else "",
        "message": "猜中了，本轮结束。" if correct else "不是这个人。轮到我继续追问。"
    }

@app.post("/guess_game/reveal")
async def guess_game_reveal(req: GuessGameRevealRequest):
    session = _get_guess_session(req.session_id)
    return {
        "success": True,
        "answer": session["ai_person"],
        "message": f"本轮揭晓：AI 设定的人物是 {session['ai_person']}。"
    }

@app.post("/guess_game/ai_turn")
async def guess_game_ai_turn(req: GuessGameTurnRequest):
    _get_guess_session(req.session_id)
    transcript = req.transcript[-12:]
    rejected_guesses = {
        _normalize_person_name(item.get("text", ""))
        for item in transcript
        if item.get("side") == "ai_guess" and item.get("answer") == "不是"
    }
    answered_ai_questions = sum(
        1 for item in transcript
        if item.get("side") == "ai_question" and item.get("answer") in ("是", "不是", "不确定", "有争议")
    )
    can_guess = answered_ai_questions >= 3
    action_rule = (
        "你现在可以在很有把握时猜一个具体中国历史人物。"
        if can_guess
        else "你现在还不能猜具体人物，必须继续问范围型问题，例如朝代、性别、职业、阵营、成就类别。禁止问“你的角色是不是某某”。"
    )
    prompt = f"""你正在和用户玩猜中国历史人物游戏。
你不知道用户心里的人物是谁，只能根据以下是/不是记录推理。
{action_rule}
你可以做两种事之一：
1. 问一个只能回答“是”或“不是”的问题；
2. 如果很有把握，猜一个具体中国历史人物。

请返回纯JSON：
{{"type":"question","text":"问题"}}
或
{{"type":"guess","text":"人物名"}}

记录：
{json.dumps(transcript, ensure_ascii=False)}
"""
    resp = await gemini_client.chat.completions.create(
        model="qwen-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=120,
        temperature=0.5,
    )
    raw = resp.choices[0].message.content.strip()
    try:
        data = json.loads(re.search(r"\{.*\}", raw, re.DOTALL).group(0))
    except Exception:
        data = {"type": "question", "text": _fallback_guess_question(transcript)}
    if data.get("type") not in ("question", "guess"):
        data = {"type": "question", "text": _fallback_guess_question(transcript)}
    if data.get("type") == "guess" and not can_guess:
        data = {"type": "question", "text": _fallback_guess_question(transcript)}
    if data.get("type") == "guess" and _normalize_person_name(data.get("text", "")) in rejected_guesses:
        data = {"type": "question", "text": _fallback_guess_question(transcript)}
    if data.get("type") == "question" and not can_guess and _is_specific_person_guess(data.get("text", "")):
        data = {"type": "question", "text": _fallback_guess_question(transcript)}
    return {"success": True, **data}

@app.post("/login")
async def wx_login(req: LoginRequest):
    if not WX_APP_ID or not WX_APP_SECRET:
        if DEV_MODE:
            print("开发模式：未配置微信 AppID/Secret，生成模拟 OpenID")
            return {"success": True, "openid": f"mock_user_{req.code[-6:]}"}
        return {"success": False, "msg": "服务器未配置微信登录，请联系管理员"}

    url = f"https://api.weixin.qq.com/sns/jscode2session?appid={WX_APP_ID}&secret={WX_APP_SECRET}&js_code={req.code}&grant_type=authorization_code"
    
    async with httpx.AsyncClient() as x_client:
        try:
            resp = await x_client.get(url)
            data = resp.json()
            if "openid" in data:
                return {"success": True, "openid": data["openid"]}
            else:
                return {"success": False, "msg": data.get("errmsg", "微信置换失败")}
        except Exception as e:
            return {"success": False, "msg": str(e)}

def _extract_json_fields(raw_text: str):
    clean = raw_text.strip()
    fence_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', clean, re.DOTALL)
    if fence_match:
        clean = fence_match.group(1).strip()
    brace_match = re.search(r'\{.*\}', clean, re.DOTALL)
    if brace_match:
        clean = brace_match.group(0)

    try:
        parsed = json.loads(clean)
        ov = parsed.get("original_voice") or parsed.get("originalVoice") or ""
        me = parsed.get("modern_explain") or parsed.get("modernExplain") or ""
        return ov.replace("\\n", "\n").replace("\\t", "\t"), me.replace("\\n", "\n").replace("\\t", "\t")
    except json.JSONDecodeError:
        pass

    fixed_chars = []
    in_str = False
    esc = False
    for ch in clean:
        if esc:
            fixed_chars.append(ch)
            esc = False
            continue
        if ch == '\\' and in_str:
            fixed_chars.append(ch)
            esc = True
            continue
        if ch == '"':
            in_str = not in_str
            fixed_chars.append(ch)
            continue
        if in_str and ch == '\n':
            fixed_chars.append('\\n')
            continue
        if in_str and ch == '\r':
            continue
        if in_str and ch == '\t':
            fixed_chars.append('\\t')
            continue
        fixed_chars.append(ch)

    try:
        parsed = json.loads(''.join(fixed_chars))
        ov = parsed.get("original_voice") or parsed.get("originalVoice") or ""
        me = parsed.get("modern_explain") or parsed.get("modernExplain") or ""
        return ov.replace("\\n", "\n").replace("\\t", "\t"), me.replace("\\n", "\n").replace("\\t", "\t")
    except json.JSONDecodeError:
        pass

    def _extract_field(text, field_name):
        parts = re.split(r'"' + field_name + r'"\s*:\s*"', text, 1)
        if len(parts) < 2:
            return ""
        rest = parts[1]
        
        # 匹配到非转义的引号作为字符串结束
        # 由于我们只想非贪婪地匹配到第一个非转义的引号且后面跟着逗号或大括号
        end_match = re.search(r'^(.*?)(?<!\\)"\s*[,}]', rest, re.DOTALL)
        if end_match:
            return end_match.group(1)
        return rest.rstrip('" \t\n\r}')

    ov_text = _extract_field(clean, r'(?:original_voice|originalVoice)') or raw_text
    me_text = _extract_field(clean, r'(?:modern_explain|modernExplain)')
    if not me_text:
        me_text = ov_text
    ov_text = ov_text.replace("\\n", "\n").replace("\\t", "\t")
    me_text = me_text.replace("\\n", "\n").replace("\\t", "\t")
    return ov_text, me_text

class ChatRequest(BaseModel):
    event_name: str      # 微信告诉我们当前在哪个案子 (例如: "三国·赤壁之战")
    character: str       # 微信告诉我们当前在审问谁 (例如: "曹操")
    message: str         # 微信发来的最新质问
    history: List[Dict]  # 🌟 微信传过来的历史聊天记录（给 AI 记忆！）
    answer_mode: Optional[str] = "expert"
    track_question: Optional[bool] = True

    class Config:
        json_schema_extra = {
            "example": {
                "event_name": "三国·赤壁之战",
                "character": "曹操",
                "message": "你为何要南下？",
                "history": []
            }
        }

    def validate_inputs(self):
        if self.event_name not in EVENTS_DB:
            raise ValueError("未知事件")
        event_characters = EVENTS_DB[self.event_name].get("characters", [])
        if self.character not in event_characters:
            raise ValueError("未知角色")
        if len(self.message) > 500:
            raise ValueError("消息过长，请控制在500字以内")
        if self.answer_mode not in ("fast", "expert", None):
            raise ValueError("未知回答模式")
        if len(self.history) > 20:
            raise ValueError("历史记录过多，请清空后重试")
        for msg in self.history:
            if isinstance(msg, dict) and len(str(msg.get("content", ""))) > 1000:
                raise ValueError("历史记录中存在过长消息")

@app.post("/chat")
async def ai_chat(request: ChatRequest, x_wx_openid: Optional[str] = Header(None, alias="X-WX-OPENID"), x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    try:
        request.validate_inputs()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        player_id = x_wx_openid if x_wx_openid else (x_client_id if x_client_id else "unknown_player")
        is_miniprogram = bool(x_wx_openid and x_wx_openid.strip())
        
        if not check_rate_limit(player_id):
            return {"reply": "发言太快了，请稍等片刻再问。", "original_voice": "", "modern_explain": "", "character": request.character}
        
        client_type = "小程序" if is_miniprogram else "网页"
        print(f"\n=== 收到提审请求 [{client_type}] ===")
        print(f"玩家: {player_id} | 案件: {request.event_name} | 被告: {request.character}")
        _safe_record_analytics("chat", player_id, request.event_name, request.character, request.answer_mode or "")
        _safe_record_chat_question(request, player_id)
        
        event_data = EVENTS_DB[request.event_name]
        raw_notes = event_data.get('ai_notes', '')
        char_note = ""
        for line in raw_notes.split('\n'):
            if request.character in line:
                char_note = raw_notes
                break
        deep_context = (
            _format_event_fast_context(event_data, request.character)
            if request.answer_mode == "fast"
            else _format_event_deep_context(event_data, request.character)
        )

        character_reply_count = sum(
            1
            for m in request.history
            if isinstance(m, dict)
            and m.get("role") != "user"
            and m.get("target") == request.character
        )
        allow_followup_question = character_reply_count > 0 and character_reply_count % 3 == 0
        if allow_followup_question:
            followup_question_rule = "本轮允许在结尾自然地向用户提出一个问题，但只能问一个，且必须和当前话题强相关；如果没有必要，仍然不要提问。"
        else:
            followup_question_rule = "本轮禁止向用户反问，也不要用问题作结尾；请直接回答用户的问题，让对话自然停在一个完整陈述上。"
        turn_instruction = _chat_turn_instruction(followup_question_rule, request.answer_mode)
        followup_question_rule = "请遵守最后一条用户消息中的本轮反问规则；默认不要为了延长对话而反问。"
        chat_max_tokens = 480 if request.answer_mode == "fast" else 800

        system_prompt = f"""你是【{request.character}】，正在参与一场跨越千年的时空访谈。事件：{request.event_name}。
原则：只据正史，不用野史小说，不知即说不知。以第一人称、半文半白回答。
# 核心原则（必须严格遵守）
1. 【史实红线】你所说的一切必须严格基于正史记载（《史记》《汉书》《三国志》《资治通鉴》等），绝不使用小说、野史、民间传说内容。
2. 【不知即不知】如果你不知道某件事的正史记载，直接说"此事史书无载，吾不知也"，绝不可编造。
3. 【角色代入】你必须完全以【{request.character}】的第一人称视角回答，带入该人物的性格、立场、处境和心机。此时距你所在的时代已过去千年。提问者是一位来自现代的「后生」或「小友」。不要称呼对方为法官！
4. 【语气要求】使用半文半白的语言风格，符合该历史人物的身份和时代背景。
5. 【精简要求】：不要长篇大论，保持回答简洁明了；你可以有主动思考和分析，但不要为了延长对话而强行反问。
6. 【反问节奏】：{followup_question_rule}

{char_note}

{event_data.get('dynamic_prompt', '')}

{deep_context}

你必须返回纯JSON格式，包含以下两个字段：
1. original_voice：你的文言回答（半文半白风格）
2. modern_explain：将你的文言回答翻译成现代白话文（必须提供，不能为空）

重要规则：
- JSON值内部绝对不允许出现双引号「"」，请使用「」替代
- 例如：要说「强干弱枝」而不能说"强干弱枝"
- JSON值内可以有\\n表示换行

示例格式：
{{"original_voice":"吾乃曹操\\n今日在此与诸位辩论。","modern_explain":"我是曹操，今天在这里和大家辩论。"}}"""

        message_history = []
        for m in request.history[-6:]:
            if not isinstance(m, dict):
                continue
            content_text = m.get("content", "")
            message_history.append({"role": "user" if m.get("role") == "user" else "assistant", "content": content_text})

        final_user_message = f"{turn_instruction}\n\n用户本轮问题：{request.message}"
        final_messages = [{"role": "system", "content": system_prompt}] + message_history + [{"role": "user", "content": final_user_message}]
        
        if is_miniprogram:
            stream = await dashscope_client.chat.completions.create(
                model=DASHSCOPE_MODEL,
                messages=final_messages,
                max_tokens=chat_max_tokens,
                temperature=0.7,
                stream=True,
            )
            reply_content = ""
            async for chunk in stream:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta
                if delta.content:
                    reply_content += delta.content
        else:
            selected_model = WEB_FAST_MODEL if request.answer_mode == "fast" else GEMINI_MODEL
            extra_body = _chat_model_extra_body(selected_model, request.answer_mode)
            resp = await gemini_client.chat.completions.create(
                model=selected_model,
                messages=final_messages,
                max_tokens=chat_max_tokens,
                temperature=0.7,
                **({"extra_body": extra_body} if extra_body else {}),
            )
            reply_content = resp.choices[0].message.content
        
        print(f"[{request.character}] 原理级返回内容:\n{reply_content}")
        
        original_voice, modern_explain = _extract_json_fields(reply_content)

        print(f"[{request.character}] 辩护完毕。")
        
        return {
            "reply": original_voice,
            "original_voice": original_voice.strip(),
            "modern_explain": modern_explain.strip(),
            "character": request.character
        }

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        traceback.print_exc()
        print(f"服务端顶层拦截到未捕获错误: {e}")
        with open("api_error.log", "a", encoding="utf-8") as ef:
            ef.write(f"\n=== {time.strftime('%Y-%m-%d %H:%M:%S')} ===\n")
            ef.write(tb)
            ef.write(f"\n")
        return {"reply": f"服务器开了个小差 (异常防爆网兜底)，请再发一遍~", "original_voice": "", "modern_explain": "", "character": request.character}

@app.post("/chat_stream")
async def ai_chat_stream(request: ChatRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    try:
        request.validate_inputs()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    player_id = x_client_id if x_client_id else "unknown_player"
    if not check_rate_limit(player_id):
        raise HTTPException(status_code=429, detail="发言太快了，请稍等片刻再问。")
    _safe_record_analytics("chat", player_id, request.event_name, request.character, request.answer_mode or "")
    _safe_record_chat_question(request, player_id)

    event_data = EVENTS_DB[request.event_name]
    raw_notes = event_data.get('ai_notes', '')
    char_note = ""
    for line in raw_notes.split('\n'):
        if request.character in line:
            char_note = raw_notes
            break
    deep_context = (
        _format_event_fast_context(event_data, request.character)
        if request.answer_mode == "fast"
        else _format_event_deep_context(event_data, request.character)
    )

    character_reply_count = sum(
        1
        for m in request.history
        if isinstance(m, dict)
        and m.get("role") != "user"
        and m.get("target") == request.character
    )
    allow_followup_question = character_reply_count > 0 and character_reply_count % 3 == 0
    if allow_followup_question:
        followup_question_rule = "本轮允许在结尾自然地向用户提出一个问题，但只能问一个，且必须和当前话题强相关；如果没有必要，仍然不要提问。"
    else:
        followup_question_rule = "本轮禁止向用户反问，也不要用问题作结尾；请直接回答用户的问题，让对话自然停在一个完整陈述上。"
    turn_instruction = _chat_turn_instruction(followup_question_rule, request.answer_mode)
    followup_question_rule = "请遵守最后一条用户消息中的本轮反问规则；默认不要为了延长对话而反问。"
    chat_max_tokens = 480 if request.answer_mode == "fast" else 800

    system_prompt = f"""你是【{request.character}】，正在参与一场跨越千年的时空访谈。事件：{request.event_name}。
原则：只据正史，不用野史小说，不知即说不知。以第一人称、半文半白回答。
# 核心原则（必须严格遵守）
1. 【史实红线】你所说的一切必须严格基于正史记载（《史记》《汉书》《三国志》《资治通鉴》等），绝不使用小说、野史、民间传说内容。
2. 【不知即不知】如果你不知道某件事的正史记载，直接说「此事史书无载，吾不知也」，绝不可编造。
3. 【角色代入】你必须完全以【{request.character}】的第一人称视角回答，带入该人物的性格、立场、处境和心机。提问者是一位来自现代的「后生」或「小友」。不要称呼对方为法官。
4. 【语气要求】使用半文半白的语言风格，符合该历史人物的身份和时代背景。
5. 【精简要求】不要长篇大论，保持回答简洁明了；你可以有主动思考和分析，但不要为了延长对话而强行反问。
6. 【反问节奏】{followup_question_rule}

{char_note}

{event_data.get('dynamic_prompt', '')}

{deep_context}

请直接输出给用户看的正文，不要输出 JSON。必须使用以下格式：

**【半原文】**
（以第一人称、半文半白回答）

**【白话文解】**
（把上面的意思翻译成现代白话，保持简洁）
"""

    message_history = []
    for m in request.history[-6:]:
        if not isinstance(m, dict):
            continue
        content_text = m.get("content", "")
        message_history.append({"role": "user" if m.get("role") == "user" else "assistant", "content": content_text})

    final_user_message = f"{turn_instruction}\n\n用户本轮问题：{request.message}"
    final_messages = [{"role": "system", "content": system_prompt}] + message_history + [{"role": "user", "content": final_user_message}]

    async def event_stream():
        try:
            selected_model = WEB_FAST_MODEL if request.answer_mode == "fast" else GEMINI_MODEL
            extra_body = _chat_model_extra_body(selected_model, request.answer_mode)
            stream = await gemini_client.chat.completions.create(
                model=selected_model,
                messages=final_messages,
                max_tokens=chat_max_tokens,
                temperature=0.7,
                stream=True,
                **({"extra_body": extra_body} if extra_body else {}),
            )
            async for chunk in stream:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta
                if delta.content:
                    yield f"data: {json.dumps({'delta': delta.content}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'done': True}, ensure_ascii=False)}\n\n"
        except Exception as e:
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
    
    # 🌟 新增接口：专门用于给微信小程序下发案卷故事
@app.get("/event")
async def get_event_details(name: str):
    print(f"前端请求调阅卷宗: {name}")
    # 精确匹配优先
    if name in EVENTS_DB:
        return {
            "success": True,
            "full_name": name,
            "data": EVENTS_DB[name]
        }
    # 模糊匹配：前端可能只传了"赤壁之战"，我们要找到"三国·赤壁之战"
    for full_name, data in EVENTS_DB.items():
        if name in full_name or full_name in name:
            return {
                "success": True,
                "full_name": full_name,
                "data": data
            }
    
    # 如果没找到（比如周公制礼作乐），就返回失败
    print(f"未找到卷宗: {name}")
    return {"success": False}

@app.get("/events_list")
async def get_events_list():
    """获取所有事件列表，供小程序首页展示"""
    print("前端请求全量事件列表")
    events_list = []
    dynasty_nav_order = {}
    for summary in EVENTS_DB.values():
        if not isinstance(summary, dict) or summary.get("summary_type") != "dynasty_skeleton":
            continue
        for index, node in enumerate(summary.get("skeleton_nodes") or []):
            event_name = node.get("event")
            if event_name:
                dynasty_nav_order[event_name] = index
    
    for full_name, data in EVENTS_DB.items():
        parts = full_name.split('·')
        dynasty = parts[0] if len(parts) > 1 else '未知'
        
        time_str = data.get('time', '')
        year = ''
        if '公元前' in time_str:
            match = re.search(r'公元前(\d+)-?(\d+)?年', time_str)
            if match:
                year = f"前{match.group(1)}年"
        elif '公元' in time_str:
            match = re.search(r'公元(\d+)-?(\d+)?年', time_str)
            if match:
                year = f"{match.group(1)}年"
                
        story = data.get('story', '')
        desc = re.sub(r'<[^>]+>', '', story)
        desc = desc[:50] + '...' if len(desc) > 50 else desc

        matched_image = data.get('image', 'https://s3.bmp.ovh/2026/05/02/1WWWIewB.png')
        
        simple_title = data.get("nav_title") or (full_name.split('·')[-1] if '·' in full_name else full_name)
        is_summary = data.get("summary_type") == "dynasty_skeleton"
        is_side_quest = data.get("nav_type") == "side"
        
        dyn_id = dynasty
        if dynasty == "五代":
            dyn_id = "五代十国"
        elif dynasty == "南北朝":
            dyn_id = "南北朝"
        else:
            dyn_id = dynasty.replace("朝", "")
            
        event_item = {
            "id": full_name,
            "title": simple_title,
            "dynasty": dynasty,
            "dynastyId": dyn_id, 
            "year": year or time_str.split('（')[0], 
            "desc": desc,
            "image": matched_image,
            "isImage": True,
            "isSummary": is_summary,
            "isSideQuest": is_side_quest,
            "navOrder": 2 if is_side_quest else (1 if is_summary else 0),
            "storyOrder": dynasty_nav_order.get(full_name)
        }
        events_list.append(event_item)
        
    # === 开始：添加按时间点智能排序的算法 ===
    def get_sort_weight(year_str):
        if not year_str:
            return 9999
        weight = 0
        # 寻找连续的数字
        match = re.search(r'\d+', year_str)
        if match:
            num = int(match.group(0))
            if "前" in year_str:
                # 公元前，数字越大，时间越早，给它负数权重
                weight = -num
            else:
                # 公元后，正数权重
                weight = num
        else:
            return 9999
        return weight
        
    # 对 events_list 进行原地排序
    events_list.sort(key=lambda x: (
        x.get("navOrder", 0),
        x.get("storyOrder") if x.get("storyOrder") is not None else get_sort_weight(x['year'])
    ))
    # === 结束：排序算法 ===
        
    return {
        "success": True,
        "data": events_list
    }

# ======== 聊天记录服务端持久化（用户隔离） ========

CHAT_DATA_DIR = Path("chat_data").resolve()
CHAT_DATA_DIR.mkdir(exist_ok=True)

USER_ID_PATTERN = re.compile(r'^[a-zA-Z0-9\-_]+$')

def _safe_chat_path(user_id: str, event_name: str) -> Path:
    if not USER_ID_PATTERN.match(user_id):
        raise ValueError("非法用户ID")
    if event_name not in EVENTS_DB:
        raise ValueError("未知事件")
    user_dir = CHAT_DATA_DIR / user_id
    event_file = (user_dir / f"{event_name}.json").resolve()
    if CHAT_DATA_DIR not in event_file.parents and event_file != CHAT_DATA_DIR:
        raise ValueError("路径越界")
    return event_file

def _write_json_atomic(path: Path, data):
    path.parent.mkdir(exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as tmp_file:
        json.dump(data, tmp_file, ensure_ascii=False, indent=2)
        tmp_name = tmp_file.name
    os.replace(tmp_name, path)

class ChatHistoryRequest(BaseModel):
    event_name: str
    messages: List[Dict]

    def validate_inputs(self):
        if self.event_name not in EVENTS_DB:
            raise ValueError("未知事件")
        if len(self.messages) > 100:
            raise ValueError("聊天记录过多，请清理后重试")
        for msg in self.messages:
            if not isinstance(msg, dict):
                raise ValueError("聊天记录格式错误")
            if len(str(msg.get("content", ""))) > 2000:
                raise ValueError("聊天记录中存在过长消息")

@app.get("/chat_history")
async def get_chat_history(event_name: str, user_id: str = Depends(get_request_user_id)):
    try:
        event_file = _safe_chat_path(user_id, event_name)
    except ValueError:
        return {"success": True, "messages": []}
    if not event_file.exists():
        return {"success": True, "messages": []}
    try:
        with open(event_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"success": True, "messages": data}
    except Exception:
        return {"success": True, "messages": []}

@app.post("/chat_history")
async def save_chat_history(request: ChatHistoryRequest, user_id: str = Depends(get_request_user_id)):
    try:
        request.validate_inputs()
        event_file = _safe_chat_path(user_id, request.event_name)
    except ValueError as e:
        return {"success": False, "error": str(e)}
    try:
        _write_json_atomic(event_file, request.messages)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
