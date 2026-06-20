# 阶段五方案书 · AI 对话系统接入百炼

> 创建于 2026-06-21。本文档为阶段五（AI 对话系统）的设计圣经。
> 阶段五前的状态：阶段四 MVP 完成（commit `16a6880`），序章 + 第一站洛阳完整可玩通；
> 所有 AI 对话节点（companion_free_talk / historical_limited_talk）当前是 in-character 占位回复。
>
> 阶段五完成后：阿萤自由对话与荀彧 5 轮受限对话由百炼真实 LLM 驱动；
> 三道检查兜底；秘密在剧本指定章节才允许揭开。

---

## 一、阶段五范围

| 子任务 | 内容 | 预计 commit |
|---|---|---|
| **5.1** | schema 升级：`secrets_hint_allowed` / `secrets_reveal_allowed` 双字段；现有 2 章 companion_state_card 补字段；secret_id 权威清单写进 `02_CHARACTERS.md` | 1 |
| **5.2** | 后端：百炼 client 封装 + system prompt 构造器 + 三道检查（混合方案） | 2 |
| **5.3** | `/story/sanguo/companion/talk_stream` 实装：阿萤自由对话接百炼 | 1 |
| **5.4** | `/story/sanguo/historical/talk_stream` 实装：荀彧 5 轮硬限 + fallback | 1 |
| **5.5** | 前端：SSE delta 接 `typeStandaloneLine` 流式打字 + "言"按钮多轮对话 | 1 |
| **5.6** | 集成测试：序章篝火 / 洛阳客栈夜半 / 荀彧 5 轮对话三节点跑通 | 0（验证） |

**预计 6 commits / 半天到一天**。阶段五不做 BGM、不补 stub 章节、不做章节切换地图动画（这些是阶段六及之后）。

---

## 二、D1 拍板：`secrets_unlockable` schema 设计

### 2.1 schema 形状

```jsonc
{
  "companion_state_card": {
    ...
    "secrets_hint_allowed": ["secret_brother"],   // 可漏小钩子的 secret id 列表
    "secrets_reveal_allowed": []                  // 可完整揭开的 secret id 列表
  }
}
```

- `secrets_hint_allowed` —— 本节点 AI 可以"漏一点点"的秘密 id 列表（侧面描写、迟疑、半句话）
- `secrets_reveal_allowed` —— 本节点 AI 可以让阿萤**完整说出**的秘密 id 列表

两个字段都是 `string[]`，空数组 `[]` 表示"什么都不能漏 / 不能揭"。

### 2.2 秘密 id 权威清单

| id | 含义 | 锁定章节（reveal 允许） | 全程 hint 允许范围 |
|---|---|---|---|
| `secret_brother` | 弟弟死于她手——黄巾来袭，她为防孩子哭声暴露躲藏的人，亲手捂死了亲弟弟 | **第三站徐州 `04_xuzhou`** | 序章后所有 companion_free_talk |
| `secret_mirror` | 她在洛阳看见董卓时第一反应不是恨，是"原来这种人长这样"——她害怕自己有朝一日也会变成那种人 | **第五站河北 `06_hebei`** | 第一站洛阳之后所有 companion_free_talk |

源头：`docs/01_STORY_BIBLE.md` §4.3 + `docs/02_CHARACTERS.md` §5.2。

### 2.3 配置示例（按当前两章状态卡）

**序章篝火夜话** `00_prologue.json` → `campfire_free_talk`：
```jsonc
{
  "secrets_hint_allowed": ["secret_brother"],
  "secrets_reveal_allowed": []
}
```

**洛阳客栈夜半** `02_luoyang.json` → `ayinghuo_midnight_talk`：
```jsonc
{
  "secrets_hint_allowed": ["secret_brother", "secret_mirror"],
  "secrets_reveal_allowed": []
}
```

**第三站徐州（未来）** 阿萤崩溃节点：
```jsonc
{
  "secrets_hint_allowed": ["secret_brother"],
  "secrets_reveal_allowed": ["secret_brother"]   // 今晚可揭
}
```

