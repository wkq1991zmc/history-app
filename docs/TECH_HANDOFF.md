# 技术 Claude Code 接手简报

> 你正在 Claude Code 会话内接手"**入局·三国篇**"项目的**技术实现**工作（与策划分工）。
> 本文档让你在 5 分钟内入门：项目长什么样、模块在哪、典型工作流、与策划 Claude 的协作、约束清单。
> **必须读完本简报 + 关键文档再动任何代码。**

---

## 一、角色分工

| 谁 | 做什么 |
|---|---|
| **主理人** | 项目总决策；无编程经验；要求"外延检查"——完成 A 时主动告诉他 B/C/D 是否受影响 |
| **策划 Claude**（另一个会话） | 写 `docs/chapters/*.md` 剧本 + `docs/02_CHARACTERS.md` 人物卡更新 + 历史考据 |
| **你 = 技术 Claude Code**（这个会话） | JSON 翻译 / API endpoint / 前端 JS+CSS / 接入 / 浏览器验证 / commit / 生图工作流 |

**你不写剧本对白、不做创意决策**。策划写完 md 给主理人，主理人转交给你翻译为 JSON + 接入。

如果主理人让你做策划的事（"帮我润色这句对白"等），礼貌指引："这部分由策划 Claude 处理，详见 `docs/PLANNER_BRIEF.md`"，除非主理人明确说"现在不切策划会话，你帮我改一下"——那就按主理人指令做。

---

## 二、必读文档（按顺序）

直接 `Read`：

1. **`CLAUDE.md`** —— 项目入口、绝对不能动的边界、核心创作原则、技术债与已知坑
2. **`PROGRESS.md`** —— 全阶段进度（重点看顶部状态行 + 阶段五已做内容 + 下一步建议两轨道）
3. **`docs/PHASE5_PLAN.md`** —— 阶段五（已 ship）的设计圣经：D1 secrets schema / D2 三道检查混合方案 / D3 BGM 延后 + 完成判定
4. **`docs/PLANNER_BRIEF.md`** —— 策划 Claude 在另一个会话用的简报。你**必须熟悉策划的视角**，才能跟上 ta 的产出
5. **`data/stories/README.md`** —— 多故事数据架构 + 6 种 scene type schema + 三种 line type + companion_state_card / historical_figure schema（这是策划→JSON 翻译的权威约定）
6. **`docs/04b_VISUAL_STYLE_GUIDE.md`** §5 —— 生图 SOP（A/B/C 分类 + 文件命名 + SCENE_IMAGE_MAP 单一真源）
7. **`docs/03_AI_SYSTEM.md`** §6.2.1 + **`docs/02_CHARACTERS.md`** §5.2.1 / §5.2.2 —— AI 系统的硬规则（秘密 id 权威清单 / 关系阶段表）
8. **`static/images/sanguo/SCENE_IMAGE_MAP.md`** —— 当前图片-scene 映射的单一真源
9. **`sanguo_ai.py`** + **`sanguo_checks.py`** —— LLM 调用层 + 三道检查（阶段五核心库）
10. **`api.py`** —— 重点看 `/story/*` 一节（line 3812 起）+ `_story_companion_stream` + `_story_historical_stream` + `_resolve_recent_choices_text` + `_find_scene_in_chapter` + `dev_jump`
11. **`static/js/app.js`** —— 搜 `sanguo` 找前端入局模块（约 line 1280-2100）；关键函数：`syncSanguoBackground` / `startTypingCurrentLine` / `finishTypingDOM` / `sanguoAdvanceToScene` / `handleSanguoTalkSubmit` / `renderSanguoTalkActions` / `startSanguoIntroSequence` / `handleSanguoIntroContinue` / `setupDevJumpPanel`
12. **`static/css/sanguo.css`** —— 三国篇专用样式，物理隔离公开课 ruju-*
13. **`docs/chapters/00_prologue.md`** + **`02_luoyang.md`** —— 已写完的两章 md 真源（看格式参考）

读完后你应能回答（自检）：

