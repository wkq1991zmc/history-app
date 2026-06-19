# UI 参考代码片段（阶段四用）

> 本文档由阶段二删除"驿路无名"前从 `static/js/historical_rpg_demo.js` 和 `static/css/historical-rpg-demo.css` 抄出。
> 用于阶段四从零做三国篇 UI 时，作字幕呈现 + 流式渲染的实现参考。
>
> ⚠️ **不直接复用**——只作参考。"驿路无名" UI 哲学与三国篇略有不同（驿路无名是带顶栏+立绘的悬疑剧风，三国篇是纯字幕+背景画面的电影质感）；具体配色、字体、动画都按 [`04_UI_SPEC.md`](04_UI_SPEC.md) 重做。
>
> 抄录时间：2026-06-19
> 抄录的原始 git 状态：commit `e9dbfdd`（删除前最后状态，可 `git show e9dbfdd:static/js/historical_rpg_demo.js` 取回完整版本）

---

## 这份参考解决了什么？

`04_UI_SPEC.md` §7.2 描述了三国篇的字幕呈现：
- **无对话框边框**——文字直接浮在画面上
- **左对齐**——流式输出从固定左侧起笔，不是居中扩散
- **背景画面下加暗化叠层**保证可读性
- **流式打字效果**——一个字一个字浮现

"驿路无名"已经实现了这套字幕方案。阶段四需要的不是"字幕方案怎么设计"（设计已在 04_UI_SPEC.md），而是"字幕方案怎么落地"——下面这两段代码就是落地的最小骨架。

---

## 一、字幕样式（CSS）

### 1.1 容器布局（贴底部 + 左右留白）

```css
.story-dialogue-layer {
    position: absolute;
    z-index: 10;
    inset: 0;
    display: grid;
    align-items: end;              /* 关键：贴底 */
    justify-items: center;
    padding: 0 clamp(1.75rem, 7vw, 8.75rem) clamp(5.2rem, 12vh, 8.2rem);
    pointer-events: none;          /* 让点击穿透到背景 */
}
```

### 1.2 对话框（**没有对话框**——透明背景 + 0 边框 + 0 阴影）

这是 04_UI_SPEC.md §7.2 "没有对话框边框"的关键实现：

```css
.story-dialogue-box {
    position: relative;
    display: grid;
    justify-items: center;
    width: min(52rem, calc(100vw - 10rem));
    min-height: 0;
    padding: 0;
    border: 0;                     /* 关键 */
    border-radius: 0;
    background: transparent;       /* 关键 */
    box-shadow: none;              /* 关键 */
    backdrop-filter: none;         /* 关键，避免毛玻璃 */
    text-align: left;              /* 关键：左对齐，不要 center */
    pointer-events: auto;
}

.story-dialogue-box::before {
    display: none;                 /* 关闭任何继承的伪元素背景 */
}
```

> **注**：背景画面的暗化是通过单独的 `<div class="story-demo-shade">` 实现的（全屏渐变叠层），不是给对话框本身加底色。这是三国篇也应该沿用的方式。

### 1.3 角色名（极轻提示，不是名字框）

04_UI_SPEC.md §7.2 说"角色对白前置 '—— ' 破折号代替名字框"——"驿路无名"用的是单独的轻量 label，三国篇可以选其一。下面是"驿路无名"的做法供参考：

```css
.story-speaker {
    display: inline-flex;
    gap: 0.55rem;
    align-items: baseline;
    justify-content: center;
    margin-bottom: 0.32rem;
    padding: 0;
    border: 0;
    background: transparent;
    /* 关键：多层阴影保证在画面任何颜色上都可读 */
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.92), 0 0 16px rgba(0, 0, 0, 0.88);
}

.story-speaker b {
    color: #f4dcae;                /* 暖白；三国篇用 #d4a557 / #e8b865 煤油灯橙黄 */
    font-family: 'Noto Serif SC', serif;
    font-size: clamp(0.95rem, 1.2vw, 1.16rem);
    font-weight: 900;
}
```

### 1.4 正文文字（响应式字号 + 多层阴影）

