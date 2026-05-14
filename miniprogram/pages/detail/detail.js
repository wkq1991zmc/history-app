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
  '吕蒙': '大都督',
  '糜芳': '国舅',
  '李世民': '秦王',
  '李建成': '太子',
  '李渊': '唐高祖',
  '尉迟敬德': '大将',
  '张巡': '中丞',
  '许远': '太守',
  '安禄山': '叛首',
  '赵匡胤': '宋太祖',
  '赵普': '宰相',
  '石敬瑭': '儿皇帝',
  '柴荣': '后周世宗',
  '寇准': '宰相',
  '萧太后': '太后',
  '王安石': '参知政事',
  '司马光': '宰相',
  '神宗': '宋神宗',
  '岳飞': '元帅',
  '赵构': '宋高宗',
  '秦桧': '宰相',
  '陆秀夫': '丞相',
  '张世杰': '太傅',
  '忽必烈': '元世祖',
  '伯颜': '大元丞相',
  '妥懽帖睦尔': '元顺帝',
  '脱脱': '宰相',
  '韩山童': '白莲教主',
  '朱棣': '燕王',
  '建文帝': '天子',
  '方孝孺': '帝师',
  '朱祁镇': '明英宗',
  '于谦': '兵部尚书',
  '王振': '太监',
  '吕后': '太后',
  '周勃': '太尉',
  '陈平': '丞相',
  '刘彻': '汉武帝',
  '卫子夫': '皇后',
  '江充': '绣衣使者',
  '司马衷': '晋惠帝',
  '贾南风': '皇后',
  '司马伦': '赵王',
  '司马睿': '晋元帝',
  '王导': '司徒',
  '祖逖': '镇西将军',
  '谢安': '太保',
  '谢玄': '建武将军',
  '苻坚': '天王',
  '刘裕': '宋武帝',
  '王镇恶': '安西将军',
  '元宏': '魏孝文帝',
  '元勰': '彭城王',
  '冯太后': '太皇太后',
  '萧衍': '梁武帝',
  '侯景': '宇宙大将军',
  '陈霸先': '陈武帝',
  '杨坚': '隋文帝',
  '高颎': '尚书左仆射',
  '独孤皇后': '皇后',
  '杨广': '隋炀帝',
  '宇文恺': '将作大匠',
  '来护儿': '左翊卫大将军',
  '杨玄感': '楚国公'
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

  onToggleTranslation(e) {
    const index = e.currentTarget.dataset.index;
    const key = `messages[${index}].showTranslation`;
    this.setData({
      [key]: !this.data.messages[index].showTranslation
    });
    this.saveChatHistory();
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
        timeout: 120000, 
        header: {
          'X-WX-OPENID': app.globalData.openId || wx.getStorageSync('userOpenId') || 'unknown'
        },
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
      original_voice: (res.data.original_voice || '').replace(/\n/g, '<br>'),
      modern_explain: (res.data.modern_explain || '').replace(/\n/g, '<br>'),
      showTranslation: false,
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
        content: msg.content || msg.original_voice || msg.modern_explain || '...',
        target: msg.target || ''
      }));

      try {
        const res = await new Promise((resolve, reject) => {
          wx.request({
            url: `${API_BASE_URL}/chat`,
            method: 'POST',
            timeout: 120000,
            header: {
              'X-WX-OPENID': app.globalData.openId || wx.getStorageSync('userOpenId') || 'unknown'
            },
            data: {
              event_name: eventId,
              character: speaker,
              message: '轮到你发言了，请立刻反击！',
              history: history
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data) {
                resolve(res);
              } else {
                reject(new Error(`返回状态码异常: ${res.statusCode}`));
              }
            },
            fail: (err) => reject(err)
          });
        });

        const assistantMessage = {
          id: Date.now() + Math.random(),
          role: 'assistant',
          content: res.data.original_voice || res.data.reply || '',
          original_voice: (res.data.original_voice || res.data.reply || '').replace(/\n/g, '<br>'),
          modern_explain: (res.data.modern_explain || '').replace(/\n/g, '<br>'),
          showTranslation: false,
          target: res.data.character || speaker
        };

        currentMessages = [...currentMessages, assistantMessage];
        this.setData({
          messages: [...currentMessages],
          scrollToViewId: `msg-${assistantMessage.id}`
        });
        
        this.saveChatHistory();
        
      } catch (error) {
        console.error(`${speaker} 发言失败或导致 500:`, error);
      }
    }
    
    this.setData({ loading: false });
  }
});
