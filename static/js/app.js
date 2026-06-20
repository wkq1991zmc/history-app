const DEFAULT_EVENT_ID = "\u79e6\u671d\u00b7\u4e00\u7edf\u516d\u56fd";
const AUTH_REMEMBER_KEY = "historyAppRememberLogin";
const AUTH_TOKEN_KEY = "historyAppAuthToken";
const AUTH_SESSION_TOKEN_KEY = "historyAppSessionAuthToken";
const GUEST_CHAT_LIMIT = 1;
const GUEST_CHAT_COUNT_KEY = "historyAppGuestChatCount";
const PRIVATE_TIME_TRAVEL_HASH = "time-travel-dev";
const LAW_CLASSROOM_DEMO_PARAM = "lawvisual";
const VISUAL_NOVEL_SCENE_ID = "three_kingdoms_chibi_council";
const VISUAL_AVATAR_CLASS = {
    "孙权": "avatar-sunquan",
    "周瑜": "avatar-zhouyu",
    "鲁肃": "avatar-lusu",
    "张昭": "avatar-zhangzhao",
    "案吏": "avatar-clerk",
    "董仲舒": "avatar-scholar",
    "律令官": "avatar-official",
    "廷尉属官": "avatar-official",
    "刑部属官": "avatar-official",
    "法司官": "avatar-official",
    "儒生": "avatar-lusu",
    "乡里代表": "avatar-zhangzhao",
    "刑部主审官": "avatar-official",
    "甲": "avatar-jia",
    "张三": "avatar-zhangsan",
    "礼官": "avatar-ritual-official",
    "被害者家属": "avatar-victim-family",
    "陈子昂": "avatar-chenziang",
    "徐元庆": "avatar-xuyuanqing",
    "晋律议案官": "avatar-official",
    "晋律官": "avatar-official",
    "礼学博士": "avatar-ritual-official",
    "族中长者": "avatar-zhangzhao",
    "李侄": "avatar-jia",
    "唐律主审官": "avatar-official",
    "律学博士": "avatar-ritual-official",
    "邻人": "avatar-victim-family",
    "里正": "avatar-zhangzhao",
    "张某": "avatar-zhangsan",
    "你": "avatar-sunquan"
};
const CLASSROOM_GLOSSARY = {
    "廷尉府": {
        subtitle: "汉代中央司法机构",
        body: "廷尉是秦汉时期掌管刑狱的中央官署之一，位列九卿，负责审理重大案件、复核疑难刑狱，并维护中央司法秩序。秦称廷尉，汉承秦制，后世司法机构虽名称多有变化，但廷尉常被视为古代中央司法官署的重要源流。"
    },
    "廷尉属官": {
        subtitle: "廷尉府中的司法官员",
        body: "属官是官署中协助长官处理事务的官员。廷尉属官参与刑狱文书、案情核验、法条适用等具体事务，是中央司法体系中负责执行和解释法律程序的重要基层官员。"
    },
    "律令": {
        subtitle: "古代成文法令",
        body: "律主要指较稳定的刑法条文，令多指皇帝或国家发布的行政命令、制度规定。秦汉以后，律令逐渐成为国家治理的重要工具，体现出中央政权以成文规则管理官民、维系统一秩序的努力。"
    },
    "人伦": {
        subtitle: "人与人之间的伦理关系",
        body: "人伦指人与人之间按身份和亲疏形成的伦理关系，如父子、君臣、夫妇、长幼、朋友等。儒家思想尤其重视人伦秩序，认为社会治理不能脱离这些关系中的责任、名分与情义。"
    },
    "名分": {
        subtitle: "身份关系与伦理位置",
        body: "名分指人在家庭、政治和社会秩序中的身份位置及其相应责任，如君臣、父子、长幼等。儒家强调“正名”，认为名分清楚，行为准则和社会秩序才有稳定依据。"
    },
    "本心": {
        subtitle: "行为背后的真实动机",
        body: "本心指行为人内在的真实动机和主观意图。在儒家化的司法观念中，判断一个行为的轻重，有时不仅看外在结果，也会追问行为背后的用心、情理与伦理关系。"
    },
    "律令官": {
        subtitle: "概括性的司法角色称呼",
        body: "“律令官”可以概括熟悉律令、负责解释和适用成文法的司法官员，但它并不是汉唐时期长期通用的固定官名。不同朝代承担类似职责的官员名称各不相同，如汉代廷尉属官、唐代刑部与大理寺官员等。"
    },
    "刑部属官": {
        subtitle: "唐代刑部中的司法官员",
        body: "刑部属官是对唐代刑部中协助处理刑狱、复核与律令事务官员的概括称呼。唐代刑部负责司法行政和案件复核，并与大理寺、御史台等机构共同参与重大案件处理；刑部内部的具体官名与职责仍有进一步区分。"
    },
    "法司官": {
        subtitle: "朝廷司法官员的概括称呼",
        body: "法司是对掌管刑狱、审判与司法复核机构的概括称呼，法司官泛指其中负责司法事务的官员。它并非某一固定品级的正式官名，但适合概括史料未明确记载姓名和具体官职的朝廷司法参与者。"
    },
    "儒生": {
        subtitle: "以经义和伦理解释政治法律的人",
        body: "儒生是研习儒家经典、以经义解释政治伦理和社会秩序的士人。汉代以后，儒学地位上升，儒生逐渐参与国家治理、法律解释和礼教传播，对中国古代政治法律文化产生深远影响。"
    },
    "董仲舒": {
        subtitle: "西汉儒学代表人物",
        body: "董仲舒是西汉重要儒者，生活于汉武帝时期，主张以儒家思想整合政治秩序。他强调天人关系、君臣伦理和教化作用，其思想常被视为汉代儒学官方化的重要标志之一。"
    },
    "春秋决狱": {
        subtitle: "以儒家经义解释疑难案件",
        body: "春秋决狱通常指汉代以后在疑难案件中援引《春秋》等儒家经典的义理来判断是非轻重。它重视行为人的名分、动机和伦理关系，是法律儒家化早期发展的典型现象。"
    },
    "引经决狱": {
        subtitle: "援引经典精神裁断案件",
        body: "引经决狱是指司法裁断时援引儒家经典义理解释案件，尤其用于成文法难以直接覆盖的疑难情形。它反映出汉代以后经学、礼教与法律实践逐渐结合的趋势。"
    },
    "原心定罪": {
        subtitle: "考察行为人的动机与本心",
        body: "原心定罪强调在判断罪责时考察行为人的主观动机和内在用心。它常与儒家经义影响下的司法观念相联系，认为同样的外在行为，若动机不同，法律评价也可能有所差异。"
    },
    "父子相隐": {
        subtitle: "亲属之间相互隐匿的伦理观念",
        body: "父子相隐源于儒家重视亲亲之情的伦理传统，认为父子等至亲之间存在不同于普通社会关系的情义责任。它在古代法律中逐渐被制度化，但通常会受到罪名轻重和国家安全等边界限制。"
    },
    "亲亲相隐": {
        subtitle: "亲属伦理进入法律判断",
        body: "亲亲相隐指亲属之间因亲情伦理而相互隐匿、庇护时，法律评价会有所区别。它源于儒家亲亲观念，后来进入法律制度，体现出古代法律对家庭伦理关系的吸收与限制。"
    },
    "礼法相融": {
        subtitle: "伦理教化与法律治理的结合",
        body: "礼法相融指礼教伦理与法律制度相互吸收、彼此配合的治理形态。中国古代法律并非只依靠刑罚，也常把孝道、名分、宗族秩序等礼的内容纳入法的规范之中。"
    },
    "礼法结合": {
        subtitle: "古代法律儒家化的重要特征",
        body: "礼法结合指法律制度吸收儒家礼教原则，使刑罚规范与伦理秩序相互配合。自汉代以后，礼教对法律的影响逐步加深，到唐律体系中形成较成熟的制度表达。"
    },
    "晋律": {
        subtitle: "魏晋时期重要法典",
        body: "《晋律》是西晋时期的重要法典，今已佚失，但其内容和特点可从《晋书·刑法志》等文献中窥见。后世常以“峻礼教之防，准五服以制罪”概括其把礼教亲属关系纳入法律制度的特点。"
    },
    "准五服以制罪": {
        subtitle: "按亲属服制确定罪责轻重",
        body: "“准五服以制罪”指依据五服亲等、尊卑长幼来调整刑罚轻重。它不是亲属犯罪一概从轻，而是把亲疏远近和上下名分都纳入法律判断，是魏晋法律儒家化制度化的重要表现。"
    },
    "五服": {
        subtitle: "表示亲属远近的丧服等级",
        body: "五服本是丧服制度，按亲属关系远近分为斩衰、齐衰、大功、小功、缌麻。古代法律把五服用于判断亲属相犯时的轻重，说明家庭伦理关系已经成为刑罚适用的重要依据。"
    },
    "大功": {
        subtitle: "五服中的一种亲等",
        body: "大功是五服之一，服期通常为九个月，涉及伯叔父母、堂兄弟等一定范围内的亲属。法律讨论亲属相犯时，大功既表示双方亲属关系较近，也需要进一步区分谁是尊长、谁是卑幼。"
    },
    "尊长": {
        subtitle: "亲属关系中的长辈或上位者",
        body: "尊长指家族伦理中地位较高的长辈或上位亲属，如父母、伯叔父母等。儒家礼法重视长幼尊卑，因此卑幼冒犯尊长在古代法律中往往会被加重评价。"
    },
    "卑幼": {
        subtitle: "亲属关系中的晚辈或下位者",
        body: "卑幼指家族伦理中地位较低的晚辈或下位亲属，如子侄等。古代法律在处理亲属相犯时，会依据卑幼与尊长的方向关系决定加重或减轻。"
    },
    "服制": {
        subtitle: "以丧服表达亲属等级的制度",
        body: "服制通过不同丧服等级表示亲属关系远近和伦理责任。魏晋以后，服制不仅用于礼仪，也被法律吸收，成为亲属之间犯罪时确定刑罚轻重的重要依据。"
    },
    "刑部": {
        subtitle: "古代中央司法行政机构",
        body: "刑部是隋唐以后中央政府中主管刑狱、司法行政和部分案件复核的重要机构，位列六部之一。它与大理寺、御史台等机构共同构成古代中央司法运行体系的一部分。"
    },
    "唐律疏议": {
        subtitle: "唐代重要法典及其解释",
        body: "《唐律疏议》又称《永徽律疏》，是在唐高宗永徽年间形成的律文及官方解释汇编。它保存了较完整的唐代法律体系，是研究中国古代法律制度和礼法结合的重要文献。"
    },
    "德礼为政教之本": {
        subtitle: "《唐律疏议》开篇总纲",
        body: "“德礼为政教之本”出自《唐律疏议》名例律开篇，强调国家治理应以道德教化和礼制秩序为根本。它说明唐律重视礼教精神，但并不意味着法官可以脱离具体律条任意免刑。"
    },
    "刑罚为政教之用": {
        subtitle: "刑罚服务于教化秩序",
        body: "“刑罚为政教之用”与“德礼为政教之本”相连，意思是刑罚是实现政治教化和社会秩序的工具。唐律中的刑罚不只是惩罚，也承担警戒、教化和维护秩序的功能。"
    },
    "德礼为本": {
        subtitle: "唐律礼法合一的价值基础",
        body: "德礼为本是对《唐律疏议》总纲精神的概括，指法律制度以儒家德礼教化为根本价值。但在具体案件中，德礼通常要通过成文条文、量刑规则和程序体现，而不是直接替代法律。"
    },
    "刑罚为用": {
        subtitle: "刑罚作为治理工具",
        body: "刑罚为用强调刑罚服务于政教秩序，而不是单纯为了报复或惩罚。唐律礼法合一的成熟处，正在于刑罚、教化、名分和程序共同构成法律秩序。"
    },
    "窃盗": {
        subtitle: "秘密盗取他人财物",
        body: "窃盗指秘密盗取他人财物的行为。唐律对窃盗按赃值轻重递增处罚，低额盗窃也会入罪，只是刑罚较轻。它体现出唐代法律对财产秩序和乡里安定的维护。"
    },
    "赃计": {
        subtitle: "按赃物价值计算刑罚",
        body: "赃计是指根据赃物价值确定罪责轻重的量刑方法。唐律中许多财产犯罪都按赃额递增处罚，赃值越高，刑罚越重；赃值很低时，也可能只处笞杖轻刑。"
    },
    "笞刑": {
        subtitle: "五刑中较轻的身体刑",
        body: "笞刑是中国古代五刑中较轻的一种，用竹板或荆条责打，常用于较轻罪行。唐律五刑包括笞、杖、徒、流、死，笞刑位于最轻一等。"
    },
    "杖刑": {
        subtitle: "重于笞刑的身体刑",
        body: "杖刑是古代五刑之一，重于笞刑，通常用杖责打。唐律中低额盗窃等轻罪可能落入笞杖范围，体现按罪行轻重分层处罚。"
    },
    "断罪引律": {
        subtitle: "裁判须引用成文依据",
        body: "断罪引律指裁断罪名时须引用律、令、格、式等成文依据。它体现唐代法制对规则和程序的重视，也限制了法官只凭抽象道德任意裁断。"
    },
    "礼法合一": {
        subtitle: "礼教精神与成文法的成熟结合",
        body: "礼法合一指礼教伦理已经深度进入法律总纲、条文和制度运行之中。唐律的特点不是临案以礼废法，而是在成文法内部体现德礼教化、亲属名分和社会秩序。"
    },
    "一准乎礼": {
        subtitle: "唐律礼法结合的概括",
        body: "“一准乎礼”常用来概括唐律以儒家礼教为重要准则的特征。唐律在亲属、尊卑、身份、婚姻、继承等方面大量吸收礼的原则，使法律条文具有鲜明的伦理秩序色彩。"
    },
    "留养承祀": {
        subtitle: "死刑案件中的孝道与制度妥协",
        body: "留养承祀是指在特定条件下，对某些应受重刑者暂缓执行，使其得以奉养老亲、延续宗祀。该制度与孝道、宗族延续和刑罚慎用有关，并不等同于赦免罪责。"
    },
    "存留养亲": {
        subtitle: "为奉养老亲而暂缓刑罚",
        body: "存留养亲是古代法律中为照顾年老无依父母而设置的刑罚变通制度。其适用通常要求罪犯承担独子、父母老疾、无人奉养等条件，并会排除部分严重罪名。"
    },
    "孝道": {
        subtitle: "儒家家庭伦理的核心",
        body: "孝道是儒家伦理的重要核心，强调子女对父母的奉养、敬爱和服从。自汉代以后，孝道不仅是道德规范，也进入选官、礼制和法律制度，对古代社会秩序影响深远。"
    },
    "宗祀": {
        subtitle: "家族祭祀与血脉延续",
        body: "宗祀指宗族祭祀和祖先供奉，关系到家族血脉、伦理记忆和社会身份的延续。在传统社会中，宗祀不仅是宗教礼仪，也与家族秩序、继承制度和孝道观念密切相关。"
    },
    "死刑复核": {
        subtitle: "对死刑案件再次审查",
        body: "死刑复核是对死刑案件进行再次审查的制度安排，目的在于避免错杀、慎用极刑。中国古代较早形成对重大刑案层层审核的传统，隋唐以后相关程序逐渐制度化。"
    },
    "陈子昂": {
        subtitle: "唐代文学家与政治人物",
        body: "陈子昂是初唐重要文学家、诗人和政治人物，曾任右拾遗。他不仅以诗歌革新闻名，也关心现实政治与司法问题。徐元庆复仇案发生后，他撰写《复仇议状》，主张依法处死徐元庆，同时表彰其孝义。"
    },
    "武则天": {
        subtitle: "武周皇帝",
        body: "武则天是中国历史上唯一得到普遍承认的女皇帝。她在唐高宗时期逐渐参与朝政，后建立武周政权。其统治时期重视选官与政治整顿，也留下多起涉及律法、礼制和官僚治理的历史争议。徐元庆复仇案即发生于武则天时期。"
    },
    "右拾遗": {
        subtitle: "负责规谏与补察的谏官",
        body: "右拾遗是唐代谏官之一，职责在于向皇帝进言、补察政事缺失。官位虽不很高，却可以就政治、司法和制度问题提出意见。陈子昂曾任右拾遗，并以这一身份参与徐元庆复仇案的讨论。"
    },
    "柳宗元": {
        subtitle: "唐代文学家与思想家",
        body: "柳宗元是中唐重要文学家、思想家和政治人物，唐宋八大家之一。他重视国家治理、官吏责任与制度原则。在《驳复仇议》中，他批评对徐元庆同时施加刑罚与表彰，主张先查明徐爽旧案曲直，再决定赏罚。"
    },
    "旌闾": {
        subtitle: "表彰某人及其乡里门闾",
        body: "旌闾是古代国家表彰忠孝、节义人物的一种方式，通常通过标识、旌表其居所门闾，使其名誉为乡里和社会所知。它不仅奖励个人，也具有树立道德典范、传播教化的作用。"
    },
    "徐元庆": {
        subtitle: "武周时期复仇案当事人",
        body: "徐元庆是同州下邽人。其父徐爽被县尉赵师韫所杀后，他隐姓埋名、伺机复仇，最终杀死赵师韫并主动投案。围绕其行为应诛、应赦还是应当表彰，引发了中国古代礼法史上的著名争论。"
    },
    "诛其人而旌其闾": {
        subtitle: "陈子昂提出的礼法折中方案",
        body: "“诛其人而旌其闾”是对陈子昂《复仇议状》主张的概括：徐元庆擅自杀人，应依法处死；但其为父复仇的孝义，又应通过表彰门闾加以褒扬。这种方案试图分别维护国法与礼教，也因赏罚并行而受到柳宗元批评。"
    },
    "复仇议状": {
        subtitle: "陈子昂讨论徐元庆案的奏议",
        body: "《复仇议状》是陈子昂针对徐元庆复仇案撰写的奏议。文章认为，为父复仇符合礼义，但私人杀人又触犯国法，因此提出先依法诛杀，再旌表孝义的处置方式。"
    },
    "驳复仇议": {
        subtitle: "柳宗元反驳陈子昂复仇议的文章",
        body: "《驳复仇议》是柳宗元对陈子昂复仇方案的批评。柳宗元认为刑赏不能同时施于同一行为，朝廷应先查明徐爽是否无罪、赵师韫是否枉法，再决定徐元庆应当受诛还是得到伸张。"
    },
    "父仇不共戴天": {
        subtitle: "传统礼教中的复仇观念",
        body: "“父仇不共戴天”源于传统礼制中对父子伦理的强调，意指杀父之仇极其深重，不能与仇人共同生存于天地之间。这一观念强化了为亲复仇的道德责任，也与国家禁止私人杀人的法律秩序产生长期冲突。"
    },
    "私人复仇": {
        subtitle: "个人绕过官府实施的报复",
        body: "私人复仇是个人或家族不经国家司法程序，直接对仇人实施报复的行为。它可能源于真实冤屈与亲属义务，但也会造成仇杀循环，并挑战国家对审判、刑罚和公共秩序的控制。"
    }
};
const CLASSROOM_GLOSSARY_TERMS = Object.keys(CLASSROOM_GLOSSARY).sort((a, b) => b.length - a.length);
const STORY_KEYWORDS = [
    "法家治国理想", "个人宗族私欲", "中央集权", "大一统", "皇权合法性", "政治合法性",
    "帝国继承权", "权力交接", "权力过渡", "权力结构", "政治结构", "制度设计",
    "制度化削藩", "制度性拆解", "制度修补", "治理体系", "国家能力", "国家信用",
    "郡国并行", "郡县制", "分封秩序", "诸侯王国", "地方封国", "地方军事化",
    "休养生息", "轻徭薄赋", "黄老政治", "文景积累", "国力恢复", "国力积累",
    "财政压力", "战争财政", "盐铁官营", "均输平准", "民力压力", "政策刹车",
    "思想整合", "官方政治语言", "儒学正统", "士人政治", "清议", "党人声望",
    "外戚政治", "宦官专权", "幼主政治", "豪强社会", "门生故吏", "土地兼并",
    "基层秩序", "民间宗教动员", "地方武装", "军阀割据", "中央权威",
    "战略视野", "战略咽喉", "边疆经营", "丝绸之路", "河西四郡", "西域都护",
    "托孤辅政", "权臣废立", "王朝更替", "禅让仪式", "三国前夜",
    "遗诏", "伪造皇帝诏书", "沙丘政变", "宫廷斗争", "父子相残", "信息封锁",
    "异姓王问题", "功臣集团", "兔死狗烹", "鸟尽弓藏", "军功集团", "皇权巩固",
    "御驾亲征", "后勤困境", "军事指挥体系", "宦官制度", "削藩政策",
    "宏大工程", "民生极限", "举国体制", "后勤灾难", "通货膨胀", "基层统治"
];

// 用户身份标识（UUID，首次访问自动生成，存于 localStorage）
function getUserId() {
    let uid = localStorage.getItem('traeHistoryUserId');
    if (!uid) {
        uid = crypto.randomUUID ? crypto.randomUUID() : 'uid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('traeHistoryUserId', uid);
    }
    return uid;
}
const USER_ID = getUserId();

// 全局状态管理
const state = {
    eventsList: [],
    currentEventId: null,
    currentEventData: null,
    chatHistory: {},
    currentTarget: "所有参与人",
    answerMode: localStorage.getItem('traeHistoryAnswerMode') || "fast",
    currentMode: "story",
    authToken: "",
    authUser: null,
    authReady: false,
    pendingEntry: "",
    guessGame: {
        sessionId: null,
        userPerson: "",
        transcript: [],
        pendingAiGuess: "",
        ended: false
    },
    timeTravel: {
        sessionId: null,
        activeSceneId: VISUAL_NOVEL_SCENE_ID,
        payload: null,
        isBusy: false,
        visualQueue: [],
        visualIndex: -1,
        visualPhase: "idle",
        visualTyping: false,
        visualTypingTimer: null,
        visualPendingPayload: null,
        visualPendingUserRequest: null,
        visualWaitingForNext: false,
        visualBrowsingHistory: false,
        visualMaxSeenIndex: -1,
        visualClassroomChoicesRevealed: false,
        visualIntroStep: "",
        visualBriefingPageIndex: 0,
        classroomStudentName: "",
        classroomReflectionMode: "supplement",
        classroomReflectionPrompt: "",
        classroomInitialPrompted: false,
        classroomInitialSubmitted: false,
        classroomCounterSubmitted: false,
        classroomPendingChoice: null,
        classroomHistorianMessages: [],
        classroomHistorianBusy: false
    },
    career: {
        sessionId: "",
        identity: null,
        office: null,
        opening: null,
        currentCase: null,
        gameState: null,
        ending: null,
        phase: "identity",
        prototype: null,
        result: null,
        answers: {},
        currentQuestionIndex: 0,
        appointment: null,
        affairResult: null,
        affairStepIndex: 0,
        affairDialogue: [],
        affairDialogueIndex: 0,
        affairMode: "dialogue",
        affairStoryChoices: []
    },
    // 三国篇等新一代多故事的运行时状态，与 timeTravel/career 完全独立
    story: {
        list: [],                  // /story/list 返回的摘要数组
        currentStoryId: null,
        currentManifest: null,     // /story/<id>/manifest 返回的完整 manifest
        sessionId: null,
        sessionData: null,         // /story/<id>/session/start 返回的 session 信息
        currentChapter: null,      // /story/<id>/chapter/<cid> 返回的完整章节数据
        sceneIndex: null,          // {scene_id: scene} 索引，便于 next 跳转
        lineIndex: 0,              // 当前 scene 内的 line 推进位置
        typing: false,             // 是否正在流式打字
        typingToken: 0,            // 流式取消用 token
        typingTimer: null          // 流式 setTimeout id
    },
    isLoading: false
};

function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}

function isLawClassroomDemo() {
    return new URLSearchParams(window.location.search).get("x") === LAW_CLASSROOM_DEMO_PARAM;
}

function updateClassroomDemoVisibility() {
    const visible = isLawClassroomDemo();
    document.body?.classList.toggle('law-classroom-demo', visible);
    elements.appShell?.classList.toggle('law-classroom-page', visible);
    elements.classroomCases?.classList.toggle('hidden', !visible);
    elements.careerEntry?.classList.toggle('hidden', visible);
    elements.timeTravelContent?.classList.toggle('law-classroom-demo', visible);
    if (elements.rujuHeroTitle) {
        elements.rujuHeroTitle.textContent = visible ? "礼法断案，做出你的裁断" : "人在局中，亲历历史";
    }
    if (elements.rujuHeroCopy) {
        elements.rujuHeroCopy.textContent = visible
            ? "进入古代司法现场，听取律令、亲情与教化的不同声音。"
            : "新故事筹备中。";
    }
    if (elements.rujuEntryCardTitle) {
        elements.rujuEntryCardTitle.textContent = visible ? "选择断案卷宗" : "入局";
    }
    if (elements.rujuEntryCardCopy) {
        elements.rujuEntryCardCopy.textContent = visible ? "课堂体验模式 · 请根据老师指引进入" : "内容更新中";
    }
    if (elements.rujuEventChipText) {
        elements.rujuEventChipText.textContent = visible ? "东汉末年 · 赤壁战前的江东朝议" : "新故事筹备中";
    }
    if (elements.travelStartBtn) {
        elements.travelStartBtn.textContent = visible ? "开始入局" : "即将开放";
    }
    if (elements.rujuEntryActionLabel) {
        elements.rujuEntryActionLabel.textContent = visible ? "随机入局" : "";
    }
}

// DOM 元素引用
const elements = {
    homeScreen: document.getElementById('home-screen'),
    homeStartBtn: document.getElementById('home-start-btn'),
    homeAuthOpenBtn: document.getElementById('home-auth-open-btn'),
    homeAuthUser: document.getElementById('home-auth-user'),
    homeAuthEmail: document.getElementById('home-auth-email'),
    homeAuthLogoutBtn: document.getElementById('home-auth-logout-btn'),
    appShell: document.getElementById('app-shell'),
    topbarAuthBtn: document.getElementById('topbar-auth-btn'),
    navContainer: document.getElementById('nav-container'),
    storySection: document.getElementById('story-section'),
    storySplash: document.getElementById('story-splash'),
    storyContent: document.getElementById('story-content'),
    guessGameContent: document.getElementById('guess-game-content'),
    timeTravelContent: document.getElementById('time-travel-content'),
    storyTitle: document.getElementById('story-title'),
    manuscriptStamp: document.getElementById('manuscript-stamp'),
    storyTime: document.getElementById('story-time'),
    storyLocation: document.getElementById('story-location'),
    storyCharactersList: document.getElementById('story-characters-list'),
    storyDetails: document.getElementById('story-details'),
    storyImgContainer: document.getElementById('story-image-container'),
    storyImg: document.getElementById('story-image'),
    
    chatHistoryWrapper: document.getElementById('chat-history-container'),
    chatSection: document.getElementById('chat-section'),
    chatEmptyState: document.getElementById('chat-empty-state'),
    charBtnsContainer: document.getElementById('character-buttons'),
    chatInput: document.getElementById('chat-input'),
    chatSubmit: document.getElementById('chat-submit'),
    chatForm: document.getElementById('chat-form'),
    btnClear: document.getElementById('btn-clear-chat'),
    currentAtBadge: document.getElementById('current-at-badge'),
    answerModeOptions: document.getElementById('answer-mode-options'),
    chatSpinner: document.getElementById('chat-spinner')
};
elements.storyContainer = document.getElementById('story-container');

