Page({
  data: {
      ratingList: [
          { rank: 3 },
          { rank: 1, url: "/images/renwu.png" },
          { rank: 2 },
      ],
      articleList: [],
      ip: '',
      processedData: [],
      isDataLoaded: false
  },

  onLoad() {
      const that = this;
      const app = getApp();
      that.setData({ ip: app.globalData.ip });
      const ip = app.globalData.ip;
      wx.request({
          url: `${ip}/api/articles`,
          success: (res) => {
              const modifiedData = res.data.map(draft => {
                  const newDraft = { ...draft };
                  newDraft.image_url = `${ip}/api/articles/${newDraft.article_id}/image`;
                  return newDraft;
              });
              const processedData = modifiedData.map(item => ({
                  ...item,
                  content10: item.content.slice(0, 10) + (item.content.length > 10 ? '...' : ''),
                  images: item.new_image_path
                      ? item.new_image_path.split(',').map((_, index) =>
                          `${ip}/api/articles/${item.article_id}/images?index=${index}`)
                      : []
              }));
              const articleList = processedData.map(item => ({
                  article_id: item.article_id,
                  created_at: item.created_at,
                  image: item.image_url,
                  location: item.location,
                  title: item.title,
                  content10: item.content10,
                  user_id: item.user_id,
                  content: item.content
              }));
              that.setData({ articleList, processedData, isDataLoaded: true });
              wx.setStorageSync('processedData', processedData);
          },
          fail: (err) => {
              console.error('获取文章列表失败: ', err);
              wx.showToast({
                  title: '数据加载失败，请稍后重试',
                  icon: 'none'
              });
          }
      });
  },

  onPullDownRefresh() {
      const that = this;
      const { ip } = that.data;
      wx.request({
          url: `${ip}/api/articles`,
          success: (res) => {
              const modifiedData = res.data.map(draft => ({
                  ...draft,
                  image_url: `${ip}/api/articles/${draft.article_id}/image`
              }));
              const processedData = modifiedData.map(item => ({
                  ...item,
                  content10: item.content.slice(0, 10) + (item.content.length > 10 ? '...' : ''),
                  images: item.new_image_path
                      ? item.new_image_path.split(',').map((_, index) =>
                          `${ip}/api/articles/${item.article_id}/images?index=${index}`)
                      : []
              }));
              const articleList = processedData.map(item => ({
                  created_at: item.created_at,
                  article_id: item.article_id,
                  image: item.image_url,
                  images: item.images,
                  location: item.location,
                  title: item.title,
                  content10: item.content10,
                  user_id: item.user_id,
                  content: item.content
              }));
              that.setData({ articleList, processedData, isDataLoaded: true });
              wx.setStorageSync('processedData', processedData);
              wx.stopPullDownRefresh();
              console.log(articleList);
          },
          fail: (err) => {
              console.error('获取文章列表失败: ', err);
              wx.showToast({
                  title: '数据加载失败，请稍后重试',
                  icon: 'none'
              });
          }
      });
  },

  navigateToDetail(e) {
      const { isDataLoaded, articleList } = this.data;
      if (!isDataLoaded) {
          wx.showToast({
              title: '数据正在加载，请稍后再试',
              icon: 'none'
          });
          return;
      }
      if (articleList.length === 0) {
          wx.showToast({
              title: '数据加载失败，请重试',
              icon: 'none'
          });
          return;
      }
      const currentArticleId = e.currentTarget.dataset.item.article_id;
      console.log(articleList);
      wx.setStorageSync('allArticles', articleList);
      wx.navigateTo({
          url: `/pages/article_detailed/index?articleId=${currentArticleId}`
      });
  }
});