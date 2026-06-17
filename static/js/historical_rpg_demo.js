const DEMO_ASSETS = {
    road: "/static/images/career/tang-roadside-crime.png",
    post: "/static/images/ruju-demo/huaiyuan-post.png",
    funeral: "/static/images/ruju-demo/riverside-funeral.png",
    ferry: "/static/images/ruju-demo/abandoned-ferry.png",
    shrine: "/static/images/career/tang-roadside-crime.png",
    shenYan: "/static/images/ruju-demo/shen-yan-cutout.png",
    clerk: "/static/images/ruju-demo/wu-chong-cutout.png",
    oldWoman: "/static/images/ruju-demo/funeral-woman-cutout.png",
    postmaster: "/static/images/ruju-demo/he-liu-cutout.png",
    sunPing: "/static/images/ruju-demo/sun-ping-cutout.png",
};

const DEMO_BGM = "/static/audio/ruju-demo/bgm/lingao-winter-road.wav";

const TIME_LABELS = ["黄昏", "入夜", "一更", "二更", "将晓"];
const SCENE_LIMITS = { funeral: 3, post: 3 };
const TESTIMONY_LINES = {
    oldWoman: {
        title: "送葬老妇的证词",
        prompt: "她想让这具尸体无名下葬。哪一句话站不住？",
        witness: "送葬老妇",
        statements: [
            { id: "drifted", text: "昨夜河水把他冲到滩上。" },
            { id: "unknown", text: "村里没人认得他。" },
            { id: "no_official", text: "他身上没有官家的东西。" },
            { id: "shoe", text: "那只鞋，是村里孩子的旧鞋。" },
        ],
    },
};

const PEOPLE = {
    "沈砚": { role: "同行商旅", portrait: DEMO_ASSETS.shenYan, side: "left" },
    "吴崇": { role: "临皋县书吏", portrait: DEMO_ASSETS.clerk, side: "right" },
    "送葬老妇": { role: "河畔村民", portrait: DEMO_ASSETS.oldWoman, side: "right" },
    "何六": { role: "怀远驿驿长", portrait: DEMO_ASSETS.postmaster, side: "right" },
    "孙平": { role: "失踪驿卒", portrait: DEMO_ASSETS.sunPing, side: "right" },
    "旁白": { role: "", portrait: "" },
    "你": { role: "观察使衙门随行书吏", portrait: "" },
};

const VOICE_PROFILES = {
    "你": { rate: 0.94, pitch: 0.94 },
    "吴崇": { rate: 0.9, pitch: 0.82 },
    "沈砚": { rate: 0.98, pitch: 1.08 },
    "送葬老妇": { rate: 0.86, pitch: 0.72 },
    "何六": { rate: 0.88, pitch: 0.78 },
    "孙平": { rate: 0.92, pitch: 0.88 },
};

const DEMO_VOICE_LINES = {
    "吴崇::我是吴崇，在临皋县衙写了六年账。县里让我陪你查孙平，可我知道，他们更想知道你会查到哪一步。": "/static/audio/ruju-demo/voice/wu-chong-longlaobo-intro-01.wav",
    "吴崇::外来的差牒好用，也不好用。能吓住小吏，吓不住真正写账的人。你若只想交差，明日辰时前找到孙平就够了。": "/static/audio/ruju-demo/voice/wu-chong-longlaobo-warning-01.wav",
    "沈砚::我叫沈砚，常替商队认路。孙平失踪前走过哪几段驿道，我比县里那些人清楚。": "/static/audio/ruju-demo/voice/shen-yan-longqiang-intro-01.wav",
    "沈砚::怀远驿到临皋，顺路不过三十里。一个老驿卒若真想逃，不会让马自己回来。": "/static/audio/ruju-demo/voice/shen-yan-longqiang-horse-01.wav",
    "你::失踪者带走了什么？": "/static/audio/ruju-demo/voice/player-01.wav",
    "吴崇::不是军报正本，只是一页点名簿。可县里催得比丢了官印还急。": "/static/audio/ruju-demo/voice/wu-chong-02.wav",
    "沈砚::一页名簿能值几条命？": "/static/audio/ruju-demo/voice/shen-yan-02.wav",
    "吴崇::这话最好别在县衙门口问。临皋这几年账面很干净，干净得像从没饿死过人。": "/static/audio/ruju-demo/voice/wu-chong-03.wav",
    "吴崇::无主尸身自有里正处置。我们要找孙平，不是替每个死人停步。": "/static/audio/ruju-demo/voice/wu-chong-04.wav",
    "沈砚::先等等。棺绳打的是驿结，外行不会这样收尾。": "/static/audio/ruju-demo/voice/shen-yan-03.wav",
    "送葬老妇::官爷若是来认尸的，我们谁也不知道他叫什么。若是来拿人的，村里也没有人能跟你们走。": "/static/audio/ruju-demo/voice/old-woman-01.wav",
    "你::我只问四句话。问完，若与孙平无关，我不拦你合棺。": "/static/audio/ruju-demo/voice/player-02.wav",
};

const LOCATIONS = {
    road: {
        name: "临皋官道",
        eyebrow: "第一站",
        image: DEMO_ASSETS.road,
        description: "一匹空马把你带到临皋。这里不是终点，只是天宝末年第一道裂缝。",
    },
    funeral: {
        name: "河滩葬礼",
        eyebrow: "途中见闻",
        image: DEMO_ASSETS.funeral,
        description: "一口薄棺正要合土。老妇人急着让死者无名下葬。",
    },
    post: {
        name: "怀远驿",
        eyebrow: "主线地点",
        image: DEMO_ASSETS.post,
        description: "孙平失踪前值守的驿站。马回来了，名册少了一页。",
    },
    ferry: {
        name: "废渡口",
        eyebrow: "尚未发现",
        image: DEMO_ASSETS.ferry,
        description: "旧驿簿边角写着一个早已停用的渡口。",
    },
    shrine: {
        name: "山神庙",
        eyebrow: "同行者故事",
        image: DEMO_ASSETS.shrine,
        description: "赶到渡口前，三个人必须先决定彼此能不能互信。",
    },
};

function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[char]);
}

function initialState() {
    return {
        mode: "dialogue",
        location: "road",
        time: 0,
        dialogue: [],
        dialogueIndex: 0,
        afterDialogue: null,
        visited: new Set(["road"]),
        completed: new Set(),
        clues: [],
        topicsSeen: {},
        sceneTurns: { funeral: 0, post: 0 },
        testimony: {
            id: "",
            selected: "drifted",
            pressed: new Set(),
            solved: false,
            evidencePicker: false,
            misses: 0,
        },
        trust: 0,
        ferryUnlocked: false,
        shrineUnlocked: false,
        companionChoice: "",
        relations: { shen: 0, wu: 0, villagers: 0 },
        memories: {
            funeralApproach: "",
            deathRecorded: false,
            heardShenPromise: false,
            wuConfessed: false,
        },
        active: false,
        typing: false,
        audio: {
            bgmOn: true,
            voiceOn: true,
            unlocked: false,
        },
        objective: "查清空马从何而来，找到失踪驿卒孙平",
        notice: "",
        ending: null,
    };
}

