import streamlit as st
from openai import OpenAI
import json
import os

# 👈 架构升级：从你的专属数据库文件引入剧本！
from data import EVENTS_DB 

# ==========================================
# 💾 新增：本地记忆库读取与保存逻辑
# ==========================================
HISTORY_FILE = "chat_records.json"

def load_all_history():
    # 如果硬盘上有这个档案本，就读出来；没有就给个空的
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_all_history(data):
    # 把最新的聊天记录写进档案本里
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# ==========================================
# 1. 网页基础设置
# ==========================================
st.set_page_config(page_title="跨时空听证会 3.0", page_icon="⚖️", layout="wide")

# ==========================================
# 🔑 你的火山引擎（豆包）配置
# ==========================================
MY_API_KEY = st.secrets["ROUTERLINK_API_KEY"]
TARGET_MODEL = "world3-router-north-america/google/gemini-3.1-pro-preview"

client = OpenAI(
    api_key=MY_API_KEY, 
    base_url="https://router-link.world3.ai/api/v1"
)

# ==========================================
# 📊 初始化核心状态 (架构升级：引入永久记忆)
# ==========================================
if "all_chats" not in st.session_state: 
    st.session_state.all_chats = load_all_history() # 网页一开，先读硬盘
if "temp_at_target" not in st.session_state: 
    st.session_state.temp_at_target = ""
if "current_view_story" not in st.session_state: 
    st.session_state.current_view_story = list(EVENTS_DB.keys())[0]

# 确保当前视图在数据库中存在
if st.session_state.current_view_story not in EVENTS_DB:
    st.session_state.current_view_story = list(EVENTS_DB.keys())[0]
CURRENT_DATA = EVENTS_DB[st.session_state.current_view_story]

# 获取“当前这个事件”的专属聊天记录（如果没有，就新建一个空列表）
if st.session_state.current_view_story not in st.session_state.all_chats:
    st.session_state.all_chats[st.session_state.current_view_story] = []

# 把当前事件的记录单独提出来，方便后面调用
st.session_state.chat_history = st.session_state.all_chats[st.session_state.current_view_story]

# ==========================================
# 🎨 自定义 UI 样式 
# ==========================================
st.markdown("""
<style>
    [data-testid="stSidebar"] button { text-align: left !important; width: 100% !important; justify-content: flex-start !important; }
    
    .story-card-wrapper {
        background-color: var(--secondary-background-color); 
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); 
        border: 1px solid var(--border-color);
        line-height: 1.8;
        margin-bottom: 30px;
    }
    
    .metadata-box {
        background-color: rgba(0, 0, 0, 0.03);
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        font-size: 14px;
        color: #666;
        border-left: 4px solid #888;
    }
    
    .at-btn-container button { border-radius: 20px !important; padding: 2px 15px !important; width: 100% !important; }
</style>
""", unsafe_allow_html=True)

# ==========================================
# 📂 左侧 Sidebar：目录导航 (新增了三国目录！)
# ==========================================
with st.sidebar:
    st.markdown("<div style='color: #888; font-size: 14px; letter-spacing: 2px; margin-bottom: 10px;'>N A V I G A T I O N</div>", unsafe_allow_html=True)
    st.title("⚖️ 时空听证系统")
    st.divider()
    
    # --- 秦朝目录 ---
    st.markdown("📄 **秦朝档案**", unsafe_allow_html=True)
    if st.button("└─ 沙丘之变", key="nav_qin_shaqiu"):
        st.session_state.current_view_story = "秦朝·沙丘之变"
        st.rerun()
        
    # --- 三国目录 ---
    st.markdown("<br>📄 **东汉/三国档案**", unsafe_allow_html=True)
    if st.button("└─ 衣带诏事件", key="nav_3k_yidai"):
        st.session_state.current_view_story = "三国·衣带诏事件"
        st.rerun()
    if st.button("└─ 白门楼斩吕布", key="nav_3k_baimen"):
        st.session_state.current_view_story = "三国·白门楼斩吕布"
        st.rerun()
    # 在 app.py 侧边栏的三国目录下加上这两个：
    if st.button("└─ 赤壁之战", key="nav_3k_chibi"):
        st.session_state.current_view_story = "三国·赤壁之战"
        st.rerun()
    if st.button("└─ 荆州惊变", key="nav_3k_jingzhou"):
        st.session_state.current_view_story = "三国·荆州惊变（关羽之死）"
        st.rerun()
        
        
    # --- 唐朝目录 ---
    st.markdown("<br>📄 **唐朝档案**", unsafe_allow_html=True)
    if st.button("└─ 玄武门之变", key="nav_tang_xuanwu"):
        st.session_state.current_view_story = "唐朝·玄武门之变"
        st.rerun()
        
    # --- 宋朝目录 ---
    st.markdown("<br>📄 **宋朝档案**", unsafe_allow_html=True)
    if st.button("└─ 岳飞之死", key="nav_song_yuefei"):
        st.session_state.current_view_story = "宋朝·岳飞之死"
        st.rerun()

# ==========================================
# 📐 主页面布局 (渲染逻辑完全不用改！)
# ==========================================
col_history, col_spacer, col_chat = st.columns([2.5, 0.2, 2]) 

