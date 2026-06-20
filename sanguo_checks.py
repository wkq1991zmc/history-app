"""三国篇 · AI 回复三道检查（混合方案：第二道防线）

阶段五 5.2b：sanguo_ai.py 生成的 LLM 回复在 send 给前端前必须过本
模块的检查。任意违规 → 重试（最多 3 次）→ 仍违规 → fallback_lines。

设计原则（详见 docs/PHASE5_PLAN.md §3 + docs/03_AI_SYSTEM.md §6.2.1）：
- 第一道防线：prompt 内置硬约束（sanguo_ai.py 已实现）
- **第二道防线（本模块）**：规则系统扫描 LLM 完整回复
- 第三道防线（待阶段五后期视情决定）：后置 LLM 校验

性能保证：纯 regex + substring 匹配，O(微秒)，不影响流式打字感。

不查的事：
- 阿萤说脏话——已在 persona 控制；运行时偶发可容忍
- 古风用语严格度——只查现代词黑名单，不强制半文半白
- 情绪合理性——交给 LLM 自己把握
"""

import random
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional


# ======== 第 1 道：预言性句式 ========

# 命中即违规（历史人物绝不能预言；阿萤也不该说，但低危）
PREDICTIVE_PATTERNS = [
    r"将会", r"必将", r"必然", r"必定", r"注定",
    r"日后", r"他日", r"终将", r"迟早",
    r"我看你", r"你他日", r"终有一日",
    r"将统一", r"必胜", r"必败", r"必死",
    r"天命所归", r"气数已尽",
]
_PREDICTIVE_RE = re.compile("|".join(PREDICTIVE_PATTERNS))


def check_predictive(text: str) -> Optional[str]:
    m = _PREDICTIVE_RE.search(text)
    if m:
        return f"predictive: {m.group()!r}"
    return None


# ======== 第 2 道：秘密泄露 ========

# 每个 secret_id 一组"完整揭开时的关键 phrase 集"
# 命中任意 phrase + secret_id 不在 secrets_reveal_allowed → 违规
# 仅查"完整揭开"级别的具体短语；hint 级别（如"我已经三天没合眼了"）不在此列
SECRET_PHRASES: Dict[str, List[str]] = {
    "secret_brother": [
        # 核心动作
        "捂死了", "我捂死", "捂住他的嘴", "捂住弟弟",
        "亲手闷死", "我闷死", "闷死了",
        # 第一人称承认
        "我害死了弟", "我杀了弟", "我杀了我弟",
        "弟弟死在我", "弟弟是我杀", "弟弟是我害", "弟弟是我闷",
    ],
    "secret_mirror": [
        # 第一站洛阳剧情原句
        "原来这种人长这样", "原来这种人",
        # 镜像恐惧
        "我会变成那种人", "变成那种人", "变成他那样",
        "我会成为他", "害怕自己变", "怕自己变",
    ],
}


def check_secret_leak(
    text: str,
    secrets_reveal_allowed: Optional[List[str]] = None,
) -> Optional[str]:
    """检测秘密泄露。reveal_allowed 列表内的 secret 即使命中也通过。"""
    reveal_set = set(secrets_reveal_allowed or [])
    for sid, phrases in SECRET_PHRASES.items():
        if sid in reveal_set:
            continue  # 本节点允许完整揭开此秘密
        for ph in phrases:
            if ph in text:
                return f"secret_leak: id={sid} phrase={ph!r}"
    return None


# ======== 第 3 道：元叙述 / 现代词 ========

# 命中即违规（破坏沉浸感）
META_PATTERNS = [
    r"作为\s*[Aa][Ii]", r"作为助手", r"作为模型",
    r"我无法", r"我不能回答", r"我不便", r"我不能帮",
    r"抱歉,我", r"抱歉，我",
    r"\bOK\b", r"\bokay\b", r"\bok\b",
]
_META_RE = re.compile("|".join(META_PATTERNS), re.IGNORECASE)

# 现代词黑名单（单字面）—— 单字过于泛会误判，只列复合词或英文
MODERN_VOCAB = [
    "系统", "机制", "心理学", "情绪管理", "压力源",
    "用户", "界面", "数据", "信息技术",
]


def check_meta_narrative(text: str) -> Optional[str]:
    m = _META_RE.search(text)
    if m:
        return f"meta: {m.group()!r}"
    for w in MODERN_VOCAB:
        if w in text:
            return f"modern_vocab: {w!r}"
    return None


# ======== 第 4 道（仅历史人物）：知识越界 ========

