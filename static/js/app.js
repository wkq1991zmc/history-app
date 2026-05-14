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
    guessUserAnswer: document.getElementById('guess-user-answer')
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

async function apiPost(endpoint, data) {
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CLIENT-ID': USER_ID },
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

// ================= 初始化与导航 =================

async function init() {
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
        } else if (res.data.length > 0) {
            loadEvent(res.data[0].id);
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

    let html = `
        <div class="mb-6">
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
            html += `
                <li>
                    <a href="#${encodeURIComponent(ev.id)}"
                       data-event-id="${escapeAttr(ev.id)}"
                       id="${safeId(ev.id)}"
                       class="nav-item block px-4 py-2 text-sm text-[#d4c3af] hover:bg-[#c62828]/10 hover:text-[#f0c9a8] rounded border-l-2 border-transparent transition-all truncate"
                       title="${escapeAttr(ev.title)}">
                       └─ ${escapeHtml(ev.title)}
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
        state.currentTarget = "所有参与人";
        elements.currentAtBadge.classList.add('hidden');
        
        renderStory(res.data);
        
        if(!state.chatHistory[state.currentEventId]) {
            const historyRes = await apiGet(`/chat_history?event_name=${encodeURIComponent(state.currentEventId)}`, {
                headers: { 'X-CLIENT-ID': USER_ID }
            });
            state.chatHistory[state.currentEventId] = (historyRes && historyRes.messages) ? historyRes.messages : [];
        }
        
        renderChatControls();
        renderChat();
        
        elements.chatInput.disabled = false;
        elements.chatSubmit.disabled = false;
        
    } else {
        alert("时空卷轴读取失败，无法找到该事件");
    }
    
    state.isLoading = false;
}

function renderStory(data) {
    elements.storySplash.classList.add('hidden');
    elements.storyContent.classList.remove('hidden');
    
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
    elements.storyDetails.innerHTML = sanitizeStoryHtml(data.story || '');
    
    // 让卷宗滚回顶部
    elements.storyContent.parentElement.parentElement.scrollTop = 0;
}

function renderChatControls() {
    const chars = state.currentEventData.characters || [];
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
}

function showGuessGame() {
    state.currentMode = "guess";
    window.location.hash = "guess-game";
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
        el.classList.add('border-transparent');
    });
    document.querySelector('[data-game="guess-person"]')?.classList.add('bg-[#c62828]/10', 'text-[#c62828]', 'border-[#c62828]', 'font-bold');
    elements.storySplash.classList.add('hidden');
    elements.storyContent.classList.add('hidden');
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
        elements.guessStatus.textContent = "这次不算回合。请换成是/不是问题，或直接点击“猜答案”。";
        return;
    }
    appendGuessLog('ai', `AI 答：${res.answer}`);
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
        elements.guessStatus.textContent = "AI 正在猜你的人物，请回答是或不是。";
    } else {
        state.guessGame.pendingAiGuess = "";
        appendGuessLog('ai', `AI 问：${res.text}`);
        elements.guessStatus.textContent = "请回答 AI 的问题。";
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

// ================= AI 交互核心桥接 =================
async function handleUserSubmit() {
    const text = elements.chatInput.value.trim();
    if(!text) return;
    
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
        if(target === "所有参与人" && state.currentEventData.characters.length > 0) {
            // 取前两个重要当事人接招
            responsers = state.currentEventData.characters;
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
                answer_mode: state.answerMode
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

// 启动入口
window.onload = function() {
    init();
    initMobile();
};
