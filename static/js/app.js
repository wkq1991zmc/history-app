const firebaseConfig = {
    apiKey: "AIzaSyBpxBagzoxMN_9TJWffR6Bqik0-sRkfGrQ",
    authDomain: "history-app-3e6cb.firebaseapp.com",
    projectId: "history-app-3e6cb",
    storageBucket: "history-app-3e6cb.firebasestorage.app",
    messagingSenderId: "1017339099255",
    appId: "1:1017339099255:web:ad853b976fa52546666e72",
    measurementId: "G-EY27HDP84N"
};

let firebaseAuth = null;
let firebaseAuthApi = null;
let firebaseReadyPromise = null;
let firebaseObserverStarted = false;
const DEFAULT_EVENT_ID = "\u79e6\u671d\u00b7\u4e00\u7edf\u516d\u56fd";
const AUTH_REMEMBER_KEY = "historyAppRememberLogin";
const GUEST_CHAT_LIMIT = 2;
const GUEST_CHAT_COUNT_KEY = "historyAppGuestChatCount";
const STORY_KEYWORDS = [
    "法家治国理想", "个人宗族私欲", "中央集权", "大一统", "皇权合法性", "政治合法性",
    "帝国继承权", "权力交接", "权力过渡", "权力结构", "政治结构", "制度设计",
    "制度化削藩", "制度性拆解", "制度修补", "国家机器", "国家能力", "国家信用",
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

async function getFirebaseAuth() {
    if (firebaseAuth && firebaseAuthApi) {
        return { auth: firebaseAuth, api: firebaseAuthApi };
    }
    if (!firebaseReadyPromise) {
        firebaseReadyPromise = Promise.all([
            import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js")
        ]).then(([appApi, authApi]) => {
            const firebaseApp = appApi.initializeApp(firebaseConfig);
            firebaseAuth = authApi.getAuth(firebaseApp);
            firebaseAuthApi = authApi;
            return authApi.setPersistence(firebaseAuth, authApi.browserLocalPersistence)
                .catch((err) => {
                    console.warn("Firebase persistence setup failed", err);
                })
                .then(() => ({ auth: firebaseAuth, api: firebaseAuthApi }));
        });
    }
    return firebaseReadyPromise;
}

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
    isLoading: false
};

// DOM 元素引用
const elements = {
    homeScreen: document.getElementById('home-screen'),
    homeStartBtn: document.getElementById('home-start-btn'),
    homeAuthOpenBtn: document.getElementById('home-auth-open-btn'),
    homeAuthUser: document.getElementById('home-auth-user'),
    homeAuthEmail: document.getElementById('home-auth-email'),
    homeAuthLogoutBtn: document.getElementById('home-auth-logout-btn'),
    appShell: document.getElementById('app-shell'),
    navContainer: document.getElementById('nav-container'),
    storySplash: document.getElementById('story-splash'),
    storyContent: document.getElementById('story-content'),
    guessGameContent: document.getElementById('guess-game-content'),
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
    authPassword: document.getElementById('auth-password'),
    authRemember: document.getElementById('auth-remember'),
    authLoginBtn: document.getElementById('auth-login-btn'),
    authSignupBtn: document.getElementById('auth-signup-btn'),
    authResetBtn: document.getElementById('auth-reset-btn'),
    authStatus: document.getElementById('auth-status')
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
            throw new Error(`HTTP ${res.status}`);
        }
        return await res.json();
    } catch (e) {
        console.error('API POST Error:', e);
        return null;
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
    if (elements.authPassword) elements.authPassword.value = '';
    elements.authEmail.focus();
}

function closeAuthModal() {
    elements.authModal?.classList.add('hidden');
    elements.authModal?.setAttribute('aria-hidden', 'true');
}

function initRememberLoginOption() {
    if (!elements.authRemember) return;
    elements.authRemember.checked = localStorage.getItem(AUTH_REMEMBER_KEY) !== "0";
}

function shouldRememberLogin() {
    return elements.authRemember ? elements.authRemember.checked : true;
}

