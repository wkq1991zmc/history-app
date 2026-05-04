import json
import time
import os
import httpx

from load_data import EVENTS_DB

API_KEY = os.environ.get("ROUTERLINK_API_KEY") 
if not API_KEY:
    raise ValueError("找不到 API KEY，请检查环境变量配置！")
TARGET_MODEL = "world3-router-north-america/google/gemini-3.1-pro-preview"
BASE_URL = "https://router-link.world3.ai/api/v1/chat/completions"

HISTORY_FILE = "chat_records.json"

MAX_ROUNDS = 5
SLEEP_TIME = 60
TARGET_STORY = "三国·赤壁之战"

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_history(data):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

print(f"🤖 [时空挂机引擎] 已启动！目标剧本：{TARGET_STORY}")
print(f"🛑 [防破产机制] 最大回合数：{MAX_ROUNDS}，发言间隔：{SLEEP_TIME}秒\n")

all_chats = load_history()
if TARGET_STORY not in all_chats:
    all_chats[TARGET_STORY] = []
chat_history = all_chats[TARGET_STORY]

characters = EVENTS_DB[TARGET_STORY]['characters']
ai_notes = EVENTS_DB[TARGET_STORY].get('ai_notes', '')

for round_num in range(MAX_ROUNDS):
    speaker = characters[round_num % len(characters)]
    print(f"⏳ [第 {round_num + 1}/{MAX_ROUNDS} 回合] 正在等待 {speaker} 思考并反击...")

    history_text = ""
    for m in chat_history[-10:]:
        role_name = "【法官(我)】" if m["role"] == "user" else f"【{m.get('target', 'AI')}】"
        history_text += f"{role_name}: {m['content']}\n"

    dynamic_prompt = EVENTS_DB[TARGET_STORY].get('dynamic_prompt', '请用极其深沉、极具城府的帝王或名臣口吻反驳。做到绵里藏针、引经据典。绝不可使用粗鄙之语。')

    system_prompt = f"""
    你是一个极其严谨的历史交互AI。当前事件：{TARGET_STORY}。
    你现在的身份是【{speaker}】。你正在一个多方政客/名将的辩论局中。
    
    {ai_notes}
    
    {dynamic_prompt}
    
    以下是你们之前的对话记录：
    {history_text}
    
    轮到你发言了！请你以【{speaker}】的身份，针对上一条消息进行高维度的辩驳与政治交锋！
    不要长篇大论，拒绝无脑骂街，必须严格按照以下格式回答：
    
    **【角色原声】**：用半文半白的语言反驳，展现深沉的心机、大局观或历史的无奈。
    
    **【白话解读】**：用现代大白话拆解你上一句话背后的真实政治意图。
    """
    
    try:
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": TARGET_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "轮到你发言了，请立刻反击上一个人的话！"}
            ]
        }
        
        with httpx.Client(timeout=60.0) as fetch_client:
            resp = fetch_client.post(BASE_URL, headers=headers, json=payload)
            
        if resp.status_code != 200:
            raise Exception(f"接口 HTTP {resp.status_code}: {resp.text}")
            
        reply_text = resp.json()['choices'][0]['message']['content']
        reply_text = reply_text.replace("【角色原声】", "**【角色原声】**").replace("【白话解读】", "\n\n**【白话解读】**")
        
        chat_history.append({"role": "assistant", "content": reply_text, "target": speaker})
        save_history(all_chats)
        
        print(f"✅ {speaker} 发言完毕并已存入档案！")
        print(f"💬 内容预览: {reply_text[:50]}...\n")
        
    except Exception as e:
        print(f"❌ {speaker} 的时空信号中断：{e}")
        break
    
    if round_num < MAX_ROUNDS - 1:
        print(f"💤 群聊静默中，等待 {SLEEP_TIME} 秒后下一个人发言...\n")
        time.sleep(SLEEP_TIME)

print("🎉 [时空挂机引擎] 今日自主挂机任务圆满结束！请前往网页端查看他们的群聊记录。")
