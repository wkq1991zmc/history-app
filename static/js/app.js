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
    "儒生": "avatar-lusu",
    "乡里代表": "avatar-zhangzhao",
    "刑部主审官": "avatar-official",
    "礼官": "avatar-scholar",
    "被害者家属": "avatar-zhangzhao",
    "你": "avatar-sunquan"
};
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
        visualBriefingPageIndex: 0
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
    elements.timeTravelContent?.classList.toggle('law-classroom-demo', visible);
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

function showHome() {
    if (isLawClassroomDemo()) {
        showTimeTravel({ privateEntry: true });
        return;
    }
    state.currentMode = "home";
    setRujuMode(false);
    window.history.pushState(null, "", window.location.pathname + window.location.search);
    elements.homeScreen?.classList.remove('hidden');
    elements.appShell?.classList.add('hidden');
    elements.storySplash.classList.remove('hidden');
    elements.storyContent.classList.add('hidden');
    elements.guessGameContent.classList.add('hidden');
    elements.timeTravelContent?.classList.add('hidden');
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
    elements.homeStartBtn?.addEventListener('click', enterFromHome);
    updateClassroomDemoVisibility();
    loadTravelScenes();
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
            showHome();
            setTimeout(() => showFeatureNotice("入局玩法正在开发中，暂未开放试玩。"), 80);
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
                    showFeatureNotice("入局玩法正在开发中，暂未开放试玩。");
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
    elements.travelStartBtn?.addEventListener('click', startTimeTravel);
    elements.travelRestartBtn?.addEventListener('click', () => startTimeTravel({ sceneId: state.timeTravel.activeSceneId || VISUAL_NOVEL_SCENE_ID }));
    elements.travelChoiceList?.addEventListener('click', handleTravelChoice);
    elements.visualChoiceList?.addEventListener('click', handleTravelChoice);
    elements.timeTravelContent?.addEventListener('click', (e) => {
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
        submitVisualNovelInput(true);
    });
    document.addEventListener('keydown', (e) => {
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
    elements.chatSection.classList.add('hidden');
}

function showTimeTravel(options = {}) {
    hideHome();
    updateClassroomDemoVisibility();
    setRujuMode(true);
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
        elements.travelPlayPanel?.classList.add('hidden');
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
    if (/乡里|被害者|家属|代表/.test(name)) return "avatar-lusu";
    if (/孙权|主公|你/.test(name)) return "avatar-sunquan";
    if (/周瑜|公瑾|将/.test(name)) return "avatar-zhouyu";
    if (/鲁肃|子敬|谋/.test(name)) return "avatar-lusu";
    if (/律令官|儒生|董仲舒|礼官|经学|先生|刑部|主审|廷尉|官/.test(name)) return "avatar-official";
    if (/张昭|老臣|相国|文臣|臣/.test(name)) return "avatar-zhangzhao";
    return "avatar-player";
}

function setVisualAvatarClass(avatarClass = "") {
    const safeClass = avatarClass || "avatar-player";
    if (elements.visualAvatar) {
        elements.visualAvatar.className = `ruju-visual-avatar ${safeClass}`;
    }
    if (elements.visualDialogueAvatar) {
        elements.visualDialogueAvatar.className = `ruju-dialogue-avatar ${safeClass}`;
    }
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
    return `你的身份：${identity}\n\n你的任务：${goal}\n\n你可以继续追问、质疑、命令；一旦拍板，本局历史会按你的决定推演。`;
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
        kind: item.kind || "ai"
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
    const pickSection = (labelPattern) => {
        const match = body.match(new RegExp(`(?:^|\\n\\n?)(${labelPattern})：([\\s\\S]*?)(?=\\n\\n?(?:教材回顾|教材联系|课堂追问|史学分析|礼法分析)：|$)`));
        return match ? match[2].trim() : "";
    };
    const analysis = pickSection("史学分析|礼法分析");
    const textbook = pickSection("教材回顾|教材联系");
    const question = pickSection("课堂追问");
    const main = body
        .replace(/(?:^|\n\n?)(?:史学分析|礼法分析)：[\s\S]*?(?=\n\n?(?:教材回顾|教材联系|课堂追问)：|$)/g, "")
        .replace(/(?:^|\n\n?)(?:教材回顾|教材联系)：[\s\S]*?(?=\n\n?课堂追问：|$)/g, "")
        .replace(/(?:^|\n\n?)课堂追问：[\s\S]*$/g, "")
        .trim();
    title = title.replace(/^([A-D])\s*[｜|]\s*/, "$1 ");
    return { title, main, analysis, textbook, question };
}

function renderClassroomVerdict(text = "") {
    const verdict = parseClassroomVerdict(text);
    const sideCards = [
        verdict.analysis ? { title: "礼法分析", text: verdict.analysis } : null,
        verdict.textbook ? { title: "教材回顾", text: verdict.textbook } : null,
        verdict.question ? { title: "课堂追问", text: verdict.question } : null,
    ].filter(Boolean);
    return `
        <article class="ruju-verdict-dossier">
            <header class="ruju-verdict-head">
                <span>裁断卷宗</span>
                <h2>${escapeHtml(verdict.title)}</h2>
            </header>
            <section class="ruju-verdict-main">
                <b>推演结果</b>
                <p>${escapeHtml(verdict.main || text).replace(/\n/g, '<br>')}</p>
            </section>
            <div class="ruju-verdict-side">
                ${sideCards.map(card => `
                    <section>
                        <b>${escapeHtml(card.title)}</b>
                        <p>${escapeHtml(card.text).replace(/\n/g, '<br>')}</p>
                    </section>
                `).join('')}
            </div>
            <div class="ruju-verdict-actions">
                <button type="button" data-verdict-action="rechoose">重新选择</button>
                <button type="button" data-verdict-action="home">返回首页</button>
            </div>
        </article>
    `;
}

function isVisualClassroomResultItem(item = {}) {
    return Boolean(state.timeTravel.payload?.classroom_mode && state.timeTravel.payload?.ended && (item.kind === "system" || item.kind === "verdict"));
}

function setVisualDialogueItem(item, options = {}) {
    if (!item || !elements.visualDialogueText) return;
    const speaker = normalizeVisualSpeaker(item.speaker, item.kind);
    const isClassroomResult = isVisualClassroomResultItem(item);
    elements.visualDialogueBox?.classList.remove('hidden');
    elements.visualSpeakerName.textContent = speaker;
    elements.visualSpeakerRole.textContent = item.role || visualRoleForSpeaker(speaker);
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
        elements.visualDialogueText.textContent = item.text || "";
        updateVisualInputAvailability();
        updateVisualContinueAvailability();
        return;
    }
    elements.visualInputForm?.classList.add('hidden');
    typeIntoElement(elements.visualDialogueText, item.text || "", { speed: 20 });
}

function setVisualThinking(speaker = "局中人", role = "") {
    clearVisualTyping();
    const displaySpeaker = normalizeVisualSpeaker(speaker, "ai");
    elements.visualSpeakerName.textContent = displaySpeaker;
    elements.visualSpeakerRole.textContent = role || visualRoleForSpeaker(displaySpeaker);
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
    elements.visualSpeakerName.textContent = speaker;
    elements.visualSpeakerRole.textContent = item.role || visualRoleForSpeaker(speaker);
    setVisualAvatarClass(isClassroomResult ? 'avatar-none' : visualAvatarClass(speaker));
    elements.visualDialogueBox?.classList.toggle('is-result', isClassroomResult);
    if (isClassroomResult) {
        elements.visualDialogueText.innerHTML = renderClassroomVerdict(text);
    } else {
        elements.visualDialogueText.textContent = text;
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
        if (verdictItem) return [verdictItem];
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
    renderVisualChoiceButtons(payload);
    state.timeTravel.visualClassroomChoicesRevealed = true;
    elements.visualDialogueBox?.classList.add('hidden');
    elements.travelVisualStage?.classList.remove('can-continue');
    updateVisualChoiceAvailability();
    elements.visualChoiceList?.classList.remove('hidden');
}

function returnToClassroomHome() {
    clearVisualTyping();
    state.timeTravel.payload = null;
    state.timeTravel.visualPendingPayload = null;
    state.timeTravel.visualQueue = [];
    state.timeTravel.visualIndex = -1;
    state.timeTravel.visualMaxSeenIndex = -1;
    state.timeTravel.visualClassroomChoicesRevealed = false;
    state.timeTravel.sessionId = null;
    elements.timeTravelContent?.classList.remove('ruju-playing');
    elements.travelStartPanel?.classList.remove('hidden');
    elements.travelPlayPanel?.classList.add('hidden');
    elements.travelVisualPanel?.classList.add('hidden');
    elements.visualChoiceList?.classList.add('hidden');
    elements.visualDialogueBox?.classList.remove('hidden', 'is-result');
}

function handleVerdictAction(action = "") {
    if (action === "rechoose") {
        returnToClassroomChoices();
    } else if (action === "home") {
        returnToClassroomHome();
    }
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
        state.timeTravel.visualClassroomChoicesRevealed = true;
        elements.visualDialogueBox?.classList.add('hidden');
    }
    updateVisualInputAvailability();
    updateVisualContinueAvailability();
}

function renderVisualNovel(payload, options = {}) {
    elements.travelVisualPanel?.classList.remove('hidden');
    elements.travelPlayPanel?.classList.add('hidden');
    if (elements.travelVisualStage) {
        elements.travelVisualStage.className = `ruju-visual-stage scene-${payload.scene_id || 'default'}${payload.classroom_mode ? ' is-classroom' : ''}`;
    }
    renderVisualChoiceButtons(payload);
    if (elements.visualEra) elements.visualEra.textContent = [payload.era, payload.year, payload.location].filter(Boolean).join(' · ');
    if (elements.visualTitle) elements.visualTitle.textContent = payload.title || '赤壁战前的江东朝议';
    if (elements.visualRound) {
        const round = Number(payload.round || 0) + 1;
        elements.visualRound.textContent = payload.ended ? '已定局' : `第 ${round} 轮`;
    }
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

async function handleTravelChoice(e) {
    const button = e.target.closest('[data-choice-id]');
    if (!button || state.timeTravel.isBusy || !state.timeTravel.sessionId) return;
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

async function submitVisualNovelInput(forceDecision = false) {
    const rawMessage = elements.visualPlayerInput?.value.trim() || "";
    const message = rawMessage || (forceDecision ? "我意已决，按当前判断拍板执行。" : "");
    if (!message || state.timeTravel.isBusy || !state.timeTravel.sessionId) return;
    const activeSpeaker = state.timeTravel.visualQueue[state.timeTravel.visualIndex]?.speaker || "";
    const targetSpeaker = activeSpeaker === "你" || !activeSpeaker
        ? (elements.travelTalkPerson.value || "周瑜")
        : activeSpeaker;
    state.timeTravel.visualPendingUserRequest = {
        message,
        forceDecision,
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
    if (res?.round !== undefined && elements.visualRound) {
        elements.visualRound.textContent = res.ended ? '已定局' : `第 ${Number(res.round || 0) + 1} 轮`;
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
    init();
    initMobile();
}

// 启动入口：module 脚本可能在 load 之后执行，需兼容两种时机。
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp, { once: true });
} else {
    startApp();
}
