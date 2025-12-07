Page({
    data: { 
        currentTab: 'short' 
    },

    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      this.setData({ currentTab: tab });
    },

    assess() {
        wx.redirectTo({
          url: '/pages/quiz-entry-assess-specific/index'
        });
      },
  })