Object.assign(elements, {
    guessSetup: document.getElementById('guess-setup'),
    guessPlay: document.getElementById('guess-play'),
    guessUserPerson: document.getElementById('guess-user-person'),
    guessStartBtn: document.getElementById('guess-start-btn'),
    guessResetBtn: document.getElementById('guess-reset-btn'),
    guessRevealBtn: document.getElementById('guess-reveal-btn'),
    guessMyPerson: document.getElementById('guess-my-person'),
    guessStatus: document.getElementById('guess-status'),
    guessLog: document.getElementById('guess-log'),
    guessInput: document.getElementById('guess-input'),
    guessAskBtn: document.getElementById('guess-ask-btn'),
    guessGuessBtn: document.getElementById('guess-guess-btn'),
    guessUserAnswer: document.getElementById('guess-user-answer'),
    feedbackOpenBtn: document.getElementById('feedback-open-btn'),
    mobileFeedbackBtn: document.getElementById('mobile-feedback-top-btn'),
    feedbackModal: document.getElementById('feedback-modal'),
    feedbackCloseBtn: document.getElementById('feedback-close-btn'),
    feedbackSubmitBtn: document.getElementById('feedback-submit-btn'),
    feedbackMessage: document.getElementById('feedback-message'),
    feedbackEmail: document.getElementById('feedback-email'),
    feedbackStatus: document.getElementById('feedback-status'),
    feedbackEmailLink: document.getElementById('feedback-email-link'),
    classroomReflectionModal: document.getElementById('classroom-reflection-modal'),
    classroomReflectionForm: document.getElementById('classroom-reflection-form'),
    classroomReflectionClose: document.getElementById('classroom-reflection-close'),
    classroomReflectionKicker: document.getElementById('classroom-reflection-kicker'),
    classroomReflectionTitle: document.getElementById('classroom-reflection-title'),
    classroomReflectionCopy: document.getElementById('classroom-reflection-copy'),
    classroomReflectionNameWrap: document.getElementById('classroom-reflection-name-wrap'),
    classroomReflectionName: document.getElementById('classroom-reflection-name'),
    classroomReflectionThoughtLabel: document.getElementById('classroom-reflection-thought-label'),
    classroomReflectionThought: document.getElementById('classroom-reflection-thought'),
    classroomReflectionStatus: document.getElementById('classroom-reflection-status'),
    classroomReflectionSubmit: document.getElementById('classroom-reflection-submit'),
    authOpenBtn: document.getElementById('auth-open-btn'),
    mobileAuthOpenBtn: document.getElementById('mobile-auth-open-btn'),
    authUserPill: document.getElementById('auth-user-pill'),
    authUserEmail: document.getElementById('auth-user-email'),
    authLogoutBtn: document.getElementById('auth-logout-btn'),
    authModal: document.getElementById('auth-modal'),
    authCloseBtn: document.getElementById('auth-close-btn'),
    authEmail: document.getElementById('auth-email'),
    authCode: document.getElementById('auth-code'),
    authCodeBtn: document.getElementById('auth-code-btn'),
    authRemember: document.getElementById('auth-remember'),
    authLoginBtn: document.getElementById('auth-login-btn'),
    authStatus: document.getElementById('auth-status')
});

Object.assign(elements, {
    travelStartPanel: document.getElementById('travel-start-panel'),
    careerPrototypePanel: document.getElementById('career-prototype-panel'),
    sanguoPanel: document.getElementById('sanguo-panel'),
    careerStartBtn: document.getElementById('career-start-btn'),
    careerEntry: document.querySelector('.ruju-career-entry'),
    rujuHeroTitle: document.getElementById('ruju-hero-title'),
    rujuHeroCopy: document.getElementById('ruju-hero-copy'),
    rujuEntryCardTitle: document.querySelector('.ruju-entry-card h2'),
    rujuEntryCardCopy: document.querySelector('.ruju-entry-card > p'),
    rujuEventChipText: document.querySelector('.ruju-event-chip b'),
    rujuEntryActionLabel: document.querySelector('.ruju-entry-actions span'),
    travelPlayPanel: document.getElementById('travel-play-panel'),
    travelStartBtn: document.getElementById('travel-start-btn'),
    classroomCases: document.querySelector('.ruju-classroom-cases'),
    travelSceneSelect: document.getElementById('travel-scene-select'),
    travelRestartBtn: document.getElementById('travel-restart-btn'),
    travelTitle: document.getElementById('travel-title'),
    travelCharacterText: document.getElementById('travel-character-text'),
    travelMeta: document.getElementById('travel-meta'),
    travelStats: document.getElementById('travel-stats'),
    travelScene: document.getElementById('travel-scene'),
    travelPeople: document.getElementById('travel-people'),
    travelChoiceList: document.getElementById('travel-choice-list'),
    travelTalkLog: document.getElementById('travel-talk-log'),
    travelTalkPerson: document.getElementById('travel-talk-person'),
    travelTalkInput: document.getElementById('travel-talk-input'),
    travelTalkBtn: document.getElementById('travel-talk-btn'),
    travelDecideBtn: document.getElementById('travel-decide-btn'),
    travelDecisionModal: document.getElementById('travel-decision-modal'),
    travelDecisionClose: document.getElementById('travel-decision-close'),
    travelDecisionCancel: document.getElementById('travel-decision-cancel'),
    travelDecisionPublish: document.getElementById('travel-decision-publish'),
    travelDecisionInput: document.getElementById('travel-decision-input'),
    travelLoading: document.getElementById('travel-loading'),
    travelLoadingTitle: document.getElementById('travel-loading-title'),
    travelLoadingPercent: document.getElementById('travel-loading-percent'),
    travelLoadingBar: document.getElementById('travel-loading-bar'),
    travelLoadingSteps: document.getElementById('travel-loading-steps'),
    travelRoundPill: document.getElementById('travel-round-pill'),
    travelVisualPanel: document.getElementById('travel-visual-panel'),
    travelVisualStage: document.getElementById('travel-visual-stage'),
    visualDialogueBox: document.getElementById('visual-dialogue-box'),
    visualChoiceList: document.getElementById('visual-choice-list'),
    visualEra: document.getElementById('visual-era'),
    visualTitle: document.getElementById('visual-title'),
    visualRound: document.getElementById('visual-round'),
    visualTurnPanel: document.getElementById('visual-turn-panel'),
    visualPhase: document.getElementById('visual-phase'),
    visualAp: document.getElementById('visual-ap'),
    visualLastAction: document.getElementById('visual-last-action'),
    visualStatusBars: document.getElementById('visual-status-bars'),
    visualAnnouncementList: document.getElementById('visual-announcement-list'),
    visualMapBtn: document.getElementById('visual-map-btn'),
    visualAvatar: document.getElementById('visual-avatar'),
    visualDialogueAvatar: document.getElementById('visual-dialogue-avatar'),
    visualSpeakerName: document.getElementById('visual-speaker-name'),
    visualSpeakerRole: document.getElementById('visual-speaker-role'),
    visualDialogueText: document.getElementById('visual-dialogue-text'),
    visualCinematicOverlay: document.getElementById('visual-cinematic-overlay'),
        visualOverlayTitle: document.getElementById('visual-overlay-title'),
        visualOverlayText: document.getElementById('visual-overlay-text'),
        visualOverlaySource: document.getElementById('visual-overlay-source'),
        visualOverlayHint: document.getElementById('visual-overlay-hint'),
        visualOverlayProgress: document.getElementById('visual-overlay-progress'),
        visualOverlayProgressBar: document.getElementById('visual-overlay-progress-bar'),
        visualOverlayProgressPercent: document.getElementById('visual-overlay-progress-percent'),
        visualPrevBtn: document.getElementById('visual-prev-btn'),
        visualNextBtn: document.getElementById('visual-next-btn'),
        visualDialogueContinue: document.getElementById('visual-dialogue-continue'),
        visualInputForm: document.getElementById('visual-input-form'),
    visualPlayerInput: document.getElementById('visual-player-input'),
    visualSendBtn: document.getElementById('visual-send-btn'),
    visualDecideBtn: document.getElementById('visual-decide-btn'),
    chibiMapModal: document.getElementById('chibi-map-modal'),
    chibiMapClose: document.getElementById('chibi-map-close')
});

// ================= API 请求 =================
async function apiGet(endpoint, options = {}) {
    try {
        const res = await fetch(endpoint, options);
        if(!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (e) {
        console.error('API GET Error:', e);
        return null;
    }
}

async function apiPost(endpoint, data, options = {}) {
    try {
        const headers = { 'Content-Type': 'application/json', 'X-CLIENT-ID': USER_ID };
        if (options.auth && state.authToken) {
            headers['X-AUTH-TOKEN'] = state.authToken;
        }
        const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            console.error('API POST HTTP Error:', res.status, res.statusText);
            let detail = '';
            try {
                const errorData = await res.json();
                detail = errorData.detail || errorData.message || '';
            } catch (parseError) {}
            throw new Error(detail || `HTTP ${res.status}`);
        }
        return await res.json();
    } catch (e) {
        console.error('API POST Error:', e);
        return { success: false, error: e.message || '请求失败' };
    }
}

function trackAnalytics(eventType, data = {}) {
    const endpoint = eventType === 'visit' ? '/analytics/visit' : '/analytics/event';
    const payload = eventType === 'visit'
        ? { path: window.location.pathname + window.location.hash, referrer: document.referrer || '' }
        : { event_type: eventType, ...data };
    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CLIENT-ID': USER_ID },
        body: JSON.stringify(payload),
        keepalive: true
    }).catch(() => {});
}

async function loadSiteConfig() {
    const res = await apiGet('/site_config');
    const email = res && res.contact_email ? String(res.contact_email).trim() : '';
    if (!email || !elements.feedbackEmailLink) return;
    elements.feedbackEmailLink.href = `mailto:${email}`;
    elements.feedbackEmailLink.textContent = `也可以发邮件：${email}`;
    elements.feedbackEmailLink.classList.remove('hidden');
}

function openFeedbackModal() {
    elements.feedbackModal.classList.remove('hidden');
    elements.feedbackModal.setAttribute('aria-hidden', 'false');
    elements.feedbackStatus.textContent = '';
    elements.feedbackMessage.focus();
}

function closeFeedbackModal() {
    elements.feedbackModal.classList.add('hidden');
    elements.feedbackModal.setAttribute('aria-hidden', 'true');
}

function classroomReflectionContext() {
    const payload = state.timeTravel.payload || {};
    const result = String(payload.result || "");
    const choiceId = result.match(/^([A-D])\s*[｜|]/)?.[1] || "";
    const choice = (payload.choices || []).find(item => String(item?.id || "") === choiceId);
    return {
        scene_id: String(payload.scene_id || ""),
        scene_title: String(payload.title || ""),
        choice_id: choiceId,
        choice_text: String(choice?.text || ""),
    };
}

function openClassroomReflectionModal() {
    if (!elements.classroomReflectionModal) return;
    elements.classroomReflectionStatus.textContent = "";
    elements.classroomReflectionSubmit.disabled = false;
    elements.classroomReflectionSubmit.textContent = "提交";
    elements.classroomReflectionModal.classList.remove('hidden');
    elements.classroomReflectionModal.setAttribute('aria-hidden', 'false');
    elements.classroomReflectionName.focus();
}

function closeClassroomReflectionModal() {
    elements.classroomReflectionModal?.classList.add('hidden');
    elements.classroomReflectionModal?.setAttribute('aria-hidden', 'true');
}

async function submitClassroomReflection() {
    const name = elements.classroomReflectionName?.value.trim() || "";
    const thought = elements.classroomReflectionThought?.value.trim() || "";
    if (!name) {
        elements.classroomReflectionStatus.textContent = "请先填写姓名。";
        elements.classroomReflectionName?.focus();
        return;
    }
    if (thought.length < 2) {
        elements.classroomReflectionStatus.textContent = "请写下你的想法。";
        elements.classroomReflectionThought?.focus();
        return;
    }

    elements.classroomReflectionSubmit.disabled = true;
    elements.classroomReflectionSubmit.textContent = "提交中";
    elements.classroomReflectionStatus.textContent = "正在保存你的想法……";
    const res = await apiPost('/classroom/reflection', {
        name,
        thought,
        ...classroomReflectionContext(),
    });
    if (!res?.success) {
        elements.classroomReflectionSubmit.disabled = false;
        elements.classroomReflectionSubmit.textContent = "提交";
        elements.classroomReflectionStatus.textContent = res?.error || "提交失败，请稍后再试。";
        return;
    }

    elements.classroomReflectionStatus.textContent = "提交成功，谢谢你的思考。";
    elements.classroomReflectionSubmit.textContent = "已提交";
    elements.classroomReflectionName.value = "";
    elements.classroomReflectionThought.value = "";
    setTimeout(closeClassroomReflectionModal, 1100);
}

const CLASSROOM_REFLECTION_PHASE_COPY = {
    initial: {
        kicker: "初判思路",
        title: "先写下你的裁断思路",
        copy: "案情已陈，疑难未决。请先写下你对此案的理解和裁断理由。",
        thoughtLabel: "裁断思路",
        placeholder: "我认为本案应当……理由是……",
        submitText: "提交思路",
        requireName: true
    },
    counter: {
        kicker: "回应追问",
        title: "回应案中人的追问",
        copy: "请回应刚才案中人的质疑，再继续推进案情。",
        thoughtLabel: "你的回应",
        placeholder: "面对这个追问，我的想法是……",
        submitText: "提交回应",
        requireName: false
    },
    supplement: {
        kicker: "继续思考",
        title: "继续思考",
        copy: "看完推演结果后，如果你有新的想法或不同判断，可以继续写下。",
        thoughtLabel: "你的想法",
        placeholder: "我还想到……",
        submitText: "提交想法",
        requireName: false
    }
};

function classroomReflectionConfig(payload = state.timeTravel.payload) {
    const config = payload?.reflection_config;
    return config && typeof config === "object" ? config : {};
}

function isClassroomThoughtScene(payload = state.timeTravel.payload) {
    return Boolean(payload?.classroom_mode);
}

function resetClassroomThoughtState() {
    state.timeTravel.classroomReflectionMode = "supplement";
    state.timeTravel.classroomReflectionPrompt = "";
    state.timeTravel.classroomInitialPrompted = false;
    state.timeTravel.classroomInitialSubmitted = false;
    state.timeTravel.classroomCounterSubmitted = false;
    state.timeTravel.classroomPendingChoice = null;
}

function classroomInitialPromptItem() {
    const config = classroomReflectionConfig();
    const prompt = config.initial_prompt || {};
    const text = prompt.text || "案情已陈，礼与法的疑难也摆在堂前。请先写下你的初判思路：你将如何理解本案的关键，并说明自己的裁断理由？";
    return {
        speaker: prompt.speaker || "史官",
        role: prompt.role || "裁断前问",
        text,
        kind: "ai",
        thoughtGate: "initial",
        reflectionPrompt: text
    };
}

function classroomInitialAckItem() {
    const ack = classroomReflectionConfig().ack || {};
    return {
        speaker: ack.speaker || "案吏",
        role: ack.role || "承命",
        text: ack.text || "已将你的初判思路记入案卷。请据此继续作出裁断。",
        kind: "ai"
    };
}

function classroomCounterPromptForChoice(choice = {}) {
    const id = String(choice?.id || "");
    const prompts = classroomReflectionConfig().counter_prompts || {};
    const prompt = prompts[id] || { speaker: "史官", role: "裁断追问", text: "此断看似可行，但它会不会留下新的礼法疑难？" };
    return {
        ...prompt,
        kind: "ai",
        thoughtGate: "counter",
        reflectionPrompt: prompt.text,
        choiceId: id,
        choiceText: String(choice?.text || "")
    };
}

function revealClassroomChoices() {
    state.timeTravel.visualClassroomChoicesRevealed = true;
    elements.visualDialogueBox?.classList.add('hidden');
}

function appendClassroomGateItem(item) {
    appendVisualItems([item], { jumpToNew: true });
}

classroomReflectionContext = function() {
    const payload = state.timeTravel.payload || {};
    const result = String(payload.result || "");
    const choiceId = result.match(/^([A-D])\s*[—:：]/)?.[1] || "";
    const choice = (payload.choices || []).find(item => String(item?.id || "") === choiceId);
    const pendingChoice = state.timeTravel.classroomPendingChoice || {};
    const mode = state.timeTravel.classroomReflectionMode || "supplement";
    return {
        scene_id: String(payload.scene_id || ""),
        scene_title: String(payload.title || ""),
        choice_id: mode === "initial" ? "" : String(pendingChoice.id || choiceId || ""),
        choice_text: mode === "initial" ? "" : String(pendingChoice.text || choice?.text || ""),
        phase: mode,
        prompt: String(state.timeTravel.classroomReflectionPrompt || ""),
    };
};

openClassroomReflectionModal = function(options = {}) {
    if (!elements.classroomReflectionModal) return;
    const mode = options.phase || "supplement";
    const copy = CLASSROOM_REFLECTION_PHASE_COPY[mode] || CLASSROOM_REFLECTION_PHASE_COPY.supplement;
    state.timeTravel.classroomReflectionMode = mode;
    state.timeTravel.classroomReflectionPrompt = options.prompt || "";
    const hasRememberedName = Boolean(state.timeTravel.classroomStudentName);
    const shouldRequireName = Boolean(copy.requireName || !hasRememberedName);
    if (elements.classroomReflectionKicker) elements.classroomReflectionKicker.textContent = copy.kicker;
    if (elements.classroomReflectionTitle) elements.classroomReflectionTitle.textContent = copy.title;
    if (elements.classroomReflectionCopy) elements.classroomReflectionCopy.textContent = options.prompt || copy.copy;
    if (elements.classroomReflectionThoughtLabel) elements.classroomReflectionThoughtLabel.textContent = copy.thoughtLabel;
    if (elements.classroomReflectionThought) {
        elements.classroomReflectionThought.value = "";
        elements.classroomReflectionThought.placeholder = copy.placeholder;
    }
    elements.classroomReflectionNameWrap?.classList.toggle('hidden', !shouldRequireName);
    if (elements.classroomReflectionName) {
        elements.classroomReflectionName.value = shouldRequireName ? state.timeTravel.classroomStudentName : "";
    }
    elements.classroomReflectionStatus.textContent = "";
    elements.classroomReflectionSubmit.disabled = false;
    elements.classroomReflectionSubmit.textContent = copy.submitText;
    elements.classroomReflectionModal.classList.remove('hidden');
    elements.classroomReflectionModal.setAttribute('aria-hidden', 'false');
    (shouldRequireName ? elements.classroomReflectionName : elements.classroomReflectionThought)?.focus();
};

submitClassroomReflection = async function() {
    const mode = state.timeTravel.classroomReflectionMode || "supplement";
    const copy = CLASSROOM_REFLECTION_PHASE_COPY[mode] || CLASSROOM_REFLECTION_PHASE_COPY.supplement;
    const needsName = Boolean(copy.requireName || !state.timeTravel.classroomStudentName);
    const name = needsName
        ? (elements.classroomReflectionName?.value.trim() || "")
        : state.timeTravel.classroomStudentName;
    const thought = elements.classroomReflectionThought?.value.trim() || "";
    if (!name) {
        elements.classroomReflectionStatus.textContent = "请先填写姓名。";
        elements.classroomReflectionName?.focus();
        return;
    }
    if (thought.length < 2) {
        elements.classroomReflectionStatus.textContent = "请写下你的想法。";
        elements.classroomReflectionThought?.focus();
        return;
    }
    elements.classroomReflectionSubmit.disabled = true;
    elements.classroomReflectionSubmit.textContent = "提交中";
    elements.classroomReflectionStatus.textContent = "正在保存……";
    const res = await apiPost('/classroom/reflection', {
        name,
        thought,
        ...classroomReflectionContext(),
    });
    if (!res?.success) {
        elements.classroomReflectionSubmit.disabled = false;
        elements.classroomReflectionSubmit.textContent = copy.submitText;
        elements.classroomReflectionStatus.textContent = res?.error || "提交失败，请稍后再试。";
        return;
    }
    state.timeTravel.classroomStudentName = name;
    elements.classroomReflectionStatus.textContent = "已保存。";
    elements.classroomReflectionSubmit.textContent = "已提交";
    elements.classroomReflectionThought.value = "";
    if (mode === "initial") {
        state.timeTravel.classroomInitialSubmitted = true;
        closeClassroomReflectionModal();
        appendClassroomGateItem(classroomInitialAckItem());
        return;
    }
    if (mode === "counter") {
        state.timeTravel.classroomCounterSubmitted = true;
        const pendingChoice = state.timeTravel.classroomPendingChoice;
        closeClassroomReflectionModal();
        if (pendingChoice?.id) {
            await chooseTravelChoice(pendingChoice.id);
        }
        return;
    }
    setTimeout(closeClassroomReflectionModal, 700);
};

function renderAuthState() {
    const email = state.authUser?.email || "";
    const isLoggedIn = Boolean(email);
    elements.authOpenBtn?.classList.toggle('hidden', isLoggedIn);
    elements.authUserPill?.classList.toggle('hidden', !isLoggedIn);
    if (elements.authUserEmail) elements.authUserEmail.textContent = email;
    elements.homeAuthOpenBtn?.classList.toggle('hidden', isLoggedIn);
    elements.homeAuthUser?.classList.toggle('hidden', !isLoggedIn);
    if (elements.homeAuthEmail) elements.homeAuthEmail.textContent = email;
    if (elements.mobileAuthOpenBtn) {
        elements.mobileAuthOpenBtn.textContent = isLoggedIn ? "已登录" : "登录";
    }
}

function openAuthModal() {
    if (!elements.authModal) return;
    elements.authModal.classList.remove('hidden');
    elements.authModal.setAttribute('aria-hidden', 'false');
    elements.authStatus.textContent = '';
    if (state.authUser?.email) {
        elements.authEmail.value = state.authUser.email;
    }
    if (elements.authCode) elements.authCode.value = '';
    elements.authEmail.focus();
}

function closeAuthModal() {
    elements.authModal?.classList.add('hidden');
    elements.authModal?.setAttribute('aria-hidden', 'true');
}

function openChibiMapModal() {
    if (!elements.chibiMapModal) return;
    elements.chibiMapModal.classList.remove('hidden');
    elements.chibiMapModal.setAttribute('aria-hidden', 'false');
    elements.chibiMapClose?.focus();
}

function closeChibiMapModal() {
    elements.chibiMapModal?.classList.add('hidden');
    elements.chibiMapModal?.setAttribute('aria-hidden', 'true');
    elements.visualMapBtn?.focus();
}

function initRememberLoginOption() {
    if (!elements.authRemember) return;
    elements.authRemember.checked = localStorage.getItem(AUTH_REMEMBER_KEY) !== "0";
}

function shouldRememberLogin() {
    return elements.authRemember ? elements.authRemember.checked : true;
}

function isLoggedIn() {
    return Boolean(state.authUser?.email);
}

function getGuestChatCount() {
    const count = Number(localStorage.getItem(GUEST_CHAT_COUNT_KEY) || "0");
    return Number.isFinite(count) ? count : 0;
}

function incrementGuestChatCount() {
    if (isLoggedIn()) return;
    localStorage.setItem(GUEST_CHAT_COUNT_KEY, String(getGuestChatCount() + 1));
}

function promptLoginForMoreChat() {
    openAuthModal();
    elements.authStatus.textContent = '你已经体验过 1 次 AI 对话。登录或注册后可以继续提问，并保留之后的探索记录。';
}

function setPendingEntry(target = "") {
    state.pendingEntry = target || "";
}

function requireLogin(target = "", options = {}) {
    setPendingEntry(target);
    showHome();
    if (window.location.hash) {
        window.history.replaceState(null, "", window.location.href.split("#")[0]);
    }
    if (options.silent) {
        closeAuthModal();
        return;
    }
    openAuthModal();
    elements.authStatus.textContent = target
        ? '请先登录，登录后会继续打开刚才的档案。'
        : '请先登录或注册，再开始探索。';
}

function continueAfterLogin() {
    if (!isLoggedIn()) return;
    const target = state.pendingEntry;
    state.pendingEntry = "";
    if (target === "guess-game") {
        showGuessGame();
        return;
    }
    if (target) {
        loadEvent(target);
        return;
    }
}

async function loadAuthUser() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_SESSION_TOKEN_KEY) || "";
    if (!token) {
        state.authToken = "";
        state.authUser = null;
        state.authReady = true;
        renderAuthState();
        return;
    }
    state.authToken = token;
    const res = await apiGet('/auth/me', {
        headers: { 'X-AUTH-TOKEN': token }
    });
    if (!res?.success) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_SESSION_TOKEN_KEY);
        state.authToken = "";
        state.authUser = null;
        state.authReady = true;
        renderAuthState();
        return;
    }
    state.authUser = res.user;
    state.authReady = true;
    renderAuthState();
    continueAfterLogin();
}

function authErrorMessage(error) {
    const message = error?.detail || error?.message || "";
    if (message) return message;
    return "登录服务暂时不可用，请稍后再试。";
}

function getAuthEmail() {
    const email = elements.authEmail?.value.trim() || "";
    if (!email) {
        elements.authStatus.textContent = '先填邮箱。';
        return null;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        elements.authStatus.textContent = '邮箱格式不正确。';
        return null;
    }
    return email;
}

function getAuthCode() {
    const code = elements.authCode?.value.trim() || "";
    if (!/^\d{6}$/.test(code)) {
        elements.authStatus.textContent = '请输入 6 位验证码。';
        return null;
    }
    return code;
}

function setAuthBusy(isBusy) {
    if (elements.authLoginBtn) elements.authLoginBtn.disabled = isBusy;
    if (elements.authCodeBtn) elements.authCodeBtn.disabled = isBusy;
}

async function parseApiError(response) {
    try {
        const data = await response.json();
        return data?.detail || data?.message || '请求失败，请稍后再试。';
    } catch (err) {
        return '请求失败，请稍后再试。';
    }
}

async function requestAuthCode() {
    const email = getAuthEmail();
    if (!email) return;
    setAuthBusy(true);
    elements.authStatus.textContent = '正在发送验证码...';
    try {
        const response = await fetch('/auth/email/request_code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CLIENT-ID': USER_ID },
            body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error(await parseApiError(response));
        const data = await response.json();
        elements.authStatus.textContent = data.dev_code
            ? `本地验证码：${data.dev_code}`
            : (data.message || '验证码已发送，请查看邮箱。');
        elements.authCode?.focus();
    } catch (err) {
        elements.authStatus.textContent = authErrorMessage(err);
    } finally {
        setAuthBusy(false);
    }
}

async function loginWithEmail() {
    const email = getAuthEmail();
    const code = getAuthCode();
    if (!email || !code) return;
    setAuthBusy(true);
    elements.authStatus.textContent = '正在登录...';
    try {
        const response = await fetch('/auth/email/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CLIENT-ID': USER_ID },
            body: JSON.stringify({ email, code })
        });
        if (!response.ok) throw new Error(await parseApiError(response));
        const data = await response.json();
        if (!data?.success || !data.token) throw new Error('登录失败，请重新获取验证码。');
        const remember = shouldRememberLogin();
        localStorage.setItem(AUTH_REMEMBER_KEY, remember ? "1" : "0");
        localStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_SESSION_TOKEN_KEY);
        if (remember) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        } else {
            sessionStorage.setItem(AUTH_SESSION_TOKEN_KEY, data.token);
        }
        state.authToken = data.token;
        state.authUser = data.user;
        renderAuthState();
        elements.authStatus.textContent = '登录成功。';
        showToast('登录成功');
        continueAfterLogin();
        setTimeout(closeAuthModal, 600);
    } catch (err) {
        elements.authStatus.textContent = authErrorMessage(err);
    } finally {
        setAuthBusy(false);
    }
}

