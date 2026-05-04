from fastapi import FastAPI, Header, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import httpx
import json
import re
import time
from collections import defaultdict

from load_data import EVENTS_DB 

app = FastAPI()

ROUTERLINK_API_KEY = os.environ.get("ROUTERLINK_API_KEY")
TARGET_MODEL = "world3-router-north-america/google/gemini-3.1-pro-preview"
BASE_URL = "https://router-link.world3.ai/api/v1/chat/completions"

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

# ======== 🌟 用户隔离系统全局配置 ========
# 请在 Render 或 .env 里配置你的小程序密钥
WX_APP_ID = os.environ.get("WX_APP_ID", "")
WX_APP_SECRET = os.environ.get("WX_APP_SECRET", "")

class LoginRequest(BaseModel):
    code: str

@app.post("/login")
async def wx_login(req: LoginRequest):
    """
    通过前端 wx.login() 给的 code，去腾讯服务器换取 openid
    """
    if not WX_APP_ID or not WX_APP_SECRET:
        # 如果开发者还没配置真正的密钥，为了不卡死流程，提供一个假装成功的伪 OpenID
        print("未配置微信 AppID/Secret，生成模拟 OpenID")
        return {"success": True, "openid": f"mock_user_{req.code[-6:]}"}

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

# 🌟 核心升级：重新定义微信发过来的“快递盒”格式
class ChatRequest(BaseModel):
    event_name: str      # 微信告诉我们当前在哪个案子 (例如: "三国·赤壁之战")
    character: str       # 微信告诉我们当前在审问谁 (例如: "曹操")
    message: str         # 微信发来的最新质问
    history: List[Dict]  # 🌟 微信传过来的历史聊天记录（给 AI 记忆！）

@app.post("/chat")
async def ai_chat(request: ChatRequest, x_wx_openid: Optional[str] = Header(None, alias="X-WX-OPENID")):
    try:
        player_id = x_wx_openid if x_wx_openid else "unknown_player"
        
        if not check_rate_limit(player_id):
            return {"reply": "发言太快了，请稍等片刻再问。", "original_voice": "", "modern_explain": "", "character": request.character}
        
        print(f"\n=== 收到微信提审请求 ===")
        print(f"玩家: {player_id} | 案件: {request.event_name} | 被告: {request.character}")
        
        # 1. 从剧本库中提取该案件的专属设定
        event_data = EVENTS_DB.get(request.event_name, {})
        ai_notes = event_data.get('ai_notes', '')
        dynamic_prompt = event_data.get('dynamic_prompt', '请用符合历史人物性格的半文半白语气回答。')

        # 2. 组装历史记忆 (把微信传来的 history 翻译给大模型听)
        history_text = ""
        # 新增：直接构造大模型的 payload array 让每次他都知道前文！
        message_history = []
        for m in request.history[-10:]:  # 只取最近10条，省钱且防遗忘
            if not isinstance(m, dict):
                continue
            role_type = m.get("role", "user")
            content_text = m.get("content", "")
            # 为了严谨也填入原生 message history 中发给模型！
            message_history.append({"role": "user" if role_type == "user" else "assistant", "content": content_text})
            
            role_name = "【法官(我)】" if role_type == "user" else f"【{m.get('target', 'AI')}】"
            history_text += f"{role_name}: {content_text}\n"

        # 3. 融合生成终极 System Prompt
        system_prompt = f"""# 角色设定
你是【{request.character}】，正在参与一场时空法庭辩论。当前事件：{request.event_name}。

# 核心原则（必须严格遵守）
1. 【史实红线】你所说的一切必须严格基于正史记载（《史记》《汉书》《三国志》《资治通鉴》等），绝不使用小说、野史、民间传说内容。
2. 【不知即不知】如果你不知道某件事的正史记载，直接说"此事史书无载，吾不知也"，绝不可编造。
3. 【角色代入】你必须完全以【{request.character}】的第一人称视角回答，带入该人物的性格、立场、处境和心机。
4. 【语气要求】使用半文半白的语言风格，符合该历史人物的身份和时代背景。

# 事件背景资料
{ai_notes}

# 语气基调
{dynamic_prompt}

# 最新案件问答文本参考
{history_text}

# 输出格式（必须严格遵守）
你必须且只能按以下 JSON 格式返回，不要包含任何多余字母：
{{
  "original_voice": "此处半文半白的语言",
  "modern_explain": "此处现代大白话"
}}
"""

        # 4. 呼叫大模型 (放弃易碎的 OpenAI SDK，改用原生 HTTP 适配一切刁钻模型)
        headers = {
            "Authorization": f"Bearer {ROUTERLINK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 将 system prompt 和 历史记忆拼在一起传给大模型！
        final_messages = [{"role": "system", "content": system_prompt}] + message_history + [{"role": "user", "content": request.message}]
        
        payload = {
            "model": "world3-router-north-america/google/gemini-3.1-pro-preview",
            "messages": final_messages
        }
        
        async with httpx.AsyncClient(timeout=60.0) as fetch_client:
            resp = await fetch_client.post(BASE_URL, headers=headers, json=payload)
            
        if resp.status_code != 200:
            print(f"RouterLink 接口报错 {resp.status_code}: {resp.text}")
            return {"reply": f"时空信号异常 (HTTP {resp.status_code})。请稍后再试。", "original_voice": "", "modern_explain": "", "character": request.character}
            
        result_data = resp.json()
        reply_content = result_data['choices'][0]['message']['content']
        
        print(f"[{request.character}] 原理级返回内容:\n{reply_content}")
        
        import json
        import re
        
        # 尝试清理可能被某些模型多此一举包上的 ```json ``` markdown 代码块
        # 并从中剥出干净的 {} 内容
        raw_content = reply_content.strip()
        match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if match:
            clean_json_str = match.group(0)
        else:
            clean_json_str = raw_content

        try:
            parsed_reply = json.loads(clean_json_str)
            original_voice = parsed_reply.get("original_voice", reply_content)
            modern_explain = parsed_reply.get("modern_explain", "")
        except json.JSONDecodeError:
            # 如果大模型抽风没有返回标准JSON的兜底
            print("警告: 返回不是标准 JSON, 尝试兜底解析")
            original_voice = reply_content
            modern_explain = ""

        print(f"[{request.character}] 辩护完毕。")
        
        # 5. 打包寄回给微信
        return {
            "reply": original_voice, # 现在主内容只返回原声，方便老代码兼容
            "original_voice": original_voice.strip(),
            "modern_explain": modern_explain.strip(),
            "character": request.character
        }

    except Exception as e:
        import traceback
        traceback.print_exc() # 极其重要：在日志打印出真正的奔溃行
        print(f"服务端顶层拦截到未捕获错误: {e}")
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
            import re
            match = re.search(r'公元前(\d+)-?(\d+)?年', time_str)
            if match:
                year = f"前{match.group(1)}年"
        elif '公元' in time_str:
            import re
            match = re.search(r'公元(\d+)-?(\d+)?年', time_str)
            if match:
                year = f"{match.group(1)}年"
                
        story = data.get('story', '')
        import re
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
        if not year_str: # 如果解析失败的垫底
            return 9999
        import re
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
