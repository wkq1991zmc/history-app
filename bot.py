import json
import time
import os
from openai import OpenAI

# 引入你的剧本库
from load_data import EVENTS_DB

# ==========================================
# ⚙️ 核心配置区 (防破产保险)
# ==========================================
# ⚠️ 注意：因为脱离了 Streamlit 环境，这里直接填入你的 API Key
# 让代码去系统的环境变量（保险箱）里找密码
API_KEY = os.environ.get("ROUTERLINK_API_KEY") 
if not API_KEY:
    raise ValueError("找不到 API KEY，请检查环境变量配置！") # 👈 请替换为你真实的 sk- 开头的密码
TARGET_MODEL = "world3-router-north-america/google/gemini-3.1-pro-preview"
BASE_URL = "https://router-link.world3.ai/api/v1"

HISTORY_FILE = "chat_records.json"

# 🛑 破产刹车皮：
MAX_ROUNDS = 5       # 挂机期间，最多允许他们自动聊多少句？（建议先设5句测试）
SLEEP_TIME = 60      # 每句话聊完，让他们休息多少秒？（60秒 = 1分钟）
TARGET_STORY = "三国·赤壁之战" # 👈 你想让哪个房间的古人彻夜长谈？

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_history(data):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# ==========================================
# 🚀 挂机大循环 (西部世界引擎)
# ==========================================
print(f"🤖 [时空挂机引擎] 已启动！目标剧本：{TARGET_STORY}")
print(f"🛑 [防破产机制] 最大回合数：{MAX_ROUNDS}，发言间隔：{SLEEP_TIME}秒\n")

# 加载数据和剧本
all_chats = load_history()
if TARGET_STORY not in all_chats:
    all_chats[TARGET_STORY] = []
chat_history = all_chats[TARGET_STORY]

characters = EVENTS_DB[TARGET_STORY]['characters']
ai_notes = EVENTS_DB[TARGET_STORY].get('ai_notes', '')

# 开始自主博弈
for round_num in range(MAX_ROUNDS):
    # 1. 找出发言人：通过取余数，让角色们按列表顺序轮流发言
    speaker = characters[round_num % len(characters)]
    print(f"⏳ [第 {round_num + 1}/{MAX_ROUNDS} 回合] 正在等待 {speaker} 思考并反击...")

    # 2. 组装历史记忆
    history_text = ""
    for m in chat_history[-10:]: # 只读最近10条，省Token
        role_name = "【法官(我)】" if m["role"] == "user" else f"【{m.get('target', 'AI')}】"
        history_text += f"{role_name}: {m['content']}\n"

    # 3. 获取该剧本专属的高级语气约束
    dynamic_prompt = EVENTS_DB[TARGET_STORY].get('dynamic_prompt', '请用极其深沉、极具城府的帝王或名臣口吻反驳。做到绵里藏针、引经据典。绝不可使用粗鄙之语。')

    # 定制自主高维博弈 Prompt
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
        # 发送请求
        response = client.chat.completions.create(
            model=TARGET_MODEL,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": "轮到你发言了，请立刻反击上一个人的话！"}]
        )
        
        reply_text = response.choices[0].message.content
        reply_text = reply_text.replace("【角色原声】", "**【角色原声】**").replace("【白话解读】", "\n\n**【白话解读】**")
        
        # 存入 JSON 本地数据库
        chat_history.append({"role": "assistant", "content": reply_text, "target": speaker})
        save_history(all_chats)
        
        print(f"✅ {speaker} 发言完毕并已存入档案！")
        print(f"💬 内容预览: {reply_text[:50]}...\n")
        
    except Exception as e:
        print(f"❌ {speaker} 的时空信号中断：{e}")
        break # 报错就停，防止浪费钱
    
    # 4. 强制休眠，假装他们在打字，也是为了保护你的钱包
    if round_num < MAX_ROUNDS - 1:
        print(f"💤 群聊静默中，等待 {SLEEP_TIME} 秒后下一个人发言...\n")
        time.sleep(SLEEP_TIME)

print("🎉 [时空挂机引擎] 今日自主挂机任务圆满结束！请前往网页端查看他们的群聊记录。")