async function logoutAuth() {
    try {
        if (state.authToken) {
            await apiPost('/auth/logout', {}, { auth: true });
        }
        localStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_SESSION_TOKEN_KEY);
        state.authToken = "";
        state.authUser = null;
        renderAuthState();
        showToast('已退出登录');
    } catch (err) {
        showToast('退出失败，请稍后再试');
    }
}

document.addEventListener('click', (e) => {
    const authTrigger = e.target.closest('#home-auth-open-btn, #auth-open-btn, #mobile-auth-open-btn');
    if (authTrigger) {
        e.preventDefault();
        openAuthModal();
        return;
    }
    const logoutTrigger = e.target.closest('#home-auth-logout-btn, #auth-logout-btn');
    if (logoutTrigger) {
        e.preventDefault();
        logoutAuth();
    }
});

function showToast(message) {
    let toast = document.getElementById('site-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'site-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove('visible');
    }, 1800);
}

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
    }
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    const success = document.execCommand('copy');
    document.body.removeChild(input);
    return success;
}

async function copyQQGroup(e) {
    const groupNumber = e.currentTarget.dataset.copyGroup || '1073677465';
    try {
        await copyText(groupNumber);
        showToast(`QQ群号已复制：${groupNumber}`);
    } catch (err) {
        showToast(`QQ群号：${groupNumber}`);
    }
}

async function submitFeedback() {
    const message = elements.feedbackMessage.value.trim();
    const email = elements.feedbackEmail.value.trim();
    if (message.length < 2) {
        elements.feedbackStatus.textContent = '先写一点反馈内容。';
        return;
    }
    elements.feedbackSubmitBtn.disabled = true;
    elements.feedbackStatus.textContent = '正在提交...';
    const res = await apiPost('/feedback', {
        message,
        email,
        page: window.location.pathname + window.location.hash,
        event_name: state.currentMode === 'story' ? state.currentEventId : '猜历史人物'
    });
    elements.feedbackSubmitBtn.disabled = false;
    if (!res || !res.success) {
        elements.feedbackStatus.textContent = '提交失败，请稍后再试。';
        return;
    }
    elements.feedbackStatus.textContent = '已收到，谢谢你。';
    elements.feedbackMessage.value = '';
    elements.feedbackEmail.value = '';
    setTimeout(closeFeedbackModal, 900);
}

// ================= 初始化与导航 =================

function hideHome() {
    elements.homeScreen?.classList.add('hidden');
    elements.appShell?.classList.remove('hidden');
    updateClassroomDemoVisibility();
}

function setRujuMode(enabled) {
    elements.appShell?.classList.toggle('ruju-mode', Boolean(enabled));
}

function setCareerMode(enabled) {
    elements.appShell?.classList.toggle('career-mode', Boolean(enabled));
}

function bindHistoricalRpgEntry() {
    const button = elements.travelStartBtn;
    if (!button || button.dataset.storyDemoBound === 'true') return;
    button.dataset.storyDemoBound = 'true';
    button.addEventListener('click', () => {
        if (isLawClassroomDemo()) {
            startTimeTravel();
            return;
        }
        // 非公开课：进入故事选择器选中的故事（当前默认第一个）
        const stories = state.story.list;
        if (stories && stories.length > 0) {
            enterStoryPanel(stories[0].story_id);
        }
    });
}

// ======== 多故事数据流（阶段三 Commit 4，UI 在阶段四） ========

// C3 流式打字速度：data/stories/README.md schema 文档定义
// slow≈60-80ms / normal≈35-40ms / fast≈28ms，默认 normal
const SANGUO_PACE_MS = { slow: 70, normal: 38, fast: 28 };
const SANGUO_PUNCT_PAUSE_MS = 95;        // 中文标点后额外停顿
const SANGUO_FIRST_CHAR_DELAY_MS = 80;   // 首字延迟（让上句余韵保留）
const SANGUO_PUNCT_RE = /[。！？；…]/;

async function fetchStoryList() {
    const res = await apiGet('/story/list');
    if (res?.success && Array.isArray(res.stories)) {
        state.story.list = res.stories;
    }
    return state.story.list;
}

async function fetchStoryManifest(storyId) {
    if (!storyId) return null;
    const res = await apiGet(`/story/${encodeURIComponent(storyId)}/manifest`);
    if (res?.success && res.manifest) {
        state.story.currentStoryId = storyId;
        state.story.currentManifest = res.manifest;
        return res.manifest;
    }
    return null;
}

async function startStorySession(storyId, loadSessionId = null) {
    if (!storyId) return null;
    const body = loadSessionId ? { load_session_id: loadSessionId } : {};
    const res = await apiPost(`/story/${encodeURIComponent(storyId)}/session/start`, body);
    if (res?.success) {
        state.story.currentStoryId = storyId;
        state.story.sessionId = res.session_id;
        state.story.sessionData = res;
        return res;
    }
    return null;
}

async function fetchStoryChapter(storyId, chapterId) {
    if (!storyId || !chapterId) return null;
    const res = await apiGet(`/story/${encodeURIComponent(storyId)}/chapter/${encodeURIComponent(chapterId)}`);
    if (res?.success && res.chapter) {
        state.story.currentChapter = res.chapter;
        // 建立 scene 索引便于 next 跳转
        const idx = {};
        (res.chapter.scenes || []).forEach(s => { if (s.scene_id) idx[s.scene_id] = s; });
        state.story.sceneIndex = idx;
        return res.chapter;
    }
    return null;
}

function getCurrentScene() {
    const sceneId = state.story.sessionData?.current_scene;
    return state.story.sceneIndex?.[sceneId] || null;
}

function getSceneBackgroundUrl(scene, chapter) {
    return scene?.background_image || chapter?.background_image || '';
}

function applyStoryEntryCopy() {
    // 公开课模式由 updateClassroomDemoVisibility 处理，本函数不动
    if (isLawClassroomDemo()) return;
    const stories = state.story.list;
    if (!stories || stories.length === 0) return;
    const first = stories[0];
    if (elements.rujuHeroTitle) elements.rujuHeroTitle.textContent = first.slogan || '人在局中，亲历历史';
    if (elements.rujuHeroCopy) elements.rujuHeroCopy.textContent = first.subtitle || '';
    if (elements.rujuEntryCardTitle) elements.rujuEntryCardTitle.textContent = first.title || '入局';
    if (elements.rujuEntryCardCopy) elements.rujuEntryCardCopy.textContent = first.subtitle || '';
    if (elements.rujuEventChipText) {
        const parts = [first.era, first.year_range, `约 ${first.estimated_hours} 小时`].filter(Boolean);
        elements.rujuEventChipText.textContent = parts.join(' · ');
    }
    if (elements.travelStartBtn) elements.travelStartBtn.textContent = '进入第一章';
    if (elements.rujuEntryActionLabel) {
        elements.rujuEntryActionLabel.textContent = `共 ${first.chapter_count} 章`;
    }
}

async function enterStoryPanel(storyId) {
    const manifest = await fetchStoryManifest(storyId);
    if (!manifest) {
        alert('无法加载故事 manifest');
        return;
    }
    const sessionInfo = await startStorySession(storyId);
    if (!sessionInfo) {
        alert('无法开启故事会话');
        return;
    }
    const chapter = await fetchStoryChapter(storyId, sessionInfo.current_chapter);
    if (!chapter) {
        alert('无法加载章节数据');
        return;
    }
    showTimeTravel();
    // sanguo-panel 用 position: fixed; inset: 0 直接覆盖整个浏览器视口
    // 不再用旧 ruju-mode/career-mode/ruju-playing 三联开关，避免触发旧
    // career/赤壁视觉局的布局规则。物理隔离最彻底。
    elements.sanguoPanel?.classList.remove('hidden');
    renderSanguoPanelShell(manifest, sessionInfo, chapter);
    startSanguoScene();
}

function exitStoryPanel() {
    sanguoClearTyping();
    elements.sanguoPanel?.classList.add('hidden');
}

/**
 * 渲染 sanguo-panel 持久结构：
 *  - 背景层 / 暗化叠层 / 顶栏 / 场景区
 *  - 场景区含 dialogue-box（speaker / text / continue-btn）
 * 流式渲染在 startTypingCurrentLine 操作内部 DOM，不重建整个 panel。
 */
function renderSanguoPanelShell(manifest, sessionInfo, chapter) {
    if (!elements.sanguoPanel) return;
    const scene = getCurrentScene();
    const bgUrl = getSceneBackgroundUrl(scene, chapter);
    const stationTitle = chapter?.title || '';

    elements.sanguoPanel.innerHTML = `
        <div class="sanguo-bg" data-sanguo-bg style="${bgUrl ? `background-image: url('${escapeAttr(bgUrl)}')` : ''}"></div>
        <div class="sanguo-shade"></div>
        <div class="sanguo-topbar">
            <div class="sanguo-topbar-title" data-sanguo-topbar-title>${escapeHtml(stationTitle)}</div>
            <div class="sanguo-topbar-icons">
                <button type="button" class="sanguo-topbar-icon" disabled title="笔记本（阶段四 P1）">卷</button>
                <button type="button" class="sanguo-topbar-icon" disabled title="自由对话（阶段五）">言</button>
                <button type="button" class="sanguo-topbar-icon" disabled title="背景音乐（阶段四 P2）">乐</button>
                <button type="button" class="sanguo-topbar-icon" data-story-action="exit-story" title="返回入局首页" aria-label="返回入局首页">×</button>
            </div>
        </div>
        <div class="sanguo-scene">
            <div class="sanguo-dialogue-box" data-sanguo-dialogue>
                <div class="sanguo-speaker" data-sanguo-speaker hidden></div>
                <p class="sanguo-text" data-sanguo-text aria-live="polite"></p>
                <button type="button" class="sanguo-continue-btn" data-sanguo-action="advance" aria-label="继续">显示全文</button>
                <div class="sanguo-choices" data-sanguo-choices hidden></div>
            </div>
        </div>
    `;
}

function startSanguoScene() {
    state.story.lineIndex = 0;
    startTypingCurrentLine();
}

function sanguoClearTyping() {
    state.story.typingToken += 1;
    if (state.story.typingTimer) {
        window.clearTimeout(state.story.typingTimer);
        state.story.typingTimer = null;
    }
    state.story.typing = false;
}

function startTypingCurrentLine() {
    sanguoClearTyping();
    const scene = getCurrentScene();
    const line = scene?.lines?.[state.story.lineIndex];
    if (!scene || !line) return;
    const dialogueBox = elements.sanguoPanel?.querySelector('[data-sanguo-dialogue]');
    const textEl = elements.sanguoPanel?.querySelector('[data-sanguo-text]');
    const speakerEl = elements.sanguoPanel?.querySelector('[data-sanguo-speaker]');
    const btnEl = elements.sanguoPanel?.querySelector('[data-sanguo-action="advance"]');
    if (!dialogueBox || !textEl) return;

    // 重置类型 class
    const lineType = line.type || 'narration';
    dialogueBox.className = 'sanguo-dialogue-box';
    dialogueBox.classList.add(`sanguo-line--${lineType}`);
    if (line.display_style === 'fullscreen_subtitle') {
        dialogueBox.classList.add('sanguo-line--fullscreen_subtitle');
    }
    if (lineType === 'dialogue' && line.speaker === '阿萤') {
        dialogueBox.classList.add('sanguo-speaker-ayinghuo');
    }

    // Speaker 渲染（仅 dialogue 显示）
    if (speakerEl) {
        if (lineType === 'dialogue' && line.speaker) {
            const stageStr = line.stage_direction
                ? ` <span class="sanguo-stage-dir">（${escapeHtml(line.stage_direction)}）</span>`
                : '';
            speakerEl.innerHTML = `<b>—— ${escapeHtml(line.speaker)}</b>${stageStr}`;
            speakerEl.hidden = false;
        } else {
            speakerEl.hidden = true;
            speakerEl.innerHTML = '';
        }
    }

    const content = String(line.text || '');
    const paceKey = (line.pace && SANGUO_PACE_MS[line.pace]) ? line.pace : 'normal';
    const charDelay = SANGUO_PACE_MS[paceKey];

    textEl.textContent = '';
    dialogueBox.classList.add('is-typing');
    if (btnEl) {
        btnEl.textContent = '显示全文';
        btnEl.classList.add('is-typing');
    }
    state.story.typing = true;
    state.story.typingToken += 1;
    const token = state.story.typingToken;

    if (!content) {
        finishTypingDOM();
        return;
    }
    let idx = 0;
    const step = () => {
        if (token !== state.story.typingToken) return;
        idx += 1;
        textEl.textContent = content.slice(0, idx);
        if (idx < content.length) {
            const prevChar = content[idx - 1] || '';
            const punctPause = SANGUO_PUNCT_RE.test(prevChar) ? SANGUO_PUNCT_PAUSE_MS : 0;
            state.story.typingTimer = window.setTimeout(step, charDelay + punctPause);
            return;
        }
        finishTypingDOM();
    };
    state.story.typingTimer = window.setTimeout(step, SANGUO_FIRST_CHAR_DELAY_MS);
}

function finishTypingDOM() {
    state.story.typingTimer = null;
    state.story.typing = false;
    const dialogueBox = elements.sanguoPanel?.querySelector('[data-sanguo-dialogue]');
    const btnEl = elements.sanguoPanel?.querySelector('[data-sanguo-action="advance"]');
    dialogueBox?.classList.remove('is-typing');
    const scene = getCurrentScene();
    const lineCount = scene?.lines?.length || 0;
    const isLast = state.story.lineIndex >= lineCount - 1;
    if (!btnEl) return;
    btnEl.classList.remove('is-typing');
    // C4: 末行 + narration_with_choice → 直接渲染印章选项，隐藏继续按钮
    if (isLast && scene?.type === 'narration_with_choice' && Array.isArray(scene?.choices) && scene.choices.length) {
        btnEl.hidden = true;
        renderSanguoChoices(scene);
        return;
    }
    // C5: 末行 + awaits_input → 渲染主角姓名输入框
    if (isLast && scene?.awaits_input === 'protagonist_name') {
        btnEl.hidden = true;
        renderSanguoNameInput(scene);
        return;
    }
    btnEl.hidden = false;
    btnEl.textContent = isLast ? '推进' : '继续';
}

function finishTyping() {
    if (!state.story.typing) return false;
    state.story.typingToken += 1;
    if (state.story.typingTimer) window.clearTimeout(state.story.typingTimer);
    const scene = getCurrentScene();
    const line = scene?.lines?.[state.story.lineIndex];
    const textEl = elements.sanguoPanel?.querySelector('[data-sanguo-text]');
    if (textEl) textEl.textContent = String(line?.text || '');
    finishTypingDOM();
    return true;
}

async function advanceSanguoLine() {
    if (finishTyping()) return;  // 流式中：先跳到全文
    const scene = getCurrentScene();
    if (!scene) return;
    const lineCount = scene.lines?.length || 0;
    if (state.story.lineIndex < lineCount - 1) {
        state.story.lineIndex += 1;
        startTypingCurrentLine();
        return;
    }
    // 已显示完所有 line，按 scene type 决定下一步
    await advanceSanguoSceneByType(scene);
}

async function advanceSanguoSceneByType(scene) {
    switch (scene.type) {
        case 'narration':
        case 'historical_distant_view': {
            if (!scene.next) { alert('当前场景无 next 字段。章节末请用 chapter_end type'); return; }
            await sanguoAdvanceToScene(scene.scene_id, scene.next);
            return;
        }
        case 'narration_with_choice':
            // 不应到这里——finishTypingDOM 末行已渲染选项；点击选项后由 handleSanguoChoice 处理
            return;
        case 'companion_free_talk':
        case 'historical_limited_talk':
            // C6 实现 AI 节点占位
            alert(`场景类型 ${scene.type} 由 C6 实现（in-character 占位）。当前 scene=${scene.scene_id}`);
            return;
        case 'chapter_end':
            // C6 实现章节切换
            alert(`章节切换由 C6 实现。本章结束。next_chapter=${scene.next_chapter || '(无)'}`);
            return;
        default:
            alert(`未知场景 type: ${scene.type}（scene=${scene.scene_id}）`);
    }
}

async function sanguoAdvanceToScene(fromScene, nextScene, nextChapter = null, choiceId = null) {
    const storyId = state.story.currentStoryId;
    const sessionId = state.story.sessionId;
    const body = { from_scene: fromScene, next_scene: nextScene };
    if (nextChapter) body.next_chapter = nextChapter;
    if (choiceId) body.choice_id = choiceId;
    const res = await apiPost(
        `/story/${encodeURIComponent(storyId)}/session/${encodeURIComponent(sessionId)}/advance`,
        body
    );
    if (!res?.success) { alert('推进失败'); return; }
    state.story.sessionData.current_scene = res.current_scene;
    state.story.sessionData.current_chapter = res.current_chapter;
    state.story.lineIndex = 0;
    resetSanguoChoiceDisplay();
    syncSanguoBackground();
    syncSanguoTopbar();
    startTypingCurrentLine();
}

// C4: 印章式选择呈现
function renderSanguoChoices(scene) {
    const choicesEl = elements.sanguoPanel?.querySelector('[data-sanguo-choices]');
    if (!choicesEl) return;
    const html = (scene.choices || []).map(c => {
        const cls = c.pending ? ' is-pending' : '';
        const titleAttr = c.pending ? ' title="此分支正在撰写中"' : '';
        return `<button type="button" class="sanguo-choice${cls}" data-sanguo-choice-id="${escapeAttr(c.id || '')}"${titleAttr}>
            <span class="sanguo-seal" aria-hidden="true"></span>
            <span class="sanguo-choice-text">${escapeHtml(c.text || '')}</span>
        </button>`;
    }).join('');
    choicesEl.innerHTML = html;
    choicesEl.hidden = false;
}

function resetSanguoChoiceDisplay() {
    const choicesEl = elements.sanguoPanel?.querySelector('[data-sanguo-choices]');
    const btnEl = elements.sanguoPanel?.querySelector('[data-sanguo-action="advance"]');
    if (choicesEl) {
        choicesEl.hidden = true;
        choicesEl.innerHTML = '';
    }
    if (btnEl) btnEl.hidden = false;
}

// C5: 主角姓名输入
function renderSanguoNameInput(scene) {
    const choicesEl = elements.sanguoPanel?.querySelector('[data-sanguo-choices]');
    if (!choicesEl) return;
    choicesEl.innerHTML = `
        <form class="sanguo-input-form" data-sanguo-input-form>
            <label class="sanguo-input-label" for="sanguo-name-input">请写下你的名字</label>
            <input id="sanguo-name-input" class="sanguo-input" type="text" maxlength="12"
                   data-sanguo-name-input placeholder="无名" autocomplete="off" spellcheck="false">
            <div class="sanguo-input-row">
                <span class="sanguo-input-hint">不填则默认"无名"</span>
                <button type="submit" class="sanguo-input-submit">写下</button>
            </div>
        </form>
    `;
    choicesEl.hidden = false;
    // 自动聚焦输入框，方便玩家直接打字
    setTimeout(() => {
        elements.sanguoPanel?.querySelector('[data-sanguo-name-input]')?.focus();
    }, 80);
}

async function handleSanguoSubmitName(rawName) {
    const storyId = state.story.currentStoryId;
    const sessionId = state.story.sessionId;
    const finalName = String(rawName || '').trim() || '无名';
    const res = await apiPost(
        `/story/${encodeURIComponent(storyId)}/session/${encodeURIComponent(sessionId)}/set_name`,
        { name: finalName }
    );
    if (!res?.success) { alert('设置姓名失败'); return; }
    state.story.sessionData.protagonist_name = res.protagonist_name;
    const scene = getCurrentScene();
    if (scene?.next) {
        await sanguoAdvanceToScene(scene.scene_id, scene.next);
    }
}

async function handleSanguoChoice(choiceId) {
    const scene = getCurrentScene();
    if (!scene || !Array.isArray(scene.choices)) return;
    const choice = scene.choices.find(c => c.id === choiceId);
    if (!choice) return;
    if (choice.pending) {
        // pending 分支：弹出温和提示，不推进
        alert(`此分支正在撰写中：${choice.text || ''}`);
        return;
    }
    // 选中印章效果（短暂视觉反馈）
    const btn = elements.sanguoPanel?.querySelector(`[data-sanguo-choice-id="${choiceId}"]`);
    if (btn) {
        btn.classList.add('is-selected');
        // 禁用所有按钮防止双击
        elements.sanguoPanel?.querySelectorAll('[data-sanguo-choice-id]').forEach(b => b.disabled = true);
    }
    // 短暂延迟让玩家看到印章红光后再推进
    await new Promise(r => setTimeout(r, 350));
    await sanguoAdvanceToScene(scene.scene_id, choice.next, null, choiceId);
}

function syncSanguoBackground() {
    const scene = getCurrentScene();
    const chapter = state.story.currentChapter;
    const bgEl = elements.sanguoPanel?.querySelector('[data-sanguo-bg]');
    if (!bgEl) return;
    const url = getSceneBackgroundUrl(scene, chapter);
    bgEl.style.backgroundImage = url ? `url('${url}')` : '';
}

function syncSanguoTopbar() {
    const chapter = state.story.currentChapter;
    const titleEl = elements.sanguoPanel?.querySelector('[data-sanguo-topbar-title]');
    if (titleEl) titleEl.textContent = chapter?.title || '';
}

function sanguoKeyboardHandler(e) {
    if (!elements.sanguoPanel || elements.sanguoPanel.classList.contains('hidden')) return;
    if (e.key !== ' ' && e.key !== 'Enter' && e.code !== 'Space') return;
    // 不抢输入框焦点
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
    e.preventDefault();
    advanceSanguoLine();
}

function showHome() {
    if (isLawClassroomDemo()) {
        showTimeTravel({ privateEntry: true });
        return;
    }
    state.currentMode = "home";
    setRujuMode(false);
    setCareerMode(false);
    window.history.pushState(null, "", window.location.pathname + window.location.search);
    elements.homeScreen?.classList.remove('hidden');
    elements.appShell?.classList.add('hidden');
    elements.storySplash.classList.remove('hidden');
    elements.storyContent.classList.add('hidden');
    elements.guessGameContent.classList.add('hidden');
    elements.timeTravelContent?.classList.add('hidden');
    elements.careerPrototypePanel?.classList.add('hidden');
    elements.sanguoPanel?.classList.add('hidden');
    elements.chatSection?.classList?.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
        el.classList.add('border-transparent');
    });
}

function getDefaultEvent() {
    return state.eventsList.find(item => item.id === "秦朝·一统六国")
        || state.eventsList.find(item => !item.isSummary)
        || state.eventsList[0]
        || { id: DEFAULT_EVENT_ID };
}

function enterFromHome() {
    const event = getDefaultEvent();
    if (event) {
        loadEvent(event.id);
    }
}

function showFeatureNotice(message = "这个玩法正在开发中，暂未开放。") {
    alert(message);
}

async function loadTravelScenes() {
    if (!elements.travelSceneSelect) return;
    const res = await apiGet('/time_travel/scenes');
    if (!res?.success || !Array.isArray(res.scenes)) return;
    const currentValue = elements.travelSceneSelect.value;
    const options = ['<option value="">随机抽取</option>'];
    res.scenes.forEach(scene => {
        if (!scene?.scene_id || !scene?.title) return;
        const labelParts = [scene.era, scene.title].filter(Boolean);
        const label = labelParts.length ? labelParts.join(' · ') : scene.title;
        options.push(`<option value="${escapeHtml(scene.scene_id)}">${escapeHtml(label)}</option>`);
    });
    elements.travelSceneSelect.innerHTML = options.join('');
    if (currentValue && [...elements.travelSceneSelect.options].some(option => option.value === currentValue)) {
        elements.travelSceneSelect.value = currentValue;
    } else if (decodeURIComponent(window.location.hash.substring(1)) === PRIVATE_TIME_TRAVEL_HASH
        && [...elements.travelSceneSelect.options].some(option => option.value === VISUAL_NOVEL_SCENE_ID)) {
        elements.travelSceneSelect.value = VISUAL_NOVEL_SCENE_ID;
    }
}

