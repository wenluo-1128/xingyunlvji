Page({
    data: {
      // 数据存储模块，存储定制流程列表数据
      processList: [
        { title: "提交需求", desc: "把您的旅行需求告诉我们" },
        { title: "旅行咨询", desc: "让定制师深入了解您对旅行的需求" },
        { title: "形成设计以及报价", desc: "定制师为您量身设计行程" },
        { title: "订单支付", desc: "通过小程序进行订单支付" },
        { title: "平台保障", desc: "若有问题以及不满，欢迎联系行云旅迹" },
        { title: "定制师评价", desc: "对于服务是否满意的评价，预祝您达到最优旅行体验" }
      ],
      beijing:'',
      ip:''
    },

    onLoad(){
      const app = getApp();
      this.setData({
        ip: app.globalData.ip
      });
      this.beijing_image();
    },

    beijing_image(){
      const { ip } = this.data;
      this.setData({
        beijing:`${ip}/api/inquire/image`
      })
    },
  });