```css
.story-dialogue-box p {
    width: min(52rem, 100%);
    max-width: min(52rem, 100%);
    margin: 0;
    color: rgba(255, 251, 240, 0.97);    /* 三国篇换成 #f0e8d8 浅暖白 */
    font-family: 'Noto Serif SC', serif;  /* 三国篇可换楷书/仿宋 */
    font-size: clamp(1.15rem, 1.55vw, 1.55rem);
    font-weight: 600;
    line-height: 1.72;
    text-wrap: pretty;
    /* 关键：三层阴影组合，保证在任何背景图上可读 */
    text-shadow:
        0 2px 8px rgba(0, 0, 0, 0.95),
        0 0 2px rgba(0, 0, 0, 0.96),
        0 0 18px rgba(0, 0, 0, 0.84);
}
```

### 1.5 打字光标（流式时显示，结束后消失）

```css
.story-dialogue-box.is-typing p::after {
    content: "";
    display: inline-block;
    width: 0.08em;
    height: 1em;
    margin-left: 0.18em;
    background: rgba(244, 220, 174, 0.88);
    vertical-align: -0.08em;
    animation: story-caret 0.72s steps(1) infinite;
}

@keyframes story-caret {
    50% { opacity: 0; }
}
```

### 1.6 "继续"按钮（弱化为小型透明文本）

```css
.story-continue-btn {
    position: relative;
    justify-self: center;
    margin-top: 0.45rem;
    min-width: 4.6rem;
    padding: 0.3rem 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: rgba(244, 220, 174, 0.76);    /* 比正文暗一些 */
    font-family: 'Noto Serif SC', serif;
    font-size: 0.72rem;                  /* 比正文小一倍多 */
    font-weight: 800;
    letter-spacing: 0;
}
```

---

## 二、流式渲染逻辑（JS）

### 2.1 HTML 结构（renderDialogue 输出的最小结构）

```html
<section class="story-demo-stage is-dialogue" style="--story-bg: url('背景图URL')">
    <div class="story-demo-bg"></div>
    <div class="story-demo-shade"></div>
    <!-- 顶栏（站名/卷/言/乐/声）插在这里 -->
    <!-- 角色立绘（如果有）插在这里 -->
    <div class="story-dialogue-layer">
        <div class="story-dialogue-box has-speaker">
            <!-- 旁白时不显示 .story-speaker；这里是角色对白 -->
            <div class="story-speaker"><b>角色名</b><span>角色头衔</span></div>
            <p data-story-dialogue-text aria-live="polite">完整文本</p>
            <button type="button" class="story-continue-btn"
                    data-story-action="continue" aria-label="继续对话">显示全文</button>
        </div>
    </div>
</section>
```

关键点：
- `.story-dialogue-box` 上的 `is-typing` class 控制光标显示
- `[data-story-dialogue-text]` 元素的 `textContent` 由 JS 逐帧改写
- 流式期间"继续"按钮文字是"显示全文"（点击即跳到全文）；流式结束后变成"继续"或"进入下一步"

### 2.2 流式字符渲染核心逻辑

```javascript
// 状态：state.typing (bool), state.dialogue (line[]), state.dialogueIndex (int)
let typingToken = 0;        // 用于取消旧的 setTimeout 链
let typingTimer = null;

function clearTyping() {
    typingToken += 1;       // 旧 step() 检测到 token 不匹配会自行退出
    if (typingTimer) window.clearTimeout(typingTimer);
    typingTimer = null;
    state.typing = false;
}

function finishTyping() {
    // 玩家点"显示全文"时一次性显示完整文本
    if (!state.typing) return false;
    clearTyping();
    const line = state.dialogue[state.dialogueIndex] || {};
    const textElement = panel.querySelector("[data-story-dialogue-text]");
    if (textElement) textElement.textContent = String(line.text || "");
    const continueButton = panel.querySelector("[data-story-action='continue']");
    const dialogueBox = panel.querySelector(".story-dialogue-box");
    dialogueBox?.classList.remove("is-typing");
    if (continueButton) {
        continueButton.textContent =
            state.dialogueIndex < state.dialogue.length - 1 ? "继续" : "进入下一步";
        continueButton.classList.remove("is-typing");
    }
    return true;
}

function startTypingCurrentLine() {
    clearTyping();
    const line = state.dialogue[state.dialogueIndex] || {};
    const content = String(line.text || "");
    const textElement = panel.querySelector("[data-story-dialogue-text]");
    const continueButton = panel.querySelector("[data-story-action='continue']");
    const dialogueBox = panel.querySelector(".story-dialogue-box");
    if (!textElement) return;

    textElement.textContent = "";
    state.typing = true;
    dialogueBox?.classList.add("is-typing");
    continueButton?.classList.add("is-typing");
    if (continueButton) continueButton.textContent = "显示全文";

    const token = typingToken;
    let index = 0;

    const step = () => {
        if (token !== typingToken) return;     // 已被 clearTyping 取消
        index += 1;
        textElement.textContent = content.slice(0, index);
        if (index < content.length) {
            // 关键：标点处自然停顿，节奏感的来源
            const punctuationPause =
                /[。！？；…]/.test(content[index - 1] || "") ? 95 : 0;
            typingTimer = window.setTimeout(step, 28 + punctuationPause);
            return;
        }
        // 流式结束
        typingTimer = null;
        state.typing = false;
        dialogueBox?.classList.remove("is-typing");
        continueButton?.classList.remove("is-typing");
        if (continueButton) {
            continueButton.textContent =
                state.dialogueIndex < state.dialogue.length - 1 ? "继续" : "进入下一步";
        }
    };

    if (!content) {
        finishTyping();
        return;
    }
    typingTimer = window.setTimeout(step, 80);  // 首字延迟 80ms，让上一句的余韵保留
}
```

