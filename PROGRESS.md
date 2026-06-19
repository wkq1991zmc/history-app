# 入局·三国篇 — 项目进度

> 本文档供后续会话接手时使用。每完成一个阶段更新一次。
> 当前阶段：**阶段一已完成，等用户确认进入阶段二**

最后更新：2026-06-19（阶段二完成）

---

## 全阶段路线图

按 `SETUP_GUIDE.md` 第六节执行，五个阶段顺序进行：

| 阶段 | 内容 | 状态 |
|---|---|---|
| 安全网 #1 | "驿路无名"最后稳定版本 commit 留底 | ✅ 已完成（`f241e84`） |
| **阶段一** | 文档结构（docs/ 拆分 + CLAUDE.md） | ✅ 已完成 |
| 安全网 #2 | 阶段一文档结构 commit | ✅ 已完成（`e9dbfdd`） |
| **阶段二** | 归档与清理"驿路无名" | ✅ 已完成（`14d59e3`），**等用户确认** |
| 阶段三 | 入局模块架构重构（多故事支持） | ⬜ 未开始 |
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
| `03_changan.md` | ⏳ 占位 | 第二站·长安（杜氏约束已记录） |
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
- **红线**：演义不是史料。桃园三结义、温酒斩华雄、草船借箭、借东风、舌战群儒、气死周瑜——全部不能作为背景事件。第二站要用"杜氏"史实替代"貂蝉"。

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

## 下一步（阶段三预告）

待用户确认阶段二无误后，进入阶段三：入局模块架构重构（多故事支持）。

按 SETUP_GUIDE 第六节阶段三，重点关注：

1. **评估现有架构与文档建议的差异**——SETUP_GUIDE §阶段三明确说目录结构、接口路径、JSON 设计都"只是建议"，要 grep 真实代码后给出更适配的方案
2. 设计 `data/stories/<story_id>/` 多故事数据结构（建议用现有 `intrigue_scenes_*.json` 风格扩展，而不是另起一套）
3. 改造 `/time_travel/...` 接口为多故事版（公开课已 200，不能破坏）
4. **顺带做阶段二 B/C 层挪过来的事**：
   - 重构 `_load_intrigue_scenes()` 让 `intrigue_scenes.json` 文件名不再硬依赖
   - 重写 hero 入口区（多故事选择器）
   - 改 `applyClassroomEntryCopy` 文案逻辑

**阶段三完成后**：在本 PROGRESS.md 增加"阶段三已做内容"一节。

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