### 2.4 schema 升级要做的事

1. 修改 `data/stories/README.md` schema 文档：
   - 删除当前 `secrets_unlockable: []` 字段定义
   - 新增 `secrets_hint_allowed` 与 `secrets_reveal_allowed` 字段定义
2. 修改两章 JSON 的所有 companion_free_talk 节点：
   - 序章 `campfire_free_talk`
   - 洛阳 `ayinghuo_midnight_talk`
3. 修改 `docs/02_CHARACTERS.md` §5.2，增加 "secret_id 权威清单" 小节，确立两个 id 的命名与锁定章节
4. 修改 `docs/03_AI_SYSTEM.md` §6.2，增加"秘密揭开机制"小节，说明 hint vs reveal 的实现细节

---

## 三、D2 拍板：三道检查实现路径（混合方案）

### 3.1 第一道防线：prompt 内置约束

在 system prompt 末尾追加硬约束段（自动从 knowledge_card 派生）：

```
你绝不可以：
- 提及以下人物 / 事件 / 时间点：{从 doesnt_know 提取的关键词列表}
- 使用预言性句式：将会 / 必将 / 注定 / 我看你 / 日后 / 终将
- 做违反人设的事：{will_never_do 列表}
- 漏出以下秘密（除非节点明确允许）：{secret_id → 内容映射}

你只能：
- 在你当下的认知范围内说话：{knows 列表}
- 按你的核心立场行事：{core_stance 列表}
- 漏出节点允许的秘密钩子：{secrets_hint_allowed → 允许的暗示语句}
- 完整说出节点允许揭开的秘密：{secrets_reveal_allowed → 允许的完整内容}
```

### 3.2 第二道防线：规则黑名单兜底

每次生成完整回复后（非流式中），按以下顺序扫描：

1. **关键词黑名单扫描**（动态从 `knowledge_card.doesnt_know` 提取）：
   - 人名（如 "曹操不久于人世"、"刘备"——若不在 knows 中）
   - 事件名（如 "官渡之战"、"赤壁"）
   - 年份（如 "建安五年"——若超过当前时间）
   - 命中 substring 即标记
2. **句式扫描**（regex）：
   - 预言性句式：`将会|必将|注定|日后|我看你|你他日|终将`
   - 命中即标记
3. **秘密泄露扫描**：
   - 对每个 secret_id，定义"完整揭开的关键 phrase 集"（如 secret_brother → "捂死了弟弟"、"亲手闷死"）
   - 命中 + secret_id 不在 `secrets_reveal_allowed` → 标记
4. **action**：
   - 任意标记 → 重试（最多 3 次）
   - 仍命中 → 随机选 `fallback_lines` 一句返回

### 3.3 不选其他方案的理由

- ❌ 纯 prompt 自我约束：qwen3.6-flash 是 fast 模型，自约束不可靠
- ❌ 后置 LLM 校验：双倍 token + 双倍时延，破坏阶段四已实现的"流式打字"沉浸感
- ❌ 纯规则黑名单：维护成本高，关键词漏判易（用比喻、旁敲侧击绕过）

混合是当前最佳——prompt 拦掉大多数 + 规则兜底剩余 + 0 额外 LLM 调用 + 流式不受影响。

### 3.4 升级路径

若发版后发现某些边缘情况（如荀彧用诗句隐喻预言未来）绕过两道防线，再追加第三道：**后置 LLM 校验**。先 ship 再迭代。

---

## 四、D3 拍板：BGM 延后到阶段六

阶段五不接 BGM。理由：
1. 阶段五范围已重，BGM 会分散注意力
2. BGM 关键路径是**资源采集**（找符合调性的曲子），不是技术
3. autoplay 需要首次用户交互处理 → UI 流程改动
4. BGM 不影响 AI 验证信号

阶段六（BGM 专项）范围：序章 + 洛阳各一首 + "乐"按钮启用 + 章节切换换曲 + autoplay 处理 + manifest/chapter JSON `background_music` 字段接入。

