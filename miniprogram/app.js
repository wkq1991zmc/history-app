// 本地调试模式：替换成你电脑的局域网 IP 地址
// 查看方法：Windows 打开 cmd 输入 ipconfig，找到 IPv4 地址（如 192.168.1.100）
// 注意：手机和电脑必须在同一 WiFi 下才能访问
const API_BASE_URL = 'https://history-app-a766.onrender.com';

App({
  globalData: {
    apiBaseUrl: API_BASE_URL,
    currentEvent: null,
    chatHistory: [],
    openId: null // 新增：用来存当前玩家的微信数字身份证
  },

  onLaunch() {
    console.log('跨时空听证会小程序启动');
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 👇🌟 核心升级：静默登录换取全局防串台 OpenID 🌟👇
    this.loginAndGetOpenId();
  },

  loginAndGetOpenId() {
    // 1. 先看缓存里有没有，有就不去麻烦腾讯了
    const cachedOpenId = wx.getStorageSync('userOpenId');
    if (cachedOpenId) {
      this.globalData.openId = cachedOpenId;
      console.log('已从缓存加载历史身份: ', cachedOpenId);
      return;
    }

    // 2. 没有的话，悄悄向微信要个 code，去自己服务器换
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: `${this.globalData.apiBaseUrl}/login`,
            method: 'POST',
            data: { code: res.code },
            success: (serverRes) => {
              if (serverRes.data && serverRes.data.success) {
                const openId = serverRes.data.openid;
                this.globalData.openId = openId;
                wx.setStorageSync('userOpenId', openId); // 存入本地保险箱
                console.log('🏅 成功置换跨时空身份卡: ', openId);
              }
            },
            fail: (err) => {
              console.error('身份置换服务器通信失败', err);
            }
          });
        }
      }
    });
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
