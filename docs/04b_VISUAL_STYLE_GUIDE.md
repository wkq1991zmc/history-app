# 三国篇 · 视觉风格规范

> 本文档基于 2026-06-19 主理人确认的"序章·乡道"视觉锚（GPT Image 2.0 黄昏版本）制定。
> 整部三国篇所有场景图必须遵守本规范，确保视觉统一。

---

## 一、视觉锚定（Visual Anchor）

**锚定图**：`static/images/sanguo/00-prologue-zhuojun-road.png`（序章涿郡乡道·统一开场图，2026-06-21 升级，**替代旧 `00-lane-v1.png`**）

**画面特征**：
- 涿郡春日乡道（同时覆盖 lane / 槐树下系列 4 个 scene 的共用物理设定）
- 烂泥土路从画面延伸至远方，远方有烟柱
- 桃花稀疏点点 / 道旁可有歪脖子树
- 人物比例极小（剪影远景）
- 天空铁灰色，地平线泛黄昏暖橙
- 大气透视感强，景深层次清晰

---

## 二、核心调性

### 色调（不可更改）

| 元素 | 颜色 | 关键词 |
|---|---|---|
| 天空主色 | 铁灰带云层 | iron grey, heavy clouds |
| 地平线 | 黄昏暖橙 | warm amber dusk glow |
| 地面/泥土 | 暗褐 | dark earthen brown, muddy |
| 反光（水洼/路面） | 微弱金光 | faint golden reflection |
| 植物 | 暗褐+稀疏粉 | dark bark + sparse dusty pink |
| 人物 | 剪影/极暗 | silhouette, barely lit |

**绝不使用**：
- 鲜艳饱和色（红、绿、蓝、黄）
- 明亮高对比白色天空
- 高饱和度桃花粉（必须是 dusty pink，不是 fresh pink）
- 任何看起来"美观清新"的颜色组合

### 光线（不可更改）

- **始终是黄昏或阴天**——绝不画正午阳光
- 光源永远是**侧后逆光**——人物背朝光源，前方阴影
- 地平线必须有**一抹暖光**——这是希望感的来源，没有这一抹就太绝望

### 构图（不可更改）

- **2.35:1 超宽电影宽幅**——绝不用 1:1 方形或 4:3
- **人物极小**（占画面 3-5%）——绝不让人物占画面主体
- **大量留白**——天空通常占画面 60% 以上
- **低地平线**——地平线通常在画面 1/3 至 1/2 处
- **深景深**——前景、中景、远景层次清晰

### 风格（不可更改）

> "Cinematic photorealism with digital matte painting texture,
> inspired by Ghost of Tsushima landscape art and the film Long An Sanwan Li,
> with the contemplative stillness of Hou Hsiao-Hsien's The Assassin."

中文：电影级写实摄影 + 数字 matte painting 质感，参考《对马岛之魂》风景、电影《长安三万里》氛围、侯孝贤《刺客聂隐娘》静默构图。

**绝不要**：
- 动漫/二次元风格
- 国画水墨晕染（虽然中国主题，但我们要的是西方电影感的东方场景）
- 油画肌理过于明显
- 任何卡通化

---

## 三、不同场景的变体调整

虽然主调性不变，但不同场景需要微调环境元素。**风格 prompt 部分保持完全一致，只换前景描述**。

### 序章涿郡（黄巾起义春）
- 烂泥路 + 歪脖子桃树 + 远方烟柱
- 春天但寒冷，桃花稀疏

### 第一站洛阳（中平六年八月）
- 城墙巍峨阴森，街道有车驾痕迹
- 暮色更深，铜驼街灯笼微光
- 不要画华美宫殿，要画"将塌之城"

### 第二站长安（初平三年 + 李傕郭汜之乱）
- 饥荒废墟，残骸散落
- 烟柱更密集、更黑
- 天色铅灰，更绝望

### 第三站徐州（兴平元年屠城）
- 这一站是**情感最低点**
- 可以允许稍微更暗、更冷的调性
- 焦土遍野，但仍保留地平线一抹暖光（这是我们对玩家最后的温柔）

### 第四站许都（建安五年）
- 政治阴影，宫闱深处
- 可加入夜景，灯笼远光
- 紧绷但表面平静

### 第五站河北（官渡之战前后）
- 大战将至的压抑
- 旌旗远影，但仍是远观，不要正面战场

### 终章荆州/赤壁（建安十二至十三年）
- 江景出现，水的元素加入
- 黄昏更浓烈，色彩更饱满（这是史诗终章）
- 但仍然不要"美化"——长坂的尘土、赤壁的火光，都要苍凉

---

## 四、标准生图 prompt 模板

**所有场景图生成时，使用以下结构**。只替换 `{{前景描述}}`、`{{中景描述}}`、`{{远景描述}}` 三个部分。

