# sanguo 图片剧情对应说明

这份说明给后续接手的 AI 或开发者使用：图片文件名已经尽量包含章节、地点和剧情动作。接入剧情时，请优先根据 `chapter_id` 和 `scene_id` 匹配，不要只按画面氛围随意替换。

> **本文档是图片-scene 映射的单一真源**。`data/stories/sanguo/chapters/*.json` 的 `background_image` 字段必须从本文档派生，不允许 JSON 偏离本文档自由扩展。新增/修改图片映射请遵循 `docs/04b_VISUAL_STYLE_GUIDE.md` §5 的工作流 SOP。

## 命名规则

- `00-prologue-*`：序章，涿郡到土地庙，主角与阿萤结伴之前。
- `02-luoyang-*`：第一站洛阳，对应 `chapter_id: 02_luoyang`。
- 文件名里的地点和动作是主要识别信息，例如 `inn-midnight-talk` 表示"客栈夜半对话"，`tongtuo-dongzhuo-carriage` 表示"铜驼街董卓车驾"。
- 历史 `.png.png` 双后缀图保留原名，新图按规范单 `.png`。

## 序章 00_prologue

### `00-prologue-zhuojun-road.png`

- 剧情场景：序章开场涿郡乡道 → 槐树下遇老妇人 → 主角递水 → 老妇人指引桃花林。
- 建议对应：`scene_id: lane`、`huai_tree`、`grandma_words`、`water_bag`
- 画面说明：中平元年三月，涿郡乡道，整体乱世开端第一印象。涵盖少年独行 + 槐树下遇老妇人抱襁褓的连续物理场景。
- 使用建议：序章前 4 个 scene 共用此图（lane + huai_tree + grandma_words + water_bag），作为本章节视觉调性的延续基准。
- **本图为当前视觉锚**（替代旧 `00-lane-v1.png`），详见 `docs/04b_VISUAL_STYLE_GUIDE.md` §一。

### `00-prologue-zhuoxian-market-recruit-notice.png`

- 剧情场景：涿县东市口集市，募兵告示前，主角被货郎拦路。
- 建议对应：`scene_id: zhuoxian_market`、`peddler`
- 画面说明：黄昏时分，集市冷清——烧饼摊只剩半个空架子，菜摊上堆着蔫掉的萝卜。墙根贴着募兵告示，朱砂印还湿。告示牌前不远处三个男人（赤面长须 + 豹头环眼 + 白脸长耳）挨着草鞋摊吃酒——但都是路人级远景，只能是模糊剪影，不要正面、不要让玩家一眼认出是谁。前景一个挑担货郎。
- 使用建议：适合涿县市口剧情段。**远景三人物绝不能成为画面焦点**——他们是"远观历史名人"原则的实践，玩家是路过的微尘，不是中心。

### `00-prologue-earth-temple-inside-empty.png`

- 剧情场景：少年钻进半塌的土地庙，发现冷灰里有未烧完的红薯皮——"有人来过。今天来过。"——颈后被柴刀抵住的瞬间（**阿萤未正面出场**，只是柴刀压在脖子上）。
- 建议对应：`scene_id: earth_temple_outside`
- 画面说明：日头渐沉，半塌屋顶 + 神像无脸 + 灰堆 + 红薯皮痕迹。**严格规定：本图不能露出阿萤的脸或身形**——阿萤要等到下一个 scene `ayinghuo_first_meet` 才正式出场。本图重点是"庙内荒寂 + 有人来过的痕迹 + 即将到来的危险预兆"。

### `00-prologue-earth-temple-aying-first-look.png.png`

- 剧情场景：阿萤正式出场（"你的米袋里有什么"）；阿萤认亲后的余韵；主角自取姓名一刻。
- 建议对应：`scene_id: ayinghuo_first_meet`、`recognize_kin`、`input_protagonist_name`
- 画面说明：这是玩家第一次看见阿萤。阿萤衣服破旧、警惕、有刀，但面部应保留少女感和吸引力，第一印象不能太像男孩。
- 使用建议：从 `ayinghuo_first_meet` 起阿萤正式视觉登场；阿萤认亲哭泣（同一土地庙，时间稍晚同一夜）以及主角自取姓名（仿古纸输入弹框 overlay）也共用此图，作为剧情余韵延续。

### `00-prologue-earth-temple-firelight-talk.png`

- 剧情场景：土地庙篝火夜话，阿萤说出自己的名字之后。
- 建议对应：`scene_id: campfire_free_talk`
- 画面说明：两人在破败土地庙里隔着小火堆坐下，背后有残破神像和塌掉的屋顶。气氛是刚从敌意转向短暂信任，不是温馨圆满。
- 使用建议：适合作为第一次"伴侣自由对话"的背景图。

### `00-prologue-morning-temple-officer-rescue.png`

- 剧情场景：序章结尾，清晨庙外，官差求救，黄巾兵追逼，主角面临 4 选项身份分支。
- 建议对应：`scene_id: morning_identity_choice`
- 画面说明：黎明微光，土地庙外路边草丛，受伤官差爬行（腿断），两个黄巾兵剪影提刀逼近；阿萤刚从庙里冲出来握柴刀；少年仍立在庙门口。天将亮，地平线一抹暖光初现。
- 使用建议：**全篇为数不多的暴力场景**，必须用远景剪影处理，绝不正面表现血腥。是身份分支决策前的氛围铺垫。

## 洛阳章 02_luoyang

### `02-luoyang-city-gate-arrival.png`

