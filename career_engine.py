from __future__ import annotations

import copy
import json
import random
import re
import time
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Tuple


DATA_DIR = Path(__file__).resolve().parent / "data"


def _load_json(name: str):
    path = DATA_DIR / name
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


OFFICES: List[Dict] = _load_json("career_offices.json")
IDENTITY_POOLS: Dict = _load_json("career_identity_pools.json")
OPENINGS: Dict = _load_json("career_openings.json")
CASES: List[Dict] = sorted(
    _load_json("career_cases_tang_county_wei.json"),
    key=lambda item: int(item.get("order") or 0),
)
RULES: Dict = _load_json("career_rules.json")
SESSIONS: Dict[str, Dict] = {}


def _office_by_id(office_id: str) -> Dict:
    office = next((item for item in OFFICES if item.get("office_id") == office_id), None)
    if not office:
        raise KeyError("未找到对应官职")
    return office


def _format_text(value: str, context: Dict) -> str:
    try:
        return str(value or "").format(**context)
    except (KeyError, ValueError):
        return str(value or "")


def _format_dialogue(items: List[Dict], context: Dict) -> List[Dict]:
    return [
        {
            "speaker": _format_text(item.get("speaker"), context),
            "role": _format_text(item.get("role"), context),
            "text": _format_text(item.get("text"), context),
        }
        for item in items or []
    ]


def _public_office(office: Dict) -> Dict:
    keys = (
        "office_id",
        "dynasty",
        "title",
        "rank",
        "plain_position",
        "summary",
        "responsibilities",
        "can_manage",
        "cannot_manage",
        "daily_contacts",
        "likely_affairs",
        "superior",
        "risks",
        "stat_labels",
    )
    return {key: copy.deepcopy(office.get(key)) for key in keys}


def _public_choice(choice: Dict) -> Dict:
    return {
        "id": str(choice.get("id") or ""),
        "text": str(choice.get("text") or ""),
        "hint": str(choice.get("hint") or ""),
        **({"response": copy.deepcopy(choice.get("response"))} if choice.get("response") else {}),
    }


def _public_case(case: Optional[Dict]) -> Optional[Dict]:
    if not case:
        return None
    return {
        "case_id": str(case.get("case_id") or ""),
        "order": int(case.get("order") or 0),
        "time_cost": int(case.get("time_cost") or 1),
        "title": str(case.get("title") or ""),
        "category": str(case.get("category") or ""),
        "background_image": str(case.get("background_image") or ""),
        "brief": str(case.get("brief") or ""),
        "portraits": copy.deepcopy(case.get("portraits") or {}),
        "opening_dialogue": copy.deepcopy(case.get("opening_dialogue") or []),
        "investigation_steps": [
            {
                "step_id": str(step.get("step_id") or ""),
                "prompt": str(step.get("prompt") or ""),
                "choices": [_public_choice(choice) for choice in step.get("choices") or []],
            }
            for step in case.get("investigation_steps") or []
        ],
        "decision_prompt": str(case.get("decision_prompt") or ""),
        "choices": [_public_choice(choice) for choice in case.get("choices") or []],
    }


def _cleanup_sessions() -> None:
    cutoff = time.time() - 24 * 60 * 60
    for session_id in [key for key, value in SESSIONS.items() if value.get("updated_at", 0) < cutoff]:
        SESSIONS.pop(session_id, None)