export function createHistoricalRpgDemo({ panel, onExit, onTrack } = {}) {
    if (!panel) return { start() {} };

    let state = initialState();
    let typingTimer = null;
    let typingToken = 0;
    let noticeTimer = null;
    let audioContext = null;
    let bgmMaster = null;
    let bgmNodes = [];
    let bgmPulseTimer = null;
    let bgmAudio = null;
    let preferredVoice = null;
    let voiceAudio = null;

    function canUseSpeech() {
        return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    }

    function pickVoice() {
        if (!canUseSpeech()) return null;
        const voices = window.speechSynthesis.getVoices?.() || [];
        preferredVoice = voices.find(voice => /zh|Chinese|中文|普通话|Mandarin/i.test(`${voice.lang} ${voice.name}`))
            || voices.find(voice => String(voice.lang || "").toLowerCase().startsWith("zh"))
            || voices[0]
            || null;
        return preferredVoice;
    }

    function stopVoice() {
        if (voiceAudio) {
            try {
                voiceAudio.pause();
                voiceAudio.currentTime = 0;
            } catch (error) {
                // Some embedded browsers expose limited media objects.
            }
            if (voiceAudio.parentNode) voiceAudio.parentNode.removeChild(voiceAudio);
            voiceAudio = null;
        }
        if (canUseSpeech()) window.speechSynthesis.cancel();
    }

    function playRecordedVoice(src) {
        if (!src) return false;
        if (typeof window.Audio === "function") {
            voiceAudio = new Audio(src);
        } else if (document.createElement) {
            voiceAudio = document.createElement("audio");
            voiceAudio.preload = "auto";
            voiceAudio.src = src;
            voiceAudio.style.display = "none";
            document.body.appendChild(voiceAudio);
        } else {
            return false;
        }
        voiceAudio.volume = 0.86;
        const playback = voiceAudio.play?.();
        if (playback?.catch) {
            playback.catch(() => {
                if (voiceAudio?.parentNode) voiceAudio.parentNode.removeChild(voiceAudio);
                voiceAudio = null;
            });
        }
        return true;
    }

    function speakLine(line = state.dialogue[state.dialogueIndex] || {}) {
        if (!state.audio.voiceOn) return;
        if (!line.speaker || line.speaker === "旁白") return;
        stopVoice();
        const recordedVoice = DEMO_VOICE_LINES[`${line.speaker}::${String(line.text || "")}`];
        if (playRecordedVoice(recordedVoice)) return;
        if (!canUseSpeech()) return;
        const utterance = new SpeechSynthesisUtterance(String(line.text || ""));
        const profile = VOICE_PROFILES[line.speaker] || { rate: 0.92, pitch: 0.92 };
        utterance.lang = "zh-CN";
        utterance.rate = profile.rate;
        utterance.pitch = profile.pitch;
        utterance.volume = 0.82;
        utterance.voice = preferredVoice || pickVoice();
        window.speechSynthesis.speak(utterance);
    }

    function ensureAudioContext() {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return null;
        if (!audioContext) audioContext = new AudioCtor();
        if (audioContext.state === "suspended") audioContext.resume?.();
        return audioContext;
    }

    function playSoftPulse(ctx) {
        if (!bgmMaster) return;
        const now = ctx.currentTime;
        const notes = [146.83, 164.81, 196, 220, 246.94];
        const note = notes[Math.floor(Math.random() * notes.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(note, now);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(620, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
        osc.connect(filter).connect(gain).connect(bgmMaster);
        osc.start(now);
        osc.stop(now + 3.4);
    }

    function startBgm() {
        if (!state.audio.bgmOn || bgmMaster || bgmAudio) return;
        state.audio.unlocked = true;
        if (document.createElement) {
            bgmAudio = document.createElement("audio");
            bgmAudio.preload = "auto";
            bgmAudio.loop = true;
            bgmAudio.src = DEMO_BGM;
            bgmAudio.volume = 0.34;
            bgmAudio.style.display = "none";
            document.body.appendChild(bgmAudio);
            const playback = bgmAudio.play?.();
            if (!playback?.catch) return;
            playback.catch(() => {
                if (bgmAudio?.parentNode) bgmAudio.parentNode.removeChild(bgmAudio);
                bgmAudio = null;
                startSynthBgm();
            });
            return;
        }
        startSynthBgm();
    }

    function startSynthBgm() {
        if (!state.audio.bgmOn || bgmMaster) return;
        const ctx = ensureAudioContext();
        if (!ctx) return;
        bgmMaster = ctx.createGain();
        bgmMaster.gain.setValueAtTime(0.045, ctx.currentTime);
        bgmMaster.connect(ctx.destination);

        const droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0.018, ctx.currentTime);
        droneGain.connect(bgmMaster);

        [73.42, 110, 146.83].forEach((frequency, index) => {
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            osc.type = index === 0 ? "sine" : "triangle";
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(420 + index * 120, ctx.currentTime);
            osc.connect(filter).connect(droneGain);
            osc.start();
            bgmNodes.push(osc, filter);
        });

        playSoftPulse(ctx);
        bgmPulseTimer = window.setInterval(() => playSoftPulse(ctx), 5400);
    }

    function stopBgm() {
        if (bgmAudio) {
            try {
                bgmAudio.pause();
                bgmAudio.currentTime = 0;
            } catch (_) {
                // Ignore media cleanup races.
            }
            if (bgmAudio.parentNode) bgmAudio.parentNode.removeChild(bgmAudio);
            bgmAudio = null;
        }
        if (bgmPulseTimer) window.clearInterval(bgmPulseTimer);
        bgmPulseTimer = null;
        bgmNodes.forEach(node => {
            try {
                if (typeof node.stop === "function") node.stop();
                node.disconnect?.();
            } catch (_) {
                // Audio nodes may already be stopped when the browser tears down the context.
            }
        });
        bgmNodes = [];
        try {
            bgmMaster?.disconnect();
        } catch (_) {
            // Ignore disconnect races.
        }
        bgmMaster = null;
    }

    function syncBgm() {
        if (state.audio.bgmOn && state.active && state.audio.unlocked) startBgm();
        else stopBgm();
    }

    function unlockAudioForStory() {
        state.audio.unlocked = true;
        pickVoice();
        if (state.audio.bgmOn) startBgm();
    }

    function toggleBgm() {
        state.audio.bgmOn = !state.audio.bgmOn;
        state.audio.unlocked = true;
        syncBgm();
        render();
    }

    function toggleVoice() {
        state.audio.voiceOn = !state.audio.voiceOn;
        state.audio.unlocked = true;
        if (!state.audio.voiceOn) stopVoice();
        render();
    }

    function clearTyping() {
        typingToken += 1;
        if (typingTimer) window.clearTimeout(typingTimer);
        typingTimer = null;
        state.typing = false;
    }

    function finishTyping() {
        if (!state.typing) return false;
        clearTyping();
        const line = state.dialogue[state.dialogueIndex] || {};
        const textElement = panel.querySelector("[data-story-dialogue-text]");
        if (textElement) textElement.textContent = String(line.text || "");
        const continueButton = panel.querySelector("[data-story-action='continue']");
        const dialogueBox = panel.querySelector(".story-dialogue-box");
        dialogueBox?.classList.remove("is-typing");
        if (continueButton) {
            continueButton.textContent = state.dialogueIndex < state.dialogue.length - 1 ? "继续" : "进入下一步";
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
        stopVoice();
        speakLine(line);
        textElement.textContent = "";
        state.typing = true;
        dialogueBox?.classList.add("is-typing");
        continueButton?.classList.add("is-typing");
        if (continueButton) continueButton.textContent = "显示全文";
        const token = typingToken;
        let index = 0;
        const step = () => {
            if (token !== typingToken) return;
            index += 1;
            textElement.textContent = content.slice(0, index);
            if (index < content.length) {
                const punctuationPause = /[。！？；…]/.test(content[index - 1] || "") ? 95 : 0;
                typingTimer = window.setTimeout(step, 28 + punctuationPause);
                return;
            }
            typingTimer = null;
            state.typing = false;
            dialogueBox?.classList.remove("is-typing");
            continueButton?.classList.remove("is-typing");
            if (continueButton) continueButton.textContent = state.dialogueIndex < state.dialogue.length - 1 ? "继续" : "进入下一步";
        };
        if (!content) {
            finishTyping();
            return;
        }
        typingTimer = window.setTimeout(step, 80);
    }

    function addClue(id, title, detail) {
        if (state.clues.some(item => item.id === id)) return;
        state.clues.push({ id, title, detail });
        state.notice = `获得线索：${title}`;
    }

    function hasClue(id) {
        return state.clues.some(item => item.id === id);
    }

    function getClue(id) {
        return state.clues.find(item => item.id === id);
    }

    function evidenceForTestimony() {
        const essentials = [
            {
                id: "missing_rider",
                title: "无人驿马",
                detail: "孙平骑走的驿马独自回到官道，马鞍下压着血布。",
            },
            {
                id: "relay_knot",
                title: "官用马缰",
                detail: "棺绳并非普通麻绳，而是从官用马缰上割下来的。",
            },
            {
                id: "old_shoe",
                title: "孩童旧鞋",
                detail: "死者手里攥着一只孩童旧鞋，老妇说是村里孩子的，却叫不出孩子姓名。",
            },
        ];
        return essentials.filter(item => item.id === "missing_rider" || hasClue(item.id));
    }

    function markTopic(location, topic) {
        if (!state.topicsSeen[location]) state.topicsSeen[location] = new Set();
        if (state.topicsSeen[location].has(topic)) return false;
        state.topicsSeen[location].add(topic);
        if (SCENE_LIMITS[location]) state.sceneTurns[location] += 1;
        return true;
    }

    function topicSeen(location, topic) {
        return Boolean(state.topicsSeen[location]?.has(topic));
    }

    function changeRelation(person, amount) {
        state.relations[person] = Math.max(-2, Math.min(3, (state.relations[person] || 0) + amount));
    }

    function relationLabel(person) {
        const value = state.relations[person] || 0;
        const labels = {
            shen: value >= 2 ? "愿意托付" : value >= 1 ? "稍有信任" : value <= -1 ? "保持戒备" : "彼此试探",
            wu: value >= 2 ? "愿意作证" : value >= 1 ? "开始动摇" : value <= -1 ? "只谈公事" : "谨慎观望",
        };
        return labels[person] || "尚未了解";
    }

    function evidenceSummary() {
        const strongClues = ["last_words", "relay_knot", "ferry_token", "empty_case", "horse_track", "cut_ledger", "zhao_qi"];
        return strongClues.filter(hasClue).length;
    }

    function scheduleNoticeDismiss() {
        if (noticeTimer) window.clearTimeout(noticeTimer);
        if (!state.notice) return;
        const notice = state.notice;
        noticeTimer = window.setTimeout(() => {
            if (state.notice !== notice) return;
            state.notice = "";
            panel.querySelector(".story-toast")?.remove();
        }, 2200);
    }

    function currentTime() {
        return TIME_LABELS[Math.min(state.time, TIME_LABELS.length - 1)];
    }

    function locationStatus(id) {
        if (id === "ferry" && !state.ferryUnlocked) return "locked";
        if (id === "shrine" && !state.shrineUnlocked) return "locked";
        if (state.completed.has(id)) return "complete";
        if (state.location === id) return "current";
        if (state.visited.has(id)) return "visited";
        return "available";
    }

    function playDialogue(lines, afterDialogue = "scene") {
        clearTyping();
        stopVoice();
        state.mode = "dialogue";
        state.dialogue = lines;
        state.dialogueIndex = 0;
        state.afterDialogue = afterDialogue;
        render();
    }

    function openMap() {
        clearTyping();
        stopVoice();
        state.mode = "map";
        state.notice = "";
        render();
    }

    function remainingSceneActions(location = state.location) {
        const limit = SCENE_LIMITS[location];
        if (!limit) return Infinity;
        return Math.max(0, limit - (state.sceneTurns[location] || 0));
    }

    function completeInvestigation(location, notice = "") {
        state.completed.add(location);
        if (location === "post" && !state.ferryUnlocked) {
            state.ferryUnlocked = true;
            state.clues.push({
                id: "patrol_direction",
                title: "夜巡去向",
                detail: "你虽未查清驿中全部疑点，却看见县中巡骑径直转向早已停用的废渡口。",
            });
            state.objective = "前往废渡口，找到孙平与点名簿";
        }
        updateJourneyUnlocks();
        if (notice) state.notice = notice;
    }

    function finishSceneInvestigation() {
        if (!SCENE_LIMITS[state.location] || state.completed.has(state.location)) {
            openMap();
            return;
        }
        completeInvestigation(state.location);
        clearTyping();
        state.mode = "map";
        state.notice = "你带着已经取得的线索离开了。未查之处不会原样等你回来。";
        render();
    }

    function updateSceneProgress(location) {
        if (remainingSceneActions(location) > 0) return;
        completeInvestigation(location, "天色已晚，你必须带着现有线索继续赶路。未查之处已经错过。");
    }

    function visitLocation(id) {
        if (id === "ferry" && !state.ferryUnlocked) {
            state.notice = "你还不知道废渡口的确切位置。";
            render();
            return;
        }
        if (id === "shrine" && !state.shrineUnlocked) {
            state.notice = "你们还没有理由停下赶路。";
            render();
            return;
        }
        const firstVisit = !state.visited.has(id);
        state.location = id;
        state.visited.add(id);
        if (firstVisit) state.time = Math.min(state.time + 1, TIME_LABELS.length - 1);
        state.notice = "";
        if (!firstVisit && state.completed.has(id) && SCENE_LIMITS[id]) {
            renderScene();
            return;
        }
        if (id === "funeral") startFuneral();
        else if (id === "post") startPost();
        else if (id === "ferry") startFerry();
        else if (id === "shrine") startShrine();
        else renderScene();
    }

    function updateJourneyUnlocks() {
        if (state.completed.has("funeral") && state.completed.has("post")) {
            state.shrineUnlocked = true;
        }
    }

    function startOpening() {
        stopBgm();
        stopVoice();
        state = initialState();
        state.active = true;
        state.mode = "briefing";
        render();
        unlockAudioForStory();
    }

    function beginOpeningDialogue() {
        unlockAudioForStory();
        playDialogue([
            { speaker: "旁白", text: "雨停在黄昏前。" },
            { speaker: "旁白", text: "临皋驿外的泥地上，站着一匹空马。鞍还在，缰绳打得很整齐，像骑马的人下马以后，还认真替它收了尾。" },
            { speaker: "旁白", text: "吴崇说，孙平只是逃了。" },
            { speaker: "旁白", text: "可逃走的人，通常不会把马送回来。" },
            { speaker: "旁白", text: "袖里的临时差牒被汗浸软。县里催我找人，催得很急，却没有一个人愿意先说：孙平带走的到底是什么。" },
            { speaker: "吴崇", text: "我是吴崇，临皋县衙书吏。县里让我陪你查孙平，也让我看着你别查过头。" },
            { speaker: "吴崇", text: "外来的差牒好用，也不好用。能吓住小吏，吓不住真正写账的人。你若只想交差，明日辰时前找到孙平就够了。" },
            { speaker: "旁白", text: "路边站着一个替商队认路的女子。她没有看吴崇，只盯着那匹空马，像是怕它忽然倒下。" },
            { speaker: "沈砚", text: "我叫沈砚，常替商队认路。孙平失踪前走过哪几段驿道，我比县里那些人清楚。" },
            { speaker: "沈砚", text: "一个老驿卒若真想逃，不会把马放回来。除非他想让后来的人沿着马找到什么。" },
            { speaker: "旁白", text: "我掀开马鞍，看见一角血布。血已经发黑，布角却被压得很平，像有人故意留给查马的人看。" },
            { speaker: "你", text: "失踪者带走了什么？" },
            { speaker: "吴崇", text: "不是军报正本，只是一页点名簿。可县里催得比丢了官印还急。" },
            { speaker: "沈砚", text: "一页名簿能值几条命？" },
            { speaker: "吴崇", text: "这话最好别在县衙门口问。临皋这几年账面很干净，干净得像从没饿死过人。" },
            { speaker: "旁白", text: "我把差牒重新塞回袖中。这一站的差遣仍然简单：找到孙平，找回点名簿。" },
            { speaker: "旁白", text: "只是从这一刻起，点名簿不再像一页纸。它像一扇门，门后通向临皋以外的路，也通向还没有烧起来的天下。" },
        ], "map");
    }

    function startFuneral() {
        state.testimony = {
            id: "oldWoman",
            selected: "drifted",
            pressed: new Set(),
            solved: false,
            evidencePicker: false,
            misses: 0,
        };
        playDialogue([
            { speaker: "旁白", text: "河滩上雾气很低。几个人围着一口薄棺，土已经铲到棺盖边，只差最后一下。" },
            { speaker: "旁白", text: "棺前没有灵牌，只有一只磨破的童鞋。那鞋被放得很正，像有人怕死者在路上认不出回家的方向。" },
            { speaker: "吴崇", text: "无主尸身自有里正处置。我们要找孙平，不是替每个死人停步。" },
            { speaker: "沈砚", text: "先等等。棺绳打的是驿结，外行不会这样收尾。" },
            { speaker: "送葬老妇", text: "官爷若是来认尸的，我们谁也不知道他叫什么。若是来拿人的，村里也没有人能跟你们走。" },
            { speaker: "你", text: "我只问四句话。问完，若与孙平无关，我不拦你合棺。" },
            { speaker: "旁白", text: "老妇没有退开。她的手背青筋鼓起，像是挡着的不是一口棺，而是一群还活着的人。" },
        ], "testimony");
    }

    function openTestimony(id = state.testimony.id || "oldWoman") {
        clearTyping();
        state.mode = "testimony";
        state.testimony.id = id;
        state.testimony.evidencePicker = false;
        render();
    }

    function funeralTopic(topic) {
        markTopic("funeral", topic);
        if (topic === "respect") {
            state.memories.funeralApproach ||= "respect";
            changeRelation("villagers", 2);
            changeRelation("shen", 1);
            addClue("last_words", "死者的遗言", "无名男子临死前反复说：别让他们点名，二十三户。");
            playDialogue([
                { speaker: "旁白", text: "你收起差牒，向送葬的人借来一炷残香，先在薄棺前行了一个生者对死者的礼。老妇挡在棺前的肩膀终于松了些。" },
                { speaker: "送葬老妇", text: "官爷若真肯把他当个人，我便告诉你。他是昨日从上游漂来的，腰上有鞭伤，手里攥着一只小孩的旧鞋。临死只说了两句话。" },
                { speaker: "送葬老妇", text: "‘别让他们点名。’还有，‘二十三户。’我不懂是什么意思。" },
                { speaker: "吴崇", text: "逃役的人临死也会胡言。二十三户，或许只是欠债的村户。" },
                { speaker: "沈砚", text: "他为什么不说‘救我’，却要护着一群人的名字？至少这句话，值得带到怀远驿去问。" },
            ], "scene");
        } else if (topic === "inspect") {
            state.memories.funeralApproach ||= "inspect";
            changeRelation("villagers", -1);
            changeRelation("wu", 1);
            addClue("relay_knot", "驿卒绳结", "棺绳来自官用马缰，结法是驿卒长途换马时使用的活结。");
            playDialogue([
                { speaker: "你", text: "此人可能牵涉失踪公文。开棺不为夺尸，也不取财物，只验伤、验衣、验绳。吴崇，把我的话记下。" },
                { speaker: "送葬老妇", text: "官字两张口。今日说只看一眼，明日便能把死人也写成盗贼。" },
                { speaker: "旁白", text: "你没有让差役碰棺木，只亲自查看滴水的棺绳。绳股上留着马汗和旧铜扣磨出的青痕。" },
                { speaker: "你", text: "这不是临时找来的麻绳，是从官用马缰上割下的。" },
                { speaker: "沈砚", text: "孙平教过我这种结。打结的人不是孙平，也一定与他同行过。" },
                { speaker: "旁白", text: "她说完才意识到自己泄露了什么，手指从棺绳上慢慢松开。" },
                { speaker: "吴崇", text: "沈姑娘，我们在官道相遇时，你只说自己替商队认路。看来每个人上路时，都只说了够用的那部分。" },
            ], "scene");
        } else if (topic === "record") {
            state.memories.deathRecorded = true;
            changeRelation("wu", 1);
            addClue("death_record", "无名死者验记", "吴崇正式记下死者伤势、遗言、旧鞋与棺绳。此人不再只是路边一具无主尸。");
            playDialogue([
                { speaker: "你", text: "吴崇，把这个人记入验簿。身长、伤处、发现地点、送葬人证，一项也别省。" },
                { speaker: "吴崇", text: "我们奉命查孙平，不是替沿途无主尸立案。写进去，县里便要问为何误了时辰。" },
                { speaker: "你", text: "若他与孙平无关，这一页只是多费墨。若有关，今日不写，明日便会有人说从未见过他。" },
                { speaker: "旁白", text: "吴崇沉默片刻，跪在棺旁垫着膝头落笔。他先写‘无名男尸’，停了一下，又在旁边留出足够写下姓名的位置。" },
                { speaker: "沈砚", text: "吴书吏，你怕的不是多一页卷宗。你怕的是有一天，有人拿这一页问你以前为何没写。" },
            ], "scene");
        } else if (topic === "shen") {
            if (hasClue("relay_knot") || hasClue("last_words")) {
                addClue("shen_identity", "沈砚的真实身份", "沈砚本名孙砚，是失踪驿卒孙平的妹妹。");
                changeRelation("shen", state.memories.funeralApproach === "respect" ? 2 : 1);
                playDialogue([
                    { speaker: "你", text: hasClue("relay_knot") ? "你不是碰巧认得驿结。你认识孙平。" : "老妇提到二十三户时，你看的不是尸体，是那只旧鞋。你知道死者替谁送东西。" },
                    { speaker: "沈砚", text: "……我姓孙。孙平是我兄长。若我一开始说实话，你还会让我跟来吗？" },
                    { speaker: "沈砚", text: state.memories.funeralApproach === "respect" ? "方才你肯先给陌生死人上香，我愿意赌一次。找到兄长以后，请先听他说完，再决定把他交给谁。" : "我不能信县衙，但眼下只能信你会先查清。找到兄长以后，请先听他说完，再决定把他交给谁。" },
                    { speaker: "吴崇", text: "隐瞒与案犯的亲缘，按理我现在就该让你回临皋。" },
                    { speaker: "沈砚", text: "那你便动手。只是没有我，你们到了渡口也未必认得谁留下的记号。" },
                ], "scene");
            } else {
                playDialogue([
                    { speaker: "沈砚", text: "我替商队走过两年驿路，认得一些绳结并不奇怪。先找孙平吧，别让死人耽误了时辰。" },
                    { speaker: "旁白", text: "她回答得太快，眼睛却始终没有离开那口棺材。" },
                    { speaker: "吴崇", text: "她在撒谎。只是眼下还不知道，这个谎是为了找孙平，还是替孙平遮掩。" },
                ], "scene");
            }
        } else if (topic === "token") {
            addClue("ferry_token", "废渡铜牌", "死者鞋底藏着旧渡口的铜牌，背面刻着怀远驿的马号。");
            state.ferryUnlocked = true;
            playDialogue([
                { speaker: "送葬老妇", text: state.memories.funeralApproach === "respect" ? "你肯给他留一炷香，这件东西我便交给你。它从他鞋底掉出来，旧渡口早废了，夜里只有逃役的人才敢过去。" : "既然你们已经验了尸，这东西也藏不住。它从他鞋底掉出来，旧渡口早废了，夜里只有逃役的人才敢过去。" },
                { speaker: "沈砚", text: "怀远驿的马号。有人想让我们去那里，也可能有人正等着我们。" },
                { speaker: "送葬老妇", text: "你们若真要去，先替他记住一件事。他死前一直护着那只旧鞋，像是答应过要把它带回谁家。" },
                { speaker: "旁白", text: state.memories.deathRecorded ? "吴崇在验簿末尾添上‘遗铜牌一、童鞋一’，那块为姓名留下的空白仍然醒目。" : "吴崇催促上路，却悄悄把死者的身量、伤处和遗物记进了随身小册。" },
            ], "scene");
        }
        updateSceneProgress("funeral");
    }

    function startPost() {
        playDialogue([
            { speaker: "旁白", text: "怀远驿的大门半开。灶上水已烧干，廊下却拴着孙平昨日骑走的青骢马。" },
            { speaker: "旁白", text: "院里没有搏斗痕迹。两副食碗摆在桌上，一副已经洗净，另一副还留着半块干硬的胡饼。" },
            { speaker: "何六", text: "孙平偷了驿银，畏罪逃了。县里要的是人，二位只管沿河北追，莫在驿中耽搁。" },
            { speaker: "吴崇", text: "何驿长，我们还没问，你便把罪名和去向都说全了。" },
            { speaker: "沈砚", text: "马回来了，人却没有。驿长，你像是早就准备好了这套说辞。" },
            { speaker: "何六", text: "我在这条路上送走过三任县令、七任驿丞。年轻人总以为多问几句话，就能让账上的字自己开口。" },
        ], "scene");
    }

    function postTopic(topic) {
        markTopic("post", topic);
        if (topic === "case") {
            addClue("empty_case", "空公文匣", "匣锁没有撬痕，军报正本仍在，少的是夹层中的点名簿。");
            changeRelation("wu", 1);
            playDialogue([
                { speaker: "旁白", text: "公文匣锁扣完整。正本封泥未动，夹层却有一圈新鲜纸屑。" },
                { speaker: "你", text: "若孙平想卖军情，不会只拿走一页点名簿。" },
                { speaker: "何六", text: "小人只管养马递文，哪里懂他发什么疯。" },
                { speaker: "吴崇", text: "锁没有被撬，说明开匣的人本就有钥匙。怀远驿能碰钥匙的，除了孙平还有你。" },
                { speaker: "何六", text: "吴书吏，替县里送过多少封不该拆的信，才练出这般好眼力？" },
            ], "scene");
        } else if (topic === "horse") {
            addClue("horse_track", "回驿的青骢马", "马腹有渡河水痕，左后蹄沾着废渡口才有的黑色芦泥。");
            state.ferryUnlocked = true;
            changeRelation("shen", 1);
            playDialogue([
                { speaker: "沈砚", text: "马腹湿到鞍下，它不是自己沿官道回来的。有人从河对岸放它回来，故意留下去向。" },
                { speaker: "何六", text: "冬日泥水都一个样，凭这个就要说我撒谎？" },
                { speaker: "旁白", text: "沈砚从马鬃里摘出一截枯芦苇。临皋官道两侧没有芦荡，只有废渡口下游那片黑水滩有。" },
                { speaker: "沈砚", text: "不是为了定你的罪。只是有人希望找他的人，别只听你的话。" },
            ], "scene");
        } else if (topic === "ledger") {
            addClue("cut_ledger", "被割走的驿簿", "驿簿缺页前后记录着二十三户转运人家，其中多人已死或失踪，却仍被重复点名。");
            state.ferryUnlocked = true;
            state.objective = "前往废渡口，找到孙平与点名簿";
            playDialogue([
                { speaker: "吴崇", text: hasClue("last_words") ? "正好二十三户。河滩死者临终护着的不是一句胡话，是这页账。三户早已绝户，名字却仍在领粮领钱。" : "缺页前后都是转运户。二十三户里，三户早已绝户，名字却仍在领粮领钱。" },
                { speaker: "你", text: "死人不能服役，却能替活人领钱。有人需要这张假名簿一直存在。" },
                { speaker: "何六", text: "你们最好想清楚。临皋县里肯让这本账见光的人，未必比孙平多。" },
                { speaker: "吴崇", text: state.memories.deathRecorded ? "这笔字出自县仓司佐。我替他誊过三年份的粮簿，不会认错。河滩那一页验记，也许真会成为我们证明赵七存在过的唯一东西。" : "这笔字出自县仓司佐。我替他誊过三年份的粮簿，不会认错。" },
                { speaker: "沈砚", text: "所以县里派你来，不只是监视我们。他们也想知道，你看到这些名字以后会站在哪边。" },
                { speaker: "旁白", text: "吴崇合上簿册。第一次，他没有立刻替县衙辩解。" },
            ], "scene");
        } else if (topic === "postmaster") {
            const strong = hasClue("last_words") || hasClue("empty_case") || hasClue("cut_ledger");
            if (strong) {
                addClue("zhao_qi", "同行者赵七", "何六承认孙平与驿卒赵七一同离驿；赵七很可能正是河滩死者。");
                playDialogue([
                    { speaker: "你", text: hasClue("last_words") ? "河滩死者说了二十三户。你若再说孙平独自逃银，我就把遗言、空匣、青骢马和尸体一起带回县里。" : "公文匣没有被撬，青骢马又从废渡回来。你若再说孙平独自逃银，我便把这些一项项写进验状。" },
                    { speaker: "何六", text: "……昨夜与他同行的是赵七。赵七说要把副簿送给观察使，孙平却在渡口改了主意。之后我什么都不知道。" },
                    { speaker: "沈砚", text: "你知道有人追他们。你只是没问追上以后会发生什么。" },
                    { speaker: "何六", text: "问了又能怎样？驿卒一条命，抵不过县里三年的亏空。我若报上去，先死的是我这一驿的人。" },
                    { speaker: "吴崇", text: state.memories.deathRecorded ? "赵七已经死了，而且已经入了验簿。你保住的不是驿站，是那些账还可以继续做下去。" : "赵七已经死了。你保住的不是驿站，是那些账还可以继续做下去。" },
                ], "scene");
            } else {
                playDialogue([
                    { speaker: "何六", text: "公差办案也要凭据。孙平偷银在先，我不过照实回报。" },
                    { speaker: "旁白", text: "他把双手拢进袖中。没有证据，他并不怕你。" },
                    { speaker: "吴崇", text: "先查匣、马或驿簿。空着手逼问一个在驿路活了半辈子的人，只会让他知道我们什么都没有。" },
                ], "scene");
            }
        } else if (topic === "shen_plan") {
            state.memories.heardShenPromise = true;
            changeRelation("shen", 1);
            addClue("ferry_signal", "渡口暗号", "孙平若安全，会让渡口灯明灭两次；若被胁迫，只会亮一次。");
            playDialogue([
                { speaker: "你", text: "你一路都在等一个能证明孙平还活着的记号。现在可以告诉我了。" },
                { speaker: "沈砚", text: "废渡船屋里有盏破灯。若他安全，灯会亮两次再灭；若只亮一次，就是有人在逼他现身。" },
                { speaker: "你", text: "若我们赶到时，他正在烧簿册呢？" },
                { speaker: "沈砚", text: "那便先别夺。让他说完。你若答应这一点，我不会在背后先放走他。" },
                { speaker: "旁白", text: "这不是信任，更像一份暂时把刀放在桌面上的约定。但她第一次让你知道，下一步该看哪里。" },
            ], "scene");
        } else if (topic === "wu") {
            state.memories.wuConfessed = true;
            changeRelation("wu", 2);
            addClue("wu_testimony", "吴崇的证词", "吴崇承认自己曾奉命誊写假册，并愿意辨认县仓司佐的笔迹。");
            playDialogue([
                { speaker: "你", text: "你认得这笔迹，也知道假册不止这一年。吴崇，我要听的不是县衙会怎么说，是你做过什么。" },
                { speaker: "吴崇", text: "三年前仓中亏空，司佐让我把已死之人重新补入转运册。我写过十二个名字。第二年是十九个。第三年，我已经不再数了。" },
                { speaker: "沈砚", text: "所以你不是被派来查案。你是被派来确认孙平拿走了多少能牵出你们的东西。" },
                { speaker: "吴崇", text: "是。但河滩若真是赵七，我愿在观察使面前认笔迹。不是因为我忽然成了好人，只是死人不该永远替我们背账。" },
                { speaker: "旁白", text: "他说完，把县衙腰牌解下来压在驿簿上。那不是辞官，只是第一次承认这块牌子未必永远护得住他。" },
            ], "scene");
        }
        updateSceneProgress("post");
    }

    function startShrine() {
        playDialogue([
            { speaker: "旁白", text: "夜巡的火把沿官道逼近，吴崇带你们躲进一座废弃山神庙。神像半边脸已经剥落，供桌下却藏着逃役者留下的草席。" },
            { speaker: "吴崇", text: "巡骑是县丞的人。他们比我们晚出城，却直接奔废渡口。县里从一开始就知道孙平在哪里。" },
            { speaker: "沈砚", text: "那我们更该赶在他们前面。你若还想把我兄长绑回去，现在便说清楚。" },
            { speaker: "吴崇", text: "我在临皋做了六年书吏。那些账有我的笔迹，有些假名字甚至是我照上官吩咐誊进去的。你以为我只是在决定交不交一个驿卒？" },
            { speaker: "旁白", text: "庙外马铃越来越近。两个人都在等你的回答，而这一次，沉默本身也会被他们记住。" },
        ], "scene");
    }

    function shrineTopic(topic) {
        markTopic("shrine", topic);
        state.companionChoice = topic;
        state.completed.add("shrine");
        if (topic === "protect") {
            state.trust += 2;
            changeRelation("shen", 2);
            addClue("companion_pact", "同行之约", "你答应先保护名单上的人，再决定如何处置证据。沈砚愿意把兄长留下的暗号全部告诉你。");
            playDialogue([
                { speaker: "你", text: "先见到孙平，先听他说完。若名单上的人今夜就有危险，我们先救人，再谈簿册归谁。" },
                { speaker: "沈砚", text: "好。我兄长若还活着，会在渡口灯下挂三次黑布。若只有一次，便是有人在逼他现身。" },
                { speaker: "吴崇", text: "救人之后呢？二十三户可以逃，临皋的账却不会自己消失。" },
                { speaker: "你", text: "所以你要活着把你知道的写下来。不是替县里，是替那些只有名字留在账上的人。" },
                { speaker: "旁白", text: "吴崇没有答应，却撕下随身小册中写着县仓司佐名讳的一页，塞进了衣襟最里层。" },
            ], "map");
        } else if (topic === "evidence") {
            changeRelation("shen", 1);
            changeRelation("wu", 1);
            addClue("companion_pact", "同行之约", "你要求三人互相保存证据：沈砚辨认暗号，吴崇誊录账目，你负责带人证走出渡口。");
            playDialogue([
                { speaker: "你", text: "谁也别先许诺交人或放人。沈砚辨暗号，吴崇抄账，我负责让孙平活着离开渡口。证据分开保管，谁被截住都不能让真相一起消失。" },
                { speaker: "吴崇", text: "这是公差办案的法子，也是盗贼分赃的法子。" },
                { speaker: "沈砚", text: "至少比把所有人的命都装进一个公文匣里稳妥。" },
                { speaker: "旁白", text: "吴崇抄下缺页前后的户名，沈砚把渡口暗号画在你掌心。庙外巡骑过去时，三个人第一次拥有了同一个计划。" },
            ], "map");
        } else if (topic === "procedure") {
            state.trust -= 1;
            changeRelation("shen", -2);
            changeRelation("wu", 1);
            addClue("companion_pact", "同行之约", "你坚持先保住完整证据并呈报观察使。吴崇同意作证，沈砚却不再透露兄长的全部暗号。");
            playDialogue([
                { speaker: "你", text: "名单上的人要救，但没有完整簿册和活口，这件事明日就会变成驿卒盗文。孙平必须跟我们去见观察使。" },
                { speaker: "吴崇", text: "我可以作证，账上的笔迹也可以认。只要孙平别在见人前把簿册烧了。" },
                { speaker: "沈砚", text: "你们总说先把人交进去，再从里面查清楚。可进去的人，未必都能等到你们查清。" },
                { speaker: "旁白", text: "她起身走出破庙，没有再等你们。片刻后，她的脚印故意踏进乱石地，再也看不出通往哪条小路。" },
            ], "map");
        } else {
            state.trust -= 1;
            changeRelation("shen", -1);
            changeRelation("wu", -1);
            playDialogue([
                { speaker: "旁白", text: "你没有回答，只让两人立即上路。吴崇收起小册，沈砚也不再提兄长。" },
                { speaker: "旁白", text: "三个人仍然同行，却各自保留了最后一件没有告诉另外两人的事。" },
            ], "map");
        }
    }

    function startFerry() {
        state.objective = "听孙平说完，再决定簿册与众人的去向";
        playDialogue([
            { speaker: "旁白", text: hasClue("ferry_signal") ? "废渡口的灯亮了两次，又熄灭。与沈砚说的一样：孙平还活着，而且暂时没有被人挟持。" : "废渡口的灯亮了两次，又熄灭。你们不知道这是求援、警告，还是有人故意引你们靠近。" },
            { speaker: "旁白", text: "船屋门被推开时，一个满身血污的男人正把几页纸塞进火盆。" },
            { speaker: "沈砚", text: hasClue("shen_identity") ? "哥。是我。我带他们来，但他们答应先听你说完。" : "孙平。别烧，我是来带你走的。" },
            { speaker: "孙平", text: "砚儿？我让赵七把铜牌丢进河里，就是不想让你找到这里。" },
            { speaker: "孙平", text: "你不该来。赵七已经因为这张纸死了，我不能再让名单上的人也死。" },
            { speaker: "吴崇", text: state.memories.deathRecorded ? "赵七没有把铜牌丢进河。他把它藏在鞋底。我们已经把他的伤势、遗物和最后去处写进验簿，只差一个名字。" : "赵七没有把铜牌丢进河。他把它藏在鞋底，临死还在替你指路。" },
            { speaker: "孙平", text: "那具尸体是他？……他答应过，要把孩子的鞋送回河东村。" },
            { speaker: "旁白", text: state.memories.deathRecorded ? "孙平伸向火盆的手停住了。吴崇取出验簿，在那块预留的空白里写下两个字：赵七。" : "孙平伸向火盆的手停住了。直到这一刻，河滩上那个无名死者才在他的声音里重新有了姓名。" },
            { speaker: "孙平", text: "县里把二十三户穷民重复点入转运册，朝廷的钱粮照领，差役却落在孤儿寡妇头上。如今边地调兵，他们还要把这些人记作逃户，收走田宅抵数。" },
            { speaker: "吴崇", text: state.memories.wuConfessed ? "我已经把自己誊过的假名和县仓司佐的笔迹写下。你拿走这一页，他们还会再造一页；可若我们能让三份证词同时抵达观察使，他们便不能只杀一个驿卒了事。" : "县仓司佐做账，何六替他们截信，而我替县衙誊过三年假册。你拿走这一页，只会让他们再造一页。" },
            { speaker: "沈砚", text: "至少今夜，他们还没来得及按这张纸抓人。哥，把名字给我。" },
            { speaker: "孙平", text: "给你，然后呢？带着二十三户逃？没有户籍，没有田，没有过所，他们躲过今晚，也会死在下一道关津。" },
            ...(state.companionChoice ? [{ speaker: "旁白", text: state.companionChoice === "evidence" ? "山神庙里定下的办法仍然可行：三个人各带走一部分证据，没有谁能独自决定全部人的命。" : state.companionChoice === "protect" ? "沈砚看向你。山神庙里那句‘先救人’，现在不再是一句安慰，而是一笔必须兑现的债。" : state.companionChoice === "procedure" ? "沈砚站到了孙平与火盆之间。她记得你坚持要把兄长交给观察使，也已做好在这里阻止你的准备。" : "吴崇与沈砚都没有看你。你在山神庙没有作出承诺，他们也不打算把最后的决定完全交给你。" }] : []),
            { speaker: "旁白", text: "远处官道忽然响起急促马铃。真正的军报正越过临皋：范阳兵反。没有人再能阻止天下大乱，但火盆旁的二十三个名字仍在等你决定。" },
        ], "final");
    }

    function actionsForLocation() {
        if (state.location === "funeral") {
            const approachChosen = Boolean(state.memories.funeralApproach);
            const actions = [
                { id: "respect", kind: "交谈", label: "先祭一炷香", hint: "取得送葬者信任", closed: approachChosen && !topicSeen("funeral", "respect") },
                { id: "inspect", kind: "察看", label: "验看尸身", hint: "更快拿到物证", closed: approachChosen && !topicSeen("funeral", "inspect") },
                { id: "record", kind: "证据", label: "记入验簿", hint: "让死者留下卷宗" },
            ];
            if (approachChosen || topicSeen("funeral", "shen")) {
                actions.push({ id: "shen", kind: "追问", label: "追问沈砚", hint: hasClue("relay_knot") ? "她认识驿结" : "她听见二十三户失态了" });
            }
            if (approachChosen || topicSeen("funeral", "token")) {
                actions.push({ id: "token", kind: "遗物", label: "查看旧鞋", hint: state.relations.villagers > 0 ? "老妇愿意开口" : "需要说明理由" });
            }
            return decorateSceneActions(actions, "funeral");
        }
        if (state.location === "post") {
            const actions = [];
            actions.push({ id: "case", kind: "察看", label: "看公文匣", hint: "确认少了什么" });
            actions.push({ id: "horse", kind: "察看", label: "看回驿马", hint: "马蹄记得去向" });
            if (topicSeen("post", "ledger") || hasClue("empty_case") || hasClue("last_words")) {
                actions.push({ id: "ledger", kind: "线索", label: hasClue("last_words") ? "比对二十三户" : "翻驿簿", hint: "把遗言和账册放一起" });
            }
            if (topicSeen("post", "postmaster") || evidenceSummary() >= 2) {
                actions.push({ id: "postmaster", kind: "对质", label: "对质何六", hint: "逼他说出谁截信" });
            }
            if (topicSeen("post", "shen_plan") || hasClue("shen_identity")) {
                actions.push({ id: "shen_plan", kind: "同行", label: "问兄妹暗号", hint: "看沈砚是否信你" });
            }
            if (topicSeen("post", "wu") || hasClue("cut_ledger")) {
                actions.push({ id: "wu", kind: "追问", label: "追问吴崇", hint: "他认得笔迹" });
            }
            return decorateSceneActions(actions, "post");
        }
        if (state.location === "shrine") {
            return [
                { id: "protect", kind: "承诺", label: "先救人", hint: "答应沈砚" },
                { id: "evidence", kind: "计划", label: "分藏证据", hint: "让真相不只在一人手里" },
                { id: "procedure", kind: "原则", label: "上呈观察使", hint: "相信程序" },
                { id: "silence", kind: "回避", label: "立即赶路", hint: "不作承诺" },
            ];
        }
        return [];
    }

    function decorateSceneActions(actions, location) {
        const noTime = remainingSceneActions(location) <= 0 || state.completed.has(location);
        return actions.map(action => {
            const selected = topicSeen(location, action.id);
            return {
                ...action,
                selected,
                disabled: selected || action.closed || noTime,
                stateLabel: selected ? "已采取" : action.closed ? "已错过" : noTime ? "时间已过" : "",
            };
        });
    }

    function currentTestimony() {
        return TESTIMONY_LINES[state.testimony.id] || TESTIMONY_LINES.oldWoman;
    }

    function currentStatement() {
        const testimony = currentTestimony();
        return testimony.statements.find(item => item.id === state.testimony.selected) || testimony.statements[0];
    }

    function selectTestimonyLine(id) {
        state.testimony.selected = id;
        state.testimony.evidencePicker = false;
        render();
    }

    function observeTestimonyScene() {
        if (hasClue("relay_knot")) {
            playDialogue([
                { speaker: "旁白", text: "你再次看向棺绳。马缰切口整齐，打结处有驿路长途换马时常用的活扣。" },
                { speaker: "沈砚", text: "这东西不会自己跑到棺材上。她说没有官家的东西，至少这一句不对。" },
            ], "testimony");
            return;
        }
        addClue("relay_knot", "官用马缰", "棺绳并非普通麻绳，而是从官用马缰上割下来的，结法也像驿卒换马时用的活扣。");
        playDialogue([
            { speaker: "旁白", text: "你没有碰尸身，只蹲下查看棺绳。绳股里有马汗味，铜扣磨出的青痕还在。" },
            { speaker: "你", text: "这不是村里临时找的麻绳。它是从官用马缰上割下来的。" },
            { speaker: "吴崇", text: "官用马缰？那这具尸身就未必只是河里漂来的流民。" },
        ], "testimony");
    }

    function pressStatement() {
        const statement = currentStatement();
        state.testimony.pressed.add(statement.id);
        if (statement.id === "drifted") {
            playDialogue([
                { speaker: "你", text: "从河里漂来？是谁先看见的？" },
                { speaker: "送葬老妇", text: "天没亮时，打柴的孩子看见他卡在芦苇里。身上都是水，脸也泡得认不清。" },
                { speaker: "旁白", text: "她说得很快，像是早把这句话背熟了。" },
            ], "testimony");
        } else if (statement.id === "unknown") {
            playDialogue([
                { speaker: "你", text: "谁也不认识，为什么急着下葬？" },
                { speaker: "送葬老妇", text: "人死在我们河滩，总不能让他晒着。再说……官差若来得早，死人也能被写成活人的罪。" },
                { speaker: "吴崇", text: "这话不像怕尸体，倒像怕卷宗。" },
            ], "testimony");
        } else if (statement.id === "no_official") {
            playDialogue([
                { speaker: "你", text: "你确定他身上没有官家的东西？" },
                { speaker: "送葬老妇", text: "衣裳烂了，腰牌没有，文书也没有。官爷若要定他是官道上的人，总要拿出东西来。" },
                { speaker: "沈砚", text: "她把话说死了。要推翻这一句，得有能看得见的物证。" },
            ], "testimony");
        } else if (statement.id === "shoe") {
            addClue("old_shoe", "孩童旧鞋", "死者手里攥着一只孩童旧鞋，老妇说是村里孩子的，却叫不出孩子姓名。");
            playDialogue([
                { speaker: "你", text: "村里孩子的鞋？是哪家孩子？" },
                { speaker: "送葬老妇", text: "……孩子多，穷人家的鞋都差不多。也许是河水冲来的。" },
                { speaker: "沈砚", text: "她刚才说得像亲眼认得，现在又说也许是冲来的。" },
            ], "testimony");
        }
    }

    function presentEvidence(id) {
        state.testimony.evidencePicker = false;
        const statement = currentStatement();
        if (statement.id === "no_official" && id === "relay_knot") {
            state.testimony.solved = true;
            state.completed.add("funeral");
            state.objective = "前往怀远驿，查清孙平为何带走名册";
            changeRelation("shen", 1);
            addClue("last_words", "死者的遗言", "无名男子临死前反复说：别让他们点名，二十三户。");
            addClue("zhao_shadow", "可能的同行者", "死者身上的官用马缰说明他与驿路有关，可能不是普通流民。");
            playDialogue([
                { speaker: "你", text: "你说他身上没有官家的东西。可这口棺材上的绳子，是官用马缰。" },
                { speaker: "送葬老妇", text: "……那不是我们的。我们抬他时，它就缠在他身上。" },
                { speaker: "你", text: "一个无名流民，为何会带着官用马缰死在河滩？" },
                { speaker: "送葬老妇", text: "他临死前抓着那只鞋，只说两句话：别让他们点名，二十三户。" },
                { speaker: "沈砚", text: "孙平带走的是一页名册。河滩上的死人，也在护同一批名字。" },
                { speaker: "旁白", text: "你还不知道死者是谁，但已经可以确认：这不是路边偶遇的尸体，而是孙平案的第一道口子。" },
            ], "map");
            return;
        }
        if (statement.id === "unknown" && id === "old_shoe") {
            state.testimony.solved = true;
            state.completed.add("funeral");
            changeRelation("villagers", 1);
            addClue("last_words", "死者的遗言", "无名男子临死前反复说：别让他们点名，二十三户。");
            playDialogue([
                { speaker: "你", text: "你说谁也不认识他，却知道这只鞋是村里孩子的。你认识的不是死者，是他要把鞋送回的人。" },
                { speaker: "送葬老妇", text: "我不认得他。我只认得那只鞋。河东村许家的孩子，前月被点去拉粮，再没回来。" },
                { speaker: "送葬老妇", text: "他临死说，别让他们点名，二十三户。官爷，你若真查孙平，就去查那页名册。" },
                { speaker: "旁白", text: "无名尸、旧鞋、二十三户，第一次被串在了一起。" },
            ], "map");
            return;
        }
        state.testimony.misses += 1;
        playDialogue([
            { speaker: "你", text: `这条线索能否推翻“${statement.text}”？` },
            { speaker: "吴崇", text: "证据和话对不上。强压下去，她只会更不肯开口。" },
            { speaker: "沈砚", text: state.testimony.misses >= 2 ? "先追问，或者再看现场。别急着把每件东西都往她身上扣。" : "这不是破绽。再换一句，或者先追问。" },
        ], "testimony");
    }

    function toggleEvidencePicker() {
        state.testimony.evidencePicker = !state.testimony.evidencePicker;
        render();
    }

    function renderTopbar() {
        const navigationTools = state.mode === "briefing" ? "" : `
            <button type="button" class="story-icon-btn" data-story-action="map" aria-label="打开行程图" title="行程图">⌖</button>
            <button type="button" class="story-icon-btn" data-story-action="clues" aria-label="查看线索" title="线索簿">◇</button>
        `;
        const audioTools = `
            <button type="button" class="story-icon-btn story-audio-btn ${state.audio.bgmOn ? "is-on" : ""}" data-story-action="toggle-bgm" aria-label="${state.audio.bgmOn ? "关闭背景音乐" : "开启背景音乐"}" title="${state.audio.bgmOn ? "关闭背景音乐" : "开启背景音乐"}">乐</button>
            <button type="button" class="story-icon-btn story-audio-btn ${state.audio.voiceOn ? "is-on" : ""}" data-story-action="toggle-voice" aria-label="${state.audio.voiceOn ? "关闭角色配音" : "开启角色配音"}" title="${state.audio.voiceOn ? "关闭角色配音" : "开启角色配音"}">声</button>
        `;
        return `
            <header class="story-demo-topbar">
                <button type="button" class="story-icon-btn story-exit-btn" data-story-action="exit" aria-label="退出本局" title="退出本局">×</button>
                <div class="story-chapter-copy">
                    <span>第一站 · 天宝十四载冬</span>
                    <b>驿路无名</b>
                </div>
                <div class="story-objective"><span>当前目标</span><b>${escapeHtml(state.objective)}</b></div>
                <div class="story-time"><span>${escapeHtml(currentTime())}</span><i></i></div>
                ${audioTools}
                ${navigationTools}
            </header>
        `;
    }

    function renderClueDrawer() {
        if (state.mode !== "clues") return "";
        return `
            <aside class="story-clue-drawer">
                <div><span>线索簿</span><button type="button" data-story-action="close-overlay" aria-label="关闭">×</button></div>
                ${state.clues.length ? state.clues.map((clue, index) => `
                    <article><em>${String(index + 1).padStart(2, "0")}</em><b>${escapeHtml(clue.title)}</b><p>${escapeHtml(clue.detail)}</p></article>
                `).join("") : '<p class="story-empty-copy">你还没有找到值得记下的线索。</p>'}
            </aside>
        `;
    }

    function renderBriefing() {
        panel.innerHTML = `
            <div class="story-demo-shell">
                <section class="story-demo-stage story-briefing" style="--story-bg: url('${escapeHtml(DEMO_ASSETS.road)}')">
                    <div class="story-demo-bg"></div><div class="story-demo-shade"></div>
                    ${renderTopbar()}
                    <div class="story-briefing-copy story-briefing-title-only" data-story-action="begin-opening" role="button" tabindex="0" aria-label="进入第一站">
                        <span>第一站 · 天宝十四载冬</span>
                        <h2>临皋</h2>
                        <p>空马归驿，失踪者带走了一页不该离开县衙的点名簿。</p>
                        <em>点击画面开始</em>
                    </div>
                </section>
            </div>
        `;
    }

    function renderDialogue() {
        const line = state.dialogue[state.dialogueIndex] || {};
        const person = PEOPLE[line.speaker] || PEOPLE["旁白"];
        const location = LOCATIONS[state.location] || LOCATIONS.road;
        const isNarration = !line.speaker || line.speaker === "旁白";
        return `
            <section class="story-demo-stage is-dialogue" style="--story-bg: url('${escapeHtml(location.image)}')">
                <div class="story-demo-bg"></div><div class="story-demo-shade"></div>
                ${renderTopbar()}
                ${person.portrait ? `<div class="story-character is-${escapeHtml(line.side || person.side || "right")}"><img src="${escapeHtml(person.portrait)}" alt="${escapeHtml(line.speaker)}"></div>` : ""}
                <div class="story-dialogue-layer">
                    <div class="story-dialogue-box ${isNarration ? "is-narration" : "has-speaker"}">
                        ${isNarration ? "" : `<div class="story-speaker"><b>${escapeHtml(line.speaker)}</b>${person.role ? `<span>${escapeHtml(line.role || person.role)}</span>` : ""}</div>`}
                        <p data-story-dialogue-text aria-live="polite">${escapeHtml(line.text || "")}</p>
                        <button type="button" class="story-continue-btn" data-story-action="continue" aria-label="继续对话">显示全文</button>
                    </div>
                </div>
            </section>
        `;
    }

    function renderScene() {
        state.mode = "scene";
        const location = LOCATIONS[state.location] || LOCATIONS.road;
        const actions = actionsForLocation();
        const limited = Boolean(SCENE_LIMITS[state.location]);
        const remaining = remainingSceneActions();
        const sceneFinished = state.completed.has(state.location);
        panel.innerHTML = `
            <div class="story-demo-shell">
                <section class="story-demo-stage is-scene" style="--story-bg: url('${escapeHtml(location.image)}')">
                    <div class="story-demo-bg"></div><div class="story-demo-shade"></div>
                    ${renderTopbar()}
                    <div class="story-scene-panel">
                        <span>${escapeHtml(location.eyebrow)}</span>
                        <h2>${escapeHtml(location.name)}</h2>
                        <p>${escapeHtml(location.description)}</p>
                        <div class="story-scene-status" aria-label="同行者状态">
                            <span><em>沈砚</em><b>${escapeHtml(relationLabel("shen"))}</b></span>
                            <span><em>吴崇</em><b>${escapeHtml(relationLabel("wu"))}</b></span>
                            <span><em>线索</em><b>${evidenceSummary()} 项关键证据</b></span>
                        </div>
                        ${limited ? `<div class="story-scene-pressure"><b>${sceneFinished ? "调查已经结束" : `天色渐晚，还来得及调查 ${remaining} 项`}</b><span>${sceneFinished ? "你可以回看采取过的行动，但不能重新选择。" : "你不必查完所有内容，也不可能让所有人都满意。"}</span></div>` : ""}
                        <div class="story-action-list">
                            ${actions.length ? actions.map((action, index) => `
                                <button type="button" data-story-topic="${escapeHtml(action.id)}" class="${action.selected ? "is-seen" : ""} ${action.closed ? "is-closed" : ""}" ${action.disabled ? "disabled" : ""}>
                                    <em>${escapeHtml(action.stateLabel || action.kind || String(index + 1).padStart(2, "0"))}</em><b>${escapeHtml(action.label)}</b><span>${escapeHtml(action.selected ? "这是你在此处作出的选择。" : action.closed ? "此前的做法已经关闭了这条路。" : action.hint)}</span>
                                </button>
                            `).join("") : '<div class="story-scene-complete"><b>这里暂时没有新的线索</b><span>你可以返回行程图，前往下一处地点。</span></div>'}
                        </div>
                        <button type="button" class="story-map-return" data-story-action="${limited && !sceneFinished ? "finish-scene" : "map"}">${limited && !sceneFinished ? "带着现有线索离开" : "返回行程图"}</button>
                        ${limited && !sceneFinished ? '<small class="story-leave-warning">离开后，未调查的内容将无法原样重来。</small>' : ""}
                    </div>
                    ${state.notice ? `<div class="story-toast">${escapeHtml(state.notice)}</div>` : ""}
                </section>
            </div>
        `;
        scheduleNoticeDismiss();
    }

    function renderTestimony() {
        const location = LOCATIONS[state.location] || LOCATIONS.funeral;
        const testimony = currentTestimony();
        const active = currentStatement();
        const witness = PEOPLE[testimony.witness] || {};
        panel.innerHTML = `
            <div class="story-demo-shell">
                <section class="story-demo-stage is-testimony" style="--story-bg: url('${escapeHtml(location.image)}')">
                    <div class="story-demo-bg"></div><div class="story-demo-shade"></div>
                    ${renderTopbar()}
                    ${witness.portrait ? `<div class="story-character is-testimony-witness"><img src="${escapeHtml(witness.portrait)}" alt="${escapeHtml(testimony.witness)}"></div>` : ""}
                    <div class="story-testimony-hud">
                        <span>证词</span>
                        <h2>${escapeHtml(testimony.title)}</h2>
                        <p>${escapeHtml(testimony.prompt)}</p>
                    </div>
                    <div class="story-testimony-witness">
                        <b>${escapeHtml(testimony.witness)}</b>
                        <span>${escapeHtml(witness.role || "证人")}</span>
                    </div>
                    <div class="story-testimony-box">
                        <div class="story-testimony-lines" role="list" aria-label="证词列表">
                            ${testimony.statements.map(item => `
                                <button type="button" data-story-testimony-line="${escapeHtml(item.id)}" class="${item.id === active.id ? "is-active" : ""} ${state.testimony.pressed.has(item.id) ? "is-pressed" : ""}">
                                    <em>${item.id === active.id ? "▶" : ""}</em><span>${escapeHtml(item.text)}</span>
                                </button>
                            `).join("")}
                        </div>
                        <div class="story-testimony-actions">
                            <button type="button" data-story-action="press-statement">追问</button>
                            <button type="button" data-story-action="show-evidence">出示线索</button>
                            <button type="button" data-story-action="observe-scene">观察现场</button>
                        </div>
                        ${state.testimony.evidencePicker ? `
                            <div class="story-evidence-picker" aria-label="选择要出示的线索">
                                ${evidenceForTestimony().map(clue => `
                                    <button type="button" data-story-evidence="${escapeHtml(clue.id)}">
                                        <b>${escapeHtml(clue.title)}</b>
                                        <span>${escapeHtml(clue.detail)}</span>
                                    </button>
                                `).join("")}
                            </div>
                        ` : ""}
                        <div class="story-testimony-help">
                            <span>选中一句证词，再追问或出示线索。</span>
                            <b>${state.testimony.solved ? "破绽已揭开" : hasClue("relay_knot") ? "你已取得可对质的物证" : "现场还没有查细"}</b>
                        </div>
                    </div>
                    ${state.notice ? `<div class="story-toast">${escapeHtml(state.notice)}</div>` : ""}
                </section>
            </div>
        `;
        scheduleNoticeDismiss();
    }

    function renderMap() {
        const knownLocations = ["funeral", "post", "shrine", "ferry"];
        panel.innerHTML = `
            <div class="story-demo-shell">
                <section class="story-map-screen">
                    ${renderTopbar()}
                    <div class="story-map-atmosphere"></div>
                    <div class="story-map-copy"><span>第一站 · 临皋县北</span><h2>今夜去哪里？</h2><p>主线地点会推进本章；途中见闻可能消失，也可能让你重新理解后来遇见的人。</p></div>
                    <div class="story-route" aria-label="可探索地点">
                        ${knownLocations.map((id, index) => {
                            const location = LOCATIONS[id];
                            const status = locationStatus(id);
                            const locked = status === "locked";
                            return `
                                <button type="button" class="story-map-node is-${status}" data-story-location="${id}" ${locked ? "disabled" : ""} style="--node-image: url('${escapeHtml(location.image)}')">
                                    <i>${index + 1}</i><span>${escapeHtml(locked ? "未知去处" : location.eyebrow)}</span><b>${escapeHtml(locked ? "尚未发现" : location.name)}</b><em>${locked ? "从驿簿、遗物或马蹄中寻找去向" : escapeHtml(location.description)}</em>
                                </button>
                            `;
                        }).join("")}
                    </div>
                    <div class="story-map-legend"><span><i class="is-main"></i>主线目标</span><span><i class="is-side"></i>途中见闻</span><span><i class="is-done"></i>已经探访</span></div>
                    ${state.notice ? `<div class="story-toast">${escapeHtml(state.notice)}</div>` : ""}
                </section>
            </div>
        `;
        scheduleNoticeDismiss();
    }

    function renderFinalChoice() {
        const location = LOCATIONS.ferry;
        panel.innerHTML = `
            <div class="story-demo-shell">
                <section class="story-demo-stage is-final" style="--story-bg: url('${escapeHtml(location.image)}')">
                    <div class="story-demo-bg"></div><div class="story-demo-shade"></div>
                    ${renderTopbar()}
                    <div class="story-final-panel">
                        <span>天亮之前</span>
                        <h2>你要把这二十三个名字交给谁？</h2>
                        <div class="story-final-context">
                            <span><em>关键证据</em><b>${evidenceSummary()} 项</b></span>
                            <span><em>沈砚</em><b>${escapeHtml(relationLabel("shen"))}</b></span>
                            <span><em>吴崇</em><b>${escapeHtml(relationLabel("wu"))}</b></span>
                            <p>${state.memories.deathRecorded ? "赵七的死亡已被正式记入验簿。" : "赵七仍只存在于你们几个人的证词里。"} ${state.companionChoice === "evidence" ? "三份证据已经分开保管。" : state.companionChoice === "protect" ? "你曾答应沈砚先救人。" : state.companionChoice === "procedure" ? "你曾坚持把孙平交给观察使。" : "你没有向任何一方作出承诺。"}</p>
                        </div>
                        <div class="story-final-choices">
                            <button type="button" data-story-ending="protect"><b>把军报正本送回，暗中把名簿交还二十三户</b><em>救人优先，但你和孙平会背上隐匿公文的风险</em></button>
                            <button type="button" data-story-ending="report"><b>带人证、尸证和名簿一并上呈观察使</b><em>相信程序，但证据是否足够将决定谁被定罪</em></button>
                            <button type="button" data-story-ending="flee"><b>烧掉副簿，送孙平兄妹渡河离开</b><em>保住眼前的人，却让名册背后的账继续存在</em></button>
                            <button type="button" data-story-ending="bargain"><b>用副簿与县里交易，换二十三户暂缓征发</b><em>最快止血，也让真正做假账的人继续掌权</em></button>
                        </div>
                        <form class="story-free-action" data-story-free-form>
                            <label for="story-free-input">或者说出你自己的处理方式</label>
                            <div><input id="story-free-input" name="free_action" maxlength="160" autocomplete="off" placeholder="例如：正本照送，先抄下名册，再安排名单上的人今夜离村"><button type="submit">照此行动</button></div>
                            <p>系统会理解行动意图，并映射到现有结果规则，不会让一句话改变天下大势。</p>
                        </form>
                    </div>
                </section>
            </div>
        `;
    }

    function endingFor(type) {
        const enoughEvidence = hasClue("cut_ledger")
            && (hasClue("zhao_qi") || hasClue("last_words"))
            && (state.memories.deathRecorded || state.memories.wuConfessed || state.companionChoice === "evidence");
        const knowsShen = hasClue("shen_identity");
        const warnedHouseholds = state.relations.shen >= 2 ? 19 : state.relations.shen >= 0 ? 15 : 9;
        const zhaoAftermath = state.memories.deathRecorded
            ? "吴崇把验簿上预留的空白补成‘驿卒赵七’，河滩上的死者终于以自己的名字下葬。"
            : "赵七仍以无名流民下葬；知道他姓名的人活着，能证明他如何死去的官文却不存在。";
        const brokenPromise = (state.companionChoice === "protect" && type === "report")
            || (state.companionChoice === "procedure" && (type === "protect" || type === "flee"));
        const companionAftermath = state.companionChoice === "protect"
            ? "山神庙里的承诺没有被忘记：吴崇留下誊录口供，沈砚则先去通知名册上的人。"
            : state.companionChoice === "evidence"
                ? "你们按山神庙里的约定分开保存证据。即使其中一人失手，另外两份仍能证明这页账曾经存在。"
                : "山神庙里的分歧一路跟到了渡口。你们完成了同一件事，却没有真正站到同一边。";
        const endings = {
            protect: {
                title: "名簿没有抵达县衙",
                choice: `你让吴崇带军报正本回城，自己和孙平连夜抄出二十三户姓名。名单上的人有${warnedHouseholds}户赶在封路前离开，其余人选择留下。`,
                people: `${knowsShen
                    ? "沈砚没有随兄长逃走。她留下替那些不识字的人逐户说明名簿上的罪名，也第一次把真实姓名告诉了你。"
                    : `沈砚带孙平渡河后没有告别。几个月后，你收到一封没有署名的信，里面只写着${warnedHouseholds}户人的新住处。`}${state.companionChoice ? ` ${companionAftermath}` : ""} ${zhaoAftermath}`,
                cost: `县里以隐匿公文为名追查孙平，也开始怀疑你。那${warnedHouseholds}户活了下来，却从此成了没有户籍的流民。${brokenPromise ? " 你救下了人，却违背了在山神庙向吴崇作出的保证。" : ""}`,
            },
            report: {
                title: enoughEvidence ? "尸体终于有了名字" : "程序收下了簿册",
                choice: enoughEvidence
                    ? "你把赵七的遗言、青骢马水痕、残缺驿簿和孙平的证词一并呈上。观察使无法把它只当作驿卒偷银，临皋县三名属吏被暂押查账。"
                    : "你把孙平和副簿交给观察使。案卷被收下，孙平也被先行扣押。没有足够旁证，县里仍坚持他是盗取公文的逃卒。",
                people: `${enoughEvidence
                    ? "河滩的无名死者被确认是驿卒赵七。老妇终于在他的木牌上替他写下姓名。二十三户暂缓征发，但案子还远没有结束。"
                    : "沈砚在衙门外等到天黑，没有等到兄长出来。她没有责怪你，只问了一句：‘他们说会查，要查到什么时候？’"}${state.companionChoice && !brokenPromise ? ` ${companionAftermath}` : ""}`,
                cost: `${enoughEvidence ? "你保住了证据，却也让所有证人进入官府视线。有人获救，有人从此活在报复之下。" : "你选择相信程序，程序却先保护了自己的完整。二十三户仍按原册点发。"}${brokenPromise ? " 沈砚记得你曾答应先救人；从此以后，她再没有把任何人的藏身处告诉你。" : ""}`,
            },
            flee: {
                title: "火盆里的二十三个名字",
                choice: "副簿在火中卷曲。你送孙平与沈砚登上渡船，官差赶到时只找到一地纸灰和军报正本。",
                people: `兄妹二人活着离开了临皋。${zhaoAftermath} 二十三户并不知道曾有人为他们偷出过一张名簿。`,
                cost: `县里的假账失去了一份证据。你救下了能够看见的人，却没能触及那些只以名字存在的人。${brokenPromise ? " 吴崇没有揭发你，但也不再愿意为你的决定作证。" : ""}`,
            },
            bargain: {
                title: "一纸暂缓",
                choice: `县里同意把二十三户的征发延后${state.memories.wuConfessed ? "十五" : "十"}日，条件是孙平交回副簿并承认因私怨盗文。临皋今夜没有再抓人。`,
                people: `孙平背下罪名，沈砚带着宽限逐户报信。何六仍做驿长，做假账的人也仍坐在原来的案桌后。${state.memories.wuConfessed ? " 吴崇私下留下了一份誊本，没有把自己的证词一并卖掉。" : ""}`,
                cost: "宽限足以让一些人逃走，也足以让县里重造一份更干净的账。你换来了喘息，却默认了交易可以替代真相。",
            },
        };
        return endings[type] || endings.report;
    }

    function finish(type) {
        state.ending = endingFor(type);
        state.mode = "ending";
        onTrack?.(`story_demo_ending_${type}`);
        render();
    }

    function interpretFreeAction(text) {
        const value = String(text || "").trim();
        if (!value) return "";
        if (/烧|毁|逃|渡河|放走|掩护/.test(value)) return "flee";
        if (/交易|谈判|交换|宽限|暂缓|条件/.test(value)) return "bargain";
        if (/上报|呈报|观察使|查办|依法|人证|交给官府/.test(value)) return "report";
        if (/抄|名单|名簿|百姓|离村|藏|保护|正本照送|军报照送/.test(value)) return "protect";
        return "report";
    }

    function renderEnding() {
        const ending = state.ending;
        panel.innerHTML = `
            <div class="story-demo-shell">
                <section class="story-ending-screen" style="--story-bg: url('${escapeHtml(DEMO_ASSETS.ferry)}')">
                    <div class="story-demo-bg"></div><div class="story-demo-shade"></div>
                    ${renderTopbar()}
                    <div class="story-ending-copy">
                        <span>第一站 · 终</span>
                        <h2>${escapeHtml(ending.title)}</h2>
                        <p>${escapeHtml(ending.choice)}</p>
                        <p>${escapeHtml(ending.people)}</p>
                        <blockquote>${escapeHtml(ending.cost)}</blockquote>
                        <div class="story-history-boundary"><b>天下大势</b><p>天宝十四载十一月，安禄山起兵。叛乱仍将席卷河北与两京。你没有改变它，只改变了临皋今夜有哪些人能够离开，以及谁的名字会被记住。</p></div>
                        <div class="story-next-hook"><span>下一站线索</span><b>赵七遗物上的铜牌，来自长安西市一家早已停业的脚店。</b></div>
                        <div class="story-ending-actions"><button type="button" data-story-action="restart">重新入局</button><button type="button" data-story-action="exit">返回入口</button></div>
                    </div>
                </section>
            </div>
        `;
    }

    function render() {
        if (state.mode === "briefing") {
            renderBriefing();
        } else if (state.mode === "dialogue") {
            panel.innerHTML = `<div class="story-demo-shell">${renderDialogue()}</div>`;
            startTypingCurrentLine();
        } else if (state.mode === "map") {
            renderMap();
        } else if (state.mode === "scene") {
            renderScene();
        } else if (state.mode === "testimony") {
            renderTestimony();
        } else if (state.mode === "final") {
            renderFinalChoice();
        } else if (state.mode === "ending") {
            renderEnding();
        }
        if (state.mode === "clues") {
            const previous = panel.querySelector(".story-demo-stage, .story-map-screen, .story-ending-screen");
            previous?.insertAdjacentHTML("beforeend", renderClueDrawer());
        }
    }

    function continueDialogue() {
        if (finishTyping()) return;
        if (state.dialogueIndex < state.dialogue.length - 1) {
            state.dialogueIndex += 1;
            render();
            return;
        }
        const next = state.afterDialogue;
        if (next === "map") openMap();
        else if (next === "testimony") openTestimony();
        else if (next === "final") {
            state.mode = "final";
            render();
        } else renderScene();
    }

    function openClues() {
        clearTyping();
        const priorMode = state.mode;
        state.modeBeforeOverlay = priorMode === "clues" ? (state.modeBeforeOverlay || "scene") : priorMode;
        state.mode = "clues";
        if (priorMode === "dialogue") panel.innerHTML = `<div class="story-demo-shell">${renderDialogue()}</div>`;
        else if (priorMode === "map") renderMap();
        else if (priorMode === "ending") renderEnding();
        else if (priorMode === "testimony") renderTestimony();
        else renderScene();
        state.mode = "clues";
        const host = panel.querySelector(".story-demo-stage, .story-map-screen, .story-ending-screen");
        host?.insertAdjacentHTML("beforeend", renderClueDrawer());
    }

    function closeOverlay() {
        state.mode = state.modeBeforeOverlay || "scene";
        render();
    }

    panel.addEventListener("click", event => {
        const testimonyButton = event.target.closest("[data-story-testimony-line]");
        if (testimonyButton) {
            selectTestimonyLine(testimonyButton.dataset.storyTestimonyLine || "");
            return;
        }
        const evidenceButton = event.target.closest("[data-story-evidence]");
        if (evidenceButton) {
            presentEvidence(evidenceButton.dataset.storyEvidence || "");
            return;
        }
        const locationButton = event.target.closest("[data-story-location]");
        if (locationButton) {
            visitLocation(locationButton.dataset.storyLocation || "");
            return;
        }
        const topicButton = event.target.closest("[data-story-topic]");
        if (topicButton) {
            if (state.location === "funeral") funeralTopic(topicButton.dataset.storyTopic || "");
            else if (state.location === "post") postTopic(topicButton.dataset.storyTopic || "");
            else if (state.location === "shrine") shrineTopic(topicButton.dataset.storyTopic || "");
            return;
        }
        const endingButton = event.target.closest("[data-story-ending]");
        if (endingButton) {
            finish(endingButton.dataset.storyEnding || "report");
            return;
        }
        const actionButton = event.target.closest("[data-story-action]");
        if (!actionButton) return;
        const action = actionButton.dataset.storyAction;
        if (action === "continue") continueDialogue();
        else if (action === "begin-opening") beginOpeningDialogue();
        else if (action === "finish-scene") finishSceneInvestigation();
        else if (action === "toggle-bgm") toggleBgm();
        else if (action === "toggle-voice") toggleVoice();
        else if (action === "press-statement") pressStatement();
        else if (action === "show-evidence") toggleEvidencePicker();
        else if (action === "observe-scene") observeTestimonyScene();
        else if (action === "map") {
            if (SCENE_LIMITS[state.location] && !state.completed.has(state.location) && (state.mode === "scene" || state.mode === "dialogue")) finishSceneInvestigation();
            else openMap();
        }
        else if (action === "clues") openClues();
        else if (action === "close-overlay") closeOverlay();
        else if (action === "restart") startOpening();
        else if (action === "exit") {
            state.active = false;
            clearTyping();
            stopVoice();
            stopBgm();
            onExit?.();
        }
    });

    document.addEventListener("keydown", event => {
        if (!state.active || panel.classList.contains("hidden") || state.mode !== "dialogue") return;
        if (event.key !== "Enter" && event.key !== " " && event.code !== "Space") return;
        if (event.target instanceof Element && event.target.closest("input, textarea, select, button, [contenteditable='true']")) return;
        event.preventDefault();
        continueDialogue();
    });

    panel.addEventListener("submit", event => {
        const form = event.target.closest("[data-story-free-form]");
        if (!form) return;
        event.preventDefault();
        const text = String(new FormData(form).get("free_action") || "").trim();
        if (!text) return;
        finish(interpretFreeAction(text));
    });

    return {
        start() {
            state.active = true;
            onTrack?.("story_demo_start");
            startOpening();
        },
    };
}
