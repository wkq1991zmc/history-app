# history-app · 入局·三国篇

这是「时空印证系统」（history-app）的开发项目说明。

## 📂 项目结构（首次接手必读）

- **代码根目录**：`E:\gitclone\history-app2\history-app\`（外层 `history-app2/` 是上级文件夹，不是 git 仓库；本目录才是 git 仓库）
- **GitHub 仓库**：`https://github.com/wkq1991zmc/history-app`
- **本地启动**：参考 `app.py` / `api.py`，常用地址 `http://127.0.0.1:8000`

## 📚 关键文档（每次开始工作前读）

1. **`SETUP_GUIDE.md`** —— 项目接手指令（**首次接手时必读**）
2. **`codex_handoff.md`** —— 项目历史与当前状态（之前 Codex 的开发记录）
3. **`docs/PROJECT_BIBLE.md`** —— 三国篇的完整设计圣经（主文档）
4. **`docs/01_STORY_BIBLE.md` ~ `06_PROMPT_TEMPLATES.md`** —— PROJECT_BIBLE 各节的拆分子文档
5. **`docs/chapters/00_prologue.md` ~ `07_chibi.md`** —— 各章节剧本与占位
6. **`PROGRESS.md`** —— 当前进度（每阶段更新）

## 🎯 当前任务

把「入局」模块从"驿路无名"（唐天宝末年）替换为"三国篇"（东汉末年），并重构为支持多故事的架构。

## ⛔ 绝对不能动

- **公开课"礼法断案"**：`/classroom/*` 接口、`static/classroom_admin.html`、`data/intrigue_scenes_law_classroom.json`、任何带 `classroom`/`law_classroom`/`lawvisual` 的代码
- **其他模块**：历史长卷（`events.yaml`）、历史人物 AI 对话、互动游戏（猜历史人物）
- **基础设施**：登录、统计、限流、错误兜底、`auth_data/`、`analytics_data/`、`chat_data/`、`.env`
- **旧 career 系统**（虽然废弃但用户未明确删除）：`career_engine.py`、`data/career_*.json`

## ✅ 五阶段实施顺序

按 `SETUP_GUIDE.md` 第六节推进，每阶段汇报后等用户确认再进入下一阶段：

- **阶段一**：文档结构（无代码风险）—— 创建 `docs/` 拆分文档 + `CLAUDE.md`
- **阶段二**：归档与清理 —— 清除"驿路无名"全部痕迹
- **阶段三**：入局模块架构重构 —— 多故事支持
- **阶段四**：UI 实现 —— 按 `docs/04_UI_SPEC.md` 从零做
- **阶段五**：AI 对话系统 —— 阿萤 + 历史人物，对接百炼

## 📐 核心创作原则

详见 `docs/05_WRITING_STYLE.md` 和 `docs/01_STORY_BIBLE.md`，要点：

- **严格正史**：严禁使用《三国演义》虚构情节作为正史背景
- **小人物视角**：玩家不能改写历史，只能改变身边人命运
- **情感先于名词**：不要堆专有名词
- **2-3 句一屏**：节奏必须慢
- **每屏文字越短越好**：能 30 字说清绝不 60 字
- **不写侦探化叙事**：避免"驿路无名"那种悬疑密度

## 🔧 技术债与已知坑

详见 `codex_handoff.md` 与 `SETUP_GUIDE.md` 第九节：

1. **编码**：不要用 PowerShell `Set-Content` 直接重写包含中文的前端文件，会编码污染。改中文优先用 `Edit` 或读后用 `[System.IO.File]::WriteAllText` + UTF8 no-BOM。
2. **缓存**：修改 CSS/JS 后要更新 `static/index.html` 中的缓存版本号。
3. **不要堆大文件**：`api.py` 和 `static/js/app.js` 体积已大；新模块应按"入局/UI/AI"三块拆分。
4. **百炼**：模型 `qwen3.6-flash`，环境变量 `TIME_TRAVEL_FAST_MODEL`，优先级 `WEB_API_KEY > DASHSCOPE_API_KEY > GEMINI_API_KEY`。
5. **配音不是核心**：三国篇第一版**不做配音**，先做好文本和 BGM。

## 👤 项目主理人

- 没有编程经验，依赖你完成所有技术工作
- 对故事品质要求极高
- 被《饿殍》《燕云十六声》《盛世天下女帝篇》深度熏陶，审美在线
- 沟通原则：给方案而不是给问题；重要决策给 3—4 个选项 + 利弊
- 期望你执行"外延检查"：完成 A 时主动检查 B、C、D 是否受影响

## 🤝 协作分工

主理人 ←→ 策划 Claude（网页版）→ 产出文档 → 主理人转交 → Claude Code（你）→ 实现代码 → 主理人测试 → 反馈给策划 Claude

**当你与本项目文档冲突时**：
- HOW（怎么做）：相信代码，给出更适配现有项目的方案，并告诉用户为什么
- WHAT/WHAT NOT（做/不做）：以文档为准

详见 `SETUP_GUIDE.md` 第三节"代码是真相之源"。
