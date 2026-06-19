# 入局·三国篇 — 项目进度

> 本文档供后续会话接手时使用。每完成一个阶段更新一次。
> 当前阶段：**阶段一已完成，等用户确认进入阶段二**

最后更新：2026-06-19（阶段三完成）

---

## 全阶段路线图

按 `SETUP_GUIDE.md` 第六节执行，五个阶段顺序进行：

| 阶段 | 内容 | 状态 |
|---|---|---|
| 安全网 #1 | "驿路无名"最后稳定版本 commit 留底 | ✅ 已完成（`f241e84`） |
| **阶段一** | 文档结构（docs/ 拆分 + CLAUDE.md） | ✅ 已完成 |
| 安全网 #2 | 阶段一文档结构 commit | ✅ 已完成（`e9dbfdd`） |
| **阶段二** | 归档与清理"驿路无名" | ✅ 已完成（`14d59e3`） |
| **阶段三** | 入局模块架构重构（多故事支持） | ✅ 已完成（5 commits：`dad75e0` → `9205bd5`），**等用户确认** |
| 阶段四 | UI 实现（按 `docs/04_UI_SPEC.md`） | ⬜ 未开始 |
| 阶段五 | AI 对话系统（阿萤 + 历史人物，对接百炼） | ⬜ 未开始 |

---

## 阶段一：已做内容

### 1. 安全网 commit（提交 `f241e84`）

把会话被中断前修复的"驿路无名"SyntaxError + 缓存版本号升到 `20260618f` 一起提交：
- `static/index.html`
- `static/js/app.js`
- `static/js/historical_rpg_demo.js`

commit message 明确指出是"驿路无名最后稳定版本，后续将整体删除"。万一阶段二删除阶段出错，可 `git revert` 或 `git checkout f241e84 -- <path>` 取回任意文件。

### 2. 文档拆分（`docs/`）

按 SETUP_GUIDE 阶段一拆分表，从 `docs/PROJECT_BIBLE.md` 拆出以下子文档（**主文档保持原样**）：

| 文件 | 内容 | 来源 |
|---|---|---|
| `docs/01_STORY_BIBLE.md` | 项目快速了解 / 三款参考游戏 / 严格正史核心原则 / 故事整体规划 | BIBLE §1-4 |
| `docs/02_CHARACTERS.md` | 主角设定 / 阿萤完整设定卡 / 关键历史人物表 / 知识边界卡待补清单 | BIBLE §5 |
| `docs/03_AI_SYSTEM.md` | 三层 AI 架构 / 三道检查工作流 / 标注规范 / "AI 表演，规则系统裁判"原则 | BIBLE §6 |
| `docs/04_UI_SPEC.md` | "电影 × 古籍"哲学 / 主屏布局 / 印章选项 / 笔记本 / 章节切换 / 技术实现路径 | BIBLE §7 |
| `docs/05_WRITING_STYLE.md` | 八条写作原则 / 反面教材"驿路无名" / 文笔示例 / 自检清单 | BIBLE §8 |
| `docs/06_PROMPT_TEMPLATES.md` | 阿萤状态卡模板与示例 / 历史人物知识边界卡模板与示例 / 三道检查实施 / 未来要补的卡 | BIBLE §6.2/§6.3 模板集中 |

每份文件顶部都加了：
```markdown
> 本文档抽取自 `PROJECT_BIBLE.md` 第 X 节
> 主文档保留为源材料，所有变更需同步至主文档
```

### 3. 章节剧本拆分（`docs/chapters/`）

| 文件 | 状态 | 内容 |
|---|---|---|
| `00_prologue.md` | ✅ 完整草稿（搬运自 BIBLE §9.1） | 序章·涿郡，画面 1-11 全套 |
| `01_interlude.md` | ⏳ 占位+设计要点 | 过渡·五年间 184-189 |
| `02_luoyang.md` | ✅ 完整草稿（搬运自 BIBLE §9.3） | 第一站·洛阳，含荀彧受限对话节点 |
| `03_changan.md` | ⏳ 占位（2026-06-19 重写） | 第二站·长安——李傕郭汜之乱后的长安饥荒（原"杜氏替代貂蝉"方案已废弃，改远观路线） |
| `04_xuzhou.md` | ⏳ 占位 | 第三站·徐州（阿萤秘密一揭开节点标记） |
| `05_xudu.md` | ⏳ 占位 | 第四站·许都 |
| `06_hebei.md` | ⏳ 占位 | 第五站·河北（阿萤秘密二揭开 + 重伤节点标记） |
| `07_chibi.md` | ⏳ 占位 | 终章·赤壁（5 个结局表已记录） |

