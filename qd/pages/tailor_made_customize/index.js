// index.js
Page({
  data: {
    services: ['线路设计', '预定酒店', '预定车票', '办理签证', '美食推荐', '购买门票'],
    selectedService: null,
    designerNum: null,
    name: '',
    phone: '',
    contactTime: '',
    contactTimes: '',
    remark: '',
    showToast: false,
    beijing: '',
    ip: '',
    travelData: {},
    amount: '', // 新增订单金额字段
  },

  onLoad(options) {
    const app = getApp();
    this.setData({
      ip: app.globalData.ip
    });

    this.beijing_image();

    if (options.travelData) {
      try {
        const travelData = JSON.parse(decodeURIComponent(options.travelData));
        this.setData({ travelData });
        console.log(travelData)
      } catch (e) {
        console.error('数据解析失败', e);
      }
    }
  },

  beijing_image() {
    const { ip } = this.data;
    this.setData({
      beijing: `${ip}/api/customize/image`,
    });
  },

  // 选择服务
  selectService(e) {
    this.setData({ selectedService: e.currentTarget.dataset.index });
  },

  // 选择定制师数量
  selectDesigner(e) {
    const num = e.currentTarget.dataset.num;
    this.setData({
      designerNum: num,
      amount: num * 200, // 根据选择的定制师数量计算金额
    });
  },

  // 表单输入
  inputName(e) {
    this.setData({ name: e.detail.value });
  },
  inputPhone(e) {
    this.setData({ phone: e.detail.value });
  },
  selectTime(e) {
    this.setData({ contactTime: e.detail.value });
  },
  selectTimes(e) {
    let time = e.detail.value; // 原始格式为 "HH:MM"
    time += ':00'; // 转换为 "HH:MM:SS"
    this.setData({ contactTimes: time });
  },
  inputRemark(e) {
    this.setData({ remark: e.detail.value });
  },

  // 提交处理
  handleSubmit() {
    const { ip, travelData } = this.data;
  
    if (!this.validateForm()) return;
  
    const requestData = {
      ...travelData,  // 包含第一个界面的数据
      designer_num: this.data.designerNum,
      contact_name: this.data.name,
      contact_phone: this.data.phone,
      contact_date: this.data.contactTime,   // 确保格式为 "YYYY-MM-DD"
      contact_time: this.data.contactTimes,  // 确保格式为 "HH:MM:SS"
      remark: this.data.remark,
      amount: this.data.amount
    };

    console.log(requestData)
  
    wx.request({
      url: `${ip}/api/travel-requests`,
      method: 'POST',
      data: requestData,
      success: (res) => {
        wx.showToast({ title: '提交成功', icon: 'success' });
        // 清空表单和跳转逻辑
      },
      fail: (err) => {
        wx.showToast({ title: '提交失败', icon: 'none' });
        console.error('提交错误:', err); // 添加错误日志
      }
    });
  },

  // 表单验证
  validateForm() {
    const { name, phone, designerNum } = this.data;
    if (!name) {
      wx.showToast({ title: '请输入完整信息', icon: 'none' });
      return false;
    }
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return false;
    }
    if (!designerNum) {
      wx.showToast({ title: '请选择定制师数量', icon: 'none' });
      return false;
    }
    return true;
  },

  // 显示自定义提示
  showSubmitToast() {
    this.setData({ showToast: true });
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 1500);
  },
});