const app = getApp();
const API_BASE_URL = app.globalData.apiBaseUrl;

const CHARACTER_ROLES = {
  '赵高': '中车府令',
  '李斯': '丞相',
  '胡亥': '秦二世',
  '扶苏': '公子',
  '蒙恬': '大将',
  '汉献帝': '天子',
  '曹操': '魏王',
  '刘备': '蜀主',
  '董承': '车骑将军',
  '吕布': '飞将',
  '陈宫': '谋士',
  '周瑜': '大都督',
  '孙权': '吴主',
  '诸葛亮': '军师',
  '关羽': '武圣',
  '吕蒙': '都督',
  '糜芳': '国舅',
  '李世民': '秦王',
  '李建成': '太子',
  '李渊': '唐高祖',
  '尉迟敬德': '大将',
  '岳飞': '元帅',
  '赵构': '宋高宗',
  '秦桧': '宰相',
  '朱棣': '燕王',
  '建文帝': '天子',
  '方孝孺': '帝师',
  '吕后': '太后',
  '周勃': '太尉',
  '陈平': '丞相'
};

Page({
  data: {
    eventId: '',
    eventData: {
      manuscript: '',
      title: '',
      time: '',
      location: '',
      story: '',
      characters: [],
      subtitle: ''
    },
    messages: [],
    inputValue: '',
    selectedCharacter: '',
    loading: false,
    scrollToViewId: ''
  },

  onLoad(options) {
    const eventId = options.id;
    this.setData({ eventId });
    this.loadEventData(eventId);
    this.loadChatHistory(eventId);
  },

  async loadEventData(eventId) {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE_URL}/event`,
          data: { name: eventId },
          method: 'GET',
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      });

      if (res.data && res.data.success) {
        const data = res.data.data;
        const locationParts = data.location ? data.location.split('➡️') : [];
        const subtitle = locationParts[0] || data.location || '';
        
        this.setData({
          eventData: {
            ...data,
            subtitle: subtitle
          }
        });
      } else {
        wx.showToast({
          title: '未找到该卷宗',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('加载卷宗失败', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'error'
      });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  loadChatHistory(eventId) {
    const history = wx.getStorageSync(`chat_${eventId}`) || [];
    this.setData({ messages: history });
  },

  saveChatHistory() {
    wx.setStorageSync(`chat_${this.data.eventId}`, this.data.messages);
  },

  getCharacterRole(char) {
    return CHARACTER_ROLES[char] || '历史人物';
  },

  onSelectCharacter(e) {
    const char = e.currentTarget.dataset.char;
    this.setData({ selectedCharacter: char });
  },

  onClearTarget() {
    this.setData({ selectedCharacter: '' });
  },

  onClearChat() {
    wx.showModal({
      title: '清空记录',
      content: '确定要清空所有对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(`chat_${this.data.eventId}`);
          this.setData({ messages: [] });
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  async onSendMessage() {
    const { inputValue, selectedCharacter, loading, messages, eventId, eventData } = this.data;
    
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
      original_voice: res.data.original_voice || '',
      modern_explain: res.data.modern_explain || '',
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
    const { eventId, messages, eventData } = this.data;
    const characters = eventData.characters || [];
    
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
          original_voice: res.data.original_voice || '',
          modern_explain: res.data.modern_explain || '',
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
  }
});