def start_session(player_id: str = "", seed: str = "", office_id: str = "tang_county_wei") -> Dict:
    _cleanup_sessions()
    office = _office_by_id(office_id)
    pool = IDENTITY_POOLS.get(office_id) or {}
    rng = random.Random(seed or f"{player_id}-{time.time_ns()}")
    year = copy.deepcopy(rng.choice(pool.get("years") or [{}]))
    place = copy.deepcopy(rng.choice(pool.get("places") or [{}]))
    family = copy.deepcopy(rng.choice(pool.get("families") or [{}]))
    identity = {
        "dynasty": office.get("dynasty", "唐"),
        "office_id": office_id,
        "office_title": office.get("title", "县尉"),
        "age": int(rng.choice(pool.get("ages") or [29])),
        "origin": str(rng.choice(pool.get("origins") or [""])),
        "initial_status": str(rng.choice(pool.get("initial_statuses") or [""])),
        **year,
        **place,
        **family,
    }
    opening_template = OPENINGS.get(office_id) or {}
    opening = {
        "title": opening_template.get("title", "一觉入唐"),
        "background_image": opening_template.get("background_image", ""),
        "dialogue": _format_dialogue(opening_template.get("dialogue") or [], identity),
    }
    session_id = uuid.uuid4().hex
    session = {
        "session_id": session_id,
        "player_id": player_id,
        "office_id": office_id,
        "identity": identity,
        "opening": opening,
        "case_index": 0,
        "day": 1,
        "stats": copy.deepcopy(office.get("initial_stats") or {}),
        "history": [],
        "unlocked_archives": [office.get("title", "县尉")],
        "created_at": time.time(),
        "updated_at": time.time(),
    }
    SESSIONS[session_id] = session
    return _session_payload(session, include_opening=True)


def _session_payload(session: Dict, include_opening: bool = False) -> Dict:
    office = _office_by_id(session["office_id"])
    current_case = CASES[session["case_index"]] if session["case_index"] < len(CASES) else None
    payload = {
        "session_id": session["session_id"],
        "identity": copy.deepcopy(session["identity"]),
        "office": _public_office(office),
        "state": {
            "day": int(session["day"]),
            "campaign_days": int(RULES.get("campaign_days") or 15),
            "stats": copy.deepcopy(session["stats"]),
            "stat_labels": copy.deepcopy(office.get("stat_labels") or {}),
            "unlocked_archives": copy.deepcopy(session.get("unlocked_archives") or []),
        },
        "case": _public_case(current_case),
    }
    if include_opening:
        payload["opening"] = copy.deepcopy(session.get("opening") or {})
    return payload


def _normalize_text(value: str) -> str:
    return re.sub(r"[\s，。！？、,.!?；;：:]", "", str(value or "")).lower()


def interpret_action(text: str) -> Tuple[str, str, int]:
    normalized = _normalize_text(text)
    best_tag = str(RULES.get("default_action_tag") or "continue_investigation")
    best_score = 0
    for tag, config in (RULES.get("action_tags") or {}).items():
        score = sum(1 for keyword in config.get("keywords") or [] if _normalize_text(keyword) in normalized)
        if score > best_score:
            best_tag = tag
            best_score = score
    label = ((RULES.get("action_tags") or {}).get(best_tag) or {}).get("label", best_tag)
    return best_tag, str(label), best_score


def _pick_case_choice(case: Dict, choice_id: str = "", free_text: str = "") -> Tuple[Dict, Dict]:
    choices = case.get("choices") or []
    if free_text.strip():
        action_tag, label, score = interpret_action(free_text)
        interpretation = {"source": "free_text", "action_tag": action_tag, "label": label, "matched_keywords": score}
        if action_tag == "overreach":
            return {
                "id": "FREE_OVERREACH",
                "text": "越权处置被县令叫停",
                "hint": "县尉不能独自作出这项决定",
                "action_tag": "overreach",
                "deltas": {"popular_support": -3, "bureaucracy": -5, "treasury": -1, "superior_rating": -6, "security": -1},
                "result": "你的命令超出了县尉权限。县令当场叫停处置，要求案件回到查验、缉捕或呈报程序。事情没有因此消失，县衙上下却开始怀疑你是否清楚自己的权力边界。",
                "aftermath": "这次越权被写入考课记录。规则系统没有让一句话直接改变案件。",
                "archive_unlocks": ["县尉权限"],
            }, interpretation
        matching = next((choice for choice in choices if choice.get("action_tag") == action_tag), None)
        if not matching:
            matching = next((choice for choice in choices if choice.get("action_tag") == "continue_investigation"), None)
        return (matching or choices[0]), interpretation
    selected = next((choice for choice in choices if str(choice.get("id")) == str(choice_id)), None)
    if not selected:
        raise ValueError("未知的处置选择")
    action_tag = str(selected.get("action_tag") or "")
    label = ((RULES.get("action_tags") or {}).get(action_tag) or {}).get("label", action_tag)
    return selected, {"source": "choice", "action_tag": action_tag, "label": label, "matched_keywords": 0}


