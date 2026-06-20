# `data/stories/` 多故事架构

本目录存放"入局"模块的故事数据。每个故事一个子目录（如 `sanguo/`），独立于公开课"礼法断案"和旧入局玩法。

## 与其他数据源的区分

| 目录 / 文件 | 用途 | 谁在用 |
|---|---|---|
| `data/intrigue_scenes_law_classroom.json` | 公开课"礼法断案"5 案例数据 | `/time_travel/` 接口 |
| `data/intrigue_scenes.json`（当前为 `[]`） | 旧入局玩法的占位，仅为兼容 `_load_intrigue_scenes()` 启动检查 | 同上 |
| `data/career_*.json` | 旧 career（县尉政务）原型数据，已废弃但保留作官制资料参考 | 暂无 |
| **`data/stories/<story_id>/`** | **新一代多故事架构。当前只有 `sanguo/`（三国篇）** | **`/story/` 接口** |

新旧两套体系**完全物理隔离**：函数、状态、接口、数据文件全部独立。出 bug 不会相互污染。

## 每个故事的目录结构

```
<story_id>/
├── manifest.json                   ← 故事元信息 + 章节索引
└── chapters/
    ├── 00_prologue.json            ← 章节剧本
    ├── 01_interlude.json
    └── ...
```

**不需要** `prompts/`、`characters.json` 等独立文件——状态卡和知识边界卡**直接内嵌**到对应章节节点（哪个对话节点用就在哪里），人物总体设定看 `docs/02_CHARACTERS.md`（策划文档）。

## `manifest.json` schema

```jsonc
{
  "schema_version": "1.0",                  // ← 必填，schema 演进时用于迁移
  "story_id": "sanguo",                     // 等于目录名
  "title": "三国篇·亲历东汉末年",
  "subtitle": "从黄巾起义到赤壁之战",
  "era": "东汉末年",
  "year_range": "184-208",
  "estimated_hours": 10,
  "slogan": "人在局中，亲历历史",
  "chapters": [
    {
      "id": "00_prologue",
      "title": "序章·涿郡",
      "year": "中平元年(184)",
      "status": "complete"                  // complete | stub | wip
    },
    ...
  ],
  "characters": {
    "protagonist": { "default_name": "无名", "renamable": true },
    "companion":   { "name": "阿萤" }
  }
}
```

## 章节 json schema：6 种节点 type（核心抽象）

每个章节文件是一棵"场景节点图"，由若干 scenes 组成。`scene_id` 在章节内唯一，`next` 指向下一场景的 `scene_id`，无 `next` 表示章节末。

### 顶层结构

```jsonc
{
  "chapter_id": "00_prologue",
  "title": "序章·涿郡",
  "background_image": "/static/images/sanguo/zhuojun-road.webp",  // 可选，全章默认
  "background_music": "/static/audio/sanguo/bgm/zhuojun-spring.wav",  // 可选
  "entry_scene": "lane",                                          // 章节入口 scene_id
  "scenes": [ ... ]
}
```

### 6 种 scene type

| type | 用途 | 必填字段 | 行为 |
|---|---|---|---|
| `narration` | 旁白/对白序列 | `lines`, `next` | 按"继续"逐行推进 |
| `narration_with_choice` | 旁白后给玩家选择 | `lines`, `choices` | 选择后跳转 `choices[].next` |
| `companion_free_talk` | 阿萤自由对话节点 | `lines`, `companion_state_card`, `next` | 进入时显"言"按钮，玩家可自由对话；退出后续接 `next` |
| `historical_distant_view` | 历史人物远观（不对话） | `lines`, `historical_figure`, `next` | 远观一段，不开对话 |
| `historical_limited_talk` | 历史人物受限对话 | `lines`, `historical_figure`, `next` | 进入时显"史"印章 + 剩余轮数；轮数耗尽自动接 `next` |
| `chapter_end` | 章末字幕 + 章节结束 | `lines`, `next_chapter`（可选） | 显示字幕，结束本章并跳转或回到故事菜单 |

### `lines` 数组的 line type

每个 line 是一个对象，`type` 字段决定渲染样式（对应 `docs/04_UI_SPEC.md` §7.2 三层文字层级）：

