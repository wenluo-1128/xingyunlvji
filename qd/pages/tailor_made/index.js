Page({
    data: {
      multiArray: [[], []],  // 动态加载的二维数组
      multiIndex: [0, 0],
      selectedDestination: '',
      provincesData: [],  // 存储省份对象
      contactTime: '',
      contactTimes: '',
      minBudget: '',
      maxBudget: '',
      adults: '',
      children: '',
      isPersonalSelected: true,
      isEnterpriseSelected: false,
      ip:''
    },
  
    onLoad() {
      const app = getApp();
      this.setData({
        ip: app.globalData.ip
      });
      const ip = app.globalData.ip;
      // 初始化加载省份数据
      wx.request({
        url: `${ip}/api/provinces`,
        success: (res) => {
          const provinces = res.data;
          if (provinces.length) {
            this.loadCities(0, provinces[0].province_id);
          }
          this.setData({
            'multiArray[0]': provinces.map(p => p.province_name),
            provincesData: provinces  // 存储省份对象
          });
        },
        fail: (err) => {
          console.error('Failed to load provinces: ', err);
        }
      });
    },
  
    // 加载指定省份的城市数据
    loadCities(columnIndex, provinceId) {
      const { ip } = this.data;
      wx.request({
        url: `${ip}/api/provinces/${provinceId}/cities`,
        success: (res) => {
          const cities = res.data.map(c => c.city_name);  // 城市名称不带“市”
          const newMultiArray = this.data.multiArray;
          newMultiArray[1] = cities;
  
          this.setData({
            multiArray: newMultiArray,
            multiIndex: [columnIndex, 0]
          });
        },
        fail: (err) => {
          console.error('Failed to load cities: ', err);
        }
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
          console.error('Province ID is undefined: ', selectedProvince);
        }
      }
    },
  
    // 选择完成后更新显示
    bindMultiPickerChange(e) {
      const val = e.detail.value;
      const selectedProvince = this.data.multiArray[0][val[0]];
      const selectedCity = this.data.multiArray[1][val[1]];
      this.setData({
        selectedDestination: `${selectedProvince}-${selectedCity}`
      });
    },
  
    selectTime(e) {
      this.setData({ contactTime: e.detail.value });
    },
  
    selectTimes(e) {
      this.setData({ contactTimes: e.detail.value });
    },
  
    togglePersonal() {
      this.setData({
        isPersonalSelected: true,
        isEnterpriseSelected: false
      });
    },
  
    toggleEnterprise() {
      this.setData({
        isPersonalSelected: false,
        isEnterpriseSelected: true
      });
    },
  
    // 表单验证
    validateForm() {
      const { 
        selectedDestination,
        contactTime,
        contactTimes,
        minBudget,
        maxBudget,
        adults,
        children 
      } = this.data;
  
      if (!selectedDestination) return '请选择目的地';
      if (!contactTime) return '请选择出发日期';
      if (!contactTimes) return '请选择返回日期';
      
      // 预算验证（至少填写最低或最高）
      if ((!minBudget && minBudget !== 0) && (!maxBudget && maxBudget !== 0)) {
        return '请填写预算范围';
      }
      
      // 人数验证
      if (!adults || parseInt(adults) <= 0) {
        return '成人人数必须大于0';
      }
      if (!children && children !== 0) {  // 允许儿童为0
        return '请填写儿童人数';
      }
  
      return null;
    },
  
    // 提交请求
    submitRequest() {
      const validationError = this.validateForm();
      if (validationError) {
        wx.showToast({ title: validationError, icon: 'none' });
        return;
      }
    
      const travelData = {
        destination: this.data.selectedDestination,
        departure_date: this.data.contactTime,
        return_date: this.data.contactTimes,
        min_budget: this.data.minBudget || null,
        max_budget: this.data.maxBudget || null,
        adults: parseInt(this.data.adults),
        children: parseInt(this.data.children) || 0
      };
    
      wx.navigateTo({
        url: `../tailor_made_customize/index?travelData=${encodeURIComponent(JSON.stringify(travelData))}`
      });
    },
  
    // 表单重置方法
    resetForm() {
      this.setData({
        selectedDestination: '',
        contactTime: '',
        contactTimes: '',
        minBudget: '',
        maxBudget: '',
        adults: '',
        children: ''
      });
    },
  
    // 预算输入处理
    handleBudgetInput(e) {
      const field = e.currentTarget.dataset.field;
      this.setData({
        [field]: e.detail.value.replace(/[^0-9.]/g, '')
      });
    },
  
    // 人数输入处理
    handleNumberInput(e) {
      const field = e.currentTarget.dataset.field;
      this.setData({
        [field]: e.detail.value.replace(/[^0-9]/g, '')
      });
    }
  });