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
    // 优先尝试从本地缓存加载数据，达到“秒开”体验
    const cachedEvents = wx.getStorageSync('eventsListCache');
    if (cachedEvents) {
      this.setData({
        events: cachedEvents,
        filteredEvents: cachedEvents,
        loading: false
      });
      // 后台静默刷新，不打扰用户
      this.fetchEventsList(true);
    } else {
      this.fetchEventsList(false);
    }
  },

  async fetchEventsList(silent = false) {
    try {
      if (!silent) {
        this.setData({ loading: true });
        wx.showLoading({ title: '加载剧本中...' });
      }
      
      const res = await util.request('/events_list');
      if (res && res.success) {
        this.setData({ 
          events: res.data,
          // 如果用户已经选了朝代，不要覆盖，按照当前选的朝代重算一遍
          filteredEvents: this.data.selectedDynasty === 'all' 
            ? res.data 
            : res.data.filter(event => event.dynastyId === this.data.selectedDynasty),
          loading: false
        });
        // 将成功获取的列表持久化缓存
        wx.setStorageSync('eventsListCache', res.data);
      }
    } catch (error) {
      console.error('加载事件列表失败:', error);
      if (!silent) {
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }
    } finally {
      if (!silent) {
        wx.hideLoading();
      }
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
