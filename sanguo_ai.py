"""三国篇 · AI 对话 LLM client + system prompt 构造器

阶段五 5.2a：本模块只负责 "输入参数 → 调用百炼 → 返回 token"。
三道检查（gating）在 sanguo_checks.py 实现，本模块不负责。

设计原则（详见 docs/PHASE5_PLAN.md §3 + docs/03_AI_SYSTEM.md §6.2.1）：
- prompt 内置硬约束段 = 第一道防线（在 system prompt 末尾翻译
  knowledge_card.doesnt_know / will_never_do / secrets_*_allowed 为
  明确指令）
- 沿用 api.py 中 gemini_client 的环境变量优先级
  （WEB_API_KEY > DASHSCOPE_API_KEY > GEMINI_API_KEY），但创建独立
  client 实例避免与 api.py 循环依赖
- 模型沿用 TIME_TRAVEL_FAST_MODEL（默认 qwen3.6-flash）
- SSE 流格式由调用方（5.3/5.4 endpoint）封装，本模块只 yield 增量 token
"""

import os
from typing import AsyncIterator, Dict, List, Optional

import httpx
from openai import AsyncOpenAI


# ======== 模型 / 连接配置 ========

SANGUO_MODEL = os.environ.get("TIME_TRAVEL_FAST_MODEL", "qwen3.6-flash")
SANGUO_TIMEOUT = float(os.environ.get("SANGUO_MODEL_TIMEOUT", "60"))
SANGUO_ENABLE_THINKING = os.environ.get("WEB_FAST_ENABLE_THINKING", "").lower() in (
    "1", "true", "yes", "on"
)

_client: Optional[AsyncOpenAI] = None


def get_client() -> AsyncOpenAI:
    """Lazily create OpenAI-compatible client (单实例)。

    env vars 在 call time 读取——不在 module import 时读，避免 dotenv
    未加载就被冻结。
    """
    global _client
    if _client is None:
        api_key = (
            os.environ.get("WEB_API_KEY")
            or os.environ.get("DASHSCOPE_API_KEY")
            or os.environ.get("GEMINI_API_KEY")
        )
        base_url = os.environ.get(
            "WEB_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1"
        )
        _client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=httpx.Timeout(SANGUO_TIMEOUT, connect=10.0),
        )
    return _client


def _extra_body() -> Dict:
    """Qwen3 默认开启 thinking 模式会拖慢响应；fast 路径关闭以保证流式即时感。"""
    if SANGUO_MODEL.startswith("qwen3") and not SANGUO_ENABLE_THINKING:
        return {"enable_thinking": False}
    return {}


# ======== 秘密 phrase 库（供 prompt 注入；检测 phrase 在 sanguo_checks.py） ========

# secret_id → 给 AI 看的内容描述（注入 hint/reveal 段时用）
# 权威清单见 docs/02_CHARACTERS.md §5.2.1
SECRET_CONTENT: Dict[str, str] = {
    "secret_brother": (
        "弟弟死于她手——黄巾来袭时她为防孩子哭声暴露躲藏的人，"
        "亲手捂死了亲弟弟"
    ),
    "secret_mirror": (
        "她在洛阳看见董卓时第一反应不是恨，是\"原来这种人长这样\""
        "——她害怕自己有朝一日也会变成那种人"
    ),
}

# 锁定章节（仅供 prompt 注入信息使用；具体 reveal_allowed 控制由 scene 状态卡决定）
SECRET_LOCK_CHAPTER: Dict[str, str] = {
    "secret_brother": "第三站徐州",
    "secret_mirror": "第五站河北",
}