async function init() {
    trackAnalytics('visit');
    // 把 sanguo-panel reparent 到 <body> 直接子级
    // 避免被 .app-shell / main / #time-travel-content 任一祖先的
    // transform/filter/will-change 困住 position:fixed（退化为 absolute）
    if (elements.sanguoPanel && elements.sanguoPanel.parentElement !== document.body) {
        document.body.appendChild(elements.sanguoPanel);
    }
    bindHistoricalRpgEntry();
    elements.homeStartBtn?.addEventListener('click', enterFromHome);
    // sanguo-panel 的事件委托：退出按钮 + 字幕推进按钮 + 印章选项
    elements.sanguoPanel?.addEventListener('click', (e) => {
        if (e.target?.closest?.('[data-sanguo-action="advance"]')) {
            e.preventDefault();
            advanceSanguoLine();
            return;
        }
        const choiceBtn = e.target?.closest?.('[data-sanguo-choice-id]');
        if (choiceBtn) {
            e.preventDefault();
            handleSanguoChoice(choiceBtn.dataset.sanguoChoiceId);
            return;
        }
        if (e.target?.closest?.('[data-story-action="exit-story"]')) {
            exitStoryPanel();
        }
    });
    // C5: 主角姓名输入表单提交
    elements.sanguoPanel?.addEventListener('submit', (e) => {
        const form = e.target?.closest?.('[data-sanguo-input-form]');
        if (!form) return;
        e.preventDefault();
        const input = form.querySelector('[data-sanguo-name-input]');
        handleSanguoSubmitName(input?.value);
    });
    // 键盘 Space / Enter 推进
    document.addEventListener('keydown', sanguoKeyboardHandler);
    updateClassroomDemoVisibility();
    loadTravelScenes();
    // 拉故事列表 + 应用入口文案（公开课模式由 applyStoryEntryCopy 自动跳过）
    fetchStoryList().then(() => applyStoryEntryCopy()).catch(() => {});
    // 1. 获取导航目录
    const res = await apiGet('/events_list');
    if(res && res.success) {
        state.eventsList = res.data;
        renderNav(res.data);
        
        const hash = decodeURIComponent(window.location.hash.substring(1));
        if(hash === "guess-game") {
            showGuessGame();
        } else if(hash === PRIVATE_TIME_TRAVEL_HASH) {
            showTimeTravel({ privateEntry: true });
        } else if(hash === "time-travel") {
            showTimeTravel();
        } else if(hash) {
            loadEvent(hash);
        } else {
            showHome();
        }
    } else {
        elements.navContainer.innerHTML = '<div class="text-red-500 text-center text-sm p-4">无法加载中央档案，请刷新重试。</div>';
    }
    
    elements.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserSubmit();
    });

    elements.navContainer.addEventListener('click', (e) => {
        const gameLink = e.target.closest('[data-game]');
        if (gameLink) {
            e.preventDefault();
            if (gameLink.dataset.game === "time-travel") {
                showTimeTravel();
            } else {
                showGuessGame();
            }
            return;
        }
        const dynastyToggle = e.target.closest('[data-dynasty-toggle]');
        if (dynastyToggle) {
            e.preventDefault();
            dynastyToggle.closest('.nav-dynasty-group')?.classList.toggle('collapsed');
            return;
        }
        const link = e.target.closest('.nav-item');
        if (!link) return;
        e.preventDefault();
        loadEvent(link.dataset.eventId);
    });

    document.querySelectorAll('[data-top-action]').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.topAction;
            if (action === "default") {
                document.querySelectorAll('[data-top-action]').forEach(item => item.classList.toggle('active', item === button));
                showHome();
            } else if (action === "archive") {
                document.querySelectorAll('[data-top-action]').forEach(item => item.classList.toggle('active', item === button));
                const event = getDefaultEvent();
                if (event) loadEvent(event.id);
            } else if (action === "guess-game") {
                document.querySelectorAll('[data-top-action]').forEach(item => item.classList.toggle('active', item === button));
                showGuessGame();
            } else if (action === "time-travel") {
                if (isLawClassroomDemo()) {
                    showTimeTravel({ privateEntry: true });
                } else {
                    showTimeTravel();
                }
            } else {
                document.querySelectorAll('[data-top-action]').forEach(item => item.classList.toggle('active', item === button));
                const event = getDefaultEvent();
                if (event) loadEvent(event.id);
            }
        });
    });
    elements.topbarAuthBtn?.addEventListener('click', openAuthModal);

    elements.charBtnsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('[data-char]');
        if (!button) return;
        setAtTarget(button.dataset.char);
    });

    elements.storyDetails.addEventListener('click', (e) => {
        const link = e.target.closest('[data-event-link]');
        if (!link) return;
        e.preventDefault();
        loadEvent(link.dataset.eventLink);
    });

    elements.answerModeOptions.addEventListener('click', (e) => {
        const button = e.target.closest('[data-mode]');
        if (!button) return;
        state.answerMode = button.dataset.mode;
        localStorage.setItem('traeHistoryAnswerMode', state.answerMode);
        renderAnswerModeOptions();
    });
    renderAnswerModeOptions();

    elements.btnClear.addEventListener('click', () => {
        if(!state.currentEventId) return;
        if(confirm(`确定要销毁【${state.currentEventId}】的所有档案记录并重新访谈吗？`)) {
            state.chatHistory[state.currentEventId] = [];
            saveChatToServer();
            renderChat({ stickToBottom: true });
        }
    });

    elements.guessStartBtn.addEventListener('click', startGuessGame);
    elements.guessResetBtn.addEventListener('click', resetGuessGame);
    elements.guessRevealBtn.addEventListener('click', revealGuessGameAnswer);
    elements.guessAskBtn.addEventListener('click', askGuessGameQuestion);
    elements.guessGuessBtn.addEventListener('click', guessAiPerson);
    elements.guessUserAnswer.addEventListener('click', handleUserYesNoAnswer);
    elements.careerPrototypePanel?.addEventListener('submit', handleCareerPanelSubmit);
    elements.careerPrototypePanel?.addEventListener('click', handleCareerPanelClick);
    elements.travelRestartBtn?.addEventListener('click', () => startTimeTravel({ sceneId: state.timeTravel.activeSceneId || VISUAL_NOVEL_SCENE_ID }));
    elements.travelChoiceList?.addEventListener('click', handleTravelChoice);
    elements.visualChoiceList?.addEventListener('click', handleTravelChoice);
    elements.timeTravelContent?.addEventListener('click', (e) => {
        const glossaryButton = e.target.closest('[data-glossary-term]');
        if (glossaryButton) {
            e.preventDefault();
            e.stopPropagation();
            openClassroomGlossary(glossaryButton.dataset.glossaryTerm || "");
            return;
        }
        const verdictButton = e.target.closest('[data-verdict-action]');
        if (verdictButton) {
            handleVerdictAction(verdictButton.dataset.verdictAction || "");
            return;
        }
        const button = e.target.closest('[data-classroom-scene]');
        if (!button) return;
        if (!isLawClassroomDemo()) return;
        startTimeTravel({ sceneId: button.dataset.classroomScene });
    });
    elements.timeTravelContent?.addEventListener('submit', (e) => {
        const form = e.target.closest('[data-classroom-historian-form]');
        if (!form) return;
        e.preventDefault();
        submitClassroomHistorianQuestion(form);
    });
    elements.travelTalkBtn?.addEventListener('click', talkTimeTravel);
    elements.travelDecideBtn?.addEventListener('click', openTravelDecisionModal);
    elements.travelDecisionClose?.addEventListener('click', closeTravelDecisionModal);
    elements.travelDecisionCancel?.addEventListener('click', closeTravelDecisionModal);
    elements.travelDecisionPublish?.addEventListener('click', publishTravelDecision);
    elements.travelDecisionModal?.addEventListener('click', (e) => {
        if (e.target === elements.travelDecisionModal) closeTravelDecisionModal();
    });
    elements.visualMapBtn?.addEventListener('click', openChibiMapModal);
    elements.chibiMapClose?.addEventListener('click', closeChibiMapModal);
    elements.chibiMapModal?.addEventListener('click', (e) => {
        if (e.target === elements.chibiMapModal) closeChibiMapModal();
    });
    elements.travelVisualStage?.addEventListener('click', (e) => {
        if (!e.target.closest?.('.ruju-continue-btn')) return;
        advanceVisualDialogue();
    });
    elements.visualOverlayHint?.addEventListener('click', (e) => {
        e.stopPropagation();
        advanceVisualDialogue();
    });
    elements.visualDialogueContinue?.addEventListener('click', (e) => {
        e.stopPropagation();
        advanceVisualDialogue();
    });
    elements.visualPrevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        retreatVisualDialogue();
    });
    elements.visualNextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        browseVisualDialogueForward();
    });
    elements.visualInputForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitVisualNovelInput(false);
    });
    elements.visualDecideBtn?.addEventListener('click', () => {
        submitVisualNovelInput(false, { endTurn: true });
    });
    document.addEventListener('keydown', (e) => {
        const glossaryModal = document.getElementById('classroom-glossary-modal');
        if (e.key === 'Escape' && glossaryModal && !glossaryModal.classList.contains('hidden')) {
            e.preventDefault();
            closeClassroomGlossary();
            return;
        }
        const historyModal = document.getElementById('classroom-history-modal');
        if (e.key === 'Escape' && historyModal && !historyModal.classList.contains('hidden')) {
            e.preventDefault();
            closeClassroomHistory();
            return;
        }
        if (e.key === 'Escape' && !elements.classroomReflectionModal?.classList.contains('hidden')) {
            e.preventDefault();
            closeClassroomReflectionModal();
            return;
        }
        if (e.key === 'Escape' && !elements.chibiMapModal?.classList.contains('hidden')) {
            e.preventDefault();
            closeChibiMapModal();
            return;
        }
        if (state.currentMode !== "time-travel") return;
        if (elements.travelVisualPanel?.classList.contains('hidden')) return;
        if (!["Enter", " "].includes(e.key) && e.code !== "Space") return;
        const target = e.target;
        if (target?.closest?.('input, button, textarea, select')) return;
        e.preventDefault();
        advanceVisualDialogue();
    });
    elements.travelTalkInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            talkTimeTravel();
        }
    });
    elements.travelDecisionInput?.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            publishTravelDecision();
        }
    });
    elements.feedbackOpenBtn?.addEventListener('click', openFeedbackModal);
    elements.mobileFeedbackBtn?.addEventListener('click', openFeedbackModal);
    elements.homeAuthOpenBtn?.addEventListener('click', openAuthModal);
    elements.homeAuthLogoutBtn?.addEventListener('click', logoutAuth);
    elements.authCloseBtn?.addEventListener('click', closeAuthModal);
    elements.authModal?.addEventListener('click', (e) => {
        if (e.target === elements.authModal) closeAuthModal();
    });
    elements.authCodeBtn?.addEventListener('click', requestAuthCode);
    elements.authLoginBtn?.addEventListener('click', loginWithEmail);
    elements.authEmail?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            requestAuthCode();
        }
    });
    elements.authCode?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginWithEmail();
        }
    });
    document.querySelectorAll('[data-copy-group]').forEach(button => {
        button.addEventListener('click', copyQQGroup);
    });
    elements.feedbackCloseBtn.addEventListener('click', closeFeedbackModal);
    elements.feedbackModal.addEventListener('click', (e) => {
        if (e.target === elements.feedbackModal) closeFeedbackModal();
    });
    elements.feedbackSubmitBtn.addEventListener('click', submitFeedback);
    elements.classroomReflectionClose?.addEventListener('click', closeClassroomReflectionModal);
    elements.classroomReflectionModal?.addEventListener('click', (e) => {
        if (e.target === elements.classroomReflectionModal) closeClassroomReflectionModal();
    });
    elements.classroomReflectionForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitClassroomReflection();
    });
    initRememberLoginOption();
    loadAuthUser();
    loadSiteConfig();
}

// 使用 base64 编码来避免特殊字符影响 ID 选择器，更安全
function safeId(str) {
    return 'nav-link-' + btoa(encodeURIComponent(str)).replace(/[/+=]/g, '');
}

function renderNav(events) {
    // 将一维数组按朝代分组
    const groupByDynasty = {};
    events.forEach(e => {
        if(!groupByDynasty[e.dynasty]) groupByDynasty[e.dynasty] = [];
        groupByDynasty[e.dynasty].push(e);
    });

    let html = '';
    for(const dynasty in groupByDynasty) {
        html += `<div class="nav-dynasty-group collapsed mb-3">
            <button type="button" data-dynasty-toggle class="nav-dynasty-toggle text-[#e8d5c4] font-bold text-sm mb-2 px-2 flex items-center gap-1 w-full">
                <span class="w-1.5 h-4 bg-[#c62828] inline-block rounded-sm"></span>
                <span class="nav-caret">▸</span>
                ${escapeHtml(dynasty)}档案
            </button>
            <ul class="nav-dynasty-list space-y-1">
        `;
        groupByDynasty[dynasty].forEach(ev => {
            const sideClass = ev.isSideQuest ? ' nav-item-side' : '';
            const itemIcon = ev.isSummary ? '纲' : (ev.isSideQuest ? '支' : '卷');
            html += `
                <li>
                    <a href="#${encodeURIComponent(ev.id)}"
                       data-event-id="${escapeAttr(ev.id)}"
                       id="${safeId(ev.id)}"
                       class="nav-item${sideClass} block px-4 py-2 text-sm text-[#d4c3af] hover:bg-[#c62828]/10 hover:text-[#f0c9a8] rounded border-l-2 border-transparent transition-all truncate"
                       title="${escapeAttr(ev.title)}">
                       <span class="nav-item-icon">${itemIcon}</span>
                       <span class="nav-item-text">${escapeHtml(ev.title)}</span>
                    </a>
                </li>
            `;
        });
        html += `</ul></div>`;
    }
    elements.navContainer.innerHTML = html;
}

function updateNavHighlight(activeId) {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
        el.classList.add('border-transparent');
    });
    const activeEl = document.getElementById(safeId(activeId));
    if(activeEl) {
        activeEl.classList.remove('border-transparent');
        activeEl.classList.add('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
    }
}

// ================= 加载剧本案件 =================
async function loadEvent(eventId) {
    if(state.isLoading) return;
    state.isLoading = true;
    hideHome();
    setRujuMode(false);
    
    window.location.hash = eventId;
    state.currentMode = "story";
    updateNavHighlight(eventId);
    
    elements.storySplash.classList.remove('hidden');
    elements.storyContent.classList.add('hidden');
    elements.guessGameContent.classList.add('hidden');
    elements.timeTravelContent?.classList.add('hidden');
    elements.chatSection?.classList?.remove('hidden');
    
    const res = await apiGet(`/event?name=${encodeURIComponent(eventId)}`);
    if(res && res.success) {
        state.currentEventId = res.full_name;
        state.currentEventData = res.data;
        trackAnalytics('event_view', { event_name: state.currentEventId });
        state.currentTarget = "所有参与人";
        elements.currentAtBadge.classList.add('hidden');
        
        renderStory(res.data);
        
        if(!state.chatHistory[state.currentEventId]) {
            const historyRes = await apiGet(`/chat_history?event_name=${encodeURIComponent(state.currentEventId)}`, {
                headers: { 'X-CLIENT-ID': USER_ID }
            });
            state.chatHistory[state.currentEventId] = (historyRes && historyRes.messages) ? historyRes.messages : [];
        }
        
        const canChat = renderChatControls();
        renderChat({ stickToBottom: true });
        
        elements.chatInput.disabled = !canChat;
        elements.chatSubmit.disabled = !canChat;
        
    } else {
        alert("时空卷轴读取失败，无法找到该事件");
    }
    
    state.isLoading = false;
}

function renderStory(data) {
    elements.storySplash.classList.add('hidden');
    elements.storyContent.classList.remove('hidden');
    const isDynastySkeleton = data.summary_type === 'dynasty_skeleton';
    elements.storyContent.classList.toggle('story-content-skeleton', isDynastySkeleton);
    elements.storyContainer?.classList.toggle('story-container-skeleton', isDynastySkeleton);
    
    elements.manuscriptStamp.innerText = data.manuscript || 'TOP SECRET DOCUMENT';
    elements.storyTitle.innerText = data.title || '无名卷宗';
    elements.storyTime.innerText = data.time || '未知';
    elements.storyLocation.innerText = data.location || '未知';
    elements.storyCharactersList.innerText = (data.characters || []).join(' 、 ');
    
    if(data.image) {
        elements.storyImg.src = data.image;
        elements.storyImgContainer.classList.remove('hidden');
    } else {
        elements.storyImgContainer.classList.add('hidden');
    }
    
    // 渲染正文HTML
    let storyHtml = isDynastySkeleton
        ? renderDynastySkeleton(data)
        : enhanceStoryKeywords(sanitizeStoryHtml(data.story || ''), data.keywords || []);
    if (data.next_event) {
        const nextTitle = String(data.next_event).split('·').pop();
        const nextNote = data.next_note || `读完本案，可以继续看「${nextTitle}」，把这一段历史接起来。`;
        storyHtml += `
            <div class="next-event-card">
                <div class="next-event-label">下一案</div>
                <p>${escapeHtml(nextNote)}</p>
                <a href="#${encodeURIComponent(data.next_event)}" data-event-link="${escapeAttr(data.next_event)}">继续调阅：${escapeHtml(nextTitle)}</a>
            </div>
        `;
    }
    elements.storyDetails.innerHTML = storyHtml;
    
    // 让卷宗滚回顶部
    elements.storyContent.parentElement.parentElement.scrollTop = 0;
}

function renderDynastySkeleton(data) {
    const nodes = data.skeleton_nodes || [];
    const pillars = data.pillars || [];
    const cracks = data.cracks || [];
    const takeaways = data.takeaways || [];
    const heroImage = data.hero_image || data.image || '';
    const titleParts = String(data.title || '').split(/[：:]/);
    const heroTitle = titleParts[0] || data.title || '';
    const heroSubtitle = titleParts.slice(1).join('：') || data.summary_title || '';
    const heroTags = data.hero_tags || [
        nodes[0]?.label || '朝代开端',
        pillars[1]?.title || '制度骨架',
        cracks[0]?.title || '历史转折'
    ];

    const nodeHtml = nodes.map((node, index) => `
        <a class="skeleton-node" href="#${encodeURIComponent(node.event || '')}" data-event-link="${escapeAttr(node.event || '')}">
            <span class="skeleton-node-index">${String(index + 1).padStart(2, '0')}</span>
            <span class="skeleton-node-title">${escapeHtml(node.label || '')}</span>
            <span class="skeleton-node-stage">${escapeHtml(node.stage || '')}</span>
            <span class="skeleton-node-note">${escapeHtml(node.note || '')}</span>
        </a>
    `).join('');

    const pillarHtml = pillars.map((item, index) => `
        <div class="skeleton-card">
            <span class="skeleton-card-index">${String(index + 1).padStart(2, '0')}</span>
            <div>
                <div class="skeleton-card-title">${escapeHtml(item.title || '')}</div>
                <p>${escapeHtml(item.body || '')}</p>
            </div>
        </div>
    `).join('');

    const crackHtml = cracks.map((item, index) => `
        <div class="skeleton-card skeleton-card-crack">
            <span class="skeleton-card-index">${String(index + 1).padStart(2, '0')}</span>
            <div>
                <div class="skeleton-card-title">${escapeHtml(item.title || '')}</div>
                <p>${escapeHtml(item.body || '')}</p>
            </div>
        </div>
    `).join('');

    const takeawayHtml = takeaways.map(item => `<li><span></span>${escapeHtml(item)}</li>`).join('');
    const tagHtml = heroTags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
    const archiveTitleHtml = (title, emphasis) => {
        const rawTitle = String(title || '');
        const rawEmphasis = String(emphasis || '');
        if (!rawTitle) return '';
        if (!rawEmphasis || !rawTitle.includes(rawEmphasis)) {
            return escapeHtml(rawTitle);
        }
        const [before, after] = rawTitle.split(rawEmphasis, 2);
        return `${escapeHtml(before)}<span>${escapeHtml(rawEmphasis)}</span>${escapeHtml(after)}`;
    };
    const archivePillarsTitle = data.archive_pillars_title || `${heroTitle || '本朝'}的骨架如何形成？`;
    const archivePillarsEmphasis = data.archive_pillars_emphasis || '';
    const archiveCracksTitle = data.archive_cracks_title || `${heroTitle || '本朝'}的裂痕从哪里开始？`;
    const archiveCracksEmphasis = data.archive_cracks_emphasis || '';

    return `
        <section class="dynasty-skeleton">
            <div class="skeleton-hero" style="background-image: linear-gradient(90deg, rgba(42, 25, 17, 0.82), rgba(42, 25, 17, 0.52) 45%, rgba(42, 25, 17, 0.1)), url('${escapeAttr(heroImage)}');">
                <div class="skeleton-hero-content">
                    <div class="skeleton-manuscript">${escapeHtml(data.manuscript || '第一卷 · 秦')}</div>
                    <h2><span>${escapeHtml(heroTitle)}</span><em>${escapeHtml(heroSubtitle)}</em></h2>
                    <p>${escapeHtml(data.summary_intro || '')}</p>
                    <div class="skeleton-hero-tags">${tagHtml}</div>
                </div>
            </div>

            <div class="skeleton-section skeleton-line-section">
                <div class="skeleton-section-title">${escapeHtml(data.skeleton_line_title || '帝国主线：朝代兴亡关键节点')}</div>
                <div class="skeleton-flow">${nodeHtml}</div>
            </div>

            <div class="skeleton-archive-grid">
                <div class="skeleton-archive-card skeleton-archive-card-rise">
                    <div class="skeleton-archive-label">第一份案卷</div>
                    <div class="skeleton-archive-title">${archiveTitleHtml(archivePillarsTitle, archivePillarsEmphasis)}</div>
                    <div class="skeleton-card-list">${pillarHtml}</div>
                </div>
                <div class="skeleton-archive-card skeleton-archive-card-fall">
                    <div class="skeleton-archive-label">第二份案卷</div>
                    <div class="skeleton-archive-title">${archiveTitleHtml(archiveCracksTitle, archiveCracksEmphasis)}</div>
                    <div class="skeleton-card-list">${crackHtml}</div>
                </div>
            </div>

            <div class="skeleton-verdict">
                <div class="skeleton-verdict-seal">史官结语</div>
                <ol>${takeawayHtml}</ol>
            </div>
        </section>
    `;
}

function renderChatControls() {
    const chars = state.currentEventData.characters || [];
    if (chars.length === 0) {
        state.currentTarget = "所有参与人";
        elements.charBtnsContainer.innerHTML = '<div class="chat-unavailable-note">这一页是朝代骨架总结，可点击左侧或上方主线节点进入具体事件后再提问。</div>';
        elements.currentAtBadge.classList.add('hidden');
        elements.chatInput.placeholder = "进入具体事件后可向人物提问";
        return false;
    }

    let html = '';
    chars.forEach(char => {
        const isSelected = char === state.currentTarget;
        const baseClass = "px-4 py-1.5 rounded-full text-sm transition-all border whitespace-nowrap flex-shrink-0 font-bold tracking-wide";
        const stateClass = isSelected 
                        ? "bg-[#e7dbce] text-[#5c1313] border-[#5c1313] shadow-md shadow-[#5c1313]/30" 
                        : "bg-transparent text-[#8c7a66] border-[#d4c3af] hover:border-[#8c7a66]";
        
        html += `<button type="button" data-char="${escapeAttr(char)}" class="${baseClass} ${stateClass}">@ ${escapeHtml(char)}</button>`;
    });
    
    // 取消@群体模式钮
    const isAll = state.currentTarget === "所有参与人";
    html += `<button type="button" data-char="所有参与人" class="px-3 py-1.5 rounded-full text-sm transition-all border whitespace-nowrap flex-shrink-0 tracking-wide ${isAll ? 'bg-transparent border-[#8c7a66] text-[#8c7a66]' : 'bg-transparent text-[#bcaea1] border-[#d4c3af] hover:text-[#8c7a66]'}">群聊模式</button>`;

    elements.charBtnsContainer.innerHTML = html;
    
    if(isAll) {
        elements.currentAtBadge.classList.add('hidden');
        elements.chatInput.placeholder = "输入问题（全局对话中）...";
    } else {
        elements.currentAtBadge.classList.remove('hidden');
        elements.currentAtBadge.innerText = `@ ${state.currentTarget}`;
        elements.chatInput.placeholder = `正在连线 @${state.currentTarget}...`;
    }
    return true;
}

function showGuessGame() {
    hideHome();
    setRujuMode(false);
    setCareerMode(false);
    state.currentMode = "guess";
    window.location.hash = "guess-game";
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
        el.classList.add('border-transparent');
    });
    document.querySelector('[data-game="guess-person"]')?.classList.add('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
    elements.storySplash.classList.add('hidden');
    elements.storyContent.classList.add('hidden');
    elements.storyContainer?.classList.remove('story-container-skeleton');
    elements.guessGameContent.classList.remove('hidden');
    elements.timeTravelContent?.classList.add('hidden');
    elements.careerPrototypePanel?.classList.add('hidden');
    elements.chatSection.classList.add('hidden');
}

function showTimeTravel(options = {}) {
    hideHome();
    updateClassroomDemoVisibility();
    setRujuMode(true);
    setCareerMode(false);
    state.currentMode = "time-travel";
    window.location.hash = options.privateEntry ? PRIVATE_TIME_TRAVEL_HASH : "time-travel";
    elements.timeTravelContent?.classList.toggle('ruju-playing', Boolean(state.timeTravel.payload));
    document.querySelectorAll('[data-top-action]').forEach(item => {
        item.classList.toggle('active', item.dataset.topAction === "time-travel");
    });
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
        el.classList.add('border-transparent');
    });
    document.querySelector('[data-game="time-travel"]')?.classList.add('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
    elements.storySplash.classList.add('hidden');
    elements.storyContent.classList.add('hidden');
    elements.guessGameContent.classList.add('hidden');
    elements.storyContainer?.classList.remove('story-container-skeleton');
    elements.timeTravelContent?.classList.remove('hidden');
    elements.chatSection.classList.add('hidden');
    if (!state.timeTravel.payload) {
        elements.travelStartPanel?.classList.remove('hidden');
        elements.careerPrototypePanel?.classList.add('hidden');
        elements.travelPlayPanel?.classList.add('hidden');
    }
}

function careerQuestionTypeLabel(type = "") {
    return type || "治理取向";
}

function renderCareerExam(prototype = {}, questionIndex = state.career.currentQuestionIndex || 0) {
    const questions = Array.isArray(prototype.questions) ? prototype.questions : [];
    const safeIndex = Math.max(0, Math.min(questionIndex, Math.max(questions.length - 1, 0)));
    state.career.currentQuestionIndex = safeIndex;
    const question = questions[safeIndex] || {};
    const selectedValue = state.career.answers?.[question.id] || "";
    const progressPercent = questions.length ? Math.round(((safeIndex + 1) / questions.length) * 100) : 0;
    const meta = [prototype.era, prototype.year, prototype.location].filter(Boolean).join(" · ");
    elements.careerPrototypePanel.innerHTML = `
        <div class="career-shell">
            <header class="career-head">
                <button type="button" class="career-back-btn" data-career-action="back">返回入口</button>
                <span>正式入局原型</span>
                <h2>${escapeHtml(prototype.title || "唐代县衙入仕考选")}</h2>
                <p>${escapeHtml(meta)}</p>
            </header>
            <section class="career-intro">
                <b>测评说明</b>
                <p>${escapeHtml(prototype.exam_intro || "")}</p>
            </section>
            <div class="career-progress" aria-label="测评进度">
                <div>
                    <b>第 ${safeIndex + 1} 题 / 共 ${questions.length} 题</b>
                    <span>${progressPercent}%</span>
                </div>
                <i><em style="width:${progressPercent}%"></em></i>
            </div>
            <form class="career-exam-form" data-career-exam-form>
                <fieldset class="career-question">
                    <legend>
                        <span>${String(safeIndex + 1).padStart(2, "0")}</span>
                        <em>${escapeHtml(careerQuestionTypeLabel(question.type))}</em>
                    </legend>
                    <h3>${escapeHtml(question.prompt || "")}</h3>
                    <div class="career-options">
                        ${(question.options || []).map(option => `
                            <label>
                                <input type="radio" name="${escapeAttr(question.id || "")}" value="${escapeAttr(option.id || "")}"${selectedValue === option.id ? " checked" : ""} required>
                                <span>${escapeHtml(option.id || "")}</span>
                                <b>${escapeHtml(option.text || "")}</b>
                            </label>
                        `).join("")}
                    </div>
                </fieldset>
                <div class="career-submit-row">
                    ${safeIndex > 0 ? '<button type="button" data-career-action="prev" class="career-secondary-btn">上一题</button>' : ''}
                    <button type="submit">${safeIndex >= questions.length - 1 ? "完成测评，等待授官" : "继续"}</button>
                    <p>没有绝对正确答案，每个选择都会形成不同治理画像。</p>
                </div>
            </form>
        </div>
    `;
}

function renderCareerResult(prototype = {}, result = {}) {
    const office = result.office || {};
    const scores = Array.isArray(result.scores) ? result.scores : [];
    const preview = Array.isArray(prototype.next_loop_preview) ? prototype.next_loop_preview : [];
    elements.careerPrototypePanel.innerHTML = `
        <div class="career-shell career-result-shell">
            <header class="career-head">
                <button type="button" class="career-back-btn" data-career-action="restart">重新考选</button>
                <span>铨选结果</span>
                <h2>授 ${escapeHtml(office.title || "县尉")}</h2>
                <p>${escapeHtml(office.rank || "")}</p>
            </header>
            <section class="career-result-card">
                <b>治理画像</b>
                <p>${escapeHtml(result.profile || "")}</p>
                <p>${escapeHtml(office.grant_text || "")}</p>
            </section>
            <section class="career-office-card">
                <b>当前职责</b>
                <p>${escapeHtml(office.duty || "")}</p>
            </section>
            <section class="career-score-grid">
                ${scores.map(item => `
                    <article>
                        <div>
                            <b>${escapeHtml(item.label || "")}</b>
                            <span>${Number(item.value || 0)}</span>
                        </div>
                        <p>${escapeHtml(item.description || "")}</p>
                    </article>
                `).join("")}
            </section>
            <section class="career-next-card">
                <b>下一步要接的政务循环</b>
                <ul>
                    ${preview.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
            </section>
            <div class="career-submit-row">
                <button type="button" data-career-action="appoint">领告身，赴任县衙</button>
                <button type="button" data-career-action="restart">重新考选</button>
                <button type="button" data-career-action="back" class="career-secondary-btn">返回入口</button>
            </div>
        </div>
    `;
}

