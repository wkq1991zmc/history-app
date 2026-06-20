# 三国篇 · 视觉风格规范

> 本文档基于 2026-06-19 主理人确认的"序章·乡道"视觉锚（GPT Image 2.0 黄昏版本）制定。
> 整部三国篇所有场景图必须遵守本规范，确保视觉统一。

---

## 一、视觉锚定（Visual Anchor）

**锚定图**：序章 · 画面 1 "乡道" · 黄昏版本

**画面特征**：
- 一棵歪脖子老桃树占据画面左侧，桃花稀疏点点
- 一条蜿蜒的烂泥土路从画面中央延伸至远方
- 路面有水洼，倒映天光
- 远方三根烟柱在天际线后方升起
- 一个孤独少年背影在路中央，比例极小
- 天空铁灰色，地平线泛黄昏暖橙
- 远山层次丰富，大气透视感强

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

每次生新场景图时：

1. **先确认是否符合本文档"绝不要"清单**——如果场景需要违反，先和策划 Claude 讨论
2. **按模板填入三段描述**，保持其余部分完全一致
3. **生成 3-4 张**，挑最接近视觉锚的一张
4. **常见问题**：
   - 人物太大 → 加 `extremely tiny figure in distance, less than 3% of frame`
   - 太亮太美 → 加 `bleak, somber, no romantic lighting, overcast`
   - 像油画/插画 → 加 `photorealistic, sharp detail, real photograph quality`
   - 缺少黄昏暖光 → 强调 `warm amber glow on horizon line`
   - 人物有脸 → 加 `back view only, face not visible, anonymous silhouette`

---

## 六、保存约定

- **原始大图**保存在 `static/images/sanguo/originals/`（不传 git，太大）
- **网页用图**压缩为 1920×800 WebP，保存在 `static/images/sanguo/`
- **每张图命名**：`{章节id}-{场景id}.webp`，如 `00-lane.webp`、`02-tongtuo-street.webp`

---

## 版本记录

- v1.0（2026-06-19）：主理人确认"序章·乡道·黄昏版"为视觉锚，本文档初版。