async function applyAuthPersistence() {
    const remember = shouldRememberLogin();
    localStorage.setItem(AUTH_REMEMBER_KEY, remember ? "1" : "0");
    const { auth, api } = await getFirebaseAuth();
    const persistence = remember ? api.browserLocalPersistence : api.browserSessionPersistence;
    await api.setPersistence(auth, persistence);
    return { auth, api };
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
    elements.authStatus.textContent = '你已经体验了 2 次 AI 对话。登录后可以继续提问，并保留之后的探索记录。';
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
    localStorage.removeItem('historyAppAuthToken');
    if (firebaseObserverStarted) return;
    firebaseObserverStarted = true;
    getFirebaseAuth().then(({ auth, api }) => {
        api.onAuthStateChanged(auth, async (user) => {
            if (!user) {
                state.authToken = "";
                state.authUser = null;
                state.authReady = true;
                renderAuthState();
                return;
            }
            state.authToken = await user.getIdToken();
            state.authUser = {
                id: user.uid,
                email: user.email || ""
            };
            state.authReady = true;
            renderAuthState();
            continueAfterLogin();
        });
    }).catch((err) => {
        console.warn("Firebase auth failed to initialize", err);
        state.authReady = true;
        renderAuthState();
    });
}

function authErrorMessage(error) {
    const code = error?.code || "";
    if (code === "auth/email-already-in-use") return "这个邮箱已经注册过了，请直接登录。";
    if (code === "auth/invalid-email") return "邮箱格式不正确。";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        return "邮箱或密码不正确。";
    }
    if (code === "auth/weak-password") return "密码至少需要 6 位。";
    if (code === "auth/too-many-requests") return "尝试次数太多，请稍后再试。";
    if (code === "auth/unauthorized-domain") return "当前域名还没有加入 Firebase 授权域名。";
    return "登录服务暂时不可用，请稍后再试。";
}

function getAuthInputs() {
    const email = elements.authEmail.value.trim();
    const password = elements.authPassword.value;
    if (!email) {
        elements.authStatus.textContent = '先填邮箱。';
        return null;
    }
    if (!password || password.length < 6) {
        elements.authStatus.textContent = '密码至少需要 6 位。';
        return null;
    }
    return { email, password };
}

function setAuthBusy(isBusy) {
    elements.authLoginBtn.disabled = isBusy;
    elements.authSignupBtn.disabled = isBusy;
    elements.authResetBtn.disabled = isBusy;
}