### 2.3 关键参数（节奏调校的可调点）

| 参数 | 值 | 作用 |
|---|---|---|
| 首字延迟 | 80ms | 给上一句的视觉余韵留时间 |
| 字符间隔 | 28ms | 默认每字 28ms = 约 36 字/秒 |
| 标点停顿 | +95ms | `。！？；…` 后停顿 123ms，制造语气 |
| 光标闪烁 | 0.72s | 流式期间的小竖线节奏 |

三国篇可以根据"是枝裕和电影 + 古籍"哲学放慢节奏（如字符间隔改 35-45ms，标点停顿改 +150ms）。

### 2.4 推进 / 跳过的事件处理（按"继续"或空格/回车）

```javascript
// 用户按空格/回车或点"继续"时调用：
function advance() {
    if (state.typing) {
        // 流式中：跳到全文，不推进
        finishTyping();
        return;
    }
    if (state.dialogueIndex < state.dialogue.length - 1) {
        state.dialogueIndex += 1;
        startTypingCurrentLine();
    } else {
        // 进入下一场景/选择/章节
        proceedToNextStep();
    }
}
```

---

## 三、三国篇实施的差异点（不要直接复用！）

| 项 | "驿路无名" | 三国篇（04_UI_SPEC.md） |
|---|---|---|
| 文字配色 | 暖白 `rgba(255,251,240,0.97)` | 浅暖白 `#f0e8d8`（旁白）+ `#e8d5b0`（阿萤话，略暖）+ `#9a9a8a`（主角心声，浅灰斜体） |
| 角色名标识 | `.story-speaker` 单独 label | 前置"—— "破折号 |
| 字体 | 'Noto Serif SC' 单一 | 标题书法 / 正文宋体 / 心声纤细楷书 三层 |
| 立绘 | 角色抠图（左/右贴边） | **不要立绘**——只有背景画面 |
| 顶栏 | 站名+章节+操作按钮 | 站名 + 古风时辰 + 卷/言/乐/声四图标 |
| 流式节奏 | 28ms/字 + 95ms 标点停顿 | 可放慢，等阶段四试玩调校 |

---

## 四、推荐的最小可工作骨架

阶段四从零起步时，可以先复制 §1.2 + §1.4 + §2.2 + §2.4 这四段，跑通"一句话流式显示 + 空格推进"，再逐步加：
1. 背景图 + 暗化叠层（`.story-demo-shade` 的设计）
2. 顶栏（卷/言/乐/声）
3. 选项（印章式，参考 04_UI_SPEC.md §7.3——这部分驿路无名没做，要自己设计）
4. 笔记本（参考 04_UI_SPEC.md §7.6——驿路无名也没做）
5. 章节切换地图过场（参考 04_UI_SPEC.md §7.7）

## 五、何时回到 git 取完整版

如果上面的代码片段不够，可以从 `e9dbfdd` 提交取回完整文件：

```bash
git show e9dbfdd:static/js/historical_rpg_demo.js > /tmp/historical_rpg_demo.js.ref
git show e9dbfdd:static/css/historical-rpg-demo.css > /tmp/historical-rpg-demo.css.ref
```

但**不要把它们 commit 回项目**——它们带着"驿路无名"的所有耦合（人物、地名、剧情常量、配音映射、地图地点等），那是按部就班该抛弃的部分。