### 4. 项目入口（`CLAUDE.md`）

按 SETUP_GUIDE 附录 A 模板创建，根据 history-app 真实结构调整：
- 标注"代码根目录是 `history-app/` 而非外层 `history-app2/`"
- 标注"`history-app/` 才是 git 仓库"
- 增加技术债与已知坑摘要（编码、缓存、文件体积、百炼优先级、配音定位）

---

## 关于"边读边拆"的核心理解汇报

按用户要求，确认我不是机械搬运，而是真的吸收了 BIBLE 的核心点。以下是我的理解（用户可对照确认）：

### ① 阿萤的两个秘密
- **秘密一**：黄巾来袭时，她为防孩子哭声暴露躲藏的人，**亲手捂死了亲弟弟**。第三站徐州揭开。
- **秘密二**：在洛阳第一次看见董卓时，她的第一反应**不是恨而是"原来这种人长这样"**——她害怕自己有朝一日变成"那种人"。第五站揭开。
- **关键**：两个秘密绝不让玩家"选项逼问"出来。AI 自由对话系统根据玩家累积关心度 + 当前情境压力，自然"漏"出来。这是双钩子，撑起全篇 25 万字。

### ② 严格正史的三步判断流程
1. 这个人此时此地是史实吗？
2. 这个人此时已经知道这件事吗？
3. 这个人的核心立场/性格此时如何？（按史书定调）
- 虚构空间限于"史书没记载的空隙"；主角和阿萤是虚构角色，可以活动在历史空白处，但历史人物已记载的言行不能虚构。
- **红线**：演义不是史料。桃园三结义、温酒斩华雄、草船借箭、借东风、舌战群儒、气死周瑜——全部不能作为背景事件。**第二站貂蝉问题（2026-06-19 修正）**：原"用杜氏替代貂蝉"方案也不成立（杜氏是秦宜禄妻，与"董卓侍婢与吕布私通"是两件事）；正史只有无名"董卓侍婢"。第二站改远观路线，相关人物不正面出场，重心改为长安饥荒。详见 [`docs/PROJECT_BIBLE.md`](docs/PROJECT_BIBLE.md) §5.3、[`docs/chapters/03_changan.md`](docs/chapters/03_changan.md)。

### ③ UI 的"电影 × 古籍"哲学
- 煤油灯橙黄（`#d4a557`/`#e8b865`）+ 深黑（`#0a0907`），**不是金色**
- 背景画面数字水墨/写实数字绘画（非动漫非真人）
- 文字浮在画面上，**无对话框边框**——这正好否定了"驿路无名"那种字幕条
- 选项是竖排"印章式"，点击有"啪"的音效
- 角色对白前置 "—— " 破折号代替名字框
- 阿萤的话用比旁白略暖的色（`#e8d5b0`）——细微差别玩家会潜意识感知
- **不显示** HP/MP/经验/等级；只显示站名+古风时辰（卯时初、酉时末）

### ④ 三层 AI 架构
- 第一层：剧情骨架——编剧写死，不交给 AI
- 第二层：阿萤自由对话——**状态卡**注入 system prompt
- 第三层：历史人物受限对话——**知识边界卡** + 3-5 轮硬限制 + 三道检查（预言/人设/越界）
- 核心原则："**AI 表演，规则系统裁判**"——任何会影响后续叙事/数据的判定都必须由代码控制

### ⑤ 写作风格反面教材（最关键的"不要做什么"）
- "驿路无名"（即刚提交安全网的那份代码）就是典型反面：
  - 侦探化叙事（主角是"采访使幕府随行书吏"带差牒查案）
  - 信息密度爆炸（开场连续砸采访使/幕府/差牒/驿卒/临皋/怀远驿）
  - 角色工具化（同伴都是"案件需要"）
  - 历史只是背景板（安史之乱直到最后才一句"范阳兵反"）
  - 每秒都在推进，没有让读者喘气的地方
- **判别准则**：写到一半时停下问自己——"这个故事是在'走完一段路'，还是在'解开一个谜'？"前者对，后者错。
- **命运钩子 ≠ 侦探钩子**：读下去的动力应该是"这些人会怎样"而不是"谜底是什么"。

