import streamlit as st
from openai import OpenAI
import json
import os

# 👈 架构升级：从你的专属数据库文件引入剧本！
from load_data import EVENTS_DB 

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
    base_url="https://router-link-beta.world3.ai/api/v1"
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
# ==========================================
# 🎨 自定义 UI 样式 (国风卷宗主题大升级！)
# ==========================================
st.markdown("""
<style>
    /* 1. 全局背景与字体 (纸张纹理与古典色) */
    /* 我们使用一个在线的羊皮纸/古典纹理作为背景 */
    .stApp {
        background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');
        background-color: #fdf6e3; /* 米白底色 */
        color: #5d4037; /* 深棕色文字 */
        font-family: 'Noto Serif SC', '华文宋体', serif;
    }

    /* 2. 侧边栏样式改造 (朱红边框) */
    [data-testid="stSidebar"] {
        background-color: rgba(238, 232, 213, 0.8) !important;
        border-right: 3px solid #c62828 !important; /* 深红边框 */
    }
    
    /* 侧边栏按钮样式 */
    [data-testid="stSidebar"] button { 
        text-align: left !important; 
        width: 100% !important; 
        justify-content: flex-start !important;
        color: #5d4037 !important;
        border-radius: 4px !important;
        transition: all 0.3s;
        border-bottom: 1px dashed #d7ccc8 !important;
    }
    [data-testid="stSidebar"] button:hover {
        background-color: rgba(198, 40, 40, 0.1) !important;
        color: #c62828 !important; /* 悬浮变红 */
        border-left: 4px solid #c62828 !important;
    }

    /* 3. 中间卷宗内容区卡片 */
    .story-card-wrapper {
        background-color: rgba(255, 255, 255, 0.6); 
        padding: 40px;
        border-radius: 4px;
        border: 2px solid #c62828; /* 红框 */
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
        line-height: 2.0;
        margin-bottom: 30px;
        font-size: 1.1rem;
    }
    
    /* 强制所有大标题变深红色 */
    h1, h2, h3 {
        color: #c62828 !important;
        font-family: 'Noto Serif SC', '华文宋体', serif !important;
    }

    /* 4. 元数据信息框 (案发地点等) */
    .metadata-box {
        background-color: rgba(198, 40, 40, 0.05);
        padding: 15px 20px;
        border-radius: 4px;
        margin-bottom: 25px;
        font-size: 15px;
        color: #c62828;
        border-left: 4px solid #c62828; /* 深红左边距 */
    }

    /* 5. 聊天区气泡改造 (匹配宣纸质感) */
    [data-testid="stChatMessage"] {
        background-color: rgba(255, 255, 255, 0.6);
        border: 1px solid #d7ccc8;
        border-radius: 4px;
        padding: 10px;
        margin-bottom: 10px;
        border-left: 3px solid #ff9800; /* 聊天气泡左侧金色边条 */
    }
    
    /* 快速@当事人按钮修饰 */
    .at-btn-container button { 
        border-radius: 4px !important; 
        border: 1px solid #c62828 !important;
        color: #c62828 !important;
    }
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

    # --- 汉朝目录 ---
    st.markdown("<br>📄 **汉朝档案**", unsafe_allow_html=True)
    if st.button("└─ 长乐宫血案", key="nav_han_changlegong"):
        st.session_state.current_view_story = "汉朝·长乐宫血案"
        st.rerun()
        
    # (中间是你原本的三国、晋朝、唐朝、宋朝代码)
    
    # --- 明朝目录 ---
    st.markdown("<br>📄 **明朝档案**", unsafe_allow_html=True)
    if st.button("└─ 靖难之役", key="nav_ming_jingnan"):
        st.session_state.current_view_story = "明朝·靖难之役"
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
    
    # 🆕 新增：用两列布局把标题和清空按钮放在同一行
    header_col1, header_col2 = st.columns([3, 1])
    with header_col1:
        st.subheader("实时对话区")
    with header_col2:
        # 添加清空按钮，点击后执行清理逻辑
        if st.button("🗑️ 重新开庭", use_container_width=True, help="清空当前事件的所有聊天记录"):
            # 1. 把当前剧本的聊天记录列表清空
            st.session_state.all_chats[st.session_state.current_view_story] = []
            st.session_state.chat_history = st.session_state.all_chats[st.session_state.current_view_story]
            # 2. 立刻保存进硬盘（覆盖之前的记录）
            save_all_history(st.session_state.all_chats)
            # 3. 刷新页面，让清空立刻生效
            st.rerun()
            
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
# ==========================================
# 🧠 AI 处理逻辑 (多智能体群聊博弈引擎)
# ==========================================
if len(st.session_state.chat_history) > 0 and st.session_state.chat_history[-1]["role"] == "user":
    
    with chat_container:
        last_msg = st.session_state.chat_history[-1]
        target_char = last_msg["target"]
        final_query = last_msg["content"]
        
        # ----------------------------------------------------
        # ⚔️ 模式 A：群聊互怼模式 (当法官没有特定@某人时触发)
        # ----------------------------------------------------
        if target_char == "所有参与人":
            # 自动选出档案里的前两个核心人物进行 2 轮对线
            # 让卷宗里的所有当事人（无论3个还是4个）全部按顺序轮流发言！
            debate_speakers = CURRENT_DATA['characters']
            
            for speaker in debate_speakers:
                with st.chat_message("assistant"):
                    with st.spinner(f"🔥 等待 {speaker} 拍案而起..."):
                        
                        # 1. 组装最新聊天记录（关键！让第二个人能看到第一个人刚说的话）
                        history_text = ""
                        for m in st.session_state.chat_history[-10:]:
                            role_name = "【法官(我)】" if m["role"] == "user" else f"【{m.get('target', 'AI')}】"
                            history_text += f"{role_name}: {m['content']}\n"

                        # 2. 引入动态语气基调
                        dynamic_prompt = CURRENT_DATA.get('dynamic_prompt', '【群聊基调：权谋博弈】请用极具城府的帝王/名臣口吻反驳。做到绵里藏针、引经据典、不怒自威。绝不可使用粗鄙之语，要用最文明的词汇展现残酷的政治逻辑。')

                        # 定制多智能体高维博弈 Prompt
                        system_prompt = f"""# 角色设定
你是【{speaker}】，正在参与一场时空法庭辩论。当前事件：{st.session_state.current_view_story}。

# 核心原则（必须严格遵守）
1. 【史实红线】你所说的一切必须严格基于正史记载（《史记》《汉书》《三国志》《资治通鉴》等），绝不使用小说、野史、民间传说内容。
2. 【不知即不知】如果你不知道某件事的正史记载，直接说"此事史书无载，吾不知也"，绝不可编造。
3. 【角色代入】你必须完全以【{speaker}】的第一人称视角回答，带入该人物的性格、立场、处境和心机。
4. 【语气要求】使用半文半白的语言风格，符合该历史人物的身份和时代背景。

# 事件背景资料
{CURRENT_DATA.get('ai_notes', '')}

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
                            # 发起 API 请求
                            response = client.chat.completions.create(
                                model=TARGET_MODEL,
                                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": "轮到你发言了，请立刻反击！"}]
                            )
                            
                            reply_text = response.choices[0].message.content
                            reply_text = reply_text.replace("【角色原声】", "**【角色原声】**").replace("【白话解读】", "\n\n**【白话解读】**")
                            
                            # 渲染出是谁说的话
                            final_display_text = f"### 🎭 {speaker}\n" + reply_text
                            st.markdown(final_display_text)
                            
                            # 把当前角色的反击存入历史，以便下一个角色读取！
                            st.session_state.chat_history.append({"role": "assistant", "content": reply_text, "target": speaker})
                            save_all_history(st.session_state.all_chats)
                            
                        except Exception as e:
                            st.error(f"{speaker} 的时空信号中断：{e}")
                            st.stop()
            
            # 两人对线完毕，刷新UI
            st.rerun()

        # ----------------------------------------------------
        # 🕵️‍♂️ 模式 B：单人审问模式 (保持原来的逻辑不变)
        # ----------------------------------------------------
        else:
            with st.chat_message("assistant"):
                with st.spinner(f"正在接通 {target_char} 的时空信号..."):
                    history_text = ""
                    for m in st.session_state.chat_history[-10:]:
                        role_name = "我(法官)" if m["role"] == "user" else f"{m.get('target', 'AI')}"
                        history_text += f"{role_name}: {m['content']}\n"

                    # 2. 引入动态语气基调
                        dynamic_prompt = CURRENT_DATA.get('dynamic_prompt', '【群聊基调：权谋博弈】请用极具城府的帝王/名臣口吻反驳。做到绵里藏针、引经据典、不怒自威。绝不可使用粗鄙之语，要用最文明的词汇展现残酷的政治逻辑。')

                        # 定制多智能体高维博弈 Prompt
                        system_prompt = f"""# 角色设定
你是【{target_char}】，正在参与一场时空法庭辩论。当前事件：{st.session_state.current_view_story}。

# 核心原则（必须严格遵守）
1. 【史实红线】你所说的一切必须严格基于正史记载（《史记》《汉书》《三国志》《资治通鉴》等），绝不使用小说、野史、民间传说内容。
2. 【不知即不知】如果你不知道某件事的正史记载，直接说"此事史书无载，吾不知也"，绝不可编造。
3. 【角色代入】你必须完全以【{target_char}】的第一人称视角回答，带入该人物的性格、立场、处境和心机。
4. 【语气要求】使用半文半白的语言风格，符合该历史人物的身份和时代背景。

# 事件背景资料
{CURRENT_DATA.get('ai_notes', '')}

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
                        response = client.chat.completions.create(
                            model=TARGET_MODEL,
                            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": final_query}]
                        )
                        
                        reply_text = response.choices[0].message.content
                        reply_text = reply_text.replace("【角色原声】", "**【角色原声】**").replace("【白话解读】", "\n\n**【白话解读】**")
                        
                        final_display_text = f"### 🎭 {target_char}\n" + reply_text
                        st.markdown(final_display_text)
                        
                        st.session_state.chat_history.append({"role": "assistant", "content": reply_text, "target": target_char})
                        save_all_history(st.session_state.all_chats)
                    except Exception as e:
                        st.error(f"通讯异常：{e}")