Page({
    data: {
      currentTab: 'home',
      activeCategory: 0,
      guessCities: [],
      categories: [], // 从后端获取的分类数据
      currentCities: [], // 当前选中分类的城市列表
      showSearchResult: false,
      searchKeyword: '',
      searchResult: [],
      ip:'',
      ai:'',
    },
  
    onLoad() {
      const app = getApp();
      this.setData({
        ip: app.globalData.ip
      });
      // 加载分类和城市数据
      this.fetchCategories();
      // 加载猜你喜欢的城市
      this.fetchGuessCities();
      this.ai_image();
    },

    ai_image(){
      const { ip } = this.data;
      this.setData({
        ai:ip+'/api/index/ai/image'
      })
    },

    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      this.setData({ currentTab: tab });
    },
  
    // 获取分类及对应的城市列表
    async fetchCategories() {
      try {
        // 1. 先获取所有分类
        const categories = await this.request('/api/categories', 'GET');
        // 2. 为每个分类获取城市列表，并改写 image_url 为新端点
        const categoriesWithCities = await Promise.all(
          categories.map(async (category) => {
            const cities = await this.request(`/api/categories/${category.category_id}/cities`, 'GET');
            return {
              ...category,
              cities: cities.map((city) => ({
                ...city,
                image_url: this.getCityImageUrl(city.city_id)
              }))
            };
          })
        );
        // 3. 更新数据并初始化第一个分类的城市
        this.setData({
          categories: categoriesWithCities,
          currentCities: categoriesWithCities[0]?.cities || []
        });
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    },
  
    // 获取猜你喜欢的城市
    async fetchGuessCities() {
      const guessCities = await this.request('/api/guess-cities', 'GET');
      this.setData({ guessCities });
    },
  
    // 搜索功能
    handleSearch() {
      const keyword = this.data.searchKeyword.trim();
      if (!keyword) return;
      this.request('/api/search', 'POST', { keyword })
        .then((result) => {
          this.setData({
            showSearchResult: true,
            searchResult: result.map((city) => ({
              name: city.name,
              city_id: city.city_id,
              image_url: this.getCityImageUrl(city.city_id)
            }))
          });
        })
        .catch((error) => console.error('Search failed:', error));
    },
  
    // 封装请求方法
    request(url, method, data = {}) {
      const { ip } = this.data;
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${ip}${url}`, // 确保端口与后端一致（3002）
          method,
          data,
          header: {
            'Content-Type': 'application/json' // 设置请求头
          },
          success: (res) => resolve(res.data),
          fail: (err) => reject(err)
        });
      });
    },
  
    // 切换分类
    switchCategory(e) {
      const index = e.currentTarget.dataset.index;
      const selectedCategory = this.data.categories[index];
      this.setData({
        activeCategory: index,
        currentCities: selectedCategory.cities
      });
    },
  
    // 隐藏搜索结果
    hideSearchResult() {
      this.setData({
        showSearchResult: false,
        searchKeyword: ''
      });
    },
  
    // 输入框变化事件
    bindSearchInput(e) {
      this.setData({ searchKeyword: e.detail.value });
    },
  
    // 猜你喜欢点击事件
    handleGuessTap(e) {
      const city = e.currentTarget.dataset.city;
      this.setData({ searchKeyword: city }, () => this.handleSearch());
    },
  
    // 图片加载失败处理
    handleImageError(e) {
      console.warn(`Image load failed for city: ${e.currentTarget.dataset.city}`);
      // 设置默认图片
      this.setData({
        [`searchResult[${e.currentTarget.dataset.index}].image_url`]: '/images/default.png'
      });
    },
  
    // 获取城市图片 URL 的公共方法
    getCityImageUrl(cityId) {
      const { ip } = this.data;
      return `${ip}/api/categories/${cityId}/cities/image`;
    },
  
    // 跳转到 AI 助手页面
    ai() {
      wx.redirectTo({
        url: '/pages/ai/index'
      });
    },
  
    // 城市卡片点击事件
    handleCityCardTap(e) {
      const cityId = e.currentTarget.dataset.city; // 获取 city_id
      wx.navigateTo({
        url: `/pages/index_cities/index?cityId=${encodeURIComponent(cityId)}`
      });
    }
  });