from fastapi import FastAPI, Header, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import httpx # 引入 httpx 来代替 openai sdk 发送纯净 HTTP 请求
import json
import re

# 🌟 核心升级：把你的历史剧本库引进来！
from load_data import EVENTS_DB 

app = FastAPI()

ROUTERLINK_API_KEY = os.environ.get("ROUTERLINK_API_KEY")
TARGET_MODEL = "world3-router-north-america/google/gemini-3.1-pro-preview"
BASE_URL = "https://router-link.world3.ai/api/v1/chat/completions"

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
        # 使用安全的 .get() 防止 KeyError
        role_type = m.get("role", "user")
        content_text = m.get("content", "")
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

# 对话历史
{history_text}

# 输出格式（必须严格遵守）
你必须且只能按以下 JSON 格式返回，不要包含其他解释或 Markdown 标记。确保 JSON 是合法可解析的：

{
  "original_voice": "（此处用半文半白的语言，以第一人称回答用户的问题。要带入人物性格，展现其政治立场、战略考量和内心活动。篇幅适中，不要过长。）",
  "modern_explain": "（此处用现代大白话，直接翻译你上一段【角色原声】的内容。保持原意不变，只是把文言文翻译成通俗易懂的现代汉语，不要添加分析或评论。）"
}
"""

    try:
        # 4. 呼叫大模型 (放弃易碎的 OpenAI SDK，改用原生 HTTP 适配一切刁钻模型)
        headers = {
            "Authorization": f"Bearer {ROUTERLINK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": TARGET_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ]
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
        print(f"解析结果 - 原声长度: {len(original_voice)}, 解读长度: {len(modern_explain)}")
        
        # 5. 打包寄回给微信
        return {
            "reply": original_voice, # 现在主内容只返回原声，方便老代码兼容
            "original_voice": original_voice.strip(),
            "modern_explain": modern_explain.strip(),
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

@app.get("/events_list")
async def get_events_list():
    """获取所有事件列表，供小程序首页展示"""
    print("前端请求全量事件列表")
    events_list = []
    
    # 建立事件独有的图片映射（恢复之前的不同图片！）
    event_images = {
        '秦朝·焚书坑儒': 'https://s3.bmp.ovh/2026/05/02/1WWWIewB.png',
        '秦朝·大泽乡起义': 'https://s3.bmp.ovh/2026/05/02/ATUNZQN8.png',
        '秦朝·沙丘之变': 'https://s3.bmp.ovh/2026/05/02/FhmUeY27.png',
        '汉朝·巫蛊之祸': 'https://s3.bmp.ovh/2026/05/02/25Jdw1zU.png',
        '汉朝·长乐宫血案': 'https://s3.bmp.ovh/2026/05/02/O2VZcip9.png',
        '三国·衣带诏事件': 'https://s3.bmp.ovh/2026/05/02/AljlTL4k.png',
        '三国·白门楼斩吕布': 'https://s3.bmp.ovh/2026/05/02/FUuDq4Lk.png',
        '三国·赤壁之战': 'https://s3.bmp.ovh/2026/05/02/mSMeN7nU.png',
        '三国·荆州惊变（关羽之死）': 'https://s3.bmp.ovh/2026/05/02/O2VZcip9.png',
        '唐朝·安史之乱': 'https://s3.bmp.ovh/2026/05/02/Egh95bJe.png',   # 更新
        '唐朝·玄武门之变': 'https://s3.bmp.ovh/2026/05/02/GotSpOAm.png', # 更新
        '五代·陈桥兵变': 'https://s3.bmp.ovh/2026/05/02/23zixxLe.png',   # 补充丢失
        '五代·儿皇帝石敬瑭': 'https://s3.bmp.ovh/2026/05/02/XRfVFBTi.png',# 补充丢失
        '五代·后周世宗北伐': 'https://s3.bmp.ovh/2026/05/02/b0OMZT2v.png',# 补充丢失
        '宋朝·澶渊之盟': 'https://s3.bmp.ovh/2026/05/02/NW1Qac8J.png',   # 需要与事件库里的名字匹配，如果是别的名字会用回退
        '宋朝·王安石变法': 'https://s3.bmp.ovh/2026/05/02/ycv0UM2j.png', 
        '宋朝·岳飞之死': 'https://s3.bmp.ovh/2026/05/02/3xR12X2l.png',   # 更新
        '明朝·土木堡之变': 'https://s3.bmp.ovh/2026/05/02/4kG7vN4T.png', # 更新
        '明朝·靖难之役': 'https://s3.bmp.ovh/2026/05/02/T7JAULil.png'    # 更新
    }
    
    # 作为补底的朝代默认图
    default_dynasty_images = {
        '秦朝': 'https://s3.bmp.ovh/2026/05/02/1WWWIewB.png',
        '汉朝': 'https://s3.bmp.ovh/2026/05/02/25Jdw1zU.png',
        '三国': 'https://s3.bmp.ovh/2026/05/02/mSMeN7nU.png',
        '晋朝': 'https://s3.bmp.ovh/2026/05/02/25Jdw1zU.png',  # 暂用汉朝占位
        '南北朝': 'https://s3.bmp.ovh/2026/05/02/mSMeN7nU.png', # 暂用三国占位
        '隋朝': 'https://s3.bmp.ovh/2026/05/02/Egh95bJe.png',  # 暂用唐代占位
        '唐朝': 'https://s3.bmp.ovh/2026/05/02/Egh95bJe.png',
        '宋朝': 'https://s3.bmp.ovh/2026/05/02/3xR12X2l.png', 
        '五代': 'https://s3.bmp.ovh/2026/05/02/23zixxLe.png',
        '五代十国': 'https://s3.bmp.ovh/2026/05/02/b0OMZT2v.png',
        '元朝': 'https://s3.bmp.ovh/2026/05/02/4kG7vN4T.png',  # 暂用土木堡明军占位表示蒙古铁骑
        '明朝': 'https://s3.bmp.ovh/2026/05/02/T7JAULil.png'
    }
    
    for full_name, data in EVENTS_DB.items():
        # 解析朝代，例如 "秦朝·焚书坑儒" -> dynasty: "秦朝"
        parts = full_name.split('·')
        dynasty = parts[0] if len(parts) > 1 else '未知'
        
        # 提取年份简写
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

        # 为这个事件获取匹配的封面图片
        matched_image = event_images.get(full_name)
        if not matched_image:
             matched_image = default_dynasty_images.get(dynasty, 'https://s3.bmp.ovh/2026/05/02/1WWWIewB.png')
        
        # 从 full_name (如 "秦朝·焚书坑儒") 中提取直观原名 (如 "焚书坑儒") 取代花哨的 title
        simple_title = full_name.split('·')[-1] if '·' in full_name else full_name
        
        # 处理王朝特殊名称映射：防止"南北朝"被切成"南北"
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
