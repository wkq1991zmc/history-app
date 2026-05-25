# 入局事件卡

`intrigue_scenes.json` 存放“入局”玩法的基础事件卡。新增事件时，可以复制一个事件对象并补齐字段；也可以新建 `intrigue_scenes_*.json` 批次文件。服务启动时会自动读取这些文件并校验格式和基本知识边界。

## 核心字段

- `scene_id`: 唯一英文 ID，用于测试下拉框和会话启动。
- `decision_maker`: 玩家扮演的最终决策者，必须也出现在 `roles` 中。
- `title`, `era`, `year`, `location`: 页面展示用的基础信息。
- `brief`: 右侧前情提要。
- `public_state`: 局中人当下公开知道的信息。
- `hidden_truth`: 历史真相或幕后情况，只给旁白推演使用，不应让 NPC 直接知道。
- `stakes`: 本局真正要权衡的风险。
- `proposal_stage`: 可选。比如 `未颁布`，用于避免 NPC 把方案说成已经发布。
- `npc_context`: 给 AI 的知识边界说明，明确“能知道什么、不能知道什么”。
- `forbidden_knowledge`: 禁止 NPC 直接说破的知识清单。
- `forbidden_patterns`: 用于修正 AI 越界发言的正则。
- `branch_axes`: 玩家决策可能落入的分支，每个分支需要 `key`, `label`, `keywords`, `plan`, `impact`。
- `historical_anchor`: 正史参考点。
- `orthodox_history`: 正史走向，用于结局对照。
- `roles`: 局中角色。玩家决策者也必须在这里。
- `openings`: 开场时由 AI 角色先发言，不能让玩家决策者预先发言。

## 新增事件注意

1. 玩家只扮演最终决策者。
2. `public_state` 和 `openings` 不能泄露 `forbidden_knowledge`。
3. 如果方案尚未发布，`npc_context` 要明确写“尚未颁布”或类似边界。
4. 每个事件至少准备 3 个角色、2 条开场发言、1 个分支轴。
