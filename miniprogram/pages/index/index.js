const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    selectedDynasty: 'all',
    dynasties: [
      { id: 'all', name: '全部', year: '', icon: '🏛️' },
      { id: '秦', name: '秦', year: '前221年', icon: '🏛️' },
      { id: '汉', name: '汉', year: '前206年', icon: '🏛️' },
      { id: '三国', name: '三国', year: '220年', icon: '🏛️' },
      { id: '晋', name: '晋', year: '265年', icon: '🏛️' },
      { id: '南北朝', name: '南北朝', year: '420年', icon: '🏛️' },
      { id: '隋', name: '隋', year: '581年', icon: '🏛️' },
      { id: '唐', name: '唐', year: '618年', icon: '🏛️' },
      { id: '五代十国', name: '五代', year: '907年', icon: '🏛️' },
      { id: '宋', name: '宋', year: '960年', icon: '🏛️' },
      { id: '元', name: '元', year: '1271年', icon: '🏛️' },
      { id: '明', name: '明', year: '1368年', icon: '🏛️' }
    ],
    events: [],
    filteredEvents: [],
    loading: true
  },

  onLoad() {
    this.fetchEventsList();
  },

  async fetchEventsList() {
    try {
      this.setData({ loading: true });
      wx.showLoading({ title: '加载剧本中...' });
      
      const res = await util.request('/events_list');
      if (res && res.success) {
        this.setData({ 
          events: res.data,
          filteredEvents: res.data,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载事件列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  onSelectDynasty(e) {
    const dynasty = e.currentTarget.dataset.dynasty;
    const selectedId = dynasty.id;
    
    this.setData({ selectedDynasty: selectedId });
    
    if (selectedId === 'all') {
      this.setData({ filteredEvents: this.data.events });
    } else {
      const filtered = this.data.events.filter(event => event.dynastyId === selectedId);
      this.setData({ filteredEvents: filtered });
    }
  },

  onEventTap(e) {
    const event = e.currentTarget.dataset.event;
    app.globalData.currentEvent = event;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${event.id}`
    });
  }
});