with col_history:
    st.markdown(f"<div style='color: #888; font-size: 14px; letter-spacing: 2px; margin-bottom: 10px;'>{CURRENT_DATA['manuscript']}</div>", unsafe_allow_html=True)
    st.title(CURRENT_DATA['title'])
    st.caption("Version 1 · 历史现场档案")
    
    st.markdown(f"""
    <div class="story-card-wrapper">
        <div class="metadata-box">
            <b>⏳ 发生时间：</b>{CURRENT_DATA['time']}<br>
            <b>📍 案发地点：</b>{CURRENT_DATA['location']}<br>
            <b>👥 卷宗涉案人：</b>{'、'.join(CURRENT_DATA['characters'])}
        </div>
        {CURRENT_DATA['story']}
    </div>
    """, unsafe_allow_html=True)

with col_chat:
    st.markdown("<div style='color: #888; font-size: 14px; letter-spacing: 2px; margin-bottom: 10px;'>I N T E R A C T I O N</div>", unsafe_allow_html=True)
    st.subheader("实时对话区")
    st.divider() 

    chat_container = st.container(height=500)
    with chat_container:
        if len(st.session_state.chat_history) == 0:
            st.info("等待提问... 请在下方点击 @ 选择质问对象，然后输入问题。")
            
        for msg in st.session_state.chat_history:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

    st.markdown("<small style='color:#888'>快速@当事人：</small>", unsafe_allow_html=True)
    
    char_count = len(CURRENT_DATA['characters'])
    col_ratios = [1] * char_count + [3] 
    col_btns = st.columns(col_ratios)
    
    for i, char in enumerate(CURRENT_DATA['characters']):
        with col_btns[i]:
            if st.button(f"@{char}", use_container_width=True):
                st.session_state.temp_at_target = char
                st.rerun()
    
    placeholder_text = "输入问题..."
    if st.session_state.temp_at_target:
        placeholder_text = f"正准备质问 @{st.session_state.temp_at_target}，请输入..."
        
    if user_input := st.chat_input(placeholder_text):
        target = "所有参与人"
        final_query = user_input
        
        if st.session_state.temp_at_target:
            target = st.session_state.temp_at_target
            final_query = f"**@{target}** {user_input}"
            st.session_state.temp_at_target = "" 

        st.session_state.chat_history.append({"role": "user", "content": final_query, "target": target})
        save_all_history(st.session_state.all_chats) # 👈 新增：你说完话，立刻存盘！
        st.rerun()

# ==========================================
# 🧠 AI 处理逻辑
# ==========================================
if len(st.session_state.chat_history) > 0 and st.session_state.chat_history[-1]["role"] == "user":
    
    with chat_container:
        with st.chat_message("assistant"):
            last_msg = st.session_state.chat_history[-1]
            target_char = last_msg["target"]
            
            with st.spinner("正在接通时空信号..."):
                history_text = ""
                for m in st.session_state.chat_history[-10:]:
                    role_name = "我(质问者)" if m["role"] == "user" else "AI"
                    history_text += f"{role_name}: {m['content']}\n"

                system_char_prompt = "请综合当前对话上下文进行回答。"
                if target_char != "所有参与人":
                    system_char_prompt = f"你现在是【{target_char}】。请极度还原你当时的性格和处境（如果是汉献帝，表现绝望与屈辱；如果是曹操，表现傲慢与多疑；如果是刘备，表现隐忍与圆滑；如果是吕布，表现贪生怕死）。"
                
                system_prompt = f"""
                你是一个极其严谨的历史交互AI。当前事件：{st.session_state.current_view_story}。
                
                {system_char_prompt}
                
                【史实最高红线】：
                你必须严格依据《三国志》、《资治通鉴》、《史记》等【正史】记载回答问题，绝不能使用《三国演义》等古典小说、影视剧或民间野史中的虚构设定！
                例如：若你扮演吕布，必须明确你的妻子不是貂蝉（貂蝉为虚构），你只与董卓的无名侍女私通；若你扮演刘备，不能提及桃园三结义等小说情节。
                如果用户问到了正史中没有记载的细节（如具体姓名、虚构事件），你必须以角色的口吻，直接指出该说法荒谬，或坦言不知。

                以下是你们之前的对话记录：
                {history_text}
                
                请针对我最后说的话做出回应。必须严格按照以下格式回答，两段之间空一行：
                
                **【角色原声】**：用半文半白的话回答，带入强烈的角色当时情绪。
                
                **【白话解读】**：用现代大白话解释你上一句的意思。
                """
                
                try:
                    response = client.chat.completions.create(
                        model=TARGET_MODEL,
                        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": "final_query"}]
                    )
                    
                    reply_text = response.choices[0].message.content
                    reply_text = reply_text.replace("【角色原声】", "**【角色原声】**").replace("【白话解读】", "\n\n**【白话解读】**")
                    
                    st.markdown(reply_text)
                    st.session_state.chat_history.append({"role": "assistant", "content": reply_text, "target": "assistant"})
                    save_all_history(st.session_state.all_chats) # 👈 新增：AI说完话，立刻存盘！
                    
                except Exception as e:
                    st.error(f"通讯异常：{e}")