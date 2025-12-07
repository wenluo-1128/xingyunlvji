Page({
    data: {
        evaluationOptions: ['服务态度好', '热情', '专业', '其他'],
        satisfactionOptions: ['交通出行', '线路设计', '美食推荐', '更多'],
        selectedOptions: [
            [],
            []
        ],
        starIndex: 0,
        comment: ''
    },
    selectOption(e) {
        const group = parseInt(e.currentTarget.dataset.group);
        const option = e.currentTarget.dataset.option;
        const { selectedOptions } = this.data;
        const newSelectedOptions = [...selectedOptions];
        const index = newSelectedOptions[group].indexOf(option);

        if (index === -1) {
            newSelectedOptions[group] = [...newSelectedOptions[group], option];
        } else {
            newSelectedOptions[group] = newSelectedOptions[group].filter((item) => item!== option);
        }

        this.setData({
            selectedOptions: newSelectedOptions
        }, () => {
            console.log('当前选中的选项:', this.data.selectedOptions);
        });
    },
    selectStar(e) {
        const index = parseInt(e.currentTarget.dataset.index);
        this.setData({
            starIndex: index
        });
    },
    inputComment(e) {
        this.setData({
            comment: e.detail.value
        });
    },
    publishPost() {
      // 重置所有数据为初始状态
      this.setData({
        selectedOptions: [[], []], // 清空两个分组的选中项
        starIndex: 0, // 评分重置为0星
        comment: '' // 清空评论内容
      });
      // 可选：添加提交成功提示（如wx.showToast）
      wx.showToast({ title: '提交成功', icon: 'success' });
    }
})    