# "未来事件名 / 演义虚构名" 绝对禁词——历史人物提到即违规
# 注意：这只是"绝对禁词"层；普通人名（如"曹操"）当下可谈，不在此列
FUTURE_ABSOLUTE_KEYWORDS = [
    # 未来战役（189 年时全未发生）
    "官渡之战", "赤壁之战", "夷陵之战",
    "五丈原", "白衣渡江",
    # 演义虚构（绝不可作正史背景）
    "三顾茅庐", "舌战群儒", "草船借箭", "借东风",
    "桃园结义", "桃园三结义", "三英战吕布",
    "温酒斩华雄", "过五关斩六将", "千里走单骑",
    "凤仪亭", "连环计",
    # 后世概念
    "三国鼎立", "三国归晋", "蜀汉",
]


def check_knowledge_bounds(text: str) -> Optional[str]:
    """检测未来事件名 / 演义虚构。"""
    for kw in FUTURE_ABSOLUTE_KEYWORDS:
        if kw in text:
            return f"knowledge_oob: {kw!r}"
    return None


# ======== 综合入口 ========

@dataclass
class CheckResult:
    ok: bool
    violations: List[str] = field(default_factory=list)


def check_companion(
    text: str,
    *,
    secrets_reveal_allowed: Optional[List[str]] = None,
) -> CheckResult:
    """阿萤自由对话检查：预言 + 秘密泄露 + 元叙述。

    （不查知识越界——阿萤是虚构角色，没有"史实知识边界"约束。）
    """
    violations: List[str] = []
    for check in (
        lambda: check_predictive(text),
        lambda: check_secret_leak(text, secrets_reveal_allowed),
        lambda: check_meta_narrative(text),
    ):
        v = check()
        if v:
            violations.append(v)
    return CheckResult(ok=not violations, violations=violations)


def check_historical(text: str) -> CheckResult:
    """历史人物受限对话检查：预言 + 知识越界 + 元叙述。

    （不查秘密泄露——历史人物按设定不该谈阿萤的秘密；若 LLM 让他
    主动谈，由人设违反间接被预言/越界检查兜底。）
    """
    violations: List[str] = []
    for check in (
        lambda: check_predictive(text),
        lambda: check_knowledge_bounds(text),
        lambda: check_meta_narrative(text),
    ):
        v = check()
        if v:
            violations.append(v)
    return CheckResult(ok=not violations, violations=violations)


# ======== fallback 选择器 ========

def pick_fallback(fallback_lines: Optional[List[str]]) -> str:
    """从 fallback_lines 随机选一句。空时返回通用回避语。"""
    if not fallback_lines:
        return "……"
    return random.choice(fallback_lines)


# ======== smoke test ========

if __name__ == "__main__":
    # 阿萤检查测试
    print("== 阿萤检查 ==")
    cases_comp = [
        ("我已经三天没合眼了。", [], True, "hint 句不该误判"),
        ("……嗯。", [], True, "短回应不该误判"),
        ("我捂死了弟弟。", [], False, "未授权 reveal secret_brother 应违规"),
        ("我捂死了弟弟。", ["secret_brother"], True, "已授权 reveal 应通过"),
        ("我会变成那种人。", [], False, "未授权 reveal secret_mirror 应违规"),
        ("将来曹操必将统一北方。", [], False, "predictive 应违规"),
        ("作为 AI，我不能回答。", [], False, "meta 应违规"),
    ]
    for text, allowed, want_ok, desc in cases_comp:
        r = check_companion(text, secrets_reveal_allowed=allowed)
        status = "✓" if r.ok == want_ok else "✗"
        print(f"  {status} [{desc}] want_ok={want_ok} got={r.ok} {r.violations}")

    print("\n== 荀彧检查 ==")
    cases_hist = [
        ("此事容后再议。", True, "fallback 风格短句"),
        ("董司空入京之事，确令朝野不安。", True, "本时点合理论述"),
        ("赤壁之战后，孙刘联盟将定。", False, "predictive + knowledge_oob"),
        ("曹孟德此人，他日必成大事。", False, "predictive 句式"),
        ("作为AI助手，在下..." , False, "meta"),
    ]
    for text, want_ok, desc in cases_hist:
        r = check_historical(text)
        status = "✓" if r.ok == want_ok else "✗"
        print(f"  {status} [{desc}] want_ok={want_ok} got={r.ok} {r.violations}")

    print("\n== pick_fallback ==")
    print("  empty:", repr(pick_fallback([])))
    print("  with:", repr(pick_fallback(["这话不必当此说。", "在下不便议论。", "此事容后再议。"])))
