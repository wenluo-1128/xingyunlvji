Page({
  data: {
    isLogin: true, // 当前显示登录表单还是注册表单
    tempAvatarPath: '/images/110.jpg', // 默认头像路径
    avatarUrl: '/images/110.jpg', // 显示的头像路径
    name: '', // 注册表单中的姓名
    regUsername: '', // 注册表单中的手机号
    regPassword: '', // 注册表单中的密码
    confirmPwd: '', // 确认密码
    ip: '' // 后端服务地址
  },

  // 页面加载时初始化后端 IP 地址
  onLoad() {
    const app = getApp();
    this.setData({
      ip: app.globalData.ip
    });
  },

  // 选择头像（仅预览，不立即上传）
  uploadAvatar() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        // 更新临时路径和显示的头像
        this.setData({
          tempAvatarPath: res.tempFilePaths[0], // 保存临时路径
          avatarUrl: res.tempFilePaths[0] // 更新页面显示
        });
      }
    });
  },

  // 输入框内容绑定
  onInput(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ [type]: e.detail.value });
  },

  // 处理注册逻辑
  handleRegister() {
    const { ip, tempAvatarPath, name, regUsername, regPassword, confirmPwd } = this.data;

    // 表单验证
    if (!name) return wx.showToast({ title: '请输入姓名', icon: 'none' });
    if (!regUsername) return wx.showToast({ title: '请输入手机号', icon: 'none' });
    if (!regPassword) return wx.showToast({ title: '请输入密码', icon: 'none' });
    if (regPassword !== confirmPwd) return wx.showToast({ title: '两次密码不一致', icon: 'none' });

    // 如果用户未选择新头像，直接使用默认头像
    if (tempAvatarPath === '/images/110.jpg') {
      this.submitRegistration('/images/110.jpg');
      return;
    }

    // 上传头像到后端
    wx.showLoading({ title: '上传中' });
    wx.uploadFile({
      url: `${ip}/upload`,
      filePath: tempAvatarPath,
      name: 'file',
      formData: { path: '/user/avatar' },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          const avatarUrl = data.path;
          this.submitRegistration(avatarUrl);
        } catch (err) {
          wx.showToast({ title: '头像解析失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading(); 
      }
    });
  },

  // 提交注册信息到后端
  submitRegistration(avatarUrl) {
    const { ip, regUsername, regPassword, name } = this.data;
    wx.request({
      url: `${ip}/api/register`,
      method: 'POST',
      data: {
        username: regUsername,
        password: regPassword,
        name,
        avatarUrl // 使用最终确定的头像路径
      },
      success: (res) => {
        if (res.data.id) {
          wx.showToast({ title: '注册成功' });
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/index' // 强制跳转到登录页
            });
          }, 1500);
        }
      },
      fail: () => wx.showToast({ title: '注册失败', icon: 'none' })
    });
  },

  // 切换登录/注册表单
  toggleForm() {
    this.setData({
      isLogin: !this.data.isLogin,
      avatarUrl: '/images/110.jpg', // 切换时重置头像
      tempAvatarPath: '/images/110.jpg' // 重置临时路径
    });
  },

  handleLogin() {
    const { ip } = this.data;
    const { username, password } = this.data;
    if (!username) return wx.showToast({ title: '请输入手机号', icon: 'none' });
    if (!password) return wx.showToast({ title: '请输入密码', icon: 'none' });
  
    wx.request({
      url: `${ip}/api/login`,
      method: 'POST',
      data: { username, password },
      success: (res) => {
        if (res.statusCode === 200) {
          // 登录成功处理
          const user = res.data;
          wx.setStorageSync('userInfo', user); // 存储用户信息
          console.log(user);
          wx.reLaunch({ url: '/pages/user-center/index' }); // 跳转到主页
        } else if (res.statusCode === 401) {
          // 登录失败提示
          wx.showToast({ title: res.data.error, icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络连接失败', icon: 'none' });
      }
    });
  }
});