### 英文模板（GPT Image 2.0 推荐）

```
A wide cinematic landscape shot, Eastern Han Dynasty late period (around {{年份}} AD)
in {{地点 location}}. {{前景描述：人物、植物、地面状态}}.
{{中景描述：道路、建筑物、河流等}}. {{远景描述：山、烟柱、城郭等}}.
The sky is heavy iron grey with a subtle warm amber glow on the horizon, dusk light.
{{人物描述（如有）}}: solitary figure viewed from behind, extremely small in frame
(less than 5% of image), wearing tattered coarse hemp clothes.

Color palette: deep blacks, oil-lamp amber, dim ember red, muddy earth brown,
faint dusty pink. No bright colors, no romantic lighting.

Style: cinematic photorealism with the texture of digital matte painting,
inspired by Ghost of Tsushima landscape art and the film Long An Sanwan Li,
with the contemplative stillness of Hou Hsiao-Hsien's The Assassin.

Composition: ultra-wide 2.35:1 cinemascope aspect ratio, low horizon line,
massive negative space, deep atmospheric perspective.
No text, no logos, no subtitles, no watermark, no people facing camera.
```

### 中文模板（备用）

```
电影感超宽幅风景画面，公元 {{年份}} 年东汉末年中国 {{地点}}。
{{前景描述}}。{{中景描述}}。{{远景描述}}。
天空厚重的铁灰色，地平线泛出一抹微弱的暖琥珀色，傍晚的光线。
{{人物描述（如有）}}：背影视角，在画面中非常渺小（占比少于 5%），
身着褴褛粗麻布衣。

色调：深黑、煤油灯琥珀、暗烬红、泥土棕、桃花瓣微弱粉。
没有鲜艳色彩，没有浪漫光线。

风格：电影级写实摄影，带有数字 matte painting 的质感，
参考《对马岛之魂》风景画、电影《长安三万里》的氛围、
侯孝贤《刺客聂隐娘》的静默构图。

构图：2.35:1 超宽电影宽幅比例，低地平线，大量留白，深远的大气透视感。
无文字，无水印，无字幕，无正面人物。
```

---

## 五、生图工作流

### 5.1 单张图生图操作（每张图层面）

1. **先确认是否符合本文档"绝不要"清单**——如果场景需要违反，先和策划 Claude 讨论
2. **按模板填入三段描述**（前景/中景/远景），保持其余部分完全一致
3. **生成 3-4 张**，挑最接近视觉锚（`00-lane-v1.png`）的一张
4. **常见问题速查**：
   - 人物太大 → 加 `extremely tiny figure in distance, less than 3% of frame`
   - 太亮太美 → 加 `bleak, somber, no romantic lighting, overcast`
   - 像油画/插画 → 加 `photorealistic, sharp detail, real photograph quality`
   - 缺少黄昏暖光 → 强调 `warm amber glow on horizon line`
   - 人物有脸 → 加 `back view only, face not visible, anonymous silhouette`

### 5.2 章节级生图 SOP（每章一轮）

每写完一章 `docs/chapters/XX.md` → 翻译为 `data/stories/sanguo/chapters/XX.json` 后，按以下流程批量补图。**单一真源是 `SCENE_IMAGE_MAP.md`，JSON 的 `background_image` 永远从 MAP 派生。**

```
策划写完一章 docs/chapters/XX.md
        ↓
Claude Code 翻译为 JSON（含 6 种 scene type）
        ↓
Claude Code 扫 scene list 按规则分类 A/B/C
        ↓
┌───────────────┬───────────────┬───────────────┐
│  A 真新设定   │  B 同场景延伸 │  C 字幕/overlay│
│  → 新图       │  → 扩 MAP     │  → 黑底/复用   │
└───────────────┴───────────────┴───────────────┘
        ↓                ↓                ↓
Claude 给文件名 +    Claude 直接在     字幕场景留空；
该图对应的剧情段     SCENE_IMAGE_MAP   输入框 overlay
描述（中文，         新增 scene_id     扩 MAP 复用前
不写 prompt）        到旧图条目下       一 scene 图
        ↓
主理人按剧情描述自行与 GPT Image 2.0 对话生图
（可参考 §四英文模板 + §5.1 调优 tips）
→ 选最像视觉锚那张 → 存到 static/images/sanguo/
        ↓
Claude Code 更新 SCENE_IMAGE_MAP.md + 同步两章 chapter JSON
        ↓
主理人浏览器逐 scene 审核
        ↓
commit（一章一图 commit 独立提交便于回退）
```

### 5.3 分类规则（A/B/C）

