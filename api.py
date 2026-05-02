from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from openai import OpenAI
import os

# 🌟 核心升级：把你的历史剧本库引进来！
from load_data import EVENTS_DB 

app = FastAPI()

# 准备好 Claude Opus 4.7 引擎 
client = OpenAI(
    api_key=os.environ.get("ROUTERLINK_API_KEY"),  
    base_url="https://router-link.world3.ai/api/v1"
)

# 🌟 核心升级：重新定义微信发过来的“快递盒”格式
class ChatRequest(BaseModel):
    event_name: str      # 微信告诉我们当前在哪个案子 (例如: "三国·赤壁之战")
    character: str       # 微信告诉我们当前在审问谁 (例如: "曹操")
    message: str         # 微信发来的最新质问
    history: List[Dict]  # 🌟 微信传过来的历史聊天记录（给 AI 记忆！）

@app.post("/chat")
async def ai_chat(request: ChatRequest):
    print(f"\n=== 收到微信提审请求 ===")
    print(f"案件: {request.event_name} | 被告: {request.character}")
    
    # 1. 从剧本库中提取该案件的专属设定
    event_data = EVENTS_DB.get(request.event_name, {})
    ai_notes = event_data.get('ai_notes', '')
    dynamic_prompt = event_data.get('dynamic_prompt', '请用符合历史人物性格的半文半白语气回答。')

    # 2. 组装历史记忆 (把微信传来的 history 翻译给大模型听)
    history_text = ""
    for m in request.history[-10:]:  # 只取最近10条，省钱且防遗忘
        role_name = "【法官(我)】" if m["role"] == "user" else f"【{m.get('target', 'AI')}】"
        history_text += f"{role_name}: {m['content']}\n"

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

# 对话历史
{history_text}

# 输出格式（必须严格遵守）
你必须且只能按以下两部分格式回答，不可添加任何其他内容：

【角色原声】
（此处用半文半白的语言，以第一人称回答用户的问题。要带入人物性格，展现其政治立场、战略考量和内心活动。篇幅适中，不要过长。）

【白话解读】
（此处用现代大白话，直接翻译你上一段【角色原声】的内容。保持原意不变，只是把文言文翻译成通俗易懂的现代汉语，不要添加分析或评论。）
"""

    try:
        # 4. 呼叫大模型
        response = client.chat.completions.create(
            model="world3-router-north-america/anthropic/claude-opus-4.7",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ]
        )
        
        reply = response.choices[0].message.content
        print(f"[{request.character}] 辩护完毕。")
        
        # 解析回复，分离角色原声和白话解读
        original_voice = ""
        modern_explain = ""
        
        # 尝试多种可能的标记格式
        patterns = [
            ("【角色原声】", "【白话解读】"),
            ("**【角色原声】**", "**【白话解读】**"),
            ("**角色原声**", "**白话解读**"),
        ]
        
        found = False
        for orig_mark, mod_mark in patterns:
            if orig_mark in reply and mod_mark in reply:
                parts = reply.split(mod_mark)
                original_part = parts[0].replace(orig_mark, "").strip().strip("*").strip()
                modern_part = parts[1].strip().strip("*").strip() if len(parts) > 1 else ""
                original_voice = original_part
                modern_explain = modern_part
                found = True
                break
        
        if not found:
            original_voice = reply
        
        print(f"解析结果 - 原声长度: {len(original_voice)}, 解读长度: {len(modern_explain)}")
        
        # 5. 打包寄回给微信
        return {
            "reply": reply,
            "original_voice": original_voice,
            "modern_explain": modern_explain,
            "character": request.character
        }
        
    except Exception as e:
        print(f"大模型连接异常: {e}")
        return {"reply": f"时空信号中断，{request.character} 拒绝回答。错误: {e}"}
    
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