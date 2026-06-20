# 入局·三国篇 — 项目进度

> 本文档供后续会话接手时使用。每完成一个阶段更新一次。
> 当前阶段：**阶段五全部完成（5.1-5.5b 共 7 commits），主理人浏览器全流程验证通过。下一阶段为 BGM（阶段六）或后续章节策划。**
> 阶段五方案书：[docs/PHASE5_PLAN.md](docs/PHASE5_PLAN.md)

最后更新：2026-06-21（阶段五 ship：AI 对话接百炼 + 三道检查 + 秘密锁 + 关系阶段进化机制）

---

## 全阶段路线图

按 `SETUP_GUIDE.md` 第六节执行，五个阶段顺序进行：

| 阶段 | 内容 | 状态 |
|---|---|---|
| 安全网 #1 | "驿路无名"最后稳定版本 commit 留底 | ✅ 已完成（`f241e84`） |
| **阶段一** | 文档结构（docs/ 拆分 + CLAUDE.md） | ✅ 已完成 |
| 安全网 #2 | 阶段一文档结构 commit | ✅ 已完成（`e9dbfdd`） |
| **阶段二** | 归档与清理"驿路无名" | ✅ 已完成（`14d59e3`） |
| **阶段三** | 入局模块架构重构（多故事支持） | ✅ 已完成（5 commits：`dad75e0` → `9205bd5`） |
| 阶段三收尾 | 史料权威 + 貂蝉杜氏修正 + 荀彧 fallback + UI 替换清单 | ✅ 已完成（`06f49f7` + `fa38596`） |
| **阶段四** | UI 实现（按 `docs/04_UI_SPEC.md` + `04b_VISUAL_STYLE_GUIDE.md`） | ✅ 已完成（C1-C8 共 9 commits 含修复），全流程已验证 |
| 阶段四收尾 | 4 张新场景图接入 + fade transition + 阿萤台词去粗口 | ✅ 已完成（`d11e69e` + `487b7c6` + `da21e95` + `16a6880`） |
| **阶段五** | AI 对话系统（阿萤 + 历史人物，对接百炼） | ✅ 已完成（5.1-5.5b 共 7 commits：`6479ebf` → `fa4d954`），全流程验证通过 |
| 阶段六（未启动） | BGM 系统 | ⬜ 未开始 |
| 后续章节策划 | 01_interlude / 03_changan → 07_chibi 剧本细化 | ⬜ 由策划 Claude 推进 |

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

---

## 阶段四：已做内容（C1-C8 共 9 commits + 多个修复补丁）

按用户在阶段三方案书确认的方向 + 用户拍板的视觉锚（GPT Image 2.0 v1·黄昏调性，`docs/04b_VISUAL_STYLE_GUIDE.md`）实施。

### 视觉锚 v1（用户预置）

- `static/images/sanguo/00-lane-v1.png` 序章·乡道·黄昏版（GPT Image 2.0 生成）
  - 歪脖子桃树 + 烂泥路 + 远方烟柱 + 极小剪影 + 黄昏暖橙地平线
  - 2.35:1 宽幅，电影级写实摄影 + 数字 matte painting
- `docs/04b_VISUAL_STYLE_GUIDE.md` 视觉风格规范
  - 后续场景图按此规范生成

### Commit 顺序

| # | Commit | 内容 |
|---|---|---|
| C1 | `81075fb` | api.py 新增 session 推进 endpoint（advance/set_name/get） |
| C2 | `4ba5d37` | sanguo-panel 基础壳 + 入口首页重做（删 ruju-flow-rail 三卡片）+ pace schema + sanguo.css |
| C3 | `4da29a0` | 流式打字 + narration 渲染 + 三层文字 + pace 字段 |
| C3 修复 1 | `4adb859` | 用户验证发现 4 问题：左侧 nav / 背景压暗 / "画面：" 残留 / hero 区残留 |
| C3 修复 2 | `6ae76df` | sanguo-panel 改 position:fixed（解决高度被打乱） |
| C3 修复 3 | `f3f280d` | sanguo-panel reparent 到 body（解决 z-index 被祖先 stacking context 困住） |
| C4 | `c8c9c51` | narration_with_choice + 印章选择 + advance 记录 choice_id |
| C5 | `53f45f1` | input_protagonist_name 仿古纸输入框 + set_name 调用 |
| C6 | `7351073` | companion_free_talk + historical 节点 in-character 占位 + chapter_end 章节切换 |
| C7 (P1) | `e4d625e` | 笔记本（卷）简化版 |
| C8 | (本次) | 收尾：序章 next_chapter 临时跳 02_luoyang 跳过 stub 01_interlude；PROGRESS.md 更新 |

### 6 种 scene type 全部覆盖

- **narration** —— C3 流式打字
- **narration_with_choice** —— C4 印章式选项，pending 分支显"撰写中"
- **companion_free_talk** —— C6 阿萤"……→嗯。" in-character 占位（阶段五接百炼）
- **historical_distant_view** —— C3 同 narration 渲染（远观无对话）
- **historical_limited_talk** —— C6 荀彧 fallback "（拈须不语，半晌方道）此事容后再议。"
- **chapter_end** —— C6 全屏字幕 + "进入下一章" / "正在撰写中" stub