function careerStatClass(value) {
    const number = Number(value || 0);
    if (number >= 60) return "is-high";
    if (number <= 40) return "is-low";
    return "";
}

function renderCareerStats(stats = {}, labels = {}) {
    return `
        <section class="career-stat-grid">
            ${Object.entries(stats).map(([key, value]) => `
                <article class="${careerStatClass(value)}">
                    <span>${escapeHtml(labels[key] || key)}</span>
                    <b>${Number(value || 0)}</b>
                </article>
            `).join("")}
        </section>
    `;
}

function renderCareerStatsCompact(stats = {}, labels = {}) {
    return `
        <div class="career-vn-stats">
            ${Object.entries(stats).map(([key, value]) => `
                <span class="${careerStatClass(value)}">
                    ${escapeHtml(labels[key] || key)}
                    <b>${Number(value || 0)}</b>
                </span>
            `).join("")}
        </div>
    `;
}

function normalizeCareerDialogue(items = []) {
    const rawItems = Array.isArray(items) ? items : items && typeof items === "object" ? [items] : [];
    return rawItems
        .filter(item => item && item.text)
        .map(item => ({
            speaker: String(item.speaker || "案吏"),
            role: String(item.role || ""),
            text: String(item.text || "")
        }));
}

function careerSpeakerPortrait(affair = {}, speaker = "") {
    const portraits = affair.portraits || {};
    const key = String(speaker || "");
    const fallbackPortraits = {
        default: "/static/images/law-clerk-avatar.png",
        "案吏": "/static/images/law-clerk-avatar.png",
        "巡丁": "/static/images/law-clerk-avatar.png",
        "小商户": "/static/images/law-tang-victim-family-avatar.png",
        "贫弱妇人": "/static/images/law-tang-victim-family-avatar.png",
        "坊正": "/static/images/law-tang-ritual-official-avatar.png"
    };
    return portraits[key] || fallbackPortraits[key] || portraits.default || fallbackPortraits.default;
}

function renderCareerStoryChoices(step = {}) {
    const choices = Array.isArray(step.choices) ? step.choices : [];
    if (!choices.length) return "";
    return `
        <div class="career-story-choices">
            ${choices.map((choice, index) => `
                <button type="button" data-career-story-choice="${escapeAttr(choice.id || "")}">
                    <span>${escapeHtml(choice.id && choice.id.length <= 2 ? choice.id : String(index + 1))}</span>
                    <b>${escapeHtml(choice.text || "")}</b>
                    <em>${escapeHtml(choice.hint || "")}</em>
                </button>
            `).join("")}
        </div>
    `;
}

function renderCareerList(items = []) {
    return `<ul>${(items || []).map(item => `<li>${escapeHtml(item || "")}</li>`).join("")}</ul>`;
}

function renderCareerIdentity(payload = {}) {
    const identity = payload.identity || {};
    const office = payload.office || {};
    const stateData = payload.state || {};
    elements.careerPrototypePanel.innerHTML = `
        <div class="career-shell career-identity-shell">
            <header class="career-head">
                <button type="button" class="career-back-btn" data-career-action="back">返回入口</button>
                <span>随机身份已生成</span>
                <h2>${escapeHtml(identity.dynasty || "唐")}代 ${escapeHtml(office.title || "县尉")}</h2>
                <p>${escapeHtml([identity.reign_year, identity.place, `${identity.age || 0}岁`].filter(Boolean).join(" · "))}</p>
            </header>
            <section class="career-identity-grid">
                <article><span>当前任地</span><b>${escapeHtml(identity.current_post || identity.place || "")}</b><p>${escapeHtml(identity.local_note || "")}</p></article>
                <article><span>家庭情况</span><b>${escapeHtml(identity.family || "")}</b><p>${escapeHtml(identity.origin || "")}</p></article>
                <article><span>时代背景</span><b>${escapeHtml(identity.era_background || "")}</b><p>${escapeHtml(identity.social_conflict || "")}</p></article>
                <article><span>初始状态</span><b>${escapeHtml(identity.initial_status || "")}</b><p>任期共 ${Number(stateData.campaign_days || 15)} 日，案件结果由规则结算。</p></article>
            </section>
            <section class="career-office-guide" role="dialog" aria-modal="true" aria-label="官职说明">
                <div class="career-office-guide-head"><span>官职说明</span><h3>你现在是什么官？</h3><p>${escapeHtml(office.summary || "")}</p></div>
                <div class="career-guide-columns">
                    <article><b>大概相当于什么位置</b><p>${escapeHtml(office.plain_position || office.rank || "")}</p><b>直属上级</b><p>${escapeHtml(office.superior || "")}</p></article>
                    <article><b>你能管</b>${renderCareerList(office.can_manage || [])}</article>
                    <article><b>你不能管</b>${renderCareerList(office.cannot_manage || [])}</article>
                    <article><b>日常会面对</b>${renderCareerList(office.daily_contacts || [])}</article>
                </div>
                <div class="career-guide-risk"><b>这份官职真正的风险</b>${renderCareerList(office.risks || [])}</div>
                <div class="career-submit-row"><button type="button" data-career-action="begin-opening">明白了，进入开局</button></div>
            </section>
        </div>
    `;
}

function startCareerOpening() {
    const opening = state.career.opening || {};
    state.career.phase = "opening";
    state.career.affairDialogue = normalizeCareerDialogue(opening.dialogue || []);
    state.career.affairDialogueIndex = 0;
    state.career.affairMode = state.career.affairDialogue.length ? "dialogue" : "choice";
    renderCareerAffairScene();
}

function startCareerCase(caseData = state.career.currentCase) {
    if (!caseData) return;
    state.career.currentCase = caseData;
    state.career.phase = "case";
    state.career.affairResult = null;
    state.career.affairStepIndex = 0;
    state.career.affairDialogue = normalizeCareerDialogue(caseData.opening_dialogue || []);
    state.career.affairDialogueIndex = 0;
    state.career.affairMode = state.career.affairDialogue.length ? "dialogue" : "choice";
    state.career.affairStoryChoices = [];
    renderCareerAffairScene();
}

function careerActiveScene() {
    if (state.career.phase === "opening" || state.career.phase === "opening-ready") {
        return {
            title: state.career.opening?.title || "一觉入唐",
            category: "穿越开场",
            background_image: state.career.opening?.background_image || "",
            portraits: {},
            brief: "你必须先弄清自己的身份，再走进县衙。"
        };
    }
    return state.career.currentCase || {};
}

function careerAffairSteps(affair = {}) {
    const investigationSteps = Array.isArray(affair.investigation_steps) ? affair.investigation_steps : [];
    if (investigationSteps.length || Array.isArray(affair.choices)) {
        return [
            ...investigationSteps,
            {
                step_id: "decision",
                prompt: affair.decision_prompt || "你准备如何处置？",
                final: true,
                choices: affair.choices || []
            }
        ];
    }
    if (Array.isArray(affair.story_steps) && affair.story_steps.length) return affair.story_steps;
    return [];
}

function renderCareerAffairScene() {
    const affair = careerActiveScene();
    const stateData = state.career.gameState || {};
    const office = state.career.office || {};
    const labels = stateData.stat_labels || office.stat_labels || {};
    const steps = careerAffairSteps(affair);
    const stepIndex = Math.min(Math.max(Number(state.career.affairStepIndex || 0), 0), Math.max(steps.length - 1, 0));
    const step = steps[stepIndex] || {};
    const dialogue = state.career.affairDialogue || [];
    const dialogueIndex = Math.min(Math.max(Number(state.career.affairDialogueIndex || 0), 0), Math.max(dialogue.length - 1, 0));
    const currentLine = dialogue[dialogueIndex] || null;
    const openingReady = state.career.phase === "opening-ready";
    const isChoiceMode = openingReady || state.career.affairMode === "choice" || !currentLine;
    const speakerPortrait = currentLine ? careerSpeakerPortrait(affair, currentLine.speaker) : "";
    const bgStyle = affair.background_image ? ` style="--career-bg: url('${escapeAttr(affair.background_image)}')"` : "";
    const phaseLabel = state.career.phase.startsWith("opening") ? "穿越开场" : `${escapeHtml(affair.category || "政务")} · 第 ${stepIndex + 1}/${steps.length || 1} 幕`;
    elements.careerPrototypePanel.innerHTML = `
        <div class="career-shell career-appointment-shell career-vn-shell">
            <section class="career-affair-stage ${isChoiceMode ? "is-choice" : "is-dialogue"}"${bgStyle}>
                <div class="career-affair-bg" aria-hidden="true"></div><div class="career-affair-shade" aria-hidden="true"></div>
                <div class="career-vn-topbar">
                    <button type="button" class="career-back-btn career-vn-back" data-career-action="back">退出本局</button>
                    <div><span>${phaseLabel}</span><b>${escapeHtml(affair.title || "今日政务")}</b><em>${escapeHtml([office.title || "县尉", state.career.identity?.reign_year, `任职第 ${stateData.day || 1} 日`].filter(Boolean).join(" · "))}</em></div>
                    ${renderCareerStatsCompact(stateData.stats || {}, labels)}
                </div>
                ${isChoiceMode ? `
                    <div class="career-choice-screen">
                        <div class="career-choice-question">${escapeHtml(openingReady ? "衙门的门已经打开。你的第一件政务正在堂下等候。" : (step.prompt || affair.decision_prompt || ""))}</div>
                        ${openingReady ? '<button type="button" class="career-opening-enter" data-career-action="start-case">走进县衙</button>' : renderCareerStoryChoices(step)}
                        ${step.final ? `
                            <form class="career-free-form" data-career-free-form>
                                <label for="career-free-input">或者写下你自己的处理办法</label>
                                <div><input id="career-free-input" name="free_text" type="text" maxlength="180" placeholder="例如：先封存现场，再分别询问证人并呈报县令" autocomplete="off"><button type="submit">按此处置</button></div>
                                <p>系统会先识别处理意图，再按现有规则标签结算，不会让一句话直接改写结果。</p>
                            </form>
                        ` : ""}
                    </div>
                ` : `
                    <button type="button" class="career-dialogue-hotzone" data-career-action="next-dialogue" aria-label="继续对话">
                        <div class="career-vn-character" aria-hidden="true"><img src="${escapeAttr(speakerPortrait)}" alt=""></div>
                        <div class="career-dialogue-box"><div class="career-dialogue-name"><b>${escapeHtml(currentLine.speaker || "案吏")}</b>${currentLine.role ? `<span>${escapeHtml(currentLine.role)}</span>` : ""}</div><p>${escapeHtml(currentLine.text || "")}</p><em>继续</em></div>
                    </button>
                `}
            </section>
        </div>
    `;
}

function handleCareerStoryChoice(choiceId = "") {
    const affair = state.career.currentCase || {};
    const steps = careerAffairSteps(affair);
    const step = steps[state.career.affairStepIndex || 0] || {};
    const selected = (step.choices || []).find(choice => String(choice.id || "") === String(choiceId));
    if (!selected) return;
    if (step.final) {
        chooseCareerAffair(selected.id || "");
        return;
    }
    state.career.affairStoryChoices = [...(state.career.affairStoryChoices || []), {step_id: step.step_id || "", choice_id: selected.id || "", text: selected.text || ""}];
    state.career.affairStepIndex = Math.min(Number(state.career.affairStepIndex || 0) + 1, Math.max(steps.length - 1, 0));
    const response = normalizeCareerDialogue(selected.response || []);
    state.career.affairDialogue = response;
    state.career.affairDialogueIndex = 0;
    state.career.affairMode = response.length ? "dialogue" : "choice";
    renderCareerAffairScene();
}

function advanceCareerDialogue() {
    const dialogue = state.career.affairDialogue || [];
    if (Number(state.career.affairDialogueIndex || 0) < dialogue.length - 1) {
        state.career.affairDialogueIndex = Number(state.career.affairDialogueIndex || 0) + 1;
    } else if (state.career.phase === "opening") {
        state.career.phase = "opening-ready";
        state.career.affairMode = "choice";
    } else {
        state.career.affairMode = "choice";
    }
    renderCareerAffairScene();
}

function renderCareerAffairResult(payload = {}) {
    const labels = payload.state?.stat_labels || state.career.office?.stat_labels || {};
    const stateData = payload.state || {};
    const choice = payload.choice || {};
    const deltas = payload.deltas || {};
    const interpretation = payload.interpretation || {};
    state.career.affairResult = payload;
    state.career.gameState = stateData;
    state.career.currentCase = payload.next_case || null;
    state.career.ending = payload.ending || null;
    if (payload.ending) {
        renderCareerEnding(payload.ending, payload);
        return;
    }
    elements.careerPrototypePanel.innerHTML = `
        <div class="career-shell career-appointment-shell career-resolution-shell">
            <header class="career-head"><span>案件收束</span><h2>${escapeHtml(choice.text || "政务结果")}</h2><p>${escapeHtml(`任职第 ${stateData.day || 1} 日 · ${interpretation.label ? `识别为“${interpretation.label}”` : "规则结算"}`)}</p></header>
            <section class="career-result-card career-scene-card"><b>短期结果</b><p>${escapeHtml(payload.result || "")}</p></section>
            <section class="career-result-card"><b>后续影响</b><p>${escapeHtml(payload.aftermath || "")}</p></section>
            <section class="career-delta-card"><b>属性变化</b><div>${Object.entries(deltas).map(([key, value]) => `<span class="${Number(value) >= 0 ? "is-up" : "is-down"}">${escapeHtml(labels[key] || key)} ${Number(value) >= 0 ? "+" : ""}${Number(value || 0)}</span>`).join("")}</div></section>
            ${renderCareerStats(stateData.stats || {}, labels)}
            ${(payload.archive_unlocks || []).length ? `<section class="career-archive-card"><b>历史互动档案已解锁</b>${renderCareerList(payload.archive_unlocks)}</section>` : ""}
            <section class="career-next-card"><b>下一件事务</b><p>${escapeHtml(payload.next_case ? `${payload.next_case.title}：${payload.next_case.brief}` : "等待考课")}</p></section>
            <div class="career-submit-row"><button type="button" data-career-action="next-case">继续任职</button><button type="button" data-career-action="back" class="career-secondary-btn">结束本局</button></div>
        </div>
    `;
}

function renderCareerEnding(ending = {}, payload = {}) {
    const labels = payload.state?.stat_labels || state.career.office?.stat_labels || {};
    elements.careerPrototypePanel.innerHTML = `
        <div class="career-shell career-ending-shell">
            <header class="career-head"><span>十五日考课</span><h2>${escapeHtml(ending.title || "阶段结算")}</h2><p>${escapeHtml(`${state.career.identity?.place || "任地"} · 共处置 ${ending.history_count || 0} 件事务`)}</p></header>
            <section class="career-ending-verdict"><b>县令考语</b><p>${escapeHtml(ending.text || "")}</p></section>
            ${renderCareerStats(ending.stats || {}, labels)}
            <section class="career-archive-card"><b>本局解锁档案</b>${renderCareerList(ending.unlocked_archives || [])}</section>
            <div class="career-submit-row"><button type="button" data-career-action="restart">再次入仕</button><button type="button" data-career-action="back" class="career-secondary-btn">返回入口</button></div>
        </div>
    `;
}

async function startCareerPrototype() {
    if (state.isLoading) return;
    state.isLoading = true;
    try {
        showTimeTravel();
        setCareerMode(true);
        elements.timeTravelContent?.classList.add('ruju-playing');
        elements.travelStartPanel?.classList.add('hidden');
        elements.travelPlayPanel?.classList.add('hidden');
        elements.travelVisualPanel?.classList.add('hidden');
        elements.careerPrototypePanel?.classList.remove('hidden');
        elements.careerPrototypePanel.innerHTML = '<div class="career-shell"><section class="career-intro"><b>正在生成你的身份……</b><p>官职、年代、任地和家庭都将遵守唐代制度边界。</p></section></div>';
        const res = await apiPost('/career/session/start', {seed: `${Date.now()}-${Math.random()}`, office_id: 'tang_county_wei'});
        if (!res?.success || !res.session_id) throw new Error(res?.detail || "身份生成失败");
        Object.assign(state.career, {
            sessionId: res.session_id,
            identity: res.identity || null,
            office: res.office || null,
            opening: res.opening || null,
            currentCase: res.case || null,
            gameState: res.state || null,
            ending: null,
            phase: "identity",
            affairResult: null,
            affairStepIndex: 0,
            affairDialogue: [],
            affairDialogueIndex: 0,
            affairMode: "dialogue",
            affairStoryChoices: []
        });
        renderCareerIdentity(res);
        trackAnalytics('time_travel', {detail: 'career_direct_appointment_start'});
    } catch (error) {
        alert(error?.message || "正式入局暂时无法开启，请稍后重试。");
        setCareerMode(false);
        elements.travelStartPanel?.classList.remove('hidden');
        elements.careerPrototypePanel?.classList.add('hidden');
    } finally {
        state.isLoading = false;
    }
}

async function handleCareerPanelSubmit(event) {
    const form = event.target.closest('[data-career-free-form]');
    if (!form || state.isLoading) return;
    event.preventDefault();
    const freeText = String(new FormData(form).get('free_text') || '').trim();
    if (!freeText) {
        showToast("请写下你的处理办法。");
        return;
    }
    await chooseCareerAffair("", freeText);
}

function handleCareerPanelClick(event) {
    const button = event.target.closest('[data-career-action]');
    const storyChoice = event.target.closest('[data-career-story-choice]');
    if (storyChoice) {
        handleCareerStoryChoice(storyChoice.dataset.careerStoryChoice || "");
        return;
    }
    if (!button) return;
    const action = button.dataset.careerAction;
    if (action === "back") {
        setCareerMode(false);
        elements.timeTravelContent?.classList.remove('ruju-playing');
        elements.careerPrototypePanel?.classList.add('hidden');
        elements.travelStartPanel?.classList.remove('hidden');
    } else if (action === "next-dialogue") {
        advanceCareerDialogue();
    } else if (action === "restart") {
        startCareerPrototype();
    } else if (action === "begin-opening") {
        startCareerOpening();
    } else if (action === "start-case") {
        startCareerCase();
    } else if (action === "next-case") {
        startCareerCase(state.career.currentCase);
    }
}

async function chooseCareerAffair(choiceId = "", freeText = "") {
    const affair = state.career.currentCase;
    if (!state.career.sessionId || !affair?.case_id || (!choiceId && !freeText) || state.isLoading) return;
    state.isLoading = true;
    try {
        elements.careerPrototypePanel.innerHTML = '<div class="career-shell"><section class="career-intro"><b>规则正在结算……</b><p>系统先识别处置标签，再计算时间、属性和后续影响。</p></section></div>';
        const res = await apiPost('/career/session/action', {
            session_id: state.career.sessionId,
            case_id: affair.case_id,
            choice_id: choiceId || "",
            free_text: freeText || ""
        });
        if (!res?.success) throw new Error(res?.detail || "政务结算失败");
        renderCareerAffairResult(res);
        trackAnalytics('time_travel', {detail: `career_case_${affair.case_id}_${res.interpretation?.action_tag || choiceId}`});
    } catch (error) {
        alert(error?.message || "政务处置失败，请稍后重试。");
        renderCareerAffairScene();
    } finally {
        state.isLoading = false;
    }
}

function setTravelBusy(isBusy) {
    state.timeTravel.isBusy = isBusy;
    [elements.travelStartBtn, elements.travelRestartBtn, elements.travelTalkBtn, elements.travelDecideBtn, elements.travelDecisionPublish, elements.visualSendBtn, elements.visualDecideBtn]
        .forEach(button => {
            if (button) button.disabled = isBusy;
        });
    if (elements.visualPlayerInput) elements.visualPlayerInput.disabled = isBusy;
    elements.travelChoiceList?.querySelectorAll('button').forEach(button => {
        button.disabled = isBusy;
    });
    elements.visualChoiceList?.querySelectorAll('button').forEach(button => {
        button.disabled = isBusy;
    });
    updateVisualInputAvailability();
    updateVisualContinueAvailability();
}

function setTravelLoadingStep(stepIndex, percent, titlesOverride) {
    const titles = titlesOverride || [
        '正在抽取历史现场...',
        '正在分配你的席位...',
        '正在召集局中人...',
        '正在生成第一轮朝议...'
    ];
    const safePercent = Math.max(0, Math.min(100, percent));
    if (!elements.travelLoading) {
        setVisualLoadingProgress(safePercent, titles[Math.min(stepIndex, titles.length - 1)], true);
        return;
    }
    elements.travelLoading.classList.remove('hidden');
    elements.travelLoadingTitle.textContent = titles[Math.min(stepIndex, titles.length - 1)];
    elements.travelLoadingPercent.textContent = `${safePercent}%`;
    elements.travelLoadingBar.style.width = `${safePercent}%`;
    elements.travelLoadingSteps?.querySelectorAll('li').forEach((item, index) => {
        item.classList.toggle('active', index === stepIndex);
        item.classList.toggle('done', index < stepIndex);
    });
    setVisualLoadingProgress(safePercent, titles[Math.min(stepIndex, titles.length - 1)], true);
}

function startTravelLoadingLoop(mode = 'start') {
    const isChoice = mode === 'choice';
    const titles = isChoice
        ? ['正在记录主张...', '正在推演反应...', '正在更新局势...', '正在生成下一步...']
        : null;
    const checkpoints = isChoice ? [
        { step: 0, percent: 18, delay: 0 },
        { step: 1, percent: 42, delay: 1200 },
        { step: 2, percent: 68, delay: 5200 },
        { step: 3, percent: 86, delay: 14000 },
        { step: 3, percent: 96, delay: 28000 }
    ] : [
        { step: 0, percent: 12, delay: 0 },
        { step: 1, percent: 28, delay: 2500 },
        { step: 2, percent: 46, delay: 9000 },
        { step: 3, percent: 64, delay: 22000 },
        { step: 3, percent: 78, delay: 45000 },
        { step: 3, percent: 88, delay: 75000 },
        { step: 3, percent: 96, delay: 105000 }
    ];
    checkpoints.forEach(item => {
        window.setTimeout(() => {
            if (state.timeTravel.isBusy) {
                setTravelLoadingStep(item.step, item.percent, titles);
            }
        }, item.delay);
    });
}

function stopTravelLoading() {
    setTravelLoadingStep(3, 100);
    window.setTimeout(() => {
        elements.travelLoading?.classList.add('hidden');
        if (elements.travelLoadingBar) elements.travelLoadingBar.style.width = '0%';
        if (elements.travelLoadingPercent) elements.travelLoadingPercent.textContent = '0%';
        elements.travelLoadingSteps?.querySelectorAll('li').forEach(item => {
            item.classList.remove('active', 'done');
        });
    }, 350);
}

function setVisualLoadingProgress(percent = 0, label = "", visible = false) {
    const safePercent = Math.max(0, Math.min(100, percent));
    elements.visualOverlayProgress?.classList.toggle('hidden', !visible);
    if (elements.visualOverlayProgressBar) elements.visualOverlayProgressBar.style.width = `${safePercent}%`;
    if (elements.visualOverlayProgressPercent) elements.visualOverlayProgressPercent.textContent = `${Math.round(safePercent)}%`;
    if (label && elements.visualOverlayText && state.timeTravel.visualPhase === "loading") {
        elements.visualOverlayText.textContent = label;
    }
}

function isVisualNovelPayload(payload) {
    return Boolean(payload?.dialogue || payload?.mode === "intrigue" || payload?.classroom_mode);
}

function normalizeVisualSpeaker(name = "", kind = "ai") {
    return name || (kind === "user" ? "你" : "局中人");
}

function visualRoleForSpeaker(name = "") {
    const people = state.timeTravel.payload?.encountered || [];
    const person = people.find(item => item.name === name);
    return person?.role || (name === "你" ? (state.timeTravel.payload?.user_role?.identity || "决策者") : "");
}

function visualAvatarClass(name = "") {
    if (VISUAL_AVATAR_CLASS[name]) return VISUAL_AVATAR_CLASS[name];
    if (/旁白/.test(name)) return "avatar-none";
    if (/案吏/.test(name)) return "avatar-clerk";
    if (/张三/.test(name)) return "avatar-zhangsan";
    if (/^甲$|养父甲/.test(name)) return "avatar-jia";
    if (/史官/.test(name)) return "avatar-scholar";
    if (/礼官/.test(name)) return "avatar-ritual-official";
    if (/被害者|家属/.test(name)) return "avatar-victim-family";
    if (/乡里|代表/.test(name)) return "avatar-lusu";
    if (/孙权|主公|你/.test(name)) return "avatar-sunquan";
    if (/周瑜|公瑾|将/.test(name)) return "avatar-zhouyu";
    if (/鲁肃|子敬|谋/.test(name)) return "avatar-lusu";
    if (/律令官|儒生|董仲舒|礼官|经学|先生|刑部|主审|廷尉|官/.test(name)) return "avatar-official";
    if (/张昭|老臣|相国|文臣|臣/.test(name)) return "avatar-zhangzhao";
    return "avatar-player";
}

function setVisualAvatarClass(avatarClass = "") {
    const safeClass = avatarClass || "avatar-player";
    const hasDialogueAvatar = safeClass !== "avatar-none";
    if (elements.visualAvatar) {
        elements.visualAvatar.className = `ruju-visual-avatar ${safeClass}`;
    }
    if (elements.visualDialogueAvatar) {
        elements.visualDialogueAvatar.className = `ruju-dialogue-avatar ${safeClass}`;
    }
    elements.visualDialogueBox?.classList.toggle('no-dialogue-avatar', !hasDialogueAvatar);
    elements.visualDialogueBox?.classList.toggle('has-dialogue-avatar', hasDialogueAvatar);
}

function setVisualStagePhase(phase) {
    state.timeTravel.visualPhase = phase;
    elements.travelVisualStage?.classList.remove('is-loading', 'is-intro', 'is-dialogue', 'can-continue');
    elements.travelVisualStage?.classList.add(`is-${phase}`);
    const isDialogue = phase === "dialogue";
    elements.visualCinematicOverlay?.classList.toggle('hidden', isDialogue);
    elements.visualInputForm?.classList.add('hidden');
    elements.visualChoiceList?.classList.add('hidden');
    elements.visualOverlayHint?.classList.add('hidden');
    elements.visualDialogueContinue?.classList.add('hidden');
    if (phase !== "loading") setVisualLoadingProgress(0, "", false);
    updateVisualInputAvailability();
    updateVisualContinueAvailability();
}

function updateVisualInputAvailability() {
    if (!elements.visualInputForm) return;
    const queue = state.timeTravel.visualQueue || [];
    const isAtLatestShown = state.timeTravel.visualIndex >= state.timeTravel.visualMaxSeenIndex;
    const hasNoMoreLines = !queue.length || state.timeTravel.visualIndex >= queue.length - 1;
    const canInput = state.timeTravel.visualPhase === "dialogue"
        && isAtLatestShown
        && hasNoMoreLines
        && !state.timeTravel.visualPendingUserRequest
        && !state.timeTravel.visualTyping
        && !state.timeTravel.isBusy
        && !state.timeTravel.payload?.classroom_mode
        && !state.timeTravel.payload?.ended;
    elements.visualInputForm.classList.toggle('hidden', !canInput);
}