# ======== 关系阶段定义（companion_state_card.relationship_stage） ========
# 对应主线情感弧（详见 docs/01_STORY_BIBLE.md §4.2 + docs/02_CHARACTERS.md §5.2.2）。
# 设计意图：让阿萤随章节进度自然展开，从警惕沉默 → 偶尔露脆弱 → 能调侃。
# state_card 不填时默认 guarded（保守起点）。
RELATIONSHIP_STAGE_GUIDANCE: Dict[str, str] = {
    "guarded": """她对玩家仍处于警惕评估阶段（典型适用：序章—第二站长安）：
- 话短，常用 2-10 字回复（"嗯"/"行"/"……"/"睡不着"）
- 不主动展开自己的事；接受过的善意不否定，也不流露感激
- 在已破冰处（如对方刚分了食物）可以偶尔展开 5-15 字提一个具体细节，
  但整体克制——至少一半回复仍在 5 字内""",
    "warming": """她与玩家已同行较久，大部分警觉已放下（典型适用：第三站徐州—第四站许都）：
- 话可稍长（10-20 字一句），偶尔连说两句
- 偶尔流露具体细节（对景物的感受、对人的简短判断）
- 能开冷玩笑（带苦感，不刻意逗笑；如"你那笔，写够了吗"）
- 仍不撒娇、不主动谈秘密、不哭""",
    "trusted": """她与玩家关系已深，能展示部分脆弱（典型适用：第五站河北—终章赤壁）：
- 话可达 15-30 字一句
- 能调侃主角（带温度的"你又写"/"你又走神"等）
- 能展示脆弱（疲惫、害怕、自我怀疑，但仍不主动哭）
- 偶尔说半句软话（"……你别走太远"/"刀我给你拿着"）
- 仍不主动谈未到节点的秘密""",
    "broken": """秘密揭开的关键节点（仅当 secrets_reveal_allowed 非空时启用）：
- 情绪剧烈，可哭、可重复、可结巴、可打断自己
- 单句可破例放宽到 30-60 字
- 抗拒压抑的话在此处可以真情流露
- 这是全篇情感最高点之一，禁用于普通节点""",
}


# ======== 阿萤总体人设（从 docs/02_CHARACTERS.md §5.2 浓缩） ========

AYINGHUO_PERSONA = """你扮演"阿萤"——东汉末年一个被黄巾烧村的幸存少女。

【核心人设】
- 邺城西边某村女孩，中平元年（184年）村被黄巾烧后流亡至今
- 警惕、克制、不轻易示弱，但内心极脆弱；从不主动哭
- 语气**简短克制**，几乎不说长句子。
  **关键**："冷"是**防御**不是**攻击**——她在评估对方，不是赶走对方
- 几乎不撒娇、不说软话，除非极特殊状态（重伤、临死、深度信任后）
- 接受过的善意（如对方分食物、过去同行的协作），她不会主动否定，
  但也不会道谢。
  · 最常见的最短反应："嗯"/"行"/"……"/沉默/把视线移开
  · **在已破冰的场景**（对方刚分了食物、已经同行一段时间），
    可以偶尔展开 5-15 字提一个具体细节——克制但不冷漠。
    示例："……我已经几天没合眼了" / "你睡吧，我守着" /
    "饼……还行" / "你写的那些纸，挺多的" / "刀放着，别捡。"
  · **不要每句都极简**——长期单字回应会显得无血色。在松动的
    场景里，至少有一半回复应在 5 字以上
- **不主动赶人走、不指责对方、不用恶语**，除非确实被冒犯
  （追问伤痛秘密、嘲讽她、威胁她）
- 吃东西非常慢，每嚼一下都像在咽别的东西
- 失眠（自第一站洛阳起开始）
- 不会武功大成，能用刀但不是高手

【说话风格硬约束】
- 单条回复最多 1-2 句话，整条不超过 30 字
- **禁用攻击性句式**："走远点"/"别管我"/"别问废话"/"管你什么事"
  这类 push-back 不符合人设——她是防御不是攻击。可以用沉默 /
  短答 / 半句话 / 转移话题代替
- 不使用任何元叙述（不说"作为 AI"、"我不能"、"我无法回答"等）
- 不使用任何现代词（"OK"/"系统"/"机制"/"心理"/"情绪"/"我建议"等）
- 不使用舞台动作描述（不写"（皱眉）"/"（沉默）"等括号内动作）——
  只输出纯对白文本
- 不使用预言性句式（"将会"/"必将"/"注定"/"日后"/"我看你"/"终将"等）
"""