### MVP 可玩通的剧情段

```
序章·涿郡（00_prologue）：
  lane (v1 视觉锚)
  → grandma_words → water_bag → zhuoxian_market → peddler
  → midway_subtitle (全屏字幕)
  → earth_temple_outside → ayinghuo_first_meet（3 选项·2 pending）
  → recognize_kin
  → input_protagonist_name（仿古纸输入框）
  → campfire_free_talk（言/睡吧 + in-character 占位）
  → morning_identity_choice（4 选项·3 pending）
  → chapter_end (全屏字幕)
  → 进入「第一站·洛阳」

第一站·洛阳（02_luoyang）：
  city_wall → city_gate → gate_captain（3 选项·2 pending）
  → document_scene → tongtuo_street
  → dongzhuo_carriage（historical_distant_view 董卓远观）
  → inn_night → ayinghuo_midnight_talk（companion_free_talk）
  → knock_at_door → xunyu_appears
  → xunyu_limited_talk（historical_limited_talk 5 轮硬限·占位回 fallback）
  → xunyu_farewell → back_upstairs（4 选项·3 pending）
  → chapter_end
```

### 关键技术决策

1. **sanguo-panel 全屏覆盖**：JS 在 init 时 reparent 到 `<body>` 直接子级 + CSS `position: fixed; z-index: 9999`。避开任何祖先 stacking context 困扰。
2. **物理隔离继续**：所有新 CSS 类用 `sanguo-*` 前缀，与公开课 `ruju-*` 不冲突；所有新 endpoint 在 `/story/*` 命名空间。
3. **章节切换检测**：sanguoAdvanceToScene 比对 currentChapter.chapter_id 与 res.current_chapter，不同时重新 fetchStoryChapter。
4. **流式渲染两套管道**：startTypingCurrentLine（scene.lines 索引推进）和 typeStandaloneLine（一次性 line + callback）。前者用于剧本主线，后者用于 C6 in-character 占位回复。
5. **C6 in-character 占位代替"阶段五接入"提示**：保持沉浸感（用户补充 2 要求）。阿萤"……→嗯。"，荀彧 fallback_lines[0]。

### 临时跳过

- `00_prologue.json` 末 `next_chapter: "02_luoyang"`（原 `01_interlude` 是 stub）
  - 为让用户能完整验证序章 → 第一站。等 01_interlude 写完后恢复

### 验证（自动化）

- ✅ `python -m py_compile api.py` 通过
- ✅ uvicorn 干净启动
- ✅ 公开课 `/?x=lawvisual` 200
- ✅ 主页 + 长卷 + 入口卡片 200
- ✅ 所有 sanguo.css / app.js 资源 200
- ⏳ 真人浏览器全流程验证待用户做

### 阶段四暂未做（按方案书 P2 延后）

- 章节切换地图过场动画（用 fade 替代）
- 笔记本完整版（日录/人印/地图/心事 四标签 + 翻页效果）
- 历史人物对话"史"印章常驻顶栏标记
- BGM 实际接通（顶栏"乐"暂禁用）

---

## 阶段五：已做内容（7 commits `6479ebf` → `fa4d954`）

按 [docs/PHASE5_PLAN.md](docs/PHASE5_PLAN.md) 拍板的方案执行。AI 对话系统从占位升级为真实 LLM 驱动，三道检查兜底，秘密锁机制就位，关系阶段进化机制就位。

### 5.1 schema 升级 (`6479ebf`)

- `companion_state_card.secrets_unlockable` 占位字段替换为：
  - `secrets_hint_allowed: string[]` —— 可"漏一点点"的 secret id
  - `secrets_reveal_allowed: string[]` —— 可"完整揭开"的 secret id
- 定义 2 个权威 secret id（写入 [`docs/02_CHARACTERS.md`](docs/02_CHARACTERS.md) §5.2.1）：
  - `secret_brother`（弟弟死于她手，锁第三站徐州）
  - `secret_mirror`（看见董卓时的恐惧，锁第五站河北）
- 两章现有 companion_state_card 同步升级

### 5.2 后端 LLM 客户端 + 三道检查 (`1fae856` + `3a943b0`)

- 新建 `sanguo_ai.py`：百炼 client 单例 + system prompt 构造器
  - `build_companion_system_prompt(state_card, recent_choices)`
  - `build_historical_system_prompt(figure, knowledge_card, recent_choices)`
  - `collect_completion` / `stream_completion`
  - 沿用 `WEB_API_KEY > DASHSCOPE_API_KEY > GEMINI_API_KEY` 优先级
  - 关 qwen3 thinking 模式保证流式即时
- 新建 `sanguo_checks.py`：三道检查混合方案
  - 预言性句式 regex（"将会/必将/注定/日后/我看你/终将"等 20+ 词）
  - 秘密泄露 phrase 字典（命中且 secret_id 不在 reveal_allowed → 违规）
  - 元叙述（"作为 AI"/"我无法"）+ 现代词扫描
  - 知识越界（"赤壁之战"/"草船借箭"等绝对禁词，仅历史人物用）