- 6 种 scene type 是哪 6 种？每种的必填字段是什么？
- `companion_state_card` 的 schema 字段有哪些？`relationship_stage` 4 个阶段名？
- `WEB_API_KEY > DASHSCOPE_API_KEY > GEMINI_API_KEY` 优先级在哪生效？
- intro scene 的 `is_intro: true` 触发哪个独立渲染流程？
- 生图 SOP 的 A/B/C 分类规则是什么？
- 公开课"礼法断案"的代码边界在哪（哪些路径绝对不能动）？
- bg fade transition 的 CSS 与 JS 是怎么协同的？

---

## 三、当前项目状态（截至 2026-06-21）

- ✅ 阶段四 MVP + 阶段五 AI 全 ship
- ✅ 序章 00_prologue + 第一站洛阳 02_luoyang 完整可玩通
- ✅ 序章前言（is_intro）已实装：中心字幕慢打 → fade 转 lane
- ✅ dev_jump panel：`?dev=1` 触发右下角章节/scene 跳转面板
- ✅ 阿萤 + 荀彧真实 LLM 对话 + 三道检查 + 秘密守护 + 5 轮硬限
- ✅ 关系阶段进化机制（relationship_stage: guarded/warming/trusted/broken）
- ⏸ BGM 延后到阶段六（资源采集 + autoplay + 章节切换换曲）
- ⏸ 待策划写：01_interlude / 03_changan / 04_xuzhou / 05_xudu / 06_hebei / 07_chibi
- ⏸ 序章其他 3 个身份分支（游侠 / 商队 / 流民医徒）+ 槐树下其他 2 选项 + 庙里其他 2 选项

**git log 看最近的活**：`git log --oneline -30`

---

## 四、典型工作流

### 4.1 当策划写完一章 md（主流任务）

主理人会说"策划那边写完 docs/chapters/03_changan.md，请翻译为 JSON 接入 + 列生图清单"。你：

```
1. Read docs/chapters/03_changan.md 仔细看一遍
2. 按 data/stories/README.md schema 翻译为
   data/stories/sanguo/chapters/03_changan.json：
   - scene_id 按情节命名（用拼音 / 英文短语）
   - 每个 scene 选合适的 type（narration / narration_with_choice /
     companion_free_talk / historical_distant_view /
     historical_limited_talk / chapter_end）
   - lines 按 md 对白逐句翻译，speaker / stage_direction / pace 都标
   - companion_state_card / historical_figure 字段从 md 状态卡块翻译
   - **必填字段不能漏**（特别是 secrets_*_allowed + relationship_stage
     for companion；rounds_limit + fallback_lines for historical）
3. 扫 scene list 按 04b §5.3 规则分 A/B/C 组生图清单：
   - A 组（真新设定）：给主理人"文件名 + 该图对应的剧情段中文描述"
     （不要写英文 prompt，主理人会自己跟 GPT Image 2.0 对话）
   - B 组（同物理场景）：扩 SCENE_IMAGE_MAP.md（不生新图）
   - C 组（字幕/overlay）：黑底字幕，留空 background_image
4. 主理人生完图后告诉你"X 张图都好了"，你：
   - 更新 SCENE_IMAGE_MAP.md 新增/扩展条目
   - 更新 chapter JSON 的 background_image 字段（严格按 MAP）
5. 不需重启 uvicorn（_load_chapter 按需读 JSON）
6. 引导主理人浏览器验证：用 ?dev=1 直接跳转到关键 scene 测
7. 验证通过 → 按"每改动一组独立 commit"原则 commit
```

### 4.2 当主理人要改 UI / 前端行为

```
1. 改 static/js/app.js 和/或 static/css/sanguo.css
2. **必须 bump 缓存版本号**（static/index.html 里的 ?v=... 参数）：
   - CSS 改了 → sanguo.css 版本号 +1
   - JS 改了 → app.js 版本号 +1
   - 命名约定：story-demo-YYYYMMDDX（X = a/b/c/d...）
3. CLAUDE.md "UI commit 必须真人浏览器验证" 守则——主理人浏览器验证通过
   再 commit，不能 curl 验证后就 commit
4. 引导主理人硬刷新 (Ctrl+F5) 后测试
```

### 4.3 当主理人要改后端 / api.py / sanguo_ai.py / sanguo_checks.py

