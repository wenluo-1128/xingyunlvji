Page({
    data: {
      currentTab: '地点', // 默认选中地点
      Content: {
        id: null,
        backgroundImage: '', 
        imageSrc: '', 
        title: '', 
        description: ''
      },
      scenicList: [], // 热门景点列表
      ip:''
    },

    onLoad(options) {
        const app = getApp();
        const ip = app.globalData.ip;
        if (options.cityId) {
          const cityId = decodeURIComponent(options.cityId);
          this.setData({ cityId });
          console.log('接收到的 city_id: ', cityId);
          wx.request({
            url: `${ip}/api/index_cit`,
            method: 'GET',
            data: { cityId },
            success: (res) => {
              if (res.statusCode === 200) {
                const { content, scenicList } = res.data;
                const formattedScenicList = scenicList.map(item => ({
                  ...item,
                  image_url: `${ip}/api/index_cit/${item.id}/image_url`
                }));
                const formattedContent = {
                  ...content,
                  backgroundImage: `${ip}/api/index_cit/${content.id}/backgroundImage`,
                  imageSrc: `${ip}/api/index_cit/${content.id}/imageSrc`
                };
                this.setData({
                  Content: formattedContent,
                  scenicList: formattedScenicList
                });
              }
            }
          })
        }
      },

        // 导航切换事件处理
      switchTab(e) {
        const tab = e.currentTarget.dataset.tab;
        this.setData({ currentTab: tab });
      },
  });