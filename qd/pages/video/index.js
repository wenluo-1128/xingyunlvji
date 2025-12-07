Page({
  data: {
    name: '请返回登录界面登录', // 默认值
    avatarUrl: '/images/110.jpg', // 默认头像
    ip:''
  },

  onLoad() {
    const app = getApp();
    const userInfo = wx.getStorageSync('userInfo');
    const ip = app.globalData.ip;
    this.setData({
      ip: app.globalData.ip
    });

    if (userInfo && userInfo.id && ip) {
      const processedAvatarUrl = `${ip}/user/image?userId=${userInfo.id}`;
      this.setData({
        name: userInfo.name || '用户',
        avatarUrl: processedAvatarUrl
      });
    } else if (userInfo && userInfo.name) {
      // 如果只有名字，更新名字
      this.setData({
        name: userInfo.name
      });
    }
  },

  saveDraft() {
    // 显示提示信息
    wx.showToast({
      title: '已存入草稿',
      icon: 'success',
      duration: 2000
    });
    console.log('点击了存草稿');
  },

  publishVideo() {
    // 调用微信API选择视频
    wx.chooseMedia({
      count: 1, // 最多选择1个文件
      mediaType: ['video'], // 只能选择视频
      sourceType: ['album', 'camera'], // 可以从相册选择或使用相机拍摄
      maxDuration: 60, // 视频最长拍摄时间，单位秒
      camera: 'back', // 默认使用后置摄像头
      success(res) {
        console.log('选择视频成功', res.tempFiles);
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 在这里可以添加上传视频到服务器的逻辑
        // wx.uploadFile({...})
      },
      fail(err) {
        console.error('选择视频失败', err);
        wx.showToast({
          title: '选择视频失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
    console.log('点击了发表我的视频');
  }
});