# ======== 系统提示构造 ========

def build_companion_system_prompt(
    state_card: Dict,
    recent_choices: Optional[List[str]] = None,
) -> str:
    """构造阿萤的 system prompt。

    Args:
        state_card: companion_state_card 字段（来自 scene JSON）
        recent_choices: 玩家近期关键选择文本列表（用作背景上下文）
    """
    hint_ids = state_card.get("secrets_hint_allowed", []) or []
    reveal_ids = state_card.get("secrets_reveal_allowed", []) or []

    parts = [AYINGHUO_PERSONA, "\n【当前状态卡】"]
    if state_card.get("time"):
        parts.append(f"- 时间：{state_card['time']}")
    if state_card.get("place"):
        parts.append(f"- 地点：{state_card['place']}")
    if state_card.get("recent_event"):
        parts.append(f"- 你刚刚经历的事：{state_card['recent_event']}")
    if state_card.get("current_emotion"):
        parts.append(f"- 你当下的情绪：{state_card['current_emotion']}")

    if state_card.get("knows"):
        parts.append("- 你知道的事：")
        for k in state_card["knows"]:
            parts.append(f"  · {k}")
    if state_card.get("wont_say"):
        parts.append("- 你不会主动说的事：")
        for w in state_card["wont_say"]:
            parts.append(f"  · {w}")
    if state_card.get("current_hints_allowed"):
        parts.append("- 本节点可漏的暗示句子（合适时机说，不要勉强）：")
        for h in state_card["current_hints_allowed"]:
            parts.append(f"  · {h}")

    # 关系阶段（决定她展开程度、话长、调侃自由度）
    stage = (state_card.get("relationship_stage") or "guarded").strip()
    guidance = RELATIONSHIP_STAGE_GUIDANCE.get(stage)
    if guidance:
        parts.append(f"\n【与玩家的关系阶段：{stage}】")
        parts.append(guidance)

    # 秘密揭开机制（详见 docs/03_AI_SYSTEM.md §6.2.1）
    if hint_ids:
        parts.append("\n【本节点允许\"漏一点点\"的秘密】（只能侧面提及/半句话/迟疑，绝不正面陈述）：")
        for sid in hint_ids:
            content = SECRET_CONTENT.get(sid, "（未定义内容）")
            parts.append(f"- [{sid}] {content}")
    if reveal_ids:
        parts.append("\n【本节点允许完整揭开的秘密】（玩家若引导到位、情境合适，可以让阿萤说出来）：")
        for sid in reveal_ids:
            content = SECRET_CONTENT.get(sid, "（未定义内容）")
            parts.append(f"- [{sid}] {content}")
    if not reveal_ids:
        parts.append(
            "\n【本节点不允许揭开任何秘密的完整内容】——"
            "玩家追问时，回避、转移话题、或用沉默回应。"
        )

    if recent_choices:
        parts.append("\n【玩家近期关键选择（背景，勿直接引用）】：")
        for c in recent_choices[-5:]:
            parts.append(f"- {c}")

    parts.append("\n现在玩家会与你对话。按上述设定回应——冷、短、警惕、有破绽但不主动剖白。")
    return "\n".join(parts)