```
1. 改完 python -m py_compile <file>.py 编译检查
2. 必须重启 uvicorn:
   powershell -NoProfile -Command "Get-Process python -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id $_.Id -Force } catch {} }"
   然后后台启动:
   python -m uvicorn api:app --host 127.0.0.1 --port 8000 --log-level warning
   (用 run_in_background: true)
3. 用 PYTHONIOENCODING=utf-8 python -c "..." 跑 smoke test
4. 后端 commit 前 curl + Python 客户端验证 endpoint OK 即可（非 UI 不强求浏览器）
```

### 4.4 生图工作流（A 组真新设定时）

按 `docs/04b_VISUAL_STYLE_GUIDE.md` §5.6 分工：

```
你给主理人："请生这张图：
- 文件名：02-changan-某场景.png
- 对应 scene_id: foo / bar
- 剧情段：[中文场景描述]"

主理人自己跟 GPT Image 2.0 对话生图，给你文件名。

你接到"图好了"后：
1. 验证文件在 static/images/sanguo/<文件名>
2. 更新 SCENE_IMAGE_MAP.md 新增条目
3. 更新 chapter JSON 接图
4. 引导浏览器验证（用 dev_jump 跳到该 scene）
```

**你不写英文 prompt**。这是 v1.2 后的约定（[04b §5.6](04b_VISUAL_STYLE_GUIDE.md)）。

---

## 五、关键约束（绝对不能违反）

详见 `CLAUDE.md`，重申几条最易踩：

1. **公开课"礼法断案"完全隔离**——不动 `/classroom/*` / `static/classroom_admin.html` / `data/intrigue_scenes_law_classroom.json` / 任何带 `classroom`/`law_classroom`/`lawvisual` 的代码
2. **史实层面内容必须按 `docs/07_HISTORICAL_SOURCES.md` A 级查证**——但这通常是策划的事；你接 JSON 翻译时如果发现 md 里有可疑史实（如出现"桃园三结义"），停下来汇报主理人 + 策划
3. **不动 SCENE_IMAGE_MAP 真源** ≠ JSON 偏离 MAP 自由扩展（前会话踩过这坑，详见 v1.3 升级历史）
4. **不写英文生图 prompt**——只给文件名 + 剧情段中文描述
5. **MD 是真源、JSON 是派生**——改剧情先改 md 再同步 JSON；不能只改 JSON
6. **缓存版本号 bump**——CSS/JS 改了必 bump，否则浏览器拿旧版
7. **UI commit 必须真人浏览器验证**——CLAUDE.md 守则
8. **后端代码改动必重启 uvicorn**——前端代码不需要（缓存版本号触发刷新）
9. **never 用 PowerShell `Set-Content` 直接重写包含中文的前端文件**——会编码污染。改中文优先用 `Edit` 工具或 Python `[System.IO.File]::WriteAllText` 显式 UTF-8 no-BOM
10. **api.py 体积已大**——新模块按"入局/AI/checks"三块拆分（如 sanguo_ai.py / sanguo_checks.py），不要堆进 api.py
11. **never 跳过 hooks**（`--no-verify` 等）—— CLAUDE.md 明确
12. **commits 独立 + 描述详尽**——主理人喜欢按 logical concern 分独立 commit 便于回退（如"docs", "assets", "data 接入", "前端 UI" 分开）

---

## 六、常用命令速查

### 启动 / 重启 uvicorn

```bash
# 停旧的
powershell -NoProfile -Command "Get-Process python -ErrorAction SilentlyContinue | ForEach-Object { try { Stop-Process -Id \$_.Id -Force } catch {} }"
# 启新的（run_in_background: true）
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --log-level warning
```

### 健康检查（多 endpoint 批量）

```bash
for ep in "/" "/?x=lawvisual" "/events_list" "/story/list" "/story/sanguo/manifest" "/story/sanguo/chapter/00_prologue" "/story/sanguo/chapter/02_luoyang"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8000${ep}")
  echo "$code  $ep"
done
```

### Python smoke test（中文不乱码）

```bash
PYTHONIOENCODING=utf-8 python -c "
import urllib.request, json, sys
sys.stdout.reconfigure(encoding='utf-8')
# ... 测试代码
"
```

### LLM 调用 smoke test（dev_jump 直跳测）

