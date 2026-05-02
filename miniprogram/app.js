// 本地调试模式：替换成你电脑的局域网 IP 地址
// 查看方法：Windows 打开 cmd 输入 ipconfig，找到 IPv4 地址（如 192.168.1.100）
// 注意：手机和电脑必须在同一 WiFi 下才能访问
const API_BASE_URL = 'http://192.168.2.47:8000';

App({
  globalData: {
    apiBaseUrl: API_BASE_URL,
    currentEvent: null,
    chatHistory: []
  },

  onLaunch() {
    console.log('跨时空听证会小程序启动');
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
  },

  onShow(options) {
    console.log('小程序显示', options);
  },

  onHide() {
    console.log('小程序隐藏');
  },

  onError(error) {
    console.error('小程序发生错误', error);
    wx.showToast({
      title: '发生错误，请重启',
      icon: 'error'
    });
  }
});
