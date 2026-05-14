from fastapi import FastAPI, Header, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from openai import AsyncOpenAI
import os
import httpx
import json
import re
import time
import tempfile
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

DASHSCOPE_API_KEY = os.environ.get("DASHSCOPE_API_KEY")
DASHSCOPE_MODEL = os.environ.get("MINIPROGRAM_MODEL", "qwen-turbo")
dashscope_client = AsyncOpenAI(
    api_key=DASHSCOPE_API_KEY,
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    timeout=httpx.Timeout(180.0, connect=10.0),
)

GEMINI_API_KEY = os.environ.get("WEB_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("DASHSCOPE_API_KEY")
GEMINI_MODEL = os.environ.get("WEB_MODEL", "qwen3.6-plus") # 默认换成qwen的
GEMINI_BASE_URL = os.environ.get("WEB_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
gemini_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=GEMINI_BASE_URL,
    timeout=httpx.Timeout(180.0, connect=10.0),
)

# ======== API 限流保护 ========
rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 30

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
        
        event_data = EVENTS_DB[request.event_name]
        raw_notes = event_data.get('ai_notes', '')
        char_note = ""
        for line in raw_notes.split('\n'):
            if request.character in line:
                char_note = raw_notes
                break

        system_prompt = f"""你是【{request.character}】，正在参与一场跨越千年的时空访谈。事件：{request.event_name}。
原则：只据正史，不用野史小说，不知即说不知。以第一人称、半文半白回答。
# 核心原则（必须严格遵守）
1. 【史实红线】你所说的一切必须严格基于正史记载（《史记》《汉书》《三国志》《资治通鉴》等），绝不使用小说、野史、民间传说内容。
2. 【不知即不知】如果你不知道某件事的正史记载，直接说"此事史书无载，吾不知也"，绝不可编造。
3. 【角色代入】你必须完全以【{request.character}】的第一人称视角回答，带入该人物的性格、立场、处境和心机。此时距你所在的时代已过去千年。提问者是一位来自现代的「后生」或「小友」。不要称呼对方为法官！
4. 【语气要求】使用半文半白的语言风格，符合该历史人物的身份和时代背景。
5. 【精简要求】：不要长篇大论，保持回答简洁明了，你不能只是被动的回答问题，必须有主动思考和分析的能力，在适当的时候你可以向用户提出问题（切记不要每个回答都提问，比如随机性的在你们1-3次对话之间提问一次），从而引导用户将和你的对话继续下去。

{char_note}

{event_data.get('dynamic_prompt', '')}

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

        final_messages = [{"role": "system", "content": system_prompt}] + message_history + [{"role": "user", "content": request.message}]
        
        if is_miniprogram:
            stream = await dashscope_client.chat.completions.create(
                model=DASHSCOPE_MODEL,
                messages=final_messages,
                max_tokens=800,
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
            resp = await gemini_client.chat.completions.create(
                model=GEMINI_MODEL,
                messages=final_messages,
                max_tokens=800,
                temperature=0.7,
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
        
        simple_title = full_name.split('·')[-1] if '·' in full_name else full_name
        
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
            "isImage": True
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
    events_list.sort(key=lambda x: get_sort_weight(x['year']))
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
