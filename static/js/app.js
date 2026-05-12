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
    isLoading: false
};

// DOM 元素引用
const elements = {
    navContainer: document.getElementById('nav-container'),
    storySplash: document.getElementById('story-splash'),
    storyContent: document.getElementById('story-content'),
    storyTitle: document.getElementById('story-title'),
    manuscriptStamp: document.getElementById('manuscript-stamp'),
    storyTime: document.getElementById('story-time'),
    storyLocation: document.getElementById('story-location'),
    storyCharactersList: document.getElementById('story-characters-list'),
    storyDetails: document.getElementById('story-details'),
    storyImgContainer: document.getElementById('story-image-container'),
    storyImg: document.getElementById('story-image'),
    
    chatHistoryWrapper: document.getElementById('chat-history-container'),
    chatEmptyState: document.getElementById('chat-empty-state'),
    charBtnsContainer: document.getElementById('character-buttons'),
    chatInput: document.getElementById('chat-input'),
    chatSubmit: document.getElementById('chat-submit'),
    chatForm: document.getElementById('chat-form'),
    btnClear: document.getElementById('btn-clear-chat'),
    currentAtBadge: document.getElementById('current-at-badge'),
    chatSpinner: document.getElementById('chat-spinner')
};

// ================= API 请求 =================
async function apiGet(endpoint) {
    try {
        const res = await fetch(endpoint);
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
        if(hash) {
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

    elements.btnClear.addEventListener('click', () => {
        if(!state.currentEventId) return;
        if(confirm(`确定要销毁【${state.currentEventId}】的所有档案记录并重新开庭吗？`)) {
            state.chatHistory[state.currentEventId] = [];
            saveChatToServer();
            renderChat();
        }
    });
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
        html += `<div class="mb-6">
            <h3 class="text-[#e8d5c4] font-bold text-sm mb-2 px-2 flex items-center gap-1">
                <span class="w-1.5 h-4 bg-[#c62828] inline-block rounded-sm"></span>
                ${dynasty}档案
            </h3>
            <ul class="space-y-1">
        `;
        groupByDynasty[dynasty].forEach(ev => {
            html += `
                <li>
                    <a href="#${ev.id}" onclick="loadEvent('${ev.id}')" 
                       id="${safeId(ev.id)}"
                       class="nav-item block px-4 py-2 text-sm text-[#d4c3af] hover:bg-[#c62828]/10 hover:text-[#f0c9a8] rounded border-l-2 border-transparent transition-all truncate"
                       title="${ev.title}">
                       └─ ${ev.title}
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
    updateNavHighlight(eventId);
    
    elements.storySplash.classList.remove('hidden');
    elements.storyContent.classList.add('hidden');
    
    const res = await apiGet(`/event?name=${encodeURIComponent(eventId)}`);
    if(res && res.success) {
        state.currentEventId = res.full_name;
        state.currentEventData = res.data;
        
        renderStory(res.data);
        
        if(!state.chatHistory[state.currentEventId]) {
            const historyRes = await apiGet(`/chat_history?user_id=${USER_ID}&event_name=${encodeURIComponent(state.currentEventId)}`);
            state.chatHistory[state.currentEventId] = (historyRes && historyRes.messages) ? historyRes.messages : [];
        }
        
        state.currentTarget = "所有参与人";
        elements.currentAtBadge.classList.add('hidden');
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
    elements.storyDetails.innerHTML = data.story || '';
    
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
        
        html += `<button type="button" onclick="setAtTarget('${char}')" class="${baseClass} ${stateClass}">@ ${char}</button>`;
    });
    
    // 取消@群体模式钮
    const isAll = state.currentTarget === "所有参与人";
    html += `<button type="button" onclick="setAtTarget('所有参与人')" class="px-3 py-1.5 rounded-full text-sm transition-all border whitespace-nowrap flex-shrink-0 tracking-wide ${isAll ? 'bg-transparent border-[#8c7a66] text-[#8c7a66]' : 'bg-transparent text-[#bcaea1] border-[#d4c3af] hover:text-[#8c7a66]'}">群聊模式</button>`;

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
    
    history.forEach(msg => {
        if(msg.role === 'user') {
            html += `
            <div class="flex flex-col items-end mb-4 bubble-enter pr-2">
                <span class="text-[10px] text-[#8c7a66] mb-1 uppercase tracking-widest">法官 (我)</span>
                <div class="chat-bubble-user px-5 py-3 border border-[#8c7a66]/30 text-[#35251a] rounded max-w-[85%] whitespace-pre-wrap leading-relaxed">${escapeHtml(msg.content)}</div>
            </div>`;
        } else {
            // 解析大模型返回的 markdown。简单的将 **xx** 变粗体
            let formattedContent = escapeHtml(msg.content)
                .replace(/\*\*(.*?)\*\*/g, '<b class="text-[#5c1313] font-black">$1</b>')
                .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold text-[#5c1313] mb-2" style="font-family: \'Ma Shan Zheng\', serif;">$1</h3>');
                
            let charName = msg.target || "涉案人";
            
            html += `
            <div class="flex flex-col items-start mb-6 bubble-enter pl-2">
                <span class="text-xs text-[#8b2323] font-bold mb-1 ml-1 flex items-center gap-1 font-serif">
                    <span class="opacity-50">@</span> ${charName}
                </span>
                <div class="chat-bubble-ai border-t-2 border-t-[#8b2323] text-[#35251a] px-6 py-4 rounded max-w-[95%] shadow whitespace-pre-wrap leading-[2] text-[15px] bg-[#fcf8f2]">${formattedContent}</div>
            </div>`;
        }
    });
    
    elements.chatHistoryWrapper.innerHTML = `<div id="chat-empty-state" class="hidden"></div>` + html;
    // 滚动到底部
    elements.chatHistoryWrapper.scrollTop = elements.chatHistoryWrapper.scrollHeight;
}

async function saveChatToServer() {
    if (!state.currentEventId) return;
    const messages = state.chatHistory[state.currentEventId] || [];
    await apiPost('/chat_history', {
        user_id: USER_ID,
        event_name: state.currentEventId,
        messages: messages
    });
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");
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
            responsers = state.currentEventData.characters.slice(0, 2);
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
                message: target === "所有参与人" && i === 1 ? "轮到你发言了，请反击上面那个人的说法！" : text,
                history: recentHistory
            };
            
            // 创建一个临时加载气泡
            const loadingHtmlId = `loading-${Date.now()}`;
            elements.chatHistoryWrapper.insertAdjacentHTML('beforeend', `
               <div id="${loadingHtmlId}" class="flex flex-col items-start mb-6 pl-2 animate-pulse">
                   <span class="text-xs text-[#888] mb-1 ml-1">⌛ 史料链接中... 等待 ${speaker} 回复</span>
                   <div class="bg-gray-100 border border-gray-200 text-gray-400 px-4 py-2 rounded-lg rounded-tl-none max-w-[80%]">正在调取时空信号...</div>
               </div>
            `);
            elements.chatHistoryWrapper.scrollTop = elements.chatHistoryWrapper.scrollHeight;

            // ⚠️ 发送到原本为小程序写的同一个 api.py 里的接口！
            const aiRes = await apiPost('/chat', payload);
            
            // 移除 Loading
            const loadingEl = document.getElementById(loadingHtmlId);
            if(loadingEl) loadingEl.remove();

            if(aiRes && aiRes.reply) {
                // 将半文半白和白话文组装在一起，网页端看着更饱满 (或者依靠模型自己返回的格式)
                let combinedReply = aiRes.reply;
                if(aiRes.modern_explain) {
                    combinedReply = `**【半原文】**\n${aiRes.original_voice}\n\n**【白话文解】**\n${aiRes.modern_explain}`;
                }
                
                state.chatHistory[state.currentEventId].push({
                    role: "assistant",
                    content: combinedReply,
                    target: speaker
                });
                renderChat();
                saveChatToServer();
            } else {
                alert(`与 ${speaker} 的连线失败`);
            }
        }
        
    } catch (e) {
        console.error("对话异常", e);
        alert("法庭秩序混乱，请重试！");
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