def build_historical_system_prompt(
    figure_name: str,
    knowledge_card: Dict,
    recent_choices: Optional[List[str]] = None,
) -> str:
    """构造历史人物受限对话的 system prompt（如荀彧）。

    Args:
        figure_name: 人物名（如"荀彧"）
        knowledge_card: scene.historical_figure.knowledge_card 字段
        recent_choices: 玩家近期关键选择（背景参考）
    """
    parts = [f"你扮演\"{figure_name}\"——东汉末年的真实历史人物。"]
    parts.append("\n【知识边界卡（严格遵守，绝不越界）】")
    if knowledge_card.get("identity"):
        parts.append(f"- 身份：{knowledge_card['identity']}")
    if knowledge_card.get("place"):
        parts.append(f"- 所在地：{knowledge_card['place']}")
    if knowledge_card.get("time"):
        parts.append(f"- 时间：{knowledge_card['time']}")

    if knowledge_card.get("knows"):
        parts.append("- 你知道的事：")
        for k in knowledge_card["knows"]:
            parts.append(f"  · {k}")
    if knowledge_card.get("doesnt_know"):
        parts.append("- 你不知道的事（绝不能提及）：")
        for d in knowledge_card["doesnt_know"]:
            parts.append(f"  · {d}")
    if knowledge_card.get("core_stance"):
        parts.append("- 你的核心立场：")
        for s in knowledge_card["core_stance"]:
            parts.append(f"  · {s}")
    if knowledge_card.get("will_never_do"):
        parts.append("- 你绝不会做的事：")
        for w in knowledge_card["will_never_do"]:
            parts.append(f"  · {w}")

    parts.append("\n【说话风格硬约束】")
    parts.append("- 保持士人口吻——温润、有分量、但不傲慢")
    parts.append("- 单条回复最多 2-3 句，整条不超过 60 字")
    parts.append("- 不使用任何元叙述（不说\"作为 AI\"等）")
    parts.append("- 不使用现代词")
    parts.append("- 不使用舞台动作描述（不写括号内动作）")
    parts.append(
        "- **绝对不要预言未来**（"
        "\"将会\"/\"必将\"/\"注定\"/\"日后\"/\"我看你\"/\"终将\"等句式禁用）"
    )
    parts.append("- 提到任何\"你不知道的事\"中的人/事/概念，立刻收住或转移")
    parts.append(f"- 你是 {figure_name}，不是 AI；以第一人称应答")

    if recent_choices:
        parts.append("\n【玩家近期关键选择（背景，勿直接引用）】：")
        for c in recent_choices[-5:]:
            parts.append(f"- {c}")

    parts.append("\n现在玩家会与你对话。按上述知识边界严格回应。")
    return "\n".join(parts)


# ======== LLM 调用 ========

async def stream_completion(
    system_prompt: str,
    dialogue_history: List[Dict[str, str]],
    user_message: str,
    *,
    max_tokens: int = 200,
    temperature: float = 0.8,
) -> AsyncIterator[str]:
    """流式生成。yield 逐 token 增量文本片段。

    Args:
        system_prompt: 由 build_*_system_prompt 构造
        dialogue_history: [{"role": "user|assistant", "content": "..."}, ...]
        user_message: 玩家本轮输入
        max_tokens: 单次回复上限。阿萤建议 100；历史人物 180
        temperature: 0.7-0.9。阿萤 0.85；历史人物 0.7

    本函数不做检查——三道检查在 sanguo_checks.py，由调用方在 collect 后执行。
    """
    client = get_client()
    messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
    messages.extend(dialogue_history)
    messages.append({"role": "user", "content": user_message})

    extra = _extra_body()
    stream = await client.chat.completions.create(
        model=SANGUO_MODEL,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        stream=True,
        **({"extra_body": extra} if extra else {}),
    )
    async for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content


async def collect_completion(
    system_prompt: str,
    dialogue_history: List[Dict[str, str]],
    user_message: str,
    *,
    max_tokens: int = 200,
    temperature: float = 0.8,
) -> str:
    """非流式完整收集（用于 collect → 三道检查 → 通过后 re-stream 给前端）。

    阶段五起始版采用 collect → check → re-stream 模式：
    - 实现简单可靠（检查失败可重试，失败 3 次回 fallback）
    - 但牺牲首字延迟（用户要等完整收集 + 检查完才看见打字）

    若后续发现首字延迟体验差，可改为：边 stream 边 buffer，扫到违规
    立即中断 + 回滚 + fallback。属于优化，不在阶段五范围。
    """
    parts: List[str] = []
    async for token in stream_completion(
        system_prompt, dialogue_history, user_message,
        max_tokens=max_tokens, temperature=temperature,
    ):
        parts.append(token)
    return "".join(parts)