- 剧情场景：五年后主角和阿萤抵达洛阳城外、城门口被搜身收费、出示邺城旧文书放行。
- 建议对应：`scene_id: city_wall`、`city_gate`、`gate_captain`、`document_scene`
- 画面说明：两人站在洛阳城门前，看到高大城墙、排队入城的人群、士兵和市井杂乱。重点是"第一次进入大城"的震动感。
- 使用建议：洛阳章开场至放行整段共用此图——视觉风格规范要求 2.35:1 远景为主，校尉伸手讨钱、出示文书等近景特写不符合本项目风格，统一用同一张开阔城门外景配字幕处理。

### `02-luoyang-tongtuo-market-first-view.png`

- 剧情场景：铜驼街初见繁华。
- 建议对应：`scene_id: tongtuo_street`
- 画面说明：主角和阿萤走在洛阳主街，两侧店铺、绸缎、车马、人群都很密。阿萤第一次看见权贵城市的物资和秩序。
- 使用建议：适合放在董卓车驾出现前，突出"洛阳有很多东西吃，而他们一路都没有"。

### `02-luoyang-tongtuo-dongzhuo-carriage.png`

- 剧情场景：董卓车驾远观。
- 建议对应：`scene_id: dongzhuo_carriage`
- 画面说明：街上百姓退避或跪下，铁甲骑兵和宽大车驾经过，主角压着阿萤不要抬头。重点是"权力让整条街跪下"。
- 使用建议：这是董卓第一次进入玩家视野的图，适合配合历史人物远观节点（`historical_distant_view`，不开对话）。

### `02-luoyang-window-writing-notes.png`

- 剧情场景：夜里客栈，主角在窗边写笔记。
- 建议对应：`scene_id: inn_night`
- 画面说明：主角坐在窗边或桌边，借灯光写下今日所见；阿萤在床边或暗处看着他。重点是主角"记录乱世"的习惯。
- 使用建议：如果正式版非常介意画面中纸张伪文字，可以后续再换一张无可读文字版本。

### `02-luoyang-inn-midnight-talk.png`

- 剧情场景：洛阳客栈夜半，阿萤睡不着。
- 建议对应：`scene_id: ayinghuo_midnight_talk`
- 画面说明：廉价客栈夜里，阿萤从床上坐起，主角在桌边或窗边，烛光很低。重点是自由对话前的安静和不安。
- 使用建议：适合作为第二次"伴侣自由对话"的背景图。

### `02-luoyang-inn-knock-at-door-night.png`

- 剧情场景：天未明，客栈走廊砸门声惊醒主角与阿萤，店小二慌张报告"有人找您"。
- 建议对应：`scene_id: knock_at_door`
- 画面说明：木楼走廊空荡，地上一盏将熄的油灯，店小二剪影立在客房门外不敢动；走廊尽头小窗透出一点蓝灰色拂晓微光。整体光线极弱、氛围紧张。
- 使用建议：荀彧来访前的过场，营造"不速之客在等"的悬置感。

### `02-luoyang-inn-xunyu-morning-visit.png`

- 剧情场景：清晨客栈大堂，荀彧来访，主角下楼相见，受限对话。
- 建议对应：`scene_id: xunyu_appears`、`xunyu_limited_talk`
- 画面说明：主角下楼，看见一位穿青色文士袍的中年男子在客栈等他。人物气质要温和、有分量，不是武将压迫感。
- 使用建议：适合荀彧第一次正式登场和受限历史人物对话。

### `02-luoyang-xunyu-leaves-into-mist.png`

- 剧情场景：荀彧拱手告辞，走出客栈，背影消失在洛阳街道的浓厚晨雾里。
- 建议对应：`scene_id: xunyu_farewell`
- 画面说明：拂晓时分洛阳街道，浓雾，荀彧青色文士袍背影远去，客栈虚掩木门在画面边缘。天色刚开始亮，地平线一抹暖琥珀色。整体调性安静、苍茫。
- 使用建议：荀彧离场的视觉点睛，与 `inn-xunyu-morning-visit` 的"室内大堂"明确区分——这是"室外街道"远景。

### `02-luoyang-dawn-bell-decision.png`

- 剧情场景：章末抉择前的清晨钟声。
- 建议对应：`scene_id: back_upstairs`
- 画面说明：荀彧离开后，主角回到楼上，天色亮起，窗外传来宫城方向的早朝钟声。主角和阿萤即将决定是否离开洛阳。
- 使用建议：适合放在洛阳章关键选择前，承接"洛阳要塌了"的判断。

## 当前未配图的 scene（按设计有意留空）

下列 scene 按 `docs/04b_VISUAL_STYLE_GUIDE.md` §5.3 C 组规则不配独立背景图，运行时为黑底全屏字幕（VN 经典做法）：

| chapter | scene_id | 说明 |
|---|---|---|
| 00_prologue | `midway_subtitle` | 序章中段 5 句字幕浮现 |
| 00_prologue | `chapter_end` | 序章末 8 句章末字幕 + "进入下一章" 按钮 |
| 02_luoyang | `chapter_end` | 洛阳末 10 句章末字幕 + "进入下一章" 按钮 |

未来若做"章节切换地图过场动画"（阶段四 P2 延后项），可为 chapter_end 单独补图。

## 接入提醒

- 路径统一使用 `/static/images/sanguo/文件名`。
- 已经命名好的 `.png.png` 文件保留原名，避免破坏已有引用。
- 改 MAP 必须同时改 `data/stories/sanguo/chapters/*.json` 的 `background_image` 字段——两者保持一致。
- 单一真源原则：本文档是图片-scene 映射的唯一权威，JSON 必须从本文档派生。