function updateVisualChoiceAvailability() {
    if (!elements.visualChoiceList) return;
    const payload = state.timeTravel.payload || state.timeTravel.visualPendingPayload;
    const queue = state.timeTravel.visualQueue || [];
    const choices = Array.isArray(payload?.choices) ? payload.choices.filter(choice => choice?.text) : [];
    const isAtLatestShown = state.timeTravel.visualIndex >= state.timeTravel.visualMaxSeenIndex;
    const hasNoMoreLines = !queue.length || state.timeTravel.visualIndex >= queue.length - 1;
    const canChoose = Boolean(payload?.classroom_mode)
        && state.timeTravel.visualPhase === "dialogue"
        && isAtLatestShown
        && hasNoMoreLines
        && state.timeTravel.visualClassroomChoicesRevealed
        && choices.length > 0
        && !state.timeTravel.visualTyping
        && !state.timeTravel.isBusy
        && !payload?.ended;
    elements.visualChoiceList.classList.toggle('hidden', !canChoose);
}

function updateVisualContinueAvailability() {
    const phase = state.timeTravel.visualPhase;
    const queue = state.timeTravel.visualQueue || [];
    const isAtLatestShown = state.timeTravel.visualIndex >= state.timeTravel.visualMaxSeenIndex;
    const hasNextLine = phase === "dialogue" && queue.length && isAtLatestShown && state.timeTravel.visualIndex < queue.length - 1;
    const hasPreviousLine = phase === "dialogue" && queue.length && state.timeTravel.visualIndex > 0;
    const hasHistoryForwardLine = phase === "dialogue"
        && queue.length
        && state.timeTravel.visualIndex < state.timeTravel.visualMaxSeenIndex;
    const currentItem = queue[state.timeTravel.visualIndex];
    const nextItem = hasNextLine ? queue[state.timeTravel.visualIndex + 1] : null;
    const hasReadyNextLine = Boolean(nextItem?.text) && nextItem?.complete !== false;
    const currentLineComplete = Boolean(currentItem) && currentItem.complete !== false;
    const choices = Array.isArray(state.timeTravel.payload?.choices) ? state.timeTravel.payload.choices.filter(choice => choice?.text) : [];
    const canRevealClassroomChoices = Boolean(state.timeTravel.payload?.classroom_mode)
        && phase === "dialogue"
        && isAtLatestShown
        && queue.length
        && state.timeTravel.visualIndex >= queue.length - 1
        && choices.length > 0
        && !state.timeTravel.visualClassroomChoicesRevealed
        && !state.timeTravel.isBusy
        && !state.timeTravel.payload?.ended;
    const hasPendingUserRequest = phase === "dialogue"
        && Boolean(state.timeTravel.visualPendingUserRequest)
        && isAtLatestShown
        && currentItem?.kind === "user"
        && state.timeTravel.visualIndex >= queue.length - 1;
    const canContinue = !state.timeTravel.visualTyping && (
        (!state.timeTravel.isBusy && (
            (phase === "loading" && Boolean(state.timeTravel.visualPendingPayload))
            || phase === "intro"
            || hasPendingUserRequest
            || canRevealClassroomChoices
        ))
        || hasReadyNextLine
        || (phase === "dialogue" && state.timeTravel.isBusy && currentLineComplete && !state.timeTravel.visualWaitingForNext)
    );
    elements.travelVisualStage?.classList.toggle('can-continue', Boolean(canContinue));
    elements.visualOverlayHint?.classList.toggle('hidden', !(canContinue && phase !== "dialogue"));
    elements.visualDialogueContinue?.classList.toggle('hidden', !(canContinue && phase === "dialogue"));
    elements.visualPrevBtn?.classList.toggle('hidden', !hasPreviousLine || state.timeTravel.visualTyping);
    elements.visualNextBtn?.classList.toggle('hidden', !hasHistoryForwardLine || state.timeTravel.visualTyping);
    if (elements.visualPrevBtn) elements.visualPrevBtn.disabled = state.timeTravel.visualTyping;
    if (elements.visualNextBtn) elements.visualNextBtn.disabled = state.timeTravel.visualTyping || !hasHistoryForwardLine;
    if (elements.visualDialogueContinue) elements.visualDialogueContinue.disabled = state.timeTravel.visualTyping;
    updateVisualChoiceAvailability();
}

function setVisualOverlay(title, text = "", hintVisible = false, options = {}) {
    if (elements.visualOverlayTitle) elements.visualOverlayTitle.textContent = title;
    if (elements.visualOverlayText) elements.visualOverlayText.textContent = text;
    elements.visualOverlayHint?.classList.toggle('hidden', !hintVisible);
    setVisualLoadingProgress(options.progress ?? 0, "", Boolean(options.progressVisible));
    updateVisualContinueAvailability();
}

function isClassroomGlossaryEnabled() {
    return Boolean(isLawClassroomDemo());
}

function glossaryButtonHtml(term) {
    return `<button type="button" class="ruju-glossary-term" data-glossary-term="${escapeAttr(term)}">${escapeHtml(term)}</button>`;
}

function renderClassroomGlossaryHtml(text = "", options = {}) {
    const source = String(text || "");
    if (!isClassroomGlossaryEnabled() || !source || !CLASSROOM_GLOSSARY_TERMS.length) {
        const safe = escapeHtml(source);
        return options.lineBreaks ? safe.replace(/\n/g, '<br>') : safe;
    }
    const pattern = new RegExp(CLASSROOM_GLOSSARY_TERMS.map(escapeRegExp).join('|'), 'g');
    let cursor = 0;
    let html = "";
    source.replace(pattern, (term, index) => {
        if (index > cursor) html += escapeHtml(source.slice(cursor, index));
        html += glossaryButtonHtml(term);
        cursor = index + term.length;
        return term;
    });
    if (cursor < source.length) html += escapeHtml(source.slice(cursor));
    return options.lineBreaks ? html.replace(/\n/g, '<br>') : html;
}

function setGlossaryRichText(element, text = "", options = {}) {
    if (!element) return;
    if (isClassroomGlossaryEnabled()) {
        element.innerHTML = renderClassroomGlossaryHtml(text, options);
    } else {
        element.textContent = String(text || "");
    }
}

function setGlossaryLabel(element, text = "") {
    if (!element) return;
    const value = String(text || "");
    if (isClassroomGlossaryEnabled() && CLASSROOM_GLOSSARY[value]) {
        element.innerHTML = glossaryButtonHtml(value);
    } else {
        element.textContent = value;
    }
}

function ensureClassroomGlossaryModal() {
    let modal = document.getElementById('classroom-glossary-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'classroom-glossary-modal';
    modal.className = 'classroom-glossary-modal hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="classroom-glossary-card" role="dialog" aria-modal="true" aria-labelledby="classroom-glossary-title">
            <button type="button" class="classroom-glossary-close" aria-label="关闭词条">×</button>
            <div class="classroom-glossary-kicker">历史词条</div>
            <h3 id="classroom-glossary-title"></h3>
            <p class="classroom-glossary-subtitle"></p>
            <p class="classroom-glossary-body"></p>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.closest('.classroom-glossary-close')) {
            closeClassroomGlossary();
        }
    });
    return modal;
}

function openClassroomGlossary(term = "") {
    const entry = CLASSROOM_GLOSSARY[term];
    if (!entry) return;
    const modal = ensureClassroomGlossaryModal();
    modal.querySelector('#classroom-glossary-title').textContent = term;
    modal.querySelector('.classroom-glossary-subtitle').textContent = entry.subtitle || "";
    modal.querySelector('.classroom-glossary-body').textContent = entry.body || "";
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeClassroomGlossary() {
    const modal = document.getElementById('classroom-glossary-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function ensureClassroomHistoryModal() {
    let modal = document.getElementById('classroom-history-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'classroom-history-modal';
    modal.className = 'classroom-history-modal hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="classroom-history-card" role="dialog" aria-modal="true" aria-labelledby="classroom-history-title">
            <button type="button" class="classroom-history-close" aria-label="关闭历史还原">×</button>
            <div class="classroom-history-kicker">历史还原</div>
            <h3 id="classroom-history-title">真实历史中的走向</h3>
            <div class="classroom-history-body"></div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.closest('.classroom-history-close')) {
            closeClassroomHistory();
        }
    });
    return modal;
}

