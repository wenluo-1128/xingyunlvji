Page({
  data: {
    article: {}, // 当前文章数据
    allArticles: [], // 完整文章列表
    ip:'',
    name:''
  },

  onLoad(options) {
    const app = getApp();
    this.setData({ ip: app.globalData.ip });

    try {
      // 1. 获取传递的 articleId 参数
      const articleId = parseInt(options.articleId);
      console.log(articleId)

      if (!articleId) {
        wx.showToast({ title: '参数错误', icon: 'none' });
        console.log(1);
        wx.navigateBack();
        return;
      }

      // 2. 从本地缓存获取完整文章列表
      const allArticles = wx.getStorageSync('processedData') || [];
      console.log(allArticles)

      if (!Array.isArray(allArticles) || allArticles.length === 0) {
        wx.showToast({ title: '数据加载失败，请重试', icon: 'none' });
        console.log(2);
        return;
      }

      // 3. 查找当前文章
      const currentArticle = allArticles.find(
        item => item.article_id === articleId
      );

      if (!currentArticle) {
        wx.showToast({ title: '文章不存在', icon: 'none' });
        console.log(3);
        wx.navigateBack();
        return;
      }

      const formattedTime = this.formatDate(currentArticle.created_at);

      this.setData({
        article: { ...currentArticle, formattedTime }, // 当前文章数据
        allArticles: allArticles // 保存完整文章列表供后续使用
      });
    } catch (e) {
      console.error('文章详情页加载失败:', e);
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      console.log(4);
      wx.navigateBack();
    }

    this.name()

    this.as()
  },

  name() {
    const { ip } = this.data;
    const { article } = this.data;
    const id = article.user_id;
    console.log(id);
    wx.request({
        url: `${ip}/api/articles/name/${id}`,
        method: 'POST',
        success: (res) => {
            this.setData({
                name: res.data
            });
            console.log('请求成功，name 已赋值为', res.data);
        },
        fail: (err) => {
            console.error('请求失败', err);
        },
        complete: () => {
            console.log('请求完成');
        }
    });
  },

  // 时间格式化函数（YYYY年MM月DD日 HH:mm）
  formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}年` +
           `${pad(date.getMonth() + 1)}月` +
           `${pad(date.getDate())}日 ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  },

  as(){
    const allArticles = this.data
    console.log(allArticles)
  }
});