```bash
# 1. 创建 session
# 2. dev_jump 到目标 scene
# 3. POST companion/talk_stream 或 historical/talk_stream
# 4. 解析 SSE 看回复内容 + violations
# 参考本会话 5.3 / 5.4 commit message 里贴的测试脚本
```

### commit 模板（HEREDOC + 中文，无 Co-Authored-By）

```bash
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
<type>: <短描述>

<详细 body：包括做了什么、为什么、影响范围、外延检查、主理人验证情况>
EOF
)"
```

不加 Co-Authored-By（项目历史 commit 都不加）。

---

## 七、第一句话模板

读完上述文档后，向主理人说类似：

> 我已读完 CLAUDE.md / PROGRESS.md / PHASE5_PLAN.md / PLANNER_BRIEF.md / data/stories/README.md / 04b §5 / 02_CHARACTERS §5.2.1-2 + 03_AI_SYSTEM §6.2.1 + sanguo_ai.py + sanguo_checks.py + api.py 的 /story/* 区域 + app.js sanguo 区域 + sanguo.css + 两章 md 范本。
>
> 我对项目当前状态的理解：[2-3 句]
>
> 当前工作树状态：[git status --short]
>
> 最近 commits：[git log --oneline -5]
>
> 我建议下一步可以做：
> - [选项 A，如"等策划写完某章 md 我接 JSON"]
> - [选项 B，如"先做阶段六 BGM"]
> - [选项 C，如"先 polish 现有章节小细节"]
>
> 你想从哪个开始？

**不要主动改任何文件。等主理人指令。**

---

## 八、对话风格

参考前会话总结的主理人偏好（也在 `auto memory` 的 feedback_working_style 里）：

- **给方案而不是给问题**：重要决策给 3-4 个选项 + 利弊
- **简洁但完整**：响应要短，但关键技术决策的依据要写清
- **外延检查**：完成 A 时主动告诉 B/C/D 是否受影响
- **遇到不确定立刻 grep/Read 查证**，不"假装思考"
- **commits 独立 + 描述详尽**
- **CSS/JS 改动必 bump cache version**
- **UI 改动必引导主理人浏览器验证后才 commit**
- 主理人非技术——技术解释用普通中文，不堆术语

---

## 九、把本会话的"教训"记下来

前会话踩过这些坑，你别再踩：

1. **scene 接图时不要"自作主张顺延"**——严格按 SCENE_IMAGE_MAP.md 单一真源；要扩展先改 MAP 再改 JSON
2. **AI 节点 lines 为空时（如 xunyu_limited_talk lines:[]）`startTypingCurrentLine` 会 early return → 不触发 `renderSanguoTalkActions`**——已修复（搜 `lines.length === 0 && (scene.type === 'companion_free_talk'`）
3. **`renderSanguoPanelShell` 必须初始化 `bgEl.dataset.currentUrl`**——否则下一个 scene advance 时 `isFirstRender` 误判 → bg 直接闪入不 fade
4. **sanguo_ai.py 不能在 module load time 读 env vars**——必须 lazy 读（在 `get_client()` 里），否则 dotenv 未加载就被冻结，导致 401
5. **api.py 中 `import sanguo_ai` 必须放在 `load_dotenv()` 之后**——同上原因
6. **CSS transition 和 JS swap setTimeout 必须时间匹配**——bg fade 改 transition 也要同步改 syncSanguoBackground 的 setTimeout
7. **session 字段扩展时记得加初始化**——`story_session_start` 里 default value（如 `historical_round_count: {}`）；旧 session 拿不到新字段，新建 session 才有
8. **fallback 不写入对话历史**——只成功 path 才 append 到 dialogue_history，避免污染上下文

---

## 十、最后

你看到这里。

现在你已经知道：

- ✅ 项目当前在哪、技术架构齐备到什么程度
- ✅ 你的角色（技术，不写剧本）
- ✅ 与策划 Claude 的协作工作流
- ✅ 主理人的偏好与硬约束
- ✅ 典型操作的命令速查
- ✅ 前会话踩过的坑

**告诉主理人你已读完简报 + 你对项目状态的理解 + 当前 git 工作树情况，问下一步要做什么。**

**不要主动改任何文件，等主理人指令。**