- smoke test 12/12 通过

### 5.3 阿萤自由对话接百炼 (`0ab5f38`)

- `/story/sanguo/companion/talk_stream` 占位 → 真实 LLM
- 流程：load state_card → build prompt → collect → check_companion →
  通过则 SSE 推送 / 不通过最多重试 3 次（升温度）/ 全失败 fallback
- session 新增 `companion_dialogue_history` / `historical_dialogue_history`
- 烟测 3 轮通过（campfire_free_talk）：阿萤回复短而冷且秘密守住

### 5.4 荀彧受限对话接百炼 + 5 轮硬限 (`4482fd0`)

- `/story/sanguo/historical/talk_stream` 占位 → 真实 LLM
- 轮数硬限：count >= rounds_limit 时早期 return + fallback_lines + ended=True
- 烟测 6 轮通过（xunyu_limited_talk）：第 1-5 轮真实 LLM 回复（38-49 字士人腔，知识边界严守），
  第 5 轮 ended=True 触发，第 6 轮 0.1s 早期 return 给 fallback "这话不必当此说。"

### 5.5 前端 SSE 流式渲染 (`f372a8e`)

- `handleSanguoTalkSubmit(message)` 重写为 fetch + ReadableStream + TextDecoder
- delta 逐字 append 到 textEl（沿用阶段四"流式打字"沉浸感）
- 推进逻辑：companion 默认回 talk_actions（无限轮）；historical 未达限回
  talk_actions 显示"剩余 N/Y"；historical 达限自动 sanguoAdvanceToScene 推进到 scene.next
- 缓存版本号 bump `20260621b`

### 5.5b persona 软化 + 关系阶段进化机制 (`fa4d954`)

主理人验证 5.5 时反馈"阿萤过于冷淡，吃了我的东西没必要这么冷"+"希望随剧情深入开朗活泼"，两轮迭代：

- **persona v2**: 明确"冷"是防御不是攻击；禁用"走远点/别管我/别问废话"等 push-back 句式
- **persona v3**: 在已破冰的场景偶尔展开 5-15 字提一个具体细节，至少一半回复 ≥ 5 字
- **关系阶段进化**：新增 `relationship_stage` 字段（guarded / warming / trusted / broken）+
  `RELATIONSHIP_STAGE_GUIDANCE` 字典翻译为 system prompt 指引。当前两章都标 guarded，未来章节按情感弧推进
- 详细阶段表写入 [`docs/02_CHARACTERS.md`](docs/02_CHARACTERS.md) §5.2.2

### 阶段五完成判定（[docs/PHASE5_PLAN.md](docs/PHASE5_PLAN.md) §6）

✅ 全部跑通：
- 序章篝火夜话：阿萤短而冷，hint 自然漏出，秘密守住
- 洛阳客栈夜半：不同状态卡 + secret_mirror hint_allowed 已就位
- 荀彧 5 轮硬限 + 第 6 轮 ended → 自动 advance 到 xunyu_farewell
- 公开课 5 案例完全不破

### 关键技术决策

1. **混合三道检查 vs 后置 LLM 校验**：选混合（prompt 内置约束 + 规则黑名单），保留阶段四已实现的流式打字沉浸感
2. **persona 软化方向**：防御性而非攻击性。push-back 句式被明确禁用
3. **关系阶段进化作为 4 阶段 enum**：策划写每个 companion_free_talk 节点时显式指定阶段，AI 不会自己升级
4. **fallback 不污染对话历史**：成功 path 才写入 dialogue_history，避免"用户问 X，AI 回'此事容后再议'"的循环

---

## 下一步建议

阶段五已 ship，主线技术架构齐备。剩余工作分两轨：

### 技术轨

- **阶段六**：BGM 系统（详见 PHASE5_PLAN §四 D3 决策）
  - 序章 + 洛阳各一首 BGM 资源采集（古琴/箫/笛调性，参考《天地劫》/《对马岛之魂》）
  - "乐"按钮启用 + autoplay 处理（入口卡片首次点击 init audio context）
  - 章节切换换曲（淡入淡出）
  - manifest / chapter JSON `background_music` 字段接入

### 策划轨（策划 Claude）

- 序章其他分支（递水/继续走/选项 1、2 庙里分支 / 4 身份分支 3 条 pending）
- 过渡·五年间（蒙太奇）
- 第二站长安（饥荒，远观路线 per BIBLE §5.3 修正）
- 第三站徐州（曹操屠城；阿萤揭秘一，**relationship_stage 升 warming**）
- 第四站许都（衣带诏）
- 第五站河北（官渡之战；阿萤揭秘二 + 重伤，**升 trusted**）
- 终章赤壁（多结局表 5 种）

待策划写完一章后，按 `docs/04b_VISUAL_STYLE_GUIDE.md` §5 SOP 生图 + 翻译 JSON +
按 `docs/02_CHARACTERS.md` §5.2.2 标 relationship_stage 即可接入。

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