---

## 五、关键技术约定

### 5.1 接百炼

- 模型：`qwen3.6-flash`（已配置）
- 环境变量优先级：`WEB_API_KEY > DASHSCOPE_API_KEY > GEMINI_API_KEY`（沿用 history-app 现状）
- SSE 流格式：复用现有 `/classroom/talk_stream` 的 `message_start → delta → message_end → done` 格式（前端 `typeStandaloneLine` 已经能接）
- 参考实现：搜 `api.py` 中 `classroom/talk_stream` 函数

### 5.2 session 状态扩展

`story_sessions[session_id]` 当前字段（[api.py 中 `story_sessions`](api.py)）需新增：

```python
{
    ...
    "companion_dialogue_history": {     # 按 scene_id 维护对话历史
        "campfire_free_talk": [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": "..."}
        ]
    },
    "historical_dialogue_history": {    # 同上，按 scene_id
        "xunyu_limited_talk": [...]
    },
    "secrets_revealed": ["secret_brother"]  # 已揭开的秘密 id（影响后续节点 prompt 中的"已知信息"）
}
```

### 5.3 路径与文件

- 后端 LLM 工具函数：建议新建 `sanguo_ai.py`（不要堆进 `api.py`，CLAUDE.md 已警告 api.py 体积大）
- 三道检查模块：建议新建 `sanguo_checks.py`
- 前端流式渲染：复用阶段四的 `typeStandaloneLine`（详见 `static/js/app.js`，搜 `typeStandaloneLine`）

### 5.4 不破坏的边界

- 公开课 `/classroom/*` 接口 + `intrigue_scenes_law_classroom.json` 一行不动
- 阶段四已实现的 6 种 scene type 渲染逻辑不动
- `historical_distant_view` 节点不接 AI（远观无对话，保持纯叙事）
- 现有 fallback_lines 仍是兜底（不依赖 LLM 重试成功）

---

## 六、阶段五完成判定

以下三个场景在浏览器跑通即视为阶段五完成：

1. **序章篝火夜话**：玩家输入"你今天吃饱了吗？" → 阿萤回复符合人设（短、冷、警惕）；玩家输入"你怎么不睡？" → 阿萤可能漏出"我已经三天没合眼了"（hint allowed for secret_brother）；玩家追问"你弟弟呢？" → 阿萤回避或转移（reveal not allowed）
2. **洛阳客栈夜半**：玩家输入"白天那个董卓你怎么看？" → 阿萤回复带不安感；玩家追问"你怕他吗？" → 阿萤回避具体内容（secret_mirror reveal not allowed），但可能漏出"……我也说不上来"等暧昧
3. **荀彧 5 轮**：玩家问"曹操值得跟吗？" → 荀彧回避或答"未可知"（doesnt_know 包含未来诸侯命运）；玩家追问到 5 轮 → 自动结束并 advance 到 xunyu_farewell

---

## 七、阶段五开始前的 checklist

- [x] 阶段四 commit `16a6880` 之后工作树干净
- [x] D1 / D2 / D3 主理人拍板（2026-06-21）
- [x] 本方案书写定
- [ ] 5.1 schema 升级开始

主理人确认进入 5.1 后开干。

---

## 附录 A · 阶段五各 commit 预期主题（待 ship）

```
phase5-1: schema 升级（secrets_hint_allowed/reveal_allowed + secret_id 权威清单）
phase5-2a: 后端 sanguo_ai.py（百炼 client + system prompt 构造器）
phase5-2b: 后端 sanguo_checks.py（三道检查混合方案）
phase5-3: companion/talk_stream 接入百炼 + 阿萤状态卡
phase5-4: historical/talk_stream 接入百炼 + 荀彧知识卡 + 5 轮硬限
phase5-5: 前端 SSE delta 流式渲染 + 多轮对话 UI
```

每个 commit 完成后向主理人汇报，确认后再开下一个。
