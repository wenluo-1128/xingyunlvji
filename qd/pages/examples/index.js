Page({
    data: {
      currentTab: 'publish', // 默认选中“发表”
      title: '', // 标题输入框的值
      content: '', // 正文输入框的值
      images: [], // 存储上传的图片路径数组
      multiArray: [[], []], // 动态加载的二维数组
      multiIndex: [0, 0], // 当前选中的索引（省份索引, 城市索引）
      selectedDestination: '', // 选中的目的地
      provincesData: [], // 存储省份对象
      drafts: [], // 草稿数据数组
      ip:'',
      user_id: ''
    },
  
    onLoad() {
      const app = getApp();
      this.setData({
        ip: app.globalData.ip
      });
      const userInfo = wx.getStorageSync('userInfo');
      const id = userInfo.id
      console.log(id);
      this.setData({
        user_id: id
      });
      // 初始化加载省份数据
      this.loadProvinces();
      // 加载草稿数据
      this.fetchDraftData();
    },
  
    // 加载省份数据
    loadProvinces() {
      const { ip } = this.data;
      wx.request({
        url: `${ip}/api/provinces`,
        success: (res) => {
          const provinces = res.data;
          if (provinces.length) {
            this.loadCities(0, provinces[0].province_id);
          }
          this.setData({
            'multiArray[0]': provinces.map((p) => p.province_name),
            provincesData: provinces, // 存储省份对象
          });
        },
        fail: (err) => {
          console.error('Failed to load provinces:', err);
        },
      });
    },
  
    // 加载指定省份的城市数据
    loadCities(columnIndex, provinceId) {
      const { ip } = this.data;
      wx.request({
        url: `${ip}/api/provinces/${provinceId}/cities`,
        success: (res) => {
          const cities = res.data.map((c) => c.city_name); // 城市名称不带“市”
          const newMultiArray = this.data.multiArray;
          newMultiArray[1] = cities;
  
          this.setData({
            multiArray: newMultiArray,
            multiIndex: [columnIndex, 0], // 重置城市选择
          });
        },
        fail: (err) => {
          console.error('Failed to load cities:', err);
        },
      });
    },
  
    // 列变化时更新城市列表
    bindMultiPickerColumnChange(e) {
      if (e.detail.column === 0) {
        const provinceIndex = e.detail.value;
        const provincesData = this.data.provincesData || [];
        const selectedProvince = provincesData[provinceIndex];
        const provinceId = selectedProvince ? selectedProvince.province_id : null;
        if (provinceId !== null) {
          this.loadCities(provinceIndex, provinceId);
        } else {
          console.error('Province ID is undefined:', selectedProvince);
        }
      }
    },
  
    // 选择完成后更新显示
    bindMultiPickerChange(e) {
      const val = e.detail.value;
      const selectedProvince = this.data.multiArray[0][val[0]];
      const selectedCity = this.data.multiArray[1][val[1]];
      this.setData({
        selectedDestination: `${selectedProvince}-${selectedCity}`,
      });
    },
  
    // 图片上传逻辑
    uploadImage() {
      const that = this;
      wx.chooseImage({
        count: 9, // 最多选择9张图片
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          const newImages = that.data.images.concat(res.tempFilePaths);
          that.setData({ images: newImages });
        },
      });
    },
  
    // 图片预览（可选）
    previewImage(e) {
      const index = e.currentTarget.dataset.index;
      const imagePaths = this.data.images; // 获取图片路径数组
      if (!imagePaths[index]) {
        console.error('Invalid image path at index:', index);
        return;
      }
      wx.previewImage({
        current: imagePaths[index],
        urls: imagePaths,
      });
    },
  
    // 删除图片逻辑
    deleteImage(e) {
      const index = e.currentTarget.dataset.index;
      const newImages = this.data.images.filter((_, i) => i !== index);
      this.setData({ images: newImages });
    },
  
    // 切换标签页
    handleTabClick(e) {
      const { type } = e.currentTarget.dataset;
      this.setData({ currentTab: type });
    },
  
    // 标题输入框的输入事件
    onTitleInput(e) {
      this.setData({ title: e.detail.value }); // 更新标题值
    },
  
    // 正文输入框的输入事件
    onContentInput(e) {
      this.setData({ content: e.detail.value }); // 更新正文值
    },
  
    // 加载草稿数据
    fetchDraftData() {
      const { user_id } =this.data;
      const { ip } = this.data;
      console.log(user_id);
      wx.request({
        url: `${ip}/api/drafts/0/${user_id}`,
        success: (res) => {
            const modifiedData = res.data.map(draft => {
                const newDraft = { ...draft };
                const draftId = newDraft.draft_id;
                // 修改图片路径
                newDraft.image_url = `${ip}/api/drafts/cities/${draftId}/image`;
                return newDraft;
              });
            this.setData({ drafts: modifiedData });
        },
        fail: (err) => {
          console.error('Failed to fetch draft data:', err);
        },
      });
    },
  
    // 保存草稿
    saveDraft() {
      const { user_id } = this.data;
      const { ip } = this.data;
      const city = this.data.selectedDestination.split('-')[1]; // 提取城市名
      const imageUrl = `/images/${city}.png`; // 原有 image_url 逻辑保持不变
  
      // 上传图片到服务器并获取 new_image_path
      const uploadPromises = this.data.images.map((tempPath) => {
        return new Promise((resolve, reject) => {
          wx.uploadFile({
            url: `${ip}/upload`, // 后端上传接口
            filePath: tempPath,
            name: 'file',
            formData: { path: '/drafts/' }, // 草稿路径前缀
            success: (res) => {
              const { path } = JSON.parse(res.data);
              resolve(path);
            },
            fail: reject,
          });
        });
      });
  
      // 等待所有图片上传完成
      Promise.all(uploadPromises)
        .then((newImagePaths) => {
          const draftData = {
            user_id: user_id,
            image_url: imageUrl, // 原有字段
            new_image_path: newImagePaths.join(','), // 新增字段，存储多个路径
            title: this.data.title,
            city: city,
            content: this.data.content,
          };
  
          // 提交到后端
          wx.request({
            url: `${ip}/api/drafts`,
            method: 'POST',
            data: draftData,
            success: () => {
              wx.showToast({ title: '已存入草稿箱', icon: 'none' });
              this.fetchDraftData(); // 刷新草稿列表
            },
            fail: (err) => {
              console.error('保存草稿失败:', err);
              wx.showToast({ title: '保存失败', icon: 'none' });
            },
          });
        })
        .catch((err) => {
          console.error('图片上传失败:', err);
          wx.showToast({ title: '保存失败', icon: 'none' });
        });
    },

    // 删除草稿
    deleteDraft(e) {
      const { ip } = this.data;
      const draftId = e.currentTarget.dataset.draftid;
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个草稿吗？',
        success: (res) => {
          if (res.confirm) {
            wx.request({
              url: `${ip}/api/drafts/${draftId}`,
              method: 'DELETE',
              success: () => {
                this.fetchDraftData(); // 删除成功后重新加载草稿数据
                wx.showToast({ title: '删除成功', icon: 'none' });
              },
              fail: (err) => {
                console.error(err);
                wx.showToast({ title: '删除失败', icon: 'none' });
              },
            });
          }
        },
      });
    },
    
    // 发表文章
    publishPost() {
      const { user_id } = this.data;
      const { ip } = this.data;
      const { selectedDestination, title, content, draftImagePaths, images } = this.data;
  
      // 表单验证
      if (!selectedDestination || !title.trim() || !content.trim()) {
        wx.showToast({ title: '请输入完整内容', icon: 'none', duration: 2000 });
        return;
      }
  
      // 如果是草稿编辑，直接提交草稿图片路径
      if (draftImagePaths) {
        wx.request({
          url: `${ip}/api/articles`,
          method: 'POST',
          data: {
            user_id: user_id,
            image_url: `/images/${selectedDestination.split('-')[1]}.png`, // 原有字段
            new_image_path: draftImagePaths, // 草稿图片路径
            title,
            city: selectedDestination.split('-')[1],
            content,
          },
          success: () => {
            wx.showToast({ title: '已发表', icon: 'none' });
            this.setData({
              title: '',
              content: '',
              images: [],
              draftImagePaths: null, // 清空草稿图片路径
            });
          },
          fail: (err) => {
            console.error('发表失败:', err);
            wx.showToast({ title: '发表失败', icon: 'none' });
          },
        });
      } else {
        // 非草稿场景：上传图片并提交新路径
        const uploadPromises = images.map((tempPath) => {
          return new Promise((resolve, reject) => {
            wx.uploadFile({
              url: `${ip}/upload`, // 后端上传接口
              filePath: tempPath,
              name: 'file',
              formData: { path: '/article/' }, // 文章路径前缀
              success: (res) => {
                const { path } = JSON.parse(res.data);
                resolve(path);
              },
              fail: reject,
            });
          });
        });
  
        // 等待所有图片上传完成
        Promise.all(uploadPromises)
          .then((newImagePaths) => {
            const articleData = {
              image_url: `/images/${selectedDestination.split('-')[1]}.png`, // 原有字段
              new_image_path: newImagePaths.join(','), // 新图片路径
              title,
              city: selectedDestination.split('-')[1],
              content,
            };
  
            // 提交到后端
            wx.request({
              url: `${ip}/api/articles`,
              method: 'POST',
              data: articleData,
              success: () => {
                wx.showToast({ title: '已发表', icon: 'none' });
                this.setData({
                  title: '',
                  content: '',
                  images: [],
                });
              },
              fail: (err) => {
                console.error('发表失败:', err);
                wx.showToast({ title: '发表失败', icon: 'none' });
              },
            });
          })
          .catch((err) => {
            console.error('图片上传失败:', err);
            wx.showToast({ title: '发表失败', icon: 'none' });
          });
      }
    },
    
    // 编辑草稿功能
  editDraft(e) {
    const { ip } = this.data;
    const draft = e.currentTarget.dataset.draft;
    const { title, city, content, new_image_path, draft_id } = draft;

    // 保存草稿图片的文件系统路径
    this.setData({
      currentTab: 'publish', // 切换到发表标签
      title,
      content,
      draftImagePaths: new_image_path, // 保存草稿图片路径
    });

    // 生成图片 URL 数组（指向后端接口）
    const imageCount = new_image_path ? new_image_path.split(',').length : 0;
    const images = Array.from({ length: imageCount }, (_, index) =>
      `${ip}/api/drafts/${draft_id}/image?index=${index}`
    );

    // 更新图片预览区域
    this.setData({
      images,
    });

    // 处理城市选择器逻辑
    this.loadProvincesForCity(city);
  },  

  // 根据城市名加载对应省份
    async loadProvincesForCity(cityName) {
    const { ip } = this.data;
    try {
      // 1. 获取所有省份
      const provincesRes = await new Promise((resolve, reject) => {
        wx.request({
          url: `${ip}/api/provinces`,
          success: resolve,
          fail: reject,
        });
      });
      const provinces = provincesRes.data;

      // 2. 查找包含该城市的省份
      for (const province of provinces) {
        const citiesRes = await new Promise((resolve, reject) => {
          wx.request({
            url: `${ip}/api/provinces/${province.province_id}/cities`,
            success: resolve,
            fail: reject,
          });
        });
        const cities = citiesRes.data.map((c) => c.city_name);

        if (cities.includes(cityName)) {
          // 3. 更新选择器的显示状态
          const multiArray = [provinces.map((p) => p.province_name), cities];
          const multiIndex = [
            provinces.findIndex((p) => p.province_name === province.province_name),
            cities.indexOf(cityName),
          ];

          this.setData({
            multiArray,
            multiIndex,
            selectedDestination: `${province.province_name}-${cityName}`,
          });
          break;
        }
      }
    } catch (error) {
      console.error('城市匹配失败:', error);
    }
  },
  });