| line type | 含义 | 必填 | 可选 |
|---|---|---|---|
| `narration` | 旁白 | `text` | `display_style: "fullscreen_subtitle"` 用于章节中段的字幕浮现 |
| `dialogue` | 角色对白 | `speaker`, `text` | `stage_direction`（括号内动作描述），`speaker_role`（如"老妇人"额外标签） |
| `inner_voice` | 主角心声 | `text` | 渲染为浅灰斜体 |

**所有 line type 共享的可选字段**：

| 字段 | 取值 | 作用 |
|---|---|---|
| `pace` | `"slow"` / `"normal"` / `"fast"` | 流式打字速度（slow≈60-80ms/字，normal≈35-40ms/字，fast≈28ms/字）。**未标注时默认 normal**。用于重要句子放慢、快速对话加快 |

### `choices` 数组

每个 choice 是一个对象：

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | choice 唯一 id，存档时用 |
| `text` | ✅ | 显示文本，按 `docs/05_WRITING_STYLE.md` §8.4 控制在 10-15 字 |
| `next` | ✅ | 目标 scene_id |
| `identity_branch` | ❌ | 身份分支选择时填 `"游侠剑客"`/`"寒门士子"` 等（仅序章·身份选择节点用） |
| `requires` | ❌ | 解锁条件，如 `{ "identity": "寒门士子" }`（仅特定身份可见此选项） |
| `pending` | ❌ | 标记此分支尚未撰写，运行时显"此分支正在撰写中" |

### `companion_state_card` schema（仅 `companion_free_talk` 节点）

直接对应 `docs/06_PROMPT_TEMPLATES.md` §6.2 模板：

```jsonc
{
  "character": "阿萤",
  "time": "中平元年三月，深夜",
  "place": "被遗弃的土地庙",
  "recent_event": "得知奶奶和弟弟的死讯",
  "current_emotion": "刚哭完，强忍悲痛",
  "knows": ["村被黄巾烧", "奶奶今早还活着"],
  "wont_say": ["弟弟是她亲手闷死的", "她其实也不想活了"],
  "current_hints_allowed": ["我已经三天没合眼了"],
  "rounds_limit": null,                                    // null = 不限轮数
  "secrets_unlockable": []                                 // 可在本节点揭开的秘密 id（秘密一锁第三站、秘密二锁第五站，详见 docs/01_STORY_BIBLE.md §4.3）
}
```

### `historical_figure` schema（`historical_distant_view` 或 `historical_limited_talk` 节点）

```jsonc
{
  "name": "荀彧",
  "view_type": "limited_talk",                             // distant | limited_talk
  "knowledge_card": {                                      // 仅 limited_talk 需要
    "identity": "颍川人，刚被举孝廉为守宫令，此时尚未仕曹",
    "place": "洛阳",
    "knows": [...],
    "doesnt_know": [...],
    "core_stance": [...],
    "will_never_do": [...],
    "rounds_limit": 5,
    "fallback_lines": ["这话不必当此说。", "在下不便议论。"]  // 三道检查全失败时的回避回答
  }
}
```

### 可选 scene 级字段

| 字段 | 用途 |
|---|---|
| `background_image` | 覆盖章节默认背景图 |
| `background_music` | 覆盖章节默认 BGM |
| `awaits_input` | 取值如 `"protagonist_name"`，渲染时弹出输入框，输入后写入 session 状态 |

## md → json 同步约定

- **`docs/chapters/*.md` 是真源**——策划层、人类可读
- **`data/stories/sanguo/chapters/*.json` 是从 md 派生的运行时格式**——加节点 id、next、状态卡等
- 改剧情：**先改 md，再同步到 json**
- 翻译时严格忠实于 md 内容；如 md 某段在 6 种 type 下表达不出来，**立刻反馈**，一起判断是改 md 还是扩展 type

## 当前已落地

- ✅ `sanguo/manifest.json`
- ✅ `sanguo/chapters/00_prologue.json` —— 完整翻译自 `docs/chapters/00_prologue.md`
- ✅ `sanguo/chapters/02_luoyang.json` —— 完整翻译自 `docs/chapters/02_luoyang.md`
- ⏳ 01_interlude / 03_changan / 04_xuzhou / 05_xudu / 06_hebei / 07_chibi —— 占位文档已在 `docs/chapters/`，待策划补完后翻译
