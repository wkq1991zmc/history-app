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
TIME_TRAVEL_FAST_MODEL = os.environ.get("TIME_TRAVEL_FAST_MODEL", "qwen-turbo")
TIME_TRAVEL_FAST_TIMEOUT = float(os.environ.get("TIME_TRAVEL_FAST_TIMEOUT", "45"))
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

def _travel_default_payload() -> Dict:
    return {
        "title": "秦末驿路求生",
        "era": "秦末",
        "year": "公元前209年",
        "location": "蕲县附近的驿道",
        "character": {
            "age": 19,
            "gender": "男",
            "height": "七尺上下",
            "weight": "偏瘦",
            "identity": "被征发的戍卒",
            "appearance": "衣衫破旧，脚上有血泡，身上只剩半袋粗粮。"
        },
        "status": {
            "health": 72,
            "hunger": 58,
            "money": 4,
            "reputation": 8,
            "danger": 46
        },
        "scene": "暴雨刚停，驿道泥泞。你所在的队伍因误期而人人惶恐，远处县吏催促的声音越来越近。按秦律，失期可能受重罚，同行的人已经开始低声议论逃亡。",
        "encountered": [
            {"name": "老戍卒", "role": "同行役夫", "attitude": "劝你先保命"},
            {"name": "县吏", "role": "押送小吏", "attitude": "警惕而急躁"}
        ],
        "choices": [
            {"id": "A", "text": "跟着队伍继续赶路，赌能在天黑前到达。", "risk": "中", "hint": "稳妥，但体力会继续下降。"},
            {"id": "B", "text": "听老戍卒的话，趁混乱离开驿道。", "risk": "高", "hint": "可能逃过刑罚，也可能被当作逃卒。"},
            {"id": "C", "text": "去和县吏交涉，说明暴雨毁路。", "risk": "中", "hint": "需要一点胆量和说辞。"},
            {"id": "D", "text": "先找附近农舍讨水和草鞋。", "risk": "低", "hint": "能缓一口气，但会耽误行程。"}
        ],
        "ended": False,
        "ending": ""
    }

def _travel_system_prompt() -> str:
    return """你是一个严谨的中国历史文字生存游戏导演。
游戏定位：用户不是改写历史的主角，而是进入正史边缘的小人物，用生存选择贴近真实历史处境。
当前第一版只允许生成秦末背景，时间范围锁定在公元前210年至公元前206年，优先围绕徭役、戍卒、秦律、陈胜吴广起义、地方官吏、逃亡、饥荒、驿道、县乡社会、楚汉之争前夜。
硬规则：
1. 不许出现现代物品、现代制度、玄幻能力、系统面板梗。
2. 不许让用户轻易改变正史，只能影响自身、小范围遭遇和身边普通人的命运。
3. 可以出现普通人和低级吏卒；陈胜、吴广、刘邦、项羽等正史人物必须低概率、间接或远距离出现。
4. 每轮必须给 4 个选择，选择要有明确风险差异，不能都是同一种行动。
5. 叙事要有历史质感，但语言要让现代用户能读懂。
6. 必须只返回 JSON，不要解释。"""

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
    for key in ("title", "era", "year", "location", "scene", "ending"):
        if data.get(key):
            payload[key] = str(data.get(key))[:1600]
    payload["ended"] = bool(data.get("ended", payload.get("ended", False)))
    if isinstance(data.get("character"), dict):
        character = dict(base.get("character", {}))
        character.update({k: str(v)[:120] for k, v in data["character"].items() if v is not None})
        payload["character"] = character
    if isinstance(data.get("status"), dict):
        status = dict(base.get("status", {}))
        for key in ("health", "hunger", "money", "reputation", "danger"):
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
    resp = await asyncio.wait_for(
        gemini_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.92,
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
    prompt = f"""{_travel_system_prompt()}

请生成一局秦末穿越文字生存游戏的开局。随机分配用户的年龄、性别、身高体重、身份、地点和初始处境，但必须符合秦末社会。
返回 JSON 字段：
title, era, year, location,
character: {{age, gender, height, weight, identity, appearance}},
status: {{health, hunger, money, reputation, danger}},
scene,
encountered: [{{name, role, attitude}}],
choices: [{{id, text, risk, hint}}],
ended, ending
随机种子：{seed}
"""
    try:
        data = await _call_travel_model(
            [{"role": "user", "content": prompt}],
            model=GEMINI_MODEL,
            timeout_seconds=TIME_TRAVEL_MODEL_TIMEOUT,
        )
        payload = _normalize_travel_payload(data)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="时空生成失败，请稍后重试。") from exc
    session_id = str(uuid.uuid4())
    time_travel_sessions[session_id] = {
        "payload": payload,
        "history": [{"type": "start", "scene": payload.get("scene", "")}],
        "created_at": time.time(),
    }
    _safe_record_analytics("time_travel", player_id, "秦末穿越", "", "start")
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

请推进一轮剧情。你要判断选择后果、更新地点/人物/状态，并生成下一轮 4 个选择。
如果角色死亡或被捕到本局无法继续，ended 为 true，并写 ending；否则 ended 为 false。
返回 JSON 字段：
result, title, era, year, location, character, status, scene, encountered, choices, ended, ending
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
    except Exception as exc:
        raise HTTPException(status_code=503, detail="这一轮剧情生成失败，请重试。") from exc
    session["payload"] = payload
    session["history"].append({"type": "choice", "choice": selected, "result": payload.get("result", ""), "scene": payload.get("scene", "")})
    _safe_record_analytics("time_travel", player_id, "秦末穿越", "", "choose")
    return {"success": True, "session_id": req.session_id, **payload}

@app.post("/time_travel/talk")
async def time_travel_talk(req: TimeTravelTalkRequest, x_client_id: Optional[str] = Header(None, alias="X-CLIENT-ID")):
    player_id = x_client_id if x_client_id else "unknown_player"
    if not check_rate_limit(player_id):
        raise HTTPException(status_code=429, detail="说话太快了，请稍等一下。")
    if not req.message.strip() or len(req.message) > 300:
        raise HTTPException(status_code=400, detail="对话内容不能为空，且不要超过 300 字。")
    session = _get_travel_session(req.session_id)
    current = session["payload"]
    people = current.get("encountered") or []
    person_name = req.person or (people[0].get("name") if people else "路人")
    prompt = f"""{_travel_system_prompt()}

当前游戏状态：
{json.dumps(current, ensure_ascii=False)}

用户正在和「{person_name}」说话。请以这个人物的身份回答。这个人物可以不知道大历史全貌，只能按自身身份、见闻和利益说话。
用户的话：{req.message.strip()}

返回 JSON：{{"speaker":"人物名","reply":"回答内容","attitude":"态度变化"}}
"""
    try:
        data = await _call_travel_model(
            [{"role": "user", "content": prompt}],
            max_tokens=360,
            model=TIME_TRAVEL_FAST_MODEL,
            timeout_seconds=TIME_TRAVEL_FAST_TIMEOUT,
        )
        speaker = str(data.get("speaker") or person_name)[:24]
        reply = str(data.get("reply") or "那人沉默片刻，没有立刻回答。")[:900]
        attitude = str(data.get("attitude") or "")[:80]
    except Exception as exc:
        raise HTTPException(status_code=503, detail="人物对话生成失败，请重试。") from exc
    session["history"].append({"type": "talk", "speaker": speaker, "message": req.message.strip(), "reply": reply})
    _safe_record_analytics("time_travel", player_id, "秦末穿越", speaker, "talk")
    return {"success": True, "speaker": speaker, "reply": reply, "attitude": attitude}

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