function openClassroomHistory() {
    const payload = state.timeTravel.payload || {};
    const points = Array.isArray(payload.orthodox_history_points)
        ? payload.orthodox_history_points.map(item => String(item || "").trim()).filter(Boolean)
        : [];
    const text = String(payload.orthodox_history || "").trim();
    if (!points.length && !text) return;
    const modal = ensureClassroomHistoryModal();
    const body = modal.querySelector('.classroom-history-body');
    body.innerHTML = "";
    if (points.length) {
        const list = document.createElement('ul');
        points.forEach(point => {
            const item = document.createElement('li');
            item.textContent = point;
            list.appendChild(item);
        });
        body.appendChild(list);
    } else {
        text.split(/\n{2,}/).map(item => item.trim()).filter(Boolean).forEach(paragraph => {
            const item = document.createElement('p');
            item.textContent = paragraph;
            body.appendChild(item);
        });
    }
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeClassroomHistory() {
    const modal = document.getElementById('classroom-history-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function clearVisualTyping() {
    if (state.timeTravel.visualTypingTimer) {
        window.clearTimeout(state.timeTravel.visualTypingTimer);
        state.timeTravel.visualTypingTimer = null;
    }
    state.timeTravel.visualTyping = false;
}

function typeIntoElement(element, text, options = {}) {
    clearVisualTyping();
    const content = String(text || "");
    const speed = options.speed ?? 24;
    const onDone = options.onDone;
    if (!element) {
        onDone?.();
        return;
    }
    element.textContent = "";
    state.timeTravel.visualTyping = true;
    elements.travelVisualStage?.classList.remove('can-continue');
    elements.visualOverlayHint?.classList.add('hidden');
    elements.visualDialogueContinue?.classList.add('hidden');
    let index = 0;
    const step = () => {
        index += 1;
        element.textContent = content.slice(0, index);
        if (index < content.length) {
            state.timeTravel.visualTypingTimer = window.setTimeout(step, speed);
            return;
        }
        state.timeTravel.visualTypingTimer = null;
        state.timeTravel.visualTyping = false;
        setGlossaryRichText(element, content);
        onDone?.();
        updateVisualInputAvailability();
        updateVisualContinueAvailability();
    };
    if (!content) {
        state.timeTravel.visualTyping = false;
        onDone?.();
        updateVisualInputAvailability();
        updateVisualContinueAvailability();
        return;
    }
    step();
}

function prepareVisualLoading(sceneId = VISUAL_NOVEL_SCENE_ID) {
    const isClassroomScene = String(sceneId || '').startsWith('law_');
    elements.timeTravelContent?.classList.add('ruju-playing');
    elements.travelStartPanel?.classList.add('hidden');
    elements.travelPlayPanel?.classList.add('hidden');
    elements.travelVisualPanel?.classList.remove('hidden');
    state.timeTravel.visualQueue = [];
    state.timeTravel.visualIndex = -1;
    state.timeTravel.visualPendingPayload = null;
    state.timeTravel.visualPendingUserRequest = null;
    state.timeTravel.visualWaitingForNext = false;
    state.timeTravel.visualBrowsingHistory = false;
    state.timeTravel.visualMaxSeenIndex = -1;
    state.timeTravel.visualClassroomChoicesRevealed = false;
    state.timeTravel.visualIntroStep = "";
    resetClassroomThoughtState();
    if (elements.visualTitle) elements.visualTitle.textContent = isClassroomScene ? '公开课案例' : '赤壁战前的江东朝议';
    if (elements.visualEra) elements.visualEra.textContent = isClassroomScene ? '' : '东汉末年';
    if (elements.visualSpeakerName) elements.visualSpeakerName.textContent = '';
    if (elements.visualSpeakerRole) elements.visualSpeakerRole.textContent = '';
    if (elements.visualDialogueText) elements.visualDialogueText.textContent = '';
    setVisualAvatarClass('avatar-none');
    setVisualStagePhase("loading");
    setVisualOverlay(
        isClassroomScene ? "案例加载中" : "事件加载中",
        isClassroomScene ? "正在整理案情、人物立场与课堂选项..." : "正在召集局中人...",
        false,
        { progressVisible: true, progress: 0 }
    );
}

function prepareChoiceTravelLoading() {
    elements.timeTravelContent?.classList.add('ruju-playing');
    elements.travelStartPanel?.classList.add('hidden');
    elements.travelVisualPanel?.classList.add('hidden');
    elements.travelPlayPanel?.classList.remove('hidden');
    elements.travelPlayPanel?.classList.add('ruju-choice-only');
    if (elements.travelTitle) elements.travelTitle.textContent = '案例加载中';
    if (elements.travelRoundPill) elements.travelRoundPill.textContent = '公开课案例';
    if (elements.travelTalkLog) elements.travelTalkLog.innerHTML = '';
    if (elements.travelScene) elements.travelScene.textContent = '正在整理案情、角色立场与课堂选项...';
    if (elements.travelCharacterText) elements.travelCharacterText.textContent = '课堂决策位';
    if (elements.travelPeople) elements.travelPeople.innerHTML = '';
    elements.travelChoiceList?.classList.add('hidden');
}

function showVisualLoaded(payload) {
    state.timeTravel.visualPendingPayload = payload;
    setVisualStagePhase("loading");
    setVisualOverlay(
        payload?.classroom_mode ? "案例加载完成" : "事件加载完成",
        payload?.classroom_mode ? "请继续查看前情提要。" : "第一轮朝议已经生成。",
        true,
        { progressVisible: true, progress: 100 }
    );
    updateVisualContinueAvailability();
}

function visualBriefingText(payload) {
    return payload?.brief || payload?.public_state || payload?.scene || "前情提要正在展开。";
}

function visualBriefingPages(payload) {
    const pages = Array.isArray(payload?.brief_pages)
        ? payload.brief_pages
            .map((page) => ({
                title: String(page?.title || "前情提要").trim() || "前情提要",
                text: String(page?.text || "").trim()
            }))
            .filter((page) => page.text)
        : [];
    return pages.length ? pages : [{ title: "前情提要", text: visualBriefingText(payload) }];
}

function visualBriefingSource(payload) {
    if (payload?.scene_id === "law_han_qinqin_xiangyin") {
        return "改编自：董仲舒“春秋决狱”·养父匿子案";
    }
    if (payload?.scene_id === "law_tang_liuyang_chengsi") {
        return "改编自：北魏以来“存留养亲”制度与《唐律疏议》相关规定";
    }
    if (payload?.scene_id === "law_wuzhou_xuyuanqing_revenge") {
        return "改编自：陈子昂《复仇议状》与柳宗元《驳复仇议》";
    }
    if (payload?.scene_id === "law_jin_wufu_zhizui") {
        return "改编自：《晋书·刑法志》“准五服以制罪”与唐律亲属相犯规则";
    }
    if (payload?.scene_id === "law_tang_xiaoqin_daoji") {
        return "改编自：《唐律疏议》名例律总纲与窃盗计赃原则";
    }
    return "";
}

function visualMissionText(payload) {
    const role = payload?.user_role || {};
    const identity = [role.name, role.identity].filter(Boolean).join(" · ") || "局中决策者";
    const goal = role.goal || "听取众人意见，亲自追问并作出决定。";
    if (payload?.classroom_mode) {
        if (payload.mission_text) return payload.mission_text;
        return `你的身份：${identity}\n\n你的任务：${goal}\n\n请先听完各方陈说，再从屏幕中央选项中作出裁断。本局不开放自由输入。`;
    }
    return `你的身份：${identity}\n\n你的任务：${goal}\n\n你可以追问、质疑、遣使、整军或改变路线。行动力耗尽后，曹操、刘备和江东内部会各自行动，局势会自然走向结局。`;
}

function startVisualIntro() {
    const payload = state.timeTravel.visualPendingPayload || state.timeTravel.payload;
    if (!payload) return;
    setVisualStagePhase("intro");
    state.timeTravel.visualIntroStep = "brief";
    state.timeTravel.visualBriefingPageIndex = 0;
    startVisualBriefingPage(0);
}

function startVisualBriefingPage(index = 0) {
    const payload = state.timeTravel.visualPendingPayload || state.timeTravel.payload;
    if (!payload) return;
    const pages = visualBriefingPages(payload);
    const pageIndex = Math.max(0, Math.min(index, pages.length - 1));
    const page = pages[pageIndex] || pages[0];
    state.timeTravel.visualIntroStep = "brief";
    state.timeTravel.visualBriefingPageIndex = pageIndex;
    setVisualOverlay(page.title || "前情提要", "", false);
    if (elements.visualOverlaySource) {
        const source = visualBriefingSource(payload);
        elements.visualOverlaySource.textContent = source;
        elements.visualOverlaySource.classList.toggle('hidden', !source || pageIndex === 0);
    }
    typeIntoElement(elements.visualOverlayText, page.text, {
        speed: 22,
        onDone: updateVisualContinueAvailability
    });
}

function startVisualMission() {
    const payload = state.timeTravel.visualPendingPayload || state.timeTravel.payload;
    if (!payload) return;
    state.timeTravel.visualIntroStep = "mission";
    setVisualOverlay("你的任务", "", false);
    elements.visualOverlaySource?.classList.add('hidden');
    typeIntoElement(elements.visualOverlayText, visualMissionText(payload), {
        speed: 22,
        onDone: updateVisualContinueAvailability
    });
}

function normalizeVisualItem(item = {}) {
    const speaker = normalizeVisualSpeaker(item.speaker || "", item.kind || "ai");
    return {
        speaker,
        role: item.role || visualRoleForSpeaker(speaker),
        text: item.text || "",
        kind: item.kind || "ai",
        complete: item.complete,
        thoughtGate: item.thoughtGate || "",
        reflectionPrompt: item.reflectionPrompt || "",
        choiceId: item.choiceId || "",
        choiceText: item.choiceText || ""
    };
}

function classroomVerdictItemForPayload(payload = {}) {
    const dialogue = Array.isArray(payload.dialogue) ? payload.dialogue : [];
    const systemItems = dialogue.filter(item => item?.kind === 'system' && item?.text);
    const resultItem = systemItems.find(item => /推演|结果/.test(item.role || "")) || systemItems[0];
    if (!resultItem) return null;
    const extraItems = systemItems.filter(item => item !== resultItem);
    const text = [
        resultItem.text,
        ...extraItems.map(item => `${item.role || "课堂提示"}：${item.text}`)
    ].join("\n\n");
    return { speaker: "裁断卷宗", role: "礼法断案", text, kind: "verdict" };
}

function parseClassroomVerdict(text = "") {
    const source = String(text || "").trim();
    const lines = source.split(/\n+/).map(line => line.trim()).filter(Boolean);
    let title = lines[0] || "裁断结果";
    let body = lines.slice(1).join("\n\n") || source;
    if (!/^[A-D]\s*[｜|]/.test(title)) {
        title = "裁断结果";
        body = source;
    }
    const sectionLabels = "教材回顾|教材联系|史料回顾|课堂追问|史学分析|礼法分析";
    const pickSection = (labelPattern) => {
        const match = body.match(new RegExp(`(?:^|\\n\\n?)(${labelPattern})：([\\s\\S]*?)(?=\\n\\n?(?:${sectionLabels})：|$)`));
        return match ? match[2].trim() : "";
    };
    const analysis = pickSection("史学分析|礼法分析");
    const textbook = pickSection("教材回顾|教材联系");
    const sourceReview = pickSection("史料回顾");
    const question = pickSection("课堂追问");
    const main = body
        .replace(new RegExp(`(?:^|\\n\\n?)(?:史学分析|礼法分析)：[\\s\\S]*?(?=\\n\\n?(?:${sectionLabels})：|$)`, "g"), "")
        .replace(new RegExp(`(?:^|\\n\\n?)(?:教材回顾|教材联系|史料回顾)：[\\s\\S]*?(?=\\n\\n?(?:${sectionLabels})：|$)`, "g"), "")
        .replace(/(?:^|\n\n?)课堂追问：[\s\S]*$/g, "")
        .trim();
    title = title.replace(/^([A-D])\s*[｜|]\s*/, "$1 ");
    return { title, main, analysis, textbook, sourceReview, question };
}

function classroomHistorianSeedMessage() {
    const payload = state.timeTravel.payload || {};
    const title = payload.title || "本案";
    return {
        role: "ai",
        speaker: "史官",
        speakerRole: "课堂问答",
        text: `你可以继续追问「${title}」中的制度、思想与时代背景。我会把回答扣回本课的德治与法治、礼法结合、以礼入法，不续写剧情，也不替你重新判案。`
    };
}

function classroomHistorianMessages() {
    return state.timeTravel.classroomHistorianMessages?.length
        ? state.timeTravel.classroomHistorianMessages
        : [classroomHistorianSeedMessage()];
}

function renderClassroomHistorianLog() {
    return classroomHistorianMessages().map(item => `
        <div class="classroom-historian-msg ${escapeAttr(item.role || 'ai')}">
            <div>
                <b>${escapeHtml(item.speaker || (item.role === 'user' ? '你' : '史官'))}</b>
                ${item.speakerRole ? `<span>${escapeHtml(item.speakerRole)}</span>` : ''}
            </div>
            <p>${escapeHtml(item.text || '')}</p>
        </div>
    `).join('');
}

function renderClassroomHistorianPanel() {
    const busy = Boolean(state.timeTravel.classroomHistorianBusy);
    return `
        <aside class="classroom-historian-panel" aria-label="史官问答">
            <div class="classroom-historian-head">
                <span>史官问答</span>
                <b>问制度、问思想、问时代</b>
            </div>
            <div class="classroom-historian-log" data-classroom-historian-log>
                ${renderClassroomHistorianLog()}
            </div>
            <form class="classroom-historian-form" data-classroom-historian-form>
                <textarea name="question" maxlength="1200" rows="3" placeholder="可以问：这个案子和礼法结合有什么关系？也可以问相关历史背景。"${busy ? ' disabled' : ''}></textarea>
                <button type="submit"${busy ? ' disabled' : ''}>${busy ? '史官思考中' : '提问'}</button>
            </form>
        </aside>
    `;
}

function refreshClassroomHistorianPanel() {
    const panel = elements.travelVisualStage?.querySelector('.classroom-historian-panel');
    if (!panel) return;
    const replacement = document.createElement('div');
    replacement.innerHTML = renderClassroomHistorianPanel().trim();
    panel.replaceWith(replacement.firstElementChild);
    const log = elements.travelVisualStage?.querySelector('[data-classroom-historian-log]');
    if (log) log.scrollTop = log.scrollHeight;
}

function focusClassroomHistorian() {
    const panel = elements.travelVisualStage?.querySelector('.classroom-historian-panel');
    panel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = panel?.querySelector('textarea[name="question"]');
    setTimeout(() => input?.focus(), 160);
}

function renderClassroomVerdict(text = "") {
    const verdict = parseClassroomVerdict(text);
    const sideCards = [
        verdict.analysis ? { title: "礼法分析", text: verdict.analysis } : null,
        verdict.textbook ? { title: "教材回顾", text: verdict.textbook } : null,
        verdict.sourceReview ? { title: "史料回顾", text: verdict.sourceReview } : null,
        verdict.question ? { title: "课堂追问", text: verdict.question } : null,
    ].filter(Boolean);
    const historyButton = state.timeTravel.payload?.orthodox_history
        ? '<button type="button" data-verdict-action="history">历史还原</button>'
        : '';
    return `
        <article class="ruju-verdict-dossier">
            <header class="ruju-verdict-head">
                <span>裁断卷宗</span>
                <h2>${escapeHtml(verdict.title)}</h2>
            </header>
            <div class="ruju-verdict-layout">
                <div class="ruju-verdict-result-column">
                    <section class="ruju-verdict-main">
                        <b>推演结果</b>
                        <p>${renderClassroomGlossaryHtml(verdict.main || text, { lineBreaks: true })}</p>
                    </section>
                    <div class="ruju-verdict-side">
                        ${sideCards.map(card => `
                            <section>
                                <b>${escapeHtml(card.title)}</b>
                                <p>${renderClassroomGlossaryHtml(card.text, { lineBreaks: true })}</p>
                            </section>
                        `).join('')}
                    </div>
                    <div class="ruju-verdict-actions">
                        ${historyButton}
                        <button type="button" data-verdict-action="historian">史官问答</button>
                        <button type="button" data-verdict-action="rechoose">重新选择</button>
                        <button type="button" data-verdict-action="home">返回首页</button>
                    </div>
                </div>
                ${renderClassroomHistorianPanel()}
            </div>
        </article>
    `;
}

function isVisualClassroomResultItem(item = {}) {
    return Boolean(state.timeTravel.payload?.classroom_mode && state.timeTravel.payload?.ended && (item.kind === "system" || item.kind === "verdict"));
}

function setClassroomResultReadingMode(enabled) {
    const active = Boolean(enabled);
    document.documentElement.classList.toggle('law-classroom-result-reading', active);
    document.body.classList.toggle('law-classroom-result-reading', active);
    elements.travelVisualStage?.classList.toggle('is-ended', active);
}

function setVisualDialogueItem(item, options = {}) {
    if (!item || !elements.visualDialogueText) return;
    const speaker = normalizeVisualSpeaker(item.speaker, item.kind);
    const isClassroomResult = isVisualClassroomResultItem(item);
    setClassroomResultReadingMode(isClassroomResult);
    elements.visualDialogueBox?.classList.remove('hidden');
    setGlossaryLabel(elements.visualSpeakerName, speaker);
    setGlossaryLabel(elements.visualSpeakerRole, item.role || visualRoleForSpeaker(speaker));
    setVisualAvatarClass(isClassroomResult ? 'avatar-none' : visualAvatarClass(speaker));
    elements.visualDialogueBox?.classList.toggle('is-result', isClassroomResult);
    if (isClassroomResult) {
        clearVisualTyping();
        elements.visualDialogueText.innerHTML = renderClassroomVerdict(item.text || "");
        elements.visualInputForm?.classList.add('hidden');
        updateVisualInputAvailability();
        updateVisualContinueAvailability();
        return;
    }
    if (options.instant) {
        clearVisualTyping();
        setGlossaryRichText(elements.visualDialogueText, item.text || "");
        updateVisualInputAvailability();
        updateVisualContinueAvailability();
        return;
    }
    elements.visualInputForm?.classList.add('hidden');
    typeIntoElement(elements.visualDialogueText, item.text || "", { speed: 20 });
}

function setVisualThinking(speaker = "局中人", role = "") {
    clearVisualTyping();
    setClassroomResultReadingMode(false);
    const displaySpeaker = normalizeVisualSpeaker(speaker, "ai");
    setGlossaryLabel(elements.visualSpeakerName, displaySpeaker);
    setGlossaryLabel(elements.visualSpeakerRole, role || visualRoleForSpeaker(displaySpeaker));
    setVisualAvatarClass(visualAvatarClass(displaySpeaker));
    elements.visualDialogueBox?.classList.remove('is-result');
    elements.visualDialogueText.innerHTML = '<span class="ruju-thinking-dots"><i></i><i></i><i></i></span>';
    state.timeTravel.visualTyping = true;
    elements.travelVisualStage?.classList.remove('can-continue');
    elements.visualInputForm?.classList.add('hidden');
    elements.visualDialogueContinue?.classList.add('hidden');
}

function setVisualStreamText(item, text = "") {
    if (!item || !elements.visualDialogueText) return;
    const speaker = normalizeVisualSpeaker(item.speaker, item.kind);
    const isClassroomResult = isVisualClassroomResultItem(item);
    setClassroomResultReadingMode(isClassroomResult);
    setGlossaryLabel(elements.visualSpeakerName, speaker);
    setGlossaryLabel(elements.visualSpeakerRole, item.role || visualRoleForSpeaker(speaker));
    setVisualAvatarClass(isClassroomResult ? 'avatar-none' : visualAvatarClass(speaker));
    elements.visualDialogueBox?.classList.toggle('is-result', isClassroomResult);
    if (isClassroomResult) {
        elements.visualDialogueText.innerHTML = renderClassroomVerdict(text);
    } else {
        setGlossaryRichText(elements.visualDialogueText, text);
    }
}

function setVisualQueue(items = []) {
    state.timeTravel.visualQueue = items
        .filter(item => item && item.text)
        .map(normalizeVisualItem);
    state.timeTravel.visualIndex = state.timeTravel.visualQueue.length ? 0 : -1;
    state.timeTravel.visualMaxSeenIndex = state.timeTravel.visualIndex;
    state.timeTravel.visualBrowsingHistory = false;
    state.timeTravel.visualClassroomChoicesRevealed = false;
    setVisualDialogueItem(state.timeTravel.visualQueue[0]);
}

function appendVisualItems(items = [], options = {}) {
    const normalized = items
        .filter(item => item && item.text)
        .map(normalizeVisualItem);
    if (!normalized.length) return;
    const wasEmpty = !state.timeTravel.visualQueue.length;
    state.timeTravel.visualQueue.push(...normalized);
    if (wasEmpty || state.timeTravel.visualIndex < 0 || options.jumpToNew) {
        state.timeTravel.visualIndex = state.timeTravel.visualQueue.length - normalized.length;
        state.timeTravel.visualMaxSeenIndex = Math.max(state.timeTravel.visualMaxSeenIndex, state.timeTravel.visualIndex);
        state.timeTravel.visualBrowsingHistory = false;
        setVisualDialogueItem(state.timeTravel.visualQueue[state.timeTravel.visualIndex], { instant: options.instant });
    }
    updateVisualInputAvailability();
    updateVisualContinueAvailability();
}

function renderVisualChoiceButtons(payload = {}) {
    if (!elements.visualChoiceList) return;
    const choices = Array.isArray(payload.choices) ? payload.choices.filter(choice => choice?.text) : [];
    elements.visualChoiceList.innerHTML = choices.map((choice, index) => {
        const id = choice.id || String.fromCharCode(65 + index);
        return `
            <button type="button" class="ruju-visual-choice" data-choice-id="${escapeAttr(id)}">
                <span>${escapeHtml(id)}</span>
                <b>${escapeHtml(choice.text || '')}</b>
                ${choice.hint ? `<em>${escapeHtml(choice.hint)}</em>` : ''}
            </button>
        `;
    }).join('');
    elements.visualChoiceList.classList.add('hidden');
}

function visualDialogueItemsForPayload(payload = {}) {
    const dialogue = Array.isArray(payload.dialogue) ? payload.dialogue : [];
    if (payload.classroom_mode && payload.ended) {
        const verdictItem = classroomVerdictItemForPayload(payload);
        const aftermathItems = dialogue.filter(item => item?.kind !== 'system' && item?.text);
        if (verdictItem) return [...aftermathItems, verdictItem];
        const lastUserIndex = dialogue.map(item => item?.kind).lastIndexOf('user');
        return lastUserIndex >= 0 ? dialogue.slice(lastUserIndex) : dialogue;
    }
    return dialogue;
}

function showVisualHistoryIndex(index) {
    if (state.timeTravel.visualTyping || state.timeTravel.visualPhase !== "dialogue") return;
    const queue = state.timeTravel.visualQueue || [];
    const maxSeen = Math.max(-1, state.timeTravel.visualMaxSeenIndex);
    if (!queue.length || index < 0 || index >= queue.length || index > maxSeen) return;
    state.timeTravel.visualWaitingForNext = false;
    state.timeTravel.visualBrowsingHistory = index < maxSeen;
    state.timeTravel.visualIndex = index;
    setVisualDialogueItem(queue[index], { instant: true });
    updateVisualInputAvailability();
    updateVisualContinueAvailability();
}

function retreatVisualDialogue() {
    showVisualHistoryIndex(state.timeTravel.visualIndex - 1);
}

function browseVisualDialogueForward() {
    showVisualHistoryIndex(state.timeTravel.visualIndex + 1);
}

function returnToClassroomChoices() {
    const payload = state.timeTravel.payload || {};
    const choices = Array.isArray(payload.choices) ? payload.choices.filter(choice => choice?.text) : [];
    if (!choices.length) return;
    state.timeTravel.classroomCounterSubmitted = false;
    state.timeTravel.classroomPendingChoice = null;
    state.timeTravel.classroomHistorianMessages = [];
    state.timeTravel.classroomHistorianBusy = false;
    setClassroomResultReadingMode(false);
    renderVisualChoiceButtons(payload);
    state.timeTravel.visualClassroomChoicesRevealed = true;
    elements.visualDialogueBox?.classList.add('hidden');
    elements.travelVisualStage?.classList.remove('can-continue');
    updateVisualChoiceAvailability();
    elements.visualChoiceList?.classList.remove('hidden');
}

function returnToClassroomHome() {
    clearVisualTyping();
    setClassroomResultReadingMode(false);
    state.timeTravel.payload = null;
    state.timeTravel.visualPendingPayload = null;
    state.timeTravel.visualQueue = [];
    state.timeTravel.visualIndex = -1;
    state.timeTravel.visualMaxSeenIndex = -1;
    state.timeTravel.visualClassroomChoicesRevealed = false;
    state.timeTravel.classroomHistorianMessages = [];
    state.timeTravel.classroomHistorianBusy = false;
    resetClassroomThoughtState();
    state.timeTravel.sessionId = null;
    elements.timeTravelContent?.classList.remove('ruju-playing');
    elements.travelStartPanel?.classList.remove('hidden');
    elements.travelPlayPanel?.classList.add('hidden');
    elements.travelVisualPanel?.classList.add('hidden');
    elements.visualChoiceList?.classList.add('hidden');
    elements.visualDialogueBox?.classList.remove('hidden', 'is-result');
}

function handleVerdictAction(action = "") {
    if (action === "history") {
        openClassroomHistory();
    } else if (action === "historian") {
        focusClassroomHistorian();
    } else if (action === "rechoose") {
        returnToClassroomChoices();
    } else if (action === "home") {
        returnToClassroomHome();
    }
}

async function submitClassroomHistorianQuestion(form) {
    if (!form || state.timeTravel.classroomHistorianBusy || !state.timeTravel.sessionId) return;
    const input = form.querySelector('textarea[name="question"]');
    const message = input?.value.trim() || "";
    if (!message) {
        input?.focus();
        return;
    }
    state.timeTravel.classroomHistorianMessages = [
        ...(state.timeTravel.classroomHistorianMessages || []),
        { role: "user", speaker: "你", speakerRole: "学生追问", text: message },
        { role: "ai", speaker: "史官", speakerRole: "课堂问答", text: "" }
    ];
    state.timeTravel.classroomHistorianBusy = true;
    if (input) input.value = "";
    refreshClassroomHistorianPanel();

    const aiIndex = state.timeTravel.classroomHistorianMessages.length - 1;
    let streamText = "";
    let res = null;
    try {
        await apiStreamPost('/classroom/talk_stream', {
            session_id: state.timeTravel.sessionId,
            message
        }, (delta, payload) => {
            if (payload?.type !== 'delta') return;
            streamText += delta;
            const aiItem = state.timeTravel.classroomHistorianMessages[aiIndex];
            if (aiItem) aiItem.text = streamText;
            const log = elements.travelVisualStage?.querySelector('[data-classroom-historian-log]');
            const lastText = log?.querySelector('.classroom-historian-msg:last-child p');
            if (lastText) lastText.textContent = streamText;
            if (log) log.scrollTop = log.scrollHeight;
        }, (payload) => {
            if (payload.type === 'message_start') {
                const aiItem = state.timeTravel.classroomHistorianMessages[aiIndex];
                if (aiItem) {
                    aiItem.speaker = payload.speaker || "史官";
                    aiItem.speakerRole = payload.role || "课堂问答";
                }
            } else if (payload.type === 'done') {
                res = payload;
            }
        });
        const answer = res?.messages?.[0]?.text || streamText || "史官暂时没有给出回答，请换个问法再试。";
        const aiItem = state.timeTravel.classroomHistorianMessages[aiIndex];
        if (aiItem) aiItem.text = answer;
    } catch (err) {
        const aiItem = state.timeTravel.classroomHistorianMessages[aiIndex];
        if (aiItem) {
            aiItem.speaker = "旁白";
            aiItem.speakerRole = "连线提示";
            aiItem.text = err?.message || "史官暂时没有回应，请稍后再试。";
        }
    }
    state.timeTravel.classroomHistorianBusy = false;
    refreshClassroomHistorianPanel();
    focusClassroomHistorian();
}

function startVisualDialogue() {
    const payload = state.timeTravel.visualPendingPayload || state.timeTravel.payload;
    if (!payload) return;
    state.timeTravel.visualPendingPayload = null;
    state.timeTravel.payload = payload;
    renderVisualChoiceButtons(payload);
    state.timeTravel.visualClassroomChoicesRevealed = false;
    setVisualStagePhase("dialogue");
    setVisualQueue(visualDialogueItemsForPayload(payload));
    if (payload.ended && !payload.classroom_mode) {
        appendVisualItems([{ speaker: '旁白', role: '本局结果', text: payload.ending || '这一局已经收束。', kind: 'system' }], { instant: true });
    }
    updateVisualChoiceAvailability();
}

function advanceVisualDialogue() {
    if (state.timeTravel.visualTyping) return;
    const phase = state.timeTravel.visualPhase;
    if (state.timeTravel.isBusy && phase !== "dialogue") return;
    if (phase === "loading" && state.timeTravel.visualPendingPayload) {
        startVisualIntro();
        return;
    }
    if (phase === "intro") {
        if (state.timeTravel.visualIntroStep === "brief") {
            const payload = state.timeTravel.visualPendingPayload || state.timeTravel.payload;
            const pages = visualBriefingPages(payload);
            const nextPageIndex = Number(state.timeTravel.visualBriefingPageIndex || 0) + 1;
            if (nextPageIndex < pages.length) {
                startVisualBriefingPage(nextPageIndex);
            } else {
                startVisualMission();
            }
        } else {
            startVisualDialogue();
        }
        return;
    }
    if (phase !== "dialogue") return;
    const queue = state.timeTravel.visualQueue || [];
    if (!queue.length) return;
    if (state.timeTravel.visualIndex < state.timeTravel.visualMaxSeenIndex) return;
    const currentItem = queue[state.timeTravel.visualIndex];
    const nextItem = state.timeTravel.visualIndex < queue.length - 1 ? queue[state.timeTravel.visualIndex + 1] : null;
    const hasReadyNextLine = Boolean(nextItem?.text) && nextItem?.complete !== false;
    if (state.timeTravel.visualPendingUserRequest && currentItem?.kind === "user" && state.timeTravel.visualIndex >= queue.length - 1) {
        processVisualNovelPendingInput();
        return;
    }
    if (isClassroomThoughtScene() && currentItem?.thoughtGate === "initial" && !state.timeTravel.classroomInitialSubmitted) {
        openClassroomReflectionModal({
            phase: "initial",
            prompt: currentItem.reflectionPrompt || currentItem.text || ""
        });
        return;
    }
    if (isClassroomThoughtScene() && currentItem?.thoughtGate === "counter" && !state.timeTravel.classroomCounterSubmitted) {
        openClassroomReflectionModal({
            phase: "counter",
            prompt: currentItem.reflectionPrompt || currentItem.text || ""
        });
        return;
    }
    if (state.timeTravel.isBusy && !hasReadyNextLine) {
        if (currentItem?.complete !== false) {
            state.timeTravel.visualWaitingForNext = true;
            setVisualThinking("局中人", "正在商议");
        }
        return;
    }
    if (state.timeTravel.visualIndex < queue.length - 1) {
        state.timeTravel.visualIndex += 1;
        state.timeTravel.visualMaxSeenIndex = Math.max(state.timeTravel.visualMaxSeenIndex, state.timeTravel.visualIndex);
        state.timeTravel.visualWaitingForNext = false;
        state.timeTravel.visualBrowsingHistory = false;
        setVisualDialogueItem(queue[state.timeTravel.visualIndex]);
    } else if (state.timeTravel.payload?.classroom_mode && !state.timeTravel.visualClassroomChoicesRevealed) {
        if (isClassroomThoughtScene() && !state.timeTravel.classroomInitialPrompted) {
            state.timeTravel.classroomInitialPrompted = true;
            appendClassroomGateItem(classroomInitialPromptItem());
            return;
        }
        revealClassroomChoices();
    }
    updateVisualInputAvailability();
    updateVisualContinueAvailability();
}

function renderChibiTurnPanel(payload = {}) {
    const turnState = payload.turn_state || {};
    const enabled = Boolean(turnState.enabled) && !payload.classroom_mode;
    elements.visualTurnPanel?.classList.toggle('hidden', !enabled);
    if (!enabled) return;

    const maxAp = Number(turnState.max_ap || 3);
    const ap = Math.max(0, Math.min(maxAp, Number(turnState.ap ?? maxAp)));
    if (elements.visualPhase) elements.visualPhase.textContent = turnState.phase || "朝议期";
    if (elements.visualAp) elements.visualAp.textContent = `行动力 ${ap}/${maxAp}`;
    if (elements.visualLastAction) {
        const label = turnState.last_action_label || "等待你的行动";
        const cost = Number(turnState.last_action_cost || 0);
        elements.visualLastAction.textContent = cost ? `上一步：${label}，消耗 ${cost} 点` : label;
    }

    const stats = turnState.stats || {};
    const statRows = [
        ["曹军压力", stats.cao_pressure],
        ["联刘进度", stats.alliance],
        ["归降倾向", stats.surrender],
        ["江东稳定", stats.jiangdong_stability],
        ["水军准备", stats.naval_readiness],
    ];
    if (elements.visualStatusBars) {
        elements.visualStatusBars.innerHTML = statRows.map(([label, value]) => {
            const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
            return `
                <div class="ruju-status-row">
                    <span>${escapeHtml(label)}</span>
                    <i><b style="width:${safeValue}%"></b></i>
                </div>
            `;
        }).join('');
    }

    const announcements = Array.isArray(turnState.announcements) ? turnState.announcements : [];
    if (elements.visualAnnouncementList) {
        elements.visualAnnouncementList.innerHTML = announcements.length
            ? announcements.map(item => `
                <div class="ruju-announcement-item">
                    <b>${escapeHtml(item.faction || "势力")}</b>
                    <p>${escapeHtml(item.text || "")}</p>
                </div>
            `).join('')
            : '<div class="ruju-announcement-empty">行动力耗尽后，各方势力会在这里行动。</div>';
    }
}

function renderVisualNovel(payload, options = {}) {
    elements.travelVisualPanel?.classList.remove('hidden');
    elements.travelPlayPanel?.classList.add('hidden');
    setClassroomResultReadingMode(false);
    if (elements.travelVisualStage) {
        elements.travelVisualStage.className = `ruju-visual-stage scene-${payload.scene_id || 'default'}${payload.classroom_mode ? ' is-classroom' : ''}`;
    }
    renderVisualChoiceButtons(payload);
    if (elements.visualEra) elements.visualEra.textContent = [payload.era, payload.year, payload.location].filter(Boolean).join(' · ');
    if (elements.visualTitle) elements.visualTitle.textContent = payload.title || '赤壁战前的江东朝议';
    if (elements.visualRound) {
        const turn = Number(payload.turn_state?.turn || 0);
        const round = Number(payload.round || 0) + 1;
        elements.visualRound.textContent = payload.ended ? '已定局' : (turn ? `第 ${turn} 回合` : `第 ${round} 轮`);
    }
    renderChibiTurnPanel(payload);
    const people = payload.encountered || [];
    elements.travelTalkPerson.innerHTML = people.length
        ? people.map(person => `<option value="${escapeAttr(person.name || '')}">${escapeHtml(person.name || '局中人')}</option>`).join('')
        : '<option value="局中人">局中人</option>';
    elements.visualMapBtn?.classList.toggle('hidden', Boolean(payload.classroom_mode));
    if (options.awaitIntro) {
        showVisualLoaded(payload);
    } else {
        setVisualStagePhase("dialogue");
        setVisualQueue(visualDialogueItemsForPayload(payload));
    }
}

function renderTravel(payload) {
    if (!payload) return;
    state.timeTravel.payload = payload;
    elements.timeTravelContent?.classList.add('ruju-playing');
    elements.travelStartPanel?.classList.add('hidden');
    if (isVisualNovelPayload(payload)) {
        const shouldReplayIntro = !(payload.classroom_mode && (payload.ended || Number(payload.round || 0) > 0));
        renderVisualNovel(payload, { awaitIntro: shouldReplayIntro });
        return;
    }
    elements.travelVisualPanel?.classList.add('hidden');
    elements.travelPlayPanel?.classList.remove('hidden');
    elements.travelPlayPanel?.classList.toggle('ruju-choice-only', Boolean(payload.classroom_mode));
    const isIntrigue = payload.mode === 'intrigue' || payload.classroom_mode;
    elements.travelTitle.textContent = payload.title || (isIntrigue ? '入局' : '秦末求生');
    if (elements.travelRoundPill) {
        const round = Number(payload.round || 0) + 1;
        elements.travelRoundPill.textContent = payload.ended ? '已定议' : `第 ${round} 轮`;
    }

    const character = payload.character || {};
    const role = payload.user_role || {};
    elements.travelCharacterText.textContent = isIntrigue
        ? [
            character.identity || `${role.name || '局中人'} · ${role.identity || '历史现场参与者'}`,
            role.power ? `权力边界：${role.power}` : '',
            role.goal ? `目标：${role.goal}` : (character.appearance || '')
        ].filter(Boolean).join('\n')
        : [
            `${character.age || '?'}岁`,
            character.gender || '未知',
            character.identity || '无名之人',
            character.appearance || ''
        ].filter(Boolean).join(' · ');
    elements.travelMeta.innerHTML = `
        <span>${escapeHtml(payload.era || (isIntrigue ? '历史现场' : '秦末'))}</span>
        <span>${escapeHtml(payload.year || (isIntrigue ? '史事节点' : '公元前209年'))}</span>
        <span>${escapeHtml(payload.location || '未知地点')}</span>
    `;

    if (elements.travelStats) elements.travelStats.innerHTML = '';

    const sceneParts = [];
    if (payload.scene) sceneParts.push(payload.scene);
    if (payload.ended && payload.ending) sceneParts.push(`【本局结果】${payload.ending}`);
    const sceneText = sceneParts.join('\n\n');
    elements.travelScene.textContent = sceneText;

    const people = payload.encountered || [];
    elements.travelPeople.innerHTML = people.map(person => `
        <span title="${escapeAttr(person.attitude || '')}">${escapeHtml(person.name || '陌生人')} · ${escapeHtml(person.role || '路人')}</span>
    `).join('');
    elements.travelTalkPerson.innerHTML = people.length
        ? people.map(person => `<option value="${escapeAttr(person.name || '')}">${escapeHtml(person.name || '陌生人')}</option>`).join('')
        : '<option value="路人">路人</option>';

    if (elements.travelChoiceList) {
        const choices = Array.isArray(payload.choices) ? payload.choices.filter(choice => choice?.text) : [];
        elements.travelChoiceList.innerHTML = choices.map((choice, index) => `
            <button type="button" class="travel-choice" data-choice-id="${escapeAttr(choice.id || String.fromCharCode(65 + index))}">
                <span class="travel-choice-id">${escapeHtml(choice.id || String.fromCharCode(65 + index))}</span>
                <span class="travel-choice-main">
                    <b>${escapeHtml(choice.text || '')}</b>
                    ${choice.hint ? `<em>${escapeHtml(choice.hint)}</em>` : ''}
                </span>
            </button>
        `).join('');
        elements.travelChoiceList.classList.toggle('hidden', !choices.length || Boolean(payload.ended));
    }
    elements.travelTalkLog.innerHTML = '';
    (payload.dialogue || []).forEach(item => {
        appendTravelTalk(item.kind || 'ai', item.text || '', item.speaker || '', item.role || '');
    });
    if (payload.ended) {
        appendTravelTalk('system', payload.ending || '这一局已经收束。可以重新入局，再换一个身份。', '本局结果', '');
    }
    elements.travelTalkInput.disabled = Boolean(payload.ended);
    elements.travelTalkBtn.disabled = Boolean(payload.ended);
    if (elements.travelDecideBtn) elements.travelDecideBtn.disabled = Boolean(payload.ended);
}

async function startTimeTravel(options = {}) {
    if (state.timeTravel.isBusy) return;
    const isPrivateEntry = decodeURIComponent(window.location.hash.substring(1)) === PRIVATE_TIME_TRAVEL_HASH;
    const hadPayload = Boolean(state.timeTravel.payload);
    const sceneId = options.sceneId || VISUAL_NOVEL_SCENE_ID;
    const isVisualScene = sceneId === VISUAL_NOVEL_SCENE_ID || sceneId.startsWith('law_');
    state.timeTravel.activeSceneId = sceneId;
    state.timeTravel.classroomHistorianMessages = [];
    state.timeTravel.classroomHistorianBusy = false;
    showTimeTravel({ privateEntry: isPrivateEntry });
    if (isVisualScene) {
        prepareVisualLoading(sceneId);
    } else {
        prepareChoiceTravelLoading();
    }
    setTravelBusy(true);
    const loadingStartedAt = Date.now();
    elements.travelStartBtn.textContent = '正在入局...';
    if (isVisualScene) startTravelLoadingLoop('start');
    elements.travelTalkLog.innerHTML = '';
    const res = await apiPost('/time_travel/start', {
        seed: `${USER_ID}-${Date.now()}`,
        scene_id: sceneId
    });
    await wait(Math.max(0, (sceneId === VISUAL_NOVEL_SCENE_ID ? 3600 : 700) - (Date.now() - loadingStartedAt)));
    elements.travelStartBtn.textContent = '随机入局';
    setTravelBusy(false);
    if (isVisualScene) stopTravelLoading();
    if (!res || !res.success) {
        elements.timeTravelContent?.classList.toggle('ruju-playing', hadPayload);
        if (!hadPayload) elements.travelStartPanel?.classList.remove('hidden');
        if (!hadPayload) elements.travelVisualPanel?.classList.add('hidden');
        alert(res?.error || '这次入局失败了，请稍后重试。');
        return;
    }
    state.timeTravel.sessionId = res.session_id;
    renderTravel(res);
    trackAnalytics('time_travel', { detail: 'start' });
}

async function chooseTravelChoice(choiceId) {
    if (state.timeTravel.isBusy || !state.timeTravel.sessionId) return;
    setTravelBusy(true);
    startTravelLoadingLoop('choice');
    const res = await apiPost('/time_travel/choose', {
        session_id: state.timeTravel.sessionId,
        choice_id: String(choiceId || '')
    });
    setTravelBusy(false);
    stopTravelLoading();
    if (!res || !res.success) {
        alert(res?.error || '这一轮推进失败，请重试。');
        return;
    }
    state.timeTravel.classroomPendingChoice = null;
    state.timeTravel.classroomHistorianMessages = [];
    state.timeTravel.classroomHistorianBusy = false;
    renderTravel(res);
    trackAnalytics('time_travel', { detail: 'choose' });
}

async function handleTravelChoice(e) {
    const button = e.target.closest('[data-choice-id]');
    if (!button || state.timeTravel.isBusy || !state.timeTravel.sessionId) return;
    const choiceId = String(button.dataset.choiceId || '');
    const payload = state.timeTravel.payload || {};
    const choice = (payload.choices || []).find(item => String(item?.id || "") === choiceId) || { id: choiceId, text: "" };
    if (isClassroomThoughtScene(payload) && !state.timeTravel.classroomCounterSubmitted) {
        state.timeTravel.classroomPendingChoice = {
            id: choiceId,
            text: String(choice?.text || "")
        };
        state.timeTravel.visualClassroomChoicesRevealed = false;
        elements.visualChoiceList?.classList.add('hidden');
        elements.visualDialogueBox?.classList.remove('hidden');
        appendClassroomGateItem(classroomCounterPromptForChoice(choice));
        return;
    }
    return chooseTravelChoice(choiceId);
    setTravelBusy(true);
    startTravelLoadingLoop('choice');
    const res = await apiPost('/time_travel/choose', {
        session_id: state.timeTravel.sessionId,
        choice_id: String(button.dataset.choiceId || '')
    });
    setTravelBusy(false);
    stopTravelLoading();
    if (!res || !res.success) {
        alert(res?.error || '这一轮推进失败，请重试。');
        return;
    }
    renderTravel(res);
    trackAnalytics('time_travel', { detail: 'choose' });
}

function appendTravelTalk(role, text, speaker = '', speakerRole = '') {
    const item = document.createElement('div');
    item.className = `travel-talk-item ${role}`;
    const name = speaker || (role === 'user' ? '你' : role === 'system' ? '旁白' : '局中人');
    item.innerHTML = `
        <div class="travel-talk-speaker">
            <b>${escapeHtml(name)}</b>
            ${speakerRole ? `<span>${escapeHtml(speakerRole)}</span>` : ''}
        </div>
        <p>${escapeHtml(text)}</p>
    `;
    elements.travelTalkLog.appendChild(item);
    elements.travelTalkLog.scrollTop = elements.travelTalkLog.scrollHeight;
    return item;
}

function updateTravelTalkText(item, text) {
    const textNode = item?.querySelector('p');
    if (!textNode) return;
    textNode.textContent = text;
    elements.travelTalkLog.scrollTop = elements.travelTalkLog.scrollHeight;
}

async function talkTimeTravel() {
    const message = elements.travelTalkInput.value.trim();
    if (!message || state.timeTravel.isBusy || !state.timeTravel.sessionId) return;
    elements.travelTalkInput.value = '';
    await submitTravelTalk(message, false);
}

async function submitVisualNovelInput(forceDecision = false, options = {}) {
    const rawMessage = elements.visualPlayerInput?.value.trim() || "";
    const message = options.endTurn
        ? "本轮暂不行动，观察曹操、刘备和江东内部的动向。"
        : (rawMessage || (forceDecision ? "按当前判断推进下一步。" : ""));
    if (!message || state.timeTravel.isBusy || !state.timeTravel.sessionId) return;
    const activeSpeaker = state.timeTravel.visualQueue[state.timeTravel.visualIndex]?.speaker || "";
    const targetSpeaker = activeSpeaker === "你" || !activeSpeaker
        ? (elements.travelTalkPerson.value || "周瑜")
        : activeSpeaker;
    state.timeTravel.visualPendingUserRequest = {
        message,
        forceDecision: options.endTurn ? false : forceDecision,
        person: targetSpeaker
    };
    elements.visualInputForm?.classList.add('hidden');
    elements.visualPlayerInput.value = "";
    appendVisualItems([{
        speaker: "你",
        role: state.timeTravel.payload?.user_role?.identity || "孙权",
        text: message,
        kind: "user"
    }], { jumpToNew: true });
}

async function processVisualNovelPendingInput() {
    const pending = state.timeTravel.visualPendingUserRequest;
    if (!pending || state.timeTravel.isBusy || !state.timeTravel.sessionId) return;
    state.timeTravel.visualPendingUserRequest = null;
    setTravelBusy(true);
    const streamedMessages = [];
    let streamText = "";
    let streamIndex = -1;
    let currentStreamItem = null;
    let displayedStreamItem = null;
    let res = null;
    const currentSpeaker = pending.person || elements.travelTalkPerson.value || "周瑜";
    setVisualThinking(currentSpeaker, visualRoleForSpeaker(currentSpeaker));
    try {
        await apiStreamPost('/time_travel/talk_stream', {
            session_id: state.timeTravel.sessionId,
            person: currentSpeaker === "你" ? (elements.travelTalkPerson.value || "周瑜") : currentSpeaker,
            message: pending.message,
            force_decision: pending.forceDecision
        }, (delta, payload) => {
            if (payload?.type !== 'delta') return;
            streamText += delta;
            if (streamedMessages[streamIndex]) {
                streamedMessages[streamIndex].text = streamText;
            }
            if (currentStreamItem) {
                currentStreamItem.text = streamText;
                if (currentStreamItem === displayedStreamItem) {
                    setVisualStreamText(currentStreamItem, streamText);
                }
            }
        }, (payload) => {
            if (payload.type === 'message_start') {
                streamText = '';
                state.timeTravel.visualTyping = true;
                elements.travelVisualStage?.classList.remove('can-continue');
                elements.visualInputForm?.classList.add('hidden');
                elements.visualDialogueContinue?.classList.add('hidden');
                const item = {
                    speaker: payload.speaker || '局中人',
                    role: payload.role || visualRoleForSpeaker(payload.speaker || ''),
                    text: '',
                    kind: payload.kind || 'ai',
                    complete: false
                };
                streamedMessages.push(item);
                streamIndex = streamedMessages.length - 1;
                currentStreamItem = item;
                state.timeTravel.visualQueue.push(item);
                if (!displayedStreamItem || state.timeTravel.visualWaitingForNext) {
                    displayedStreamItem = item;
                    state.timeTravel.visualWaitingForNext = false;
                    state.timeTravel.visualIndex = state.timeTravel.visualQueue.length - 1;
                    state.timeTravel.visualMaxSeenIndex = Math.max(state.timeTravel.visualMaxSeenIndex, state.timeTravel.visualIndex);
                    state.timeTravel.visualBrowsingHistory = false;
                    setVisualThinking(item.speaker, item.role);
                }
            } else if (payload.type === 'message_end') {
                streamText = '';
                if (currentStreamItem) currentStreamItem.complete = true;
                if (currentStreamItem === displayedStreamItem) {
                    state.timeTravel.visualTyping = false;
                    updateVisualInputAvailability();
                    updateVisualContinueAvailability();
                }
                currentStreamItem = null;
            } else if (payload.type === 'done') {
                res = payload;
            }
        });
    } catch (err) {
        appendVisualItems([{ speaker: '旁白', role: '系统', text: err?.message || '对方没有回应，时空连线似乎断了一下。', kind: 'system' }]);
        setTravelBusy(false);
        state.timeTravel.visualTyping = false;
        return;
    }
    setTravelBusy(false);
    state.timeTravel.visualTyping = false;
    if (state.timeTravel.visualWaitingForNext) {
        const queue = state.timeTravel.visualQueue || [];
        const nextItem = queue[state.timeTravel.visualIndex + 1];
        state.timeTravel.visualWaitingForNext = false;
        if (nextItem?.text) {
            state.timeTravel.visualIndex += 1;
            state.timeTravel.visualMaxSeenIndex = Math.max(state.timeTravel.visualMaxSeenIndex, state.timeTravel.visualIndex);
            state.timeTravel.visualBrowsingHistory = false;
            setVisualDialogueItem(nextItem, { instant: true });
        } else if (displayedStreamItem) {
            state.timeTravel.visualMaxSeenIndex = Math.max(state.timeTravel.visualMaxSeenIndex, state.timeTravel.visualIndex);
            state.timeTravel.visualBrowsingHistory = false;
            setVisualDialogueItem(displayedStreamItem, { instant: true });
        }
    }
    updateVisualInputAvailability();
    updateVisualContinueAvailability();
    if (res?.turn_state && state.timeTravel.payload) {
        state.timeTravel.payload.turn_state = res.turn_state;
        state.timeTravel.payload.ended = Boolean(res.ended);
        state.timeTravel.payload.ending = res.ending || "";
        renderChibiTurnPanel(state.timeTravel.payload);
    }
    if (res?.round !== undefined && elements.visualRound) {
        const turn = Number(res.turn_state?.turn || state.timeTravel.payload?.turn_state?.turn || 0);
        elements.visualRound.textContent = res.ended ? '已定局' : (turn ? `第 ${turn} 回合` : `第 ${Number(res.round || 0) + 1} 轮`);
    }
    if (res?.ended) {
        state.timeTravel.payload.ended = true;
        elements.visualPlayerInput.disabled = true;
        elements.visualSendBtn.disabled = true;
        elements.visualDecideBtn.disabled = true;
    }
    trackAnalytics('time_travel', { detail: pending.forceDecision ? 'visual_decision' : 'visual_talk', character: streamedMessages[0]?.speaker || '' });
}

function openTravelDecisionModal() {
    if (state.timeTravel.isBusy || !state.timeTravel.sessionId || state.timeTravel.payload?.ended) return;
    elements.travelDecisionInput.value = '';
    elements.travelDecisionModal?.classList.remove('hidden');
    elements.travelDecisionModal?.setAttribute('aria-hidden', 'false');
    setTimeout(() => elements.travelDecisionInput?.focus(), 0);
}

function closeTravelDecisionModal() {
    elements.travelDecisionModal?.classList.add('hidden');
    elements.travelDecisionModal?.setAttribute('aria-hidden', 'true');
}

async function publishTravelDecision() {
    const message = elements.travelDecisionInput.value.trim();
    if (!message || state.timeTravel.isBusy || !state.timeTravel.sessionId) return;
    closeTravelDecisionModal();
    await submitTravelTalk(message, true);
}

async function submitTravelTalk(message, forceDecision = false) {
    const person = elements.travelTalkPerson.value;
    const role = state.timeTravel.payload?.user_role || {};
    appendTravelTalk('user', message, role.name || '你', role.identity || '玩家');
    setTravelBusy(true);
    const streamedMessages = [];
    let streamItem = null;
    let streamText = '';
    let streamIndex = -1;
    let res = null;
    try {
        await apiStreamPost('/time_travel/talk_stream', {
            session_id: state.timeTravel.sessionId,
            person,
            message,
            force_decision: forceDecision
        }, (delta, payload) => {
            if (payload?.type !== 'delta' || !streamItem) return;
            streamText += delta;
            if (streamedMessages[streamIndex]) streamedMessages[streamIndex].text = streamText;
            updateTravelTalkText(streamItem, streamText);
        }, (payload) => {
            if (payload.type === 'message_start') {
                streamText = '';
                streamItem = appendTravelTalk(payload.kind || 'ai', '', payload.speaker || '', payload.role || '');
                streamedMessages.push({
                    speaker: payload.speaker || '',
                    role: payload.role || '',
                    text: '',
                    kind: payload.kind || 'ai'
                });
                streamIndex = streamedMessages.length - 1;
            } else if (payload.type === 'message_end') {
                streamItem = null;
                streamText = '';
            } else if (payload.type === 'done') {
                res = payload;
            }
        });
    } catch (err) {
        appendTravelTalk('system', err?.message || '对方没有回应，时空连线似乎断了一下。');
        setTravelBusy(false);
        return;
    }
    setTravelBusy(false);
    res = res || { success: true, messages: streamedMessages, ended: false, round: 0 };
    if (elements.travelRoundPill) {
        elements.travelRoundPill.textContent = res.ended ? '已定议' : `第 ${Number(res.round || 0) + 1} 轮`;
    }
    if (res.ended) {
        elements.travelTalkInput.disabled = true;
        elements.travelTalkBtn.disabled = true;
        if (elements.travelDecideBtn) elements.travelDecideBtn.disabled = true;
    }
    trackAnalytics('time_travel', { detail: forceDecision ? 'decision' : 'talk', character: (streamedMessages || [])[0]?.speaker || '' });
}

function appendGuessLog(role, text) {
    const item = document.createElement('div');
    item.className = `guess-log-item ${role}`;
    item.textContent = text;
    elements.guessLog.appendChild(item);
    elements.guessLog.scrollTop = elements.guessLog.scrollHeight;
}

function resetGuessGame() {
    state.guessGame = {
        sessionId: null,
        userPerson: "",
        transcript: [],
        pendingAiGuess: "",
        ended: false
    };
    elements.guessSetup.classList.remove('hidden');
    elements.guessPlay.classList.add('hidden');
    elements.guessLog.innerHTML = '';
    elements.guessInput.value = '';
    elements.guessMyPerson.textContent = '你的人物：未设定';
    elements.guessRevealBtn.disabled = false;
    elements.guessInput.disabled = false;
    elements.guessAskBtn.disabled = false;
    elements.guessGuessBtn.disabled = false;
    elements.guessUserAnswer.classList.add('hidden');
}

async function startGuessGame() {
    const person = elements.guessUserPerson.value.trim();
    if (!person) {
        alert("请先写下你心里的人物。");
        return;
    }
    const res = await apiPost('/guess_game/start', { user_seed: `${person}-${Date.now()}` });
    if (!res || !res.success) {
        alert("游戏启动失败，请重试。");
        return;
    }
    state.guessGame = {
        sessionId: res.session_id,
        userPerson: person,
        transcript: [],
        pendingAiGuess: "",
        ended: false
    };
    elements.guessSetup.classList.add('hidden');
    elements.guessPlay.classList.remove('hidden');
    elements.guessLog.innerHTML = '';
    elements.guessStatus.textContent = res.message;
    elements.guessMyPerson.textContent = `你的人物：${person}`;
    elements.guessRevealBtn.disabled = false;
    elements.guessInput.disabled = false;
    elements.guessAskBtn.disabled = false;
    elements.guessGuessBtn.disabled = false;
    appendGuessLog('system', `你的人物已锁定。AI 的人物也已锁定。`);
    trackAnalytics('guess_action', { detail: 'start' });
}

async function revealGuessGameAnswer() {
    if (!state.guessGame.sessionId || state.guessGame.ended) return;
    if (!confirm("确定要揭晓 AI 的人物并结束本轮吗？")) return;
    const res = await apiPost('/guess_game/reveal', {
        session_id: state.guessGame.sessionId
    });
    if (!res || !res.success) {
        alert("揭晓失败，请重试。");
        return;
    }
    state.guessGame.ended = true;
    elements.guessStatus.textContent = `AI 的人物是 ${res.answer}。本轮已结束。`;
    appendGuessLog('system', res.message);
    trackAnalytics('guess_action', { detail: 'reveal' });
    elements.guessUserAnswer.classList.add('hidden');
    elements.guessRevealBtn.disabled = true;
    elements.guessInput.disabled = true;
    elements.guessAskBtn.disabled = true;
    elements.guessGuessBtn.disabled = true;
}

async function askGuessGameQuestion() {
    const question = elements.guessInput.value.trim();
    if (!question || state.guessGame.ended) return;
    elements.guessInput.value = '';
    appendGuessLog('user', `你问：${question}`);
    const res = await apiPost('/guess_game/ask_ai', {
        session_id: state.guessGame.sessionId,
        question
    });
    if (!res || !res.success) {
        alert("AI 回答失败，请重试。");
        return;
    }
    if (res.valid === false) {
        appendGuessLog('system', res.answer);
        elements.guessStatus.textContent = "这次不算回合。请换成判断范围的问题，或直接点击“猜答案”。";
        return;
    }
    appendGuessLog('ai', `AI 答：${res.answer}`);
    trackAnalytics('guess_action', { detail: 'ask_ai' });
    state.guessGame.transcript.push({ side: 'user_question', text: question, answer: res.answer });
    await runAiGuessTurn();
}

async function guessAiPerson() {
    const guess = elements.guessInput.value.trim();
    if (!guess || state.guessGame.ended) return;
    elements.guessInput.value = '';
    appendGuessLog('user', `你猜：${guess}`);
    const res = await apiPost('/guess_game/guess_ai', {
        session_id: state.guessGame.sessionId,
        guess
    });
    if (!res || !res.success) {
        alert("猜测提交失败，请重试。");
        return;
    }
    appendGuessLog(res.correct ? 'system' : 'ai', res.message);
    trackAnalytics('guess_action', { detail: res.correct ? 'guess_correct' : 'guess_wrong' });
    if (res.correct) {
        state.guessGame.ended = true;
        elements.guessStatus.textContent = `你猜中了，AI 的人物是 ${res.answer}。`;
        elements.guessRevealBtn.disabled = true;
        elements.guessInput.disabled = true;
        elements.guessAskBtn.disabled = true;
        elements.guessGuessBtn.disabled = true;
        return;
    }
    state.guessGame.transcript.push({ side: 'user_guess', text: guess, answer: '不是' });
    await runAiGuessTurn();
}

async function runAiGuessTurn() {
    const res = await apiPost('/guess_game/ai_turn', {
        session_id: state.guessGame.sessionId,
        transcript: state.guessGame.transcript
    });
    if (!res || !res.success) {
        alert("AI 提问失败，请重试。");
        return;
    }
    if (res.type === 'guess') {
        state.guessGame.pendingAiGuess = res.text;
        appendGuessLog('ai', `AI 猜：${res.text}`);
        elements.guessStatus.textContent = "AI 正在猜你的人物，请回答是、不是或不确定。";
    } else {
        state.guessGame.pendingAiGuess = "";
        appendGuessLog('ai', `AI 问：${res.text}`);
        elements.guessStatus.textContent = "请用是、不是或不确定回答 AI 的问题。";
    }
    state.guessGame.pendingAiQuestion = res.text;
    elements.guessUserAnswer.classList.remove('hidden');
}

function handleUserYesNoAnswer(e) {
    const button = e.target.closest('[data-answer]');
    if (!button || state.guessGame.ended) return;
    const answer = button.dataset.answer;
    elements.guessUserAnswer.classList.add('hidden');

    if (state.guessGame.pendingAiGuess) {
        appendGuessLog('user', `你答：${answer}`);
        state.guessGame.transcript.push({ side: 'ai_guess', text: state.guessGame.pendingAiGuess, answer });
        if (answer === '是') {
            state.guessGame.ended = true;
            elements.guessStatus.textContent = `AI 猜中了，你的人物是 ${state.guessGame.userPerson}。`;
            appendGuessLog('system', `本轮结束：AI 猜中了。`);
            elements.guessRevealBtn.disabled = true;
            elements.guessInput.disabled = true;
            elements.guessAskBtn.disabled = true;
            elements.guessGuessBtn.disabled = true;
        } else {
            elements.guessStatus.textContent = "轮到你继续提问或猜答案。";
        }
        return;
    }

    appendGuessLog('user', `你答：${answer}`);
    state.guessGame.transcript.push({ side: 'ai_question', text: state.guessGame.pendingAiQuestion, answer });
    elements.guessStatus.textContent = "轮到你继续提问或猜答案。";
}


async function apiStreamPost(endpoint, data, onDelta, onEvent) {
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CLIENT-ID': USER_ID },
        body: JSON.stringify(data)
    });
    if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const packets = buffer.split('\n\n');
        buffer = packets.pop() || '';

        for (const packet of packets) {
            const line = packet.split('\n').find(item => item.startsWith('data: '));
            if (!line) continue;
            const payload = JSON.parse(line.slice(6));
            if (payload.error) {
                throw new Error(payload.error);
            }
            if (onEvent) {
                onEvent(payload);
            }
            if (payload.delta) {
                onDelta(payload.delta, payload);
            }
        }
    }
}

