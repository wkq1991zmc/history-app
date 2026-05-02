const app = getApp();

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
    events: [
      {
        id: '秦朝·焚书坑儒',
        title: '焚书坑儒',
        dynasty: '秦朝',
        dynastyId: '秦',
        year: '前213年',
        desc: '秦始皇焚书坑儒，统一思想，先秦文化遭遇毁灭性打击。',
        image: 'https://s3.bmp.ovh/2026/05/02/1WWWIewB.png',
        isImage: true
      },
      {
        id: '秦朝·大泽乡起义',
        title: '大泽乡起义',
        dynasty: '秦朝',
        dynastyId: '秦',
        year: '前209年',
        desc: '陈胜吴广揭竿而起，王侯将相宁有种乎，第一次农民大起义爆发。',
        image: 'https://s3.bmp.ovh/2026/05/02/ATUNZQN8.png',
        isImage: true
      },
      {
        id: '秦朝·沙丘之变',
        title: '沙丘之变',
        dynasty: '秦朝',
        dynastyId: '秦',
        year: '前210年',
        desc: '赵高李斯合谋篡改遗诏，赐死扶苏蒙恬，大秦帝国由此走向覆灭。',
        image: 'https://s3.bmp.ovh/2026/05/02/FhmUeY27.png',
        isImage: true
      },
      {
        id: '汉朝·巫蛊之祸',
        title: '巫蛊之祸',
        dynasty: '汉朝',
        dynastyId: '汉',
        year: '前91年',
        desc: '江充陷害太子刘据，父子相残，卫子夫自杀，汉武帝晚年最惨烈宫廷悲剧。',
        image: 'https://s3.bmp.ovh/2026/05/02/25Jdw1zU.png',
        isImage: true
      },
      {
        id: '汉朝·长乐宫血案',
        title: '长乐宫血案',
        dynasty: '汉朝',
        dynastyId: '汉',
        year: '前196年',
        desc: '吕后诱杀韩信于长乐宫，千古名将落得兔死狗烹的结局。',
        image: 'https://s3.bmp.ovh/2026/05/02/O2VZcip9.png',
        isImage: true
      },
      {
        id: '三国·衣带诏事件',
        title: '衣带诏事件',
        dynasty: '三国',
        dynastyId: '三国',
        year: '199年',
        desc: '汉献帝密诏董承诛曹，事败灭门，皇权彻底沦为玩物。',
        image: 'https://s3.bmp.ovh/2026/05/02/AljlTL4k.png',
        isImage: true
      },
      {
        id: '三国·白门楼斩吕布',
        title: '白门楼斩吕布',
        dynasty: '三国',
        dynastyId: '三国',
        year: '198年',
        desc: '吕布兵败下邳，刘备一句致命之言，飞将就此陨落。',
        image: 'https://s3.bmp.ovh/2026/05/02/FUuDq4Lk.png',
        isImage: true
      },
      {
        id: '三国·赤壁之战',
        title: '赤壁之战',
        dynasty: '三国',
        dynastyId: '三国',
        year: '208年',
        desc: '孙刘联军以少胜多大破曹军，奠定三国鼎立格局。',
        image: 'https://s3.bmp.ovh/2026/05/02/mSMeN7nU.png',
        isImage: true
      },
      {
        id: '三国·荆州惊变（关羽之死）',
        title: '荆州惊变',
        dynasty: '三国',
        dynastyId: '三国',
        year: '219年',
        desc: '关羽威震华夏后败走麦城，一代武圣就此陨落。',
        image: 'https://s3.bmp.ovh/2026/05/02/O2VZcip9.png',
        isImage: true
      },
      {
        id: '唐朝·安史之乱',
        title: '安史之乱',
        dynasty: '唐朝',
        dynastyId: '唐',
        year: '755年',
        desc: '安禄山起兵叛乱，马嵬坡杨贵妃殒命，大唐由盛转衰。',
        image: 'https://s3.bmp.ovh/2026/05/02/Egh95bJe.png',
        isImage: true
      },
      {
        id: '唐朝·玄武门之变',
        title: '玄武门之变',
        dynasty: '唐朝',
        dynastyId: '唐',
        year: '626年',
        desc: '李世民杀兄逼父，血染长安，开创贞观之治。',
        image: 'https://s3.bmp.ovh/2026/05/02/GotSpOAm.png',
        isImage: true
      },
      {
        id: '五代·陈桥兵变',
        title: '陈桥兵变',
        dynasty: '五代十国',
        dynastyId: '五代十国',
        year: '960年',
        desc: '赵匡胤黄袍加身，兵不血刃篡位，杯酒释兵权开创宋朝。',
        image: 'https://s3.bmp.ovh/2026/05/02/23zixxLe.png',
        isImage: true
      },
      {
        id: '五代·儿皇帝石敬瑭',
        title: '儿皇帝石敬瑭',
        dynasty: '五代十国',
        dynastyId: '五代十国',
        year: '936年',
        desc: '石敬瑭割让燕云十六州给契丹，自称儿皇帝，遗祸四百年。',
        image: 'https://s3.bmp.ovh/2026/05/02/XRfVFBTi.png',
        isImage: true
      },
      {
        id: '五代·后周世宗北伐',
        title: '后周世宗北伐',
        dynasty: '五代十国',
        dynastyId: '五代十国',
        year: '959年',
        desc: '柴荣北伐势如破竹，却因病班师，出师未捷身先死。',
        image: 'https://s3.bmp.ovh/2026/05/02/b0OMZT2v.png',
        isImage: true
      },
      {
        id: '宋朝·澶渊之盟',
        title: '澶渊之盟',
        dynasty: '宋朝',
        dynastyId: '宋',
        year: '1004年',
        desc: '宋辽议和，岁币三十万，百年和平却开创金钱换和平先例。',
        image: 'https://s3.bmp.ovh/2026/05/02/NW1Qac8J.png',
        isImage: true
      },
      {
        id: '宋朝·王安石变法',
        title: '王安石变法',
        dynasty: '宋朝',
        dynastyId: '宋',
        year: '1069年',
        desc: '熙宁新法引发新旧党争，天变不足畏祖宗不足法，改革最终失败。',
        image: 'https://s3.bmp.ovh/2026/05/02/ycv0UM2j.png',
        isImage: true
      },
      {
        id: '宋朝·岳飞之死',
        title: '岳飞之死',
        dynasty: '宋朝',
        dynastyId: '宋',
        year: '1142年',
        desc: '莫须有罪名杀害抗金名将，南宋失去收复中原最后希望。',
        image: 'https://s3.bmp.ovh/2026/05/02/3xR12X2l.png',
        isImage: true
      },
      {
        id: '明朝·土木堡之变',
        title: '土木堡之变',
        dynasty: '明朝',
        dynastyId: '明',
        year: '1449年',
        desc: '明英宗被王振怂亲征，五十万大军覆没，天子被俘。',
        image: 'https://s3.bmp.ovh/2026/05/02/4kG7vN4T.png',
        isImage: true
      },
      {
        id: '明朝·靖难之役',
        title: '靖难之役',
        dynasty: '明朝',
        dynastyId: '明',
        year: '1402年',
        desc: '朱起兵夺位，方孝孺被诛十族，血洗金陵。',
        image: 'https://s3.bmp.ovh/2026/05/02/T7JAULil.png',
        isImage: true
      }
    ],
    filteredEvents: []
  },

  onLoad() {
    this.setData({ filteredEvents: this.data.events });
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