| 组 | 判定 | 处理 |
|---|---|---|
| **A** | 真·新物理设定（地点 / 时间段 / 关键视觉元素与现有图都不同） | **生新图**。Claude Code 给文件名 + 完整 prompt |
| **B** | 与某张已有图同物理场景（同一城门 / 同一客栈大堂 / 同一土地庙夜），剧情张力差异不足以撑独立画面 | **扩 SCENE_IMAGE_MAP**：把新 scene_id 加到旧图的"建议对应"列表 |
| **C** | 全屏字幕（章末/章中过场）/ 输入弹框 overlay | 字幕场景留空（黑底大字 = VN 标准）；输入弹框扩 MAP 复用前 scene 图 |

**判定边界拿不准时的默认**：按 B 处理（扩 MAP 复用）。理由：04b §二 风格规范要求人物极小、远景为主，特写本身违反风格；除非场景的地理 / 时间 / 关键道具与已有图明确不同，否则不生新图。

### 5.4 文件命名规则

```
{章节id}-{地点}-{动作/状态描述}.png
```

- 章节 id 用两位数前缀：`00-prologue-` / `02-luoyang-` / `03-changan-` ...
- 地点 / 状态用英文连字符短语，**4-6 词以内**
- 例：
  - ✅ `00-prologue-zhuoxian-market-recruit-notice.png`
  - ✅ `02-luoyang-xunyu-leaves-into-mist.png`
  - ❌ `aying_crying_scene.png`（缺章节前缀、缺地点、用下划线）
  - ❌ `02-luoyang-very-emotional-moment-of-the-protagonist.png`（描述太长太抽象）

**双 `.png.png` 后缀的历史图保留原名**（生成时工具自动加后缀，保留以避免破坏 git 历史），新图按规范单 `.png`。

### 5.5 SCENE_IMAGE_MAP.md 同步要求（不可省）

每次 A 组新图加入 + B 组扩 MAP，**必须立刻同步 `SCENE_IMAGE_MAP.md`**。MAP 是单一真源：
- 新增 A 组图 → MAP 加一个 `### 文件名.png` 条目（含剧情场景 / 建议对应 scene_id 列表 / 画面说明 / 使用建议四节）
- B 组扩展 → 在旧图的"建议对应"列表里加新 scene_id
- 同时更新 chapter JSON 的 `background_image` 字段

**禁止只改 JSON 不改 MAP**——会导致后续接手 AI 不知道为什么这个 scene 是这张图，无法判断能否复用。

### 5.6 主理人 / Claude Code 分工

| 谁 | 做什么 |
|---|---|
| **主理人** | 收 Claude 给的"图清单（文件名 + 该图对应的剧情段中文描述）" → 自行与 GPT Image 2.0 对话生图 → 挑图 → 存盘 → 浏览器审核 |
| **Claude Code** | A/B/C 分类 + 给文件名 + 给剧情段描述（中文）+ 更新 MAP + 更新 JSON + commit |

主理人**不需要**自己分类 scene、不需要手动改 MAP/JSON。**只做两件事：按 Claude 给的剧情描述去生图 + 浏览器审核。**

**Claude Code 不写英文 prompt**——主理人会自己跟 GPT 对话决定如何把剧情翻译成图像参数（§四英文模板和 §5.1 常见问题速查可参考但不强制）。这样未来扩展朝代/调性时，提示词的灵活性留给主理人 + GPT，Claude Code 只负责把握"哪段剧情需要图、对应什么 scene、文件名怎么命名"。

---

## 六、保存约定

- **原始大图**保存在 `static/images/sanguo/originals/`（不传 git，太大）
- **网页用图**压缩为 1920×800 WebP，保存在 `static/images/sanguo/`
- **每张图命名**：`{章节id}-{场景id}.webp`，如 `00-lane.webp`、`02-tongtuo-street.webp`

---

## 版本记录

- v1.0（2026-06-19）：主理人确认"序章·乡道·黄昏版"为视觉锚，本文档初版。
- v1.1（2026-06-20）：§5 扩展为完整章节级生图 SOP（A/B/C 分类规则 + 文件命名规则 + SCENE_IMAGE_MAP 同步要求 + 主理人/Claude Code 分工）。配套首次按此 SOP 处理的两章是 00_prologue 与 02_luoyang。
- v1.2（2026-06-20）：调整 §5.2 + §5.6 分工——Claude Code 只给"文件名 + 剧情段中文描述"，**不写英文 prompt**。提示词由主理人与 GPT 对话决定，§四英文模板降级为可选参考。理由：未来扩展朝代/调性时，提示词灵活性留给主理人 + GPT。
- v1.3（2026-06-21）：视觉锚由 `00-lane-v1.png` 升级为 `00-prologue-zhuojun-road.png`（序章前 4 个 scene 共用统一开场图）。旧 lane-v1 与 huai-tree-water-swaddle 不再被引用（文件保留在 static/images/sanguo/ 作为历史素材）。同时新增 `00-prologue-earth-temple-inside-empty.png` 修正"阿萤未出场而误用 first-look 图"的偏差。