---

## 阶段二：已做内容（commit `14d59e3`）

### A 层删除（按已扫描的真实代码，非 SETUP_GUIDE 附录 C 原清单）

| 组 | 内容 | 备注 |
|---|---|---|
| A1 | `static/images/ruju-demo/`、`static/audio/ruju-demo/` 全部 | 9+ 张图、60+ 音频文件 |
| A2 | `static/js/historical_rpg_demo.js`、`static/css/historical-rpg-demo.css` | 整文件删除 |
| A3 | 删 `data/intrigue_scenes_batch_01.json`；`data/intrigue_scenes.json` **改为 `[]`** | **重要**：`_load_intrigue_scenes()` 硬依赖 `intrigue_scenes.json` 文件名，不能删，只能清空 |
| A4 | `index.html`/`app.js`/`styles.css` 局部 edit | 入口卡片 hero 区改占位 |

### B 层（顺带做）

- `api.py:1897` 清掉"行动力耗尽后，曹操、刘备和江东内部也会各自行动，直到赤壁走向一个自然结局"

### C 层（按计划挪到阶段三）

- index.html 整个 hero 区重做（多故事架构）
- app.js 中 `ruju-*` 大段 UI 渲染逻辑（lines ~2356-3736）
- styles.css `.ruju-*` 通用类
- `_build_intrigue_payload()` / `INTRIGUE_SCENES_PATH` 重构成多故事

### 新建文件

- `docs/UI_REFERENCE_SNIPPETS.md` —— 字幕样式 + 流式字符渲染参考（从删除前抄出），阶段四用

### 验证已通过

- ✅ uvicorn 启动 OK，无 startup error
- ✅ `/` 主页 200
- ✅ `/?x=lawvisual` 公开课 200
- ✅ `/events_list` 长卷 200
- ✅ `/site_config` 200
- ✅ `/static/js/app.js` 200
- ✅ `/static/css/styles.css` 200
- ✅ 已删的 `/static/js/historical_rpg_demo.js`、`/static/css/historical-rpg-demo.css`、`/static/images/ruju-demo/*`、`/static/audio/ruju-demo/*` 全部正确 404
- ✅ 主页 HTML 内**零** "驿路无名/临皋/怀远驿/历史悬疑互动剧" 字符
- ✅ api.py 内**零** "行动力耗尽" 字符
- ✅ `python -m py_compile api.py` 通过
- ⏳ 真人浏览器验证待用户做（公开课 5 案例完整流程）

### 关键偏差（必须给后续会话/AI 看的）

1. **`_load_intrigue_scenes()` 对 `intrigue_scenes.json` 文件名硬依赖**（api.py:1428-1440）
   - 不能 `rm` 删除该文件，只能改为 `[]`
   - 阶段三重构 `_load_intrigue_scenes` 时把这个硬约束也一并解掉

2. **`ruju-*` CSS 命名空间是公开课 + 旧入局共用的**（"入局"拼音首字母 ruju）
   - app.js 里有 40+ 处 `ruju-mode/ruju-playing/ruju-visual-avatar/ruju-verdict-dossier/...`
   - **绝对不能批量删 `ruju-*`**——否则公开课"礼法断案" UI 全毁

3. **`<section id="career-prototype-panel">` 是双挂载点**
   - 既给"驿路无名" (`historical_rpg_demo.js`) 用，也给旧 career 系统用
   - 8 处 `careerPrototypePanel.innerHTML = ...` 无 optional chaining，删 section 会导致这些 innerHTML 写入崩
   - 处理方式：**只改 aria-label，不删 section 元素**——保持 career 系统休眠

4. **`ruju-chibi-*.webp` 和 `ruju-entry-bg.webp` 不属于"驿路无名"**
   - 是公开课赤壁朝议视觉局 + 入口共用资源
   - styles.css 6 处引用——保留

5. **codex_handoff 提到的 `handleTravelChoice()` 死代码**（app.js:3786 之后）
   - 当前仍存在；阶段三/四清理时一并处理

---

## 阶段三：已做内容（5 commits `dad75e0` → `9205bd5`）

按用户拍板方案：**新增独立 `/story/*` 体系，零修改 `/time_travel/*` 公开课代码路径**。

### Commit 1 `dad75e0`：`data/stories/` 多故事数据骨架