def _clamp(value: int) -> int:
    return max(int(RULES.get("stat_min") or 0), min(int(RULES.get("stat_max") or 100), int(value)))


def _ending_for(session: Dict) -> Dict:
    total = sum(int(value or 0) for value in session.get("stats", {}).values())
    ending = next(
        (item for item in RULES.get("endings") or [] if total >= int(item.get("min_total") or 0)),
        (RULES.get("endings") or [{}])[-1],
    )
    return {
        **copy.deepcopy(ending),
        "total": total,
        "day": int(session.get("day") or RULES.get("campaign_days") or 15),
        "history_count": len(session.get("history") or []),
        "stats": copy.deepcopy(session.get("stats") or {}),
        "unlocked_archives": copy.deepcopy(session.get("unlocked_archives") or []),
    }


def submit_action(session_id: str, case_id: str, choice_id: str = "", free_text: str = "") -> Dict:
    session = SESSIONS.get(session_id)
    if not session:
        raise KeyError("本局已经失效，请重新入仕")
    if session["case_index"] >= len(CASES):
        raise ValueError("本局已经完成")
    case = CASES[session["case_index"]]
    if str(case.get("case_id")) != str(case_id):
        raise ValueError("案件进度不一致，请刷新后重试")
    selected, interpretation = _pick_case_choice(case, choice_id=choice_id, free_text=free_text)
    deltas = {str(key): int(value or 0) for key, value in (selected.get("deltas") or {}).items()}
    for key in session["stats"]:
        session["stats"][key] = _clamp(int(session["stats"].get(key) or 0) + int(deltas.get(key, 0)))
    unlocks = [str(item) for item in selected.get("archive_unlocks") or [] if item]
    for item in unlocks:
        if item not in session["unlocked_archives"]:
            session["unlocked_archives"].append(item)
    session["history"].append({
        "case_id": case_id,
        "title": case.get("title", ""),
        "choice": selected.get("text", ""),
        "action_tag": interpretation.get("action_tag", ""),
        "deltas": deltas,
    })
    session["day"] = min(
        int(RULES.get("campaign_days") or 15),
        int(session["day"]) + int(case.get("time_cost") or 1),
    )
    session["case_index"] += 1
    session["updated_at"] = time.time()
    completed = session["case_index"] >= len(CASES)
    next_case = None if completed else CASES[session["case_index"]]
    office = _office_by_id(session["office_id"])
    return {
        "choice": _public_choice(selected),
        "interpretation": interpretation,
        "deltas": deltas,
        "result": str(selected.get("result") or ""),
        "aftermath": str(selected.get("aftermath") or ""),
        "archive_unlocks": unlocks,
        "state": {
            "day": int(session["day"]),
            "campaign_days": int(RULES.get("campaign_days") or 15),
            "stats": copy.deepcopy(session["stats"]),
            "stat_labels": copy.deepcopy(office.get("stat_labels") or {}),
            "unlocked_archives": copy.deepcopy(session["unlocked_archives"]),
        },
        "next_case": _public_case(next_case),
        "ending": _ending_for(session) if completed else None,
    }


def get_session(session_id: str) -> Dict:
    session = SESSIONS.get(session_id)
    if not session:
        raise KeyError("本局已经失效，请重新入仕")
    return _session_payload(session)
