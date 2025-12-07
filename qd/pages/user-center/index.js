Page({
  data: {
    currentTab: 'travel',
    tabs: ['全部', '待付款', '已付款'],
    currentTabIndex: 0,
    orders: [],
    userInfo: {},
    ip:'',
    userInfo: {}
  },

  onLoad() {
    const app = getApp();
    this.setData({
      ip: app.globalData.ip
    });

    // 读取缓存中的激活tab
    const savedTab = wx.getStorageSync('currentTab');
    if (savedTab) {
      this.setData({ currentTab: savedTab });
    }
    
    // 检查登录状态
    this.checkLogin();
  },

  // 检查登录状态并获取用户信息
  checkLogin() {
    const { ip } = this.data;
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo?.id) {
      // 构造完整的头像请求路径
      userInfo.avatar = `${ip}/user/image?userId=${userInfo.id}`;
      this.setData({ userInfo });
    }
  },

  // 头像/用户名点击跳转登录
  navigateToLogin() {
    if (!this.data.userInfo.id) {
      wx.navigateTo({ url: '/pages/login/index' });
    }
  },

  // 功能导航切换
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentTab: type });
    wx.setStorageSync('currentTab', type);
  },

  // 订单标签切换
  switchTab1(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTabIndex: index });
  },

  // 跳转文章页面
  article() {
    wx.navigateTo({ url: '/pages/article/index' });
  }
})