Page({
    data: {
      selectedTab: 'reviewed',
      reviewed: [], // 已点评的数据
      unreviewed: [] // 未点评的数据
    },
  
    onLoad: function () {
      // 这里可以调用接口获取数据
      this.setData({
        reviewed: [
        ],
        unreviewed: [
        ]
      });
    },
  
    switchTab: function (e) {
      const tab = e.currentTarget.dataset.tab;
      this.setData({
        selectedTab: tab
      });
    }
  });