- `data/stories/README.md`：完整文档化架构 + 6 种 scene type + 3 种 line type + companion_state_card / historical_figure schema + md→json 同步约定
- `data/stories/sanguo/manifest.json`：schema_version 1.0、8 章索引、人物角色、估算字数与时长
- `data/stories/sanguo/chapters/00_prologue.json`：从 docs/chapters/00_prologue.md 忠实翻译，14 scenes，4 种 type
- `data/stories/sanguo/chapters/02_luoyang.json`：从 docs/chapters/02_luoyang.md 忠实翻译，14 scenes，6 种 type 全部覆盖

### Commit 2 `936af78`：api.py 状态 + 独立 loader

新增（旧 `_load_intrigue_scenes` / `INTRIGUE_SCENES` 一行不动）：
- `story_sessions` 字典（与 `time_travel_sessions` 完全独立）
- `STORIES_DIR = DATA_DIR / "stories"`
- `_load_stories()` —— 启动时只加载 manifest 索引，章节按需加载
- `STORIES` 模块状态
- `_load_chapter(story_id, chapter_id)` —— 按需加载 + 路径穿越防御（`..` / `/` / `\` 拦截）

### Commit 3 `7bda6a6`：4 个 `/story/*` 基础 endpoint

- GET `/story/list` —— 列出故事摘要
- GET `/story/{story_id}/manifest` —— 完整 manifest
- GET `/story/{story_id}/chapter/{chapter_id}` —— 按需加载章节
- POST `/story/{story_id}/session/start` —— 创建/继续会话（含 load_session_id 支持）

session 状态字段：`story_id / current_chapter / current_scene / protagonist_name / identity / choices_made / companion_relationship / secrets_unlocked / created_at`。

### Commit 4 `bd0e080`：前端故事选择器（数据流，不做 UI）

- `index.html`：新增 `<section id="sanguo-panel">` 挂载点；app.js 缓存版本号升至 `story-demo-20260619a`
- `app.js`：
  - `state.story` 状态块
  - `elements.sanguoPanel`
  - `fetchStoryList / fetchStoryManifest / startStorySession / applyStoryEntryCopy / enterStoryPanel / exitStoryPanel / renderSanguoPanelStub`
  - `bindHistoricalRpgEntry` 非公开课分支：clicking 入口按钮启动 `stories[0]`
  - `init()` 拉故事列表并应用入口文案 + 退出按钮事件委托
  - `showHome()` 加入 hide sanguoPanel

UI 说明：仅打通数据流。占位渲染用内联样式显示 session_id/章节/场景 + 章节索引。阶段四 UI 会替换 `renderSanguoPanelStub` 为真正的剧情场景渲染。

### Commit 5 `9205bd5`：占位 talk_stream endpoints

- POST `/story/{story_id}/companion/talk_stream` —— 阿萤自由对话（流式占位）
- POST `/story/{story_id}/historical/talk_stream` —— 历史人物受限对话（流式占位）
- SSE 流格式与现有 `/classroom/talk_stream` 一致：`message_start → delta 逐字 → message_end → done`，便于阶段五复用前端流式渲染

阶段五会接入百炼 + 状态卡 / 知识边界卡 + 三道检查后实现真实回复。

### 验证（自动化）

- ✅ `python -m py_compile api.py` 通过
- ✅ uvicorn 干净启动，无 startup error
- ✅ 公开课 `/?x=lawvisual` 200
- ✅ 主页 `/` 200，`/events_list` 200，`/site_config` 200
- ✅ `/story/list` 返回 sanguo 摘要
- ✅ `/story/sanguo/manifest` 返回 schema_version 1.0 + 8 章索引
- ✅ `/story/sanguo/chapter/00_prologue` 返回 14 scenes
- ✅ `/story/sanguo/chapter/99_doesnt_exist` → 404
- ✅ `_load_chapter('sanguo', '../../etc/passwd')` → None（路径穿越拦截）
- ✅ POST `/story/sanguo/session/start` 创建 UUID session
- ✅ POST `companion/talk_stream` SSE 流：speaker=阿萤
- ✅ POST `historical/talk_stream` SSE 流：speaker=历史人物
- ✅ bogus session_id → SSE error
- ⏳ 真人浏览器验证待用户做（公开课 5 案例 + 主页 4 模块 + 入口卡片显示三国篇 + 点击进入 sanguo-panel 看到占位 + 返回按钮）

### 关键决策（与 SETUP_GUIDE 偏离）

1. 接口前缀用 `/story/`（不用 SETUP_GUIDE 建议的 `/intrigue/`）——避免与 `/time_travel/` 语义重复
2. 数据 schema 不要 `prompts/` 和 `characters.json`——状态卡内嵌到对应章节节点
3. `_load_intrigue_scenes` 一行不动；新增独立 `_load_stories`——物理隔离公开课
4. 新建独立 `sanguo-panel` 而非复用 `careerPrototypePanel`——避免旧 career 双挂载问题
5. md / json 同步策略：md 是真源，json 是派生；改剧情先改 md

### 关键状态备注（必读）

- **`data/intrigue_scenes.json` 仍是 `[]` 占位**：仅为兼容 `_load_intrigue_scenes()` 的硬依赖（要求文件存在 + scenes 非空，靠 glob 捞到 `intrigue_scenes_law_classroom.json` 满足非空检查）。**旧 `_load_intrigue_scenes()` 与 `_build_intrigue_payload()` 整套体系将来彻底废弃公开课时可连同 `intrigue_scenes.json` 占位一起删除**。
- 6 个 `ruju-chibi-*.webp` / `ruju-entry-bg.webp` 共用资源仍保留（公开课赤壁朝议视觉局 + 入口背景用）
- `careerPrototypePanel` 元素保留作旧 career 系统休眠挂载（阶段二记录的偏差 3）

---

## 下一步（阶段四预告）

待用户确认阶段三无误后，进入阶段四：UI 实现（按 `docs/04_UI_SPEC.md` 从零做）。

要点：
1. 替换 `renderSanguoPanelStub` 为真正的剧情场景渲染
2. 实现"电影 × 古籍"哲学的字幕式呈现（参考 `docs/UI_REFERENCE_SNIPPETS.md`）
3. 实现 6 种 scene type 的渲染：narration / narration_with_choice / companion_free_talk / historical_distant_view / historical_limited_talk / chapter_end
4. 实现印章式选项、笔记本系统、卷/言/乐/声 顶栏
5. 章节切换地图过场
6. 输入主角姓名节点（`awaits_input: "protagonist_name"`）

**阶段四完成后**：本 PROGRESS.md 增加"阶段四已做内容"一节。

---

## 后续会话需要注意的事项

如果会话中断后另一个会话接手，按以下顺序读：

1. 读 `PROGRESS.md`（本文件）——知道当前到哪
2. 读 `CLAUDE.md`——知道项目长什么样
3. 读 `SETUP_GUIDE.md`——知道接下来该怎么做
4. 读 `codex_handoff.md`——知道为什么是现在的状态
5. 按 `docs/01_STORY_BIBLE.md`-`06_PROMPT_TEMPLATES.md` 知道要写什么

### 编码与文件操作

- **不要用 PowerShell `Set-Content` 重写包含中文的前端文件**。改中文优先用 Edit 工具，或读后用 `[System.IO.File]::WriteAllText` 显式 UTF-8 no-BOM 写回
- 改 CSS/JS 后要更新 `static/index.html` 中的缓存版本号
- 工作目录是 `E:\gitclone\history-app2\history-app\`（**注意是 `history-app/` 子目录，不是外层 `history-app2/`**）；git 仓库也在 `history-app/`

### 与用户沟通

- 用户没有编程经验，用普通中文解释技术
- 用户做事极其在意"外延检查"——完成 A 时主动告诉用户 B/C/D 是否受影响
- 不要"假装思考"——遇到不确定立刻 grep 或读文件查证
- 重要决策给 3-4 个选项 + 利弊

### 项目边界（绝对不能动）

- 公开课"礼法断案"：`/classroom/*`、`classroom_admin.html`、`data/intrigue_scenes_law_classroom.json`、任何含 `classroom`/`lawvisual` 的代码
- 其他三模块：历史长卷（`events.yaml`）、人物 AI 对话、互动游戏
- 基础设施：登录、统计、限流、`.env`
- 旧 career 系统（暂保留）：`career_engine.py`、`data/career_*.json`

### 文档与代码冲突时

按 SETUP_GUIDE 第三节："代码 > 文档" 适用于 HOW；"文档 > 代码" 适用于 WHAT/WHAT NOT。
不确定就告诉用户，给出方案，等确认。