function renderAnswerModeOptions() {
    if (!elements.answerModeOptions) return;
    elements.answerModeOptions.querySelectorAll('[data-mode]').forEach(button => {
        button.classList.toggle('active', button.dataset.mode === state.answerMode);
    });
}

// 暴露给全局的点击事件
window.setAtTarget = function(char) {
    state.currentTarget = char;
    renderChatControls();
    elements.chatInput.focus();
}

// ================= 聊天逻辑渲染 =================
function isNearChatBottom(threshold = 96) {
    const el = elements.chatHistoryWrapper;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
}

function scrollChatToBottom() {
    if (!elements.chatHistoryWrapper) return;
    elements.chatHistoryWrapper.scrollTop = elements.chatHistoryWrapper.scrollHeight;
}

function renderChat(options = {}) {
    const history = state.chatHistory[state.currentEventId] || [];
    const shouldStickToBottom = options.stickToBottom ?? isNearChatBottom();
    
    if(history.length === 0) {
        elements.chatEmptyState.classList.remove('hidden');
        elements.chatHistoryWrapper.innerHTML = '';
        elements.chatHistoryWrapper.appendChild(elements.chatEmptyState);
        return;
    }
    
    elements.chatEmptyState.classList.add('hidden');
    let html = '';
    
    history.forEach((msg, index) => {
        if(msg.role === 'user') {
            html += `
            <div class="message-selectable flex flex-col items-end mb-4 bubble-enter pr-2" data-message-index="${index}">
                <span class="text-[10px] text-[#8c7a66] mb-1 uppercase tracking-widest">后生 (我)</span>
                <div class="chat-bubble-user px-5 py-3 border border-[#8c7a66]/30 text-[#35251a] rounded max-w-[85%] whitespace-pre-wrap leading-relaxed">${escapeHtml(msg.content)}</div>
            </div>`;
        } else {
            const formattedContent = formatChatContent(msg.content);
            let charName = msg.target || "涉案人";
            
            html += `
            <div class="message-selectable flex flex-col items-start mb-6 bubble-enter pl-2" data-message-index="${index}">
                <span class="text-xs text-[#8b2323] font-bold mb-1 ml-1 flex items-center gap-1 font-serif">
                    <span class="opacity-50">@</span> ${escapeHtml(charName)}
                </span>
                <div class="chat-bubble-ai border-t-2 border-t-[#8b2323] text-[#35251a] px-6 py-4 rounded max-w-[95%] shadow whitespace-pre-wrap leading-[2] text-[15px] bg-[#fcf8f2]">${formattedContent}</div>
            </div>`;
        }
    });
    
    elements.chatHistoryWrapper.innerHTML = `<div id="chat-empty-state" class="hidden"></div>` + html;
    if (shouldStickToBottom) {
        scrollChatToBottom();
    }
}

function formatChatContent(content) {
    return escapeHtml(content || '')
        .replace(/\*\*(.*?)\*\*/g, '<b class="text-[#5c1313] font-black">$1</b>')
        .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold text-[#5c1313] mb-2" style="font-family: \'Ma Shan Zheng\', serif;">$1</h3>');
}

function updateAssistantBubble(messageIndex, content, options = {}) {
    const shouldStickToBottom = options.stickToBottom ?? isNearChatBottom();
    const bubble = elements.chatHistoryWrapper.querySelector(`[data-message-index="${messageIndex}"] .chat-bubble-ai`);
    if (!bubble) return;
    bubble.innerHTML = formatChatContent(content);
    if (shouldStickToBottom) {
        scrollChatToBottom();
    }
}

async function saveChatToServer() {
    if (!state.currentEventId) return;
    const messages = state.chatHistory[state.currentEventId] || [];
    await apiPost('/chat_history', {
        event_name: state.currentEventId,
        messages: messages
    });
}

function escapeHtml(unsafe) {
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");
}

function escapeAttr(unsafe) {
    return escapeHtml(unsafe)
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function sanitizeStoryHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach(node => node.remove());
    template.content.querySelectorAll('*').forEach(node => {
        [...node.attributes].forEach(attr => {
            const name = attr.name.toLowerCase();
            const value = attr.value.trim().toLowerCase();
            if (name.startsWith('on') || ((name === 'href' || name === 'src') && value.startsWith('javascript:'))) {
                node.removeAttribute(attr.name);
            }
        });
    });
    return template.innerHTML;
}

function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function enhanceStoryKeywords(html, localKeywords = []) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const keywords = [...new Set([...STORY_KEYWORDS, ...localKeywords]
        .map(item => String(item || '').trim())
        .filter(item => item.length >= 2))]
        .sort((a, b) => b.length - a.length);
    if (keywords.length === 0) return template.innerHTML;

    const keywordPattern = new RegExp(keywords.map(escapeRegExp).join('|'), 'g');
    const usedKeywords = new Set();
    template.content.querySelectorAll('p').forEach(paragraph => {
        let highlightedCount = 0;
        const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                if (parent.closest('b, strong, a, script, style, .story-keyword')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        textNodes.forEach(node => {
            if (highlightedCount >= 4) return;
            const text = node.nodeValue;
            keywordPattern.lastIndex = 0;
            let match;
            let cursor = 0;
            const fragment = document.createDocumentFragment();
            let changed = false;

            while ((match = keywordPattern.exec(text)) && highlightedCount < 4) {
                if (usedKeywords.has(match[0])) continue;
                if (match.index > cursor) {
                    fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));
                }
                const keyword = document.createElement('b');
                keyword.className = 'story-keyword';
                keyword.textContent = match[0];
                fragment.appendChild(keyword);
                cursor = match.index + match[0].length;
                highlightedCount += 1;
                usedKeywords.add(match[0]);
                changed = true;
            }

            if (!changed) return;
            if (cursor < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(cursor)));
            }
            node.replaceWith(fragment);
        });
    });
    return template.innerHTML;
}

// ================= AI 交互核心桥接 =================
async function handleUserSubmit() {
    const text = elements.chatInput.value.trim();
    if(!text) return;
    const eventCharacters = state.currentEventData?.characters || [];
    if (eventCharacters.length === 0) {
        showToast("请先进入具体事件，再向历史人物提问。");
        return;
    }
    if (!isLoggedIn() && getGuestChatCount() >= GUEST_CHAT_LIMIT) {
        promptLoginForMoreChat();
        return;
    }
    
    // 阻止重复提交
    elements.chatInput.disabled = true;
    elements.chatSubmit.disabled = true;
    elements.chatSpinner.classList.add('active'); // 激活动画
    elements.chatSpinner.classList.remove('hidden');
    
    const target = state.currentTarget;
    const finalContent = target === "所有参与人" ? text : `**@${target}** ${text}`;
    
    // 1. 本地更新UI
    state.chatHistory[state.currentEventId].push({
        role: "user",
        content: finalContent,
        target: target
    });
    renderChat({ stickToBottom: true });
    elements.chatInput.value = '';
    
    saveChatToServer();
    
    try {
        // 2. 如果是群发，需不需要轮流触发（为了简化并复用小程序的单点API逻辑，我们让网页端直接分别调api即可）
        // 但这里我们做个优雅的高级博弈适配：如果@所有参与人，我们按序让前两个人物回答
        
        let responsers = [];
        if(target === "所有参与人" && eventCharacters.length > 0) {
            // 取前两个重要当事人接招
            responsers = eventCharacters;
        } else {
            responsers = [target];
        }
        
        for(let i=0; i<responsers.length; i++) {
            const speaker = responsers[i];
            
            // 构建类似小程序发送给API的格式 (提取近十条聊天记录喂给 AI)
            const recentHistory = state.chatHistory[state.currentEventId].slice(-10);
            
            const payload = {
                event_name: state.currentEventId,
                character: speaker,
                message: target === "所有参与人" && i > 0 ? "前辈, 请问您对刚才的说法有什么高见？" : text,
                history: recentHistory,
                answer_mode: state.answerMode,
                track_question: i === 0
            };
            
            const assistantMessage = {
                role: "assistant",
                content: "",
                target: speaker
            };
            state.chatHistory[state.currentEventId].push(assistantMessage);
            const assistantMessageIndex = state.chatHistory[state.currentEventId].length - 1;
            renderChat({ stickToBottom: true });
            updateAssistantBubble(assistantMessageIndex, "正在连线时空信号...", { stickToBottom: true });

            let hasFirstDelta = false;
            let pendingStreamContent = "";
            let streamRenderQueued = false;
            await apiStreamPost('/chat_stream', payload, (delta) => {
                if (!hasFirstDelta) {
                    assistantMessage.content = "";
                    hasFirstDelta = true;
                }
                assistantMessage.content += delta;
                pendingStreamContent = assistantMessage.content;
                if (!streamRenderQueued) {
                    streamRenderQueued = true;
                    requestAnimationFrame(() => {
                        updateAssistantBubble(assistantMessageIndex, pendingStreamContent);
                        streamRenderQueued = false;
                    });
                }
            });
            updateAssistantBubble(assistantMessageIndex, assistantMessage.content);
            saveChatToServer();
        }
        incrementGuestChatCount();
    } catch (e) {
        console.error("对话异常", e);
        alert("访谈信号混乱，请重试！");
    } finally {
        elements.chatInput.disabled = false;
        elements.chatSubmit.disabled = false;
        elements.chatSpinner.classList.remove('active');
        elements.chatSpinner.classList.add('hidden');
        elements.chatInput.focus();
    }
}

// ================= 移动端交互 =================
function initMobile() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const tabStory = document.getElementById('mobile-tab-story');
    const tabChat = document.getElementById('mobile-tab-chat');
    const storySection = document.getElementById('story-section');
    const chatSection = document.getElementById('chat-section');

    if (!menuBtn || !tabStory || !tabChat) return;

    function openSidebar() {
        sidebar.classList.add('mobile-open');
        overlay.classList.add('mobile-open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('mobile-open');
        document.body.style.overflow = '';
    }

    function toggleSidebar() {
        if (sidebar.classList.contains('mobile-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    menuBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);

    document.getElementById('nav-container').addEventListener('click', (e) => {
        const link = e.target.closest('.nav-item');
        if (link) {
            closeSidebar();
            switchToStory();
        }
    });

    function switchToStory() {
        storySection.classList.add('mobile-active');
        chatSection.classList.remove('mobile-active');
        tabStory.classList.add('text-[#f0c9a8]', 'border-[#c62828]');
        tabStory.classList.remove('text-[#8c7a66]', 'border-transparent');
        tabChat.classList.add('text-[#8c7a66]', 'border-transparent');
        tabChat.classList.remove('text-[#f0c9a8]', 'border-[#c62828]');
    }

    function switchToChat() {
        chatSection.classList.add('mobile-active');
        storySection.classList.remove('mobile-active');
        tabChat.classList.add('text-[#f0c9a8]', 'border-[#c62828]');
        tabChat.classList.remove('text-[#8c7a66]', 'border-transparent');
        tabStory.classList.add('text-[#8c7a66]', 'border-transparent');
        tabStory.classList.remove('text-[#f0c9a8]', 'border-[#c62828]');
    }

    tabStory.addEventListener('click', switchToStory);
    tabChat.addEventListener('click', switchToChat);
    switchToStory();
}

function startApp() {
    bindHistoricalRpgEntry();
    init();
    initMobile();
}

// 启动入口：module 脚本可能在 load 之后执行，需兼容两种时机。
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
    startApp();
}
