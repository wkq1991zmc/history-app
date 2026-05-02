const app = getApp();
const API_BASE_URL = app.globalData.apiBaseUrl;

Page({
  data: {
    eventId: '',
    currentEvent: null,
    messages: [],
    inputValue: '',
    selectedCharacter: '',
    loading: false,
    scrollToViewId: ''
  },

  onLoad(options) {
    const eventId = options.id;
    this.setData({ eventId });
    this.loadChatHistory(eventId);
    
    const currentEvent = app.globalData.currentEvent;
    if (currentEvent) {
      this.setData({ currentEvent });
    }
  },

  loadChatHistory(eventId) {
    const history = wx.getStorageSync(`chat_${eventId}`) || [];
    this.setData({ messages: history });
  },

  saveChatHistory() {
    wx.setStorageSync(`chat_${this.data.eventId}`, this.data.messages);
  },

  onSelectCharacter(e) {
    const char = e.currentTarget.dataset.char;
    this.setData({ selectedCharacter: char });
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  async onSendMessage() {
    const { inputValue, selectedCharacter, loading, messages } = this.data;
    
    if (!inputValue || loading) return;

    const target = selectedCharacter || '所有参与人';
    const content = selectedCharacter ? `**@${selectedCharacter}** ${inputValue}` : inputValue;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content,
      target: target
    };

    this.setData({
      messages: [...messages, userMessage],
      inputValue: '',
      loading: true,
      scrollToViewId: `msg-${userMessage.id}`
    });

    this.saveChatHistory();

    try {
      if (target === '所有参与人') {
        await this.sendGroupChat();
      } else {
        await this.sendSingleChat(target, content);
      }
    } catch (error) {
      console.error('发送消息失败', error);
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'error'
      });
      this.setData({ loading: false });
    }
  },

  async sendSingleChat(target, content) {
    const { eventId, messages } = this.data;
    
    const history = messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
      target: msg.target
    }));

    const res = await new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE_URL}/chat`,
        method: 'POST',
        data: {
          event_name: eventId,
          character: target,
          message: content,
          history: history
        },
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    });

    const assistantMessage = {
      id: Date.now(),
      role: 'assistant',
      content: res.data.reply,
      target: res.data.character
    };

    const newMessages = [...this.data.messages, assistantMessage];
    this.setData({
      messages: newMessages,
      loading: false,
      scrollToViewId: `msg-${assistantMessage.id}`
    });
    
    this.saveChatHistory();
  },

  async sendGroupChat() {
    const { eventId, messages, currentEvent } = this.data;
    const characters = currentEvent.characters;
    
    let currentMessages = [...this.data.messages];
    
    for (const speaker of characters) {
      const history = currentMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
        target: msg.target
      }));

      try {
        const res = await new Promise((resolve, reject) => {
          wx.request({
            url: `${API_BASE_URL}/chat`,
            method: 'POST',
            data: {
              event_name: eventId,
              character: speaker,
              message: '轮到你发言了，请立刻反击！',
              history: history
            },
            success: (res) => resolve(res),
            fail: (err) => reject(err)
          });
        });

        const assistantMessage = {
          id: Date.now() + Math.random(),
          role: 'assistant',
          content: res.data.reply,
          target: res.data.character
        };

        currentMessages = [...currentMessages, assistantMessage];
        this.setData({
          messages: currentMessages,
          scrollToViewId: `msg-${assistantMessage.id}`
        });
        
        this.saveChatHistory();
      } catch (error) {
        console.error(`${speaker} 发言失败`, error);
        break;
      }
    }
    
    this.setData({ loading: false });
  },

  onClearChat() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当前对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          wx.removeStorageSync(`chat_${this.data.eventId}`);
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  }
});