async function loginWithEmail() {
    const values = getAuthInputs();
    if (!values) return;
    setAuthBusy(true);
    elements.authStatus.textContent = '正在登录...';
    try {
        const { auth, api } = await applyAuthPersistence();
        const credential = await api.signInWithEmailAndPassword(auth, values.email, values.password);
        state.authToken = await credential.user.getIdToken();
        state.authUser = {
            id: credential.user.uid,
            email: credential.user.email || values.email
        };
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

async function signupWithEmail() {
    const values = getAuthInputs();
    if (!values) return;
    setAuthBusy(true);
    elements.authStatus.textContent = '正在注册...';
    try {
        const { auth, api } = await applyAuthPersistence();
        const credential = await api.createUserWithEmailAndPassword(auth, values.email, values.password);
        state.authToken = await credential.user.getIdToken();
        state.authUser = {
            id: credential.user.uid,
            email: credential.user.email || values.email
        };
        renderAuthState();
        elements.authStatus.textContent = '注册成功。';
        showToast('注册成功');
        continueAfterLogin();
        setTimeout(closeAuthModal, 600);
    } catch (err) {
        elements.authStatus.textContent = authErrorMessage(err);
    } finally {
        setAuthBusy(false);
    }
}

async function resetAuthPassword() {
    const email = elements.authEmail.value.trim();
    if (!email) {
        elements.authStatus.textContent = '先填邮箱，再重置密码。';
        return;
    }
    setAuthBusy(true);
    elements.authStatus.textContent = '正在发送重置邮件...';
    try {
        const { auth, api } = await getFirebaseAuth();
        await api.sendPasswordResetEmail(auth, email);
        elements.authStatus.textContent = '重置邮件已发送，请查看邮箱。';
    } catch (err) {
        elements.authStatus.textContent = authErrorMessage(err);
    } finally {
        setAuthBusy(false);
    }
}

async function logoutAuth() {
    try {
        const { auth, api } = await getFirebaseAuth();
        await api.signOut(auth);
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
}

function showHome() {
    state.currentMode = "home";
    elements.homeScreen?.classList.remove('hidden');
    elements.appShell?.classList.add('hidden');
    elements.storySplash.classList.remove('hidden');
    elements.storyContent.classList.add('hidden');
    elements.guessGameContent.classList.add('hidden');
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

async function init() {
    trackAnalytics('visit');
    elements.homeStartBtn?.addEventListener('click', enterFromHome);
    // 1. 获取导航目录
    const res = await apiGet('/events_list');
    if(res && res.success) {
        state.eventsList = res.data;
        renderNav(res.data);
        
        const hash = decodeURIComponent(window.location.hash.substring(1));
        if(hash === "guess-game") {
            showGuessGame();
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
            showGuessGame();
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
            renderChat();
        }
    });

    elements.guessStartBtn.addEventListener('click', startGuessGame);
    elements.guessResetBtn.addEventListener('click', resetGuessGame);
    elements.guessRevealBtn.addEventListener('click', revealGuessGameAnswer);
    elements.guessAskBtn.addEventListener('click', askGuessGameQuestion);
    elements.guessGuessBtn.addEventListener('click', guessAiPerson);
    elements.guessUserAnswer.addEventListener('click', handleUserYesNoAnswer);
    elements.feedbackOpenBtn?.addEventListener('click', openFeedbackModal);
    elements.mobileFeedbackBtn?.addEventListener('click', openFeedbackModal);
    elements.homeAuthOpenBtn?.addEventListener('click', openAuthModal);
    elements.homeAuthLogoutBtn?.addEventListener('click', logoutAuth);
    document.querySelectorAll('[data-copy-group]').forEach(button => {
        button.addEventListener('click', copyQQGroup);
    });
    elements.feedbackCloseBtn.addEventListener('click', closeFeedbackModal);
    elements.feedbackModal.addEventListener('click', (e) => {
        if (e.target === elements.feedbackModal) closeFeedbackModal();
    });
    elements.feedbackSubmitBtn.addEventListener('click', submitFeedback);
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
            html += `
                <li>
                    <a href="#${encodeURIComponent(ev.id)}"
                       data-event-id="${escapeAttr(ev.id)}"
                       id="${safeId(ev.id)}"
                       class="nav-item${sideClass} block px-4 py-2 text-sm text-[#d4c3af] hover:bg-[#c62828]/10 hover:text-[#f0c9a8] rounded border-l-2 border-transparent transition-all truncate"
                       title="${escapeAttr(ev.title)}">
                       └─ ${escapeHtml(ev.title)}
                    </a>
                </li>
            `;
        });
        html += `</ul></div>`;
    }
    html += `
        <div class="mt-6 mb-6">
            <h3 class="text-[#e8d5c4] font-bold text-sm mb-2 px-2 flex items-center gap-1">
                <span class="w-1.5 h-4 bg-[#c62828] inline-block rounded-sm"></span>
                互动游戏
            </h3>
            <ul class="space-y-1">
                <li>
                    <a href="#guess-game" data-game="guess-person"
                       class="nav-item block px-4 py-2 text-sm text-[#d4c3af] hover:bg-[#c62828]/10 hover:text-[#f0c9a8] rounded border-l-2 border-transparent transition-all truncate">
                       └─ 猜历史人物
                    </a>
                </li>
            </ul>
        </div>
    `;
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
    
    window.location.hash = eventId;
    state.currentMode = "story";
    updateNavHighlight(eventId);
    
    elements.storySplash.classList.remove('hidden');
    elements.storyContent.classList.add('hidden');
    elements.guessGameContent.classList.add('hidden');
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
        renderChat();
        
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
                    <div class="skeleton-archive-title">秦朝为何能迅速<span>兴起</span>？</div>
                    <div class="skeleton-card-list">${pillarHtml}</div>
                </div>
                <div class="skeleton-archive-card skeleton-archive-card-fall">
                    <div class="skeleton-archive-label">第二份案卷</div>
                    <div class="skeleton-archive-title">帝国<span>裂痕</span>从哪里开始？</div>
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
    elements.chatSection.classList.add('hidden');
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


async function apiStreamPost(endpoint, data, onDelta) {
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
            if (payload.delta) {
                onDelta(payload.delta);
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
function renderChat() {
    const history = state.chatHistory[state.currentEventId] || [];
    
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
    // 滚动到底部
    elements.chatHistoryWrapper.scrollTop = elements.chatHistoryWrapper.scrollHeight;
}

function formatChatContent(content) {
    return escapeHtml(content || '')
        .replace(/\*\*(.*?)\*\*/g, '<b class="text-[#5c1313] font-black">$1</b>')
        .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold text-[#5c1313] mb-2" style="font-family: \'Ma Shan Zheng\', serif;">$1</h3>');
}

function updateAssistantBubble(messageIndex, content) {
    const bubble = elements.chatHistoryWrapper.querySelector(`[data-message-index="${messageIndex}"] .chat-bubble-ai`);
    if (!bubble) return;
    bubble.innerHTML = formatChatContent(content);
    elements.chatHistoryWrapper.scrollTop = elements.chatHistoryWrapper.scrollHeight;
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
    renderChat();
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
            renderChat();
            updateAssistantBubble(assistantMessageIndex, "正在连线时空信号...");

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
