<template>
  <div class="order-detail-container">
    <!-- 头部 -->
    <header class="header">
      <!-- 标题链接 -->
      <router-link to="/dashboard">
        <h1 class="header-title">"行云旅迹"订单管理系统</h1>
      </router-link>
      <div class="header-right">
        <span class="time-info">当前时间: <span id="current-time">{{ currentTime }}</span></span>
        <!-- 用户图标 -->
        <div class="user-icon" @click="toggleUserDropdown">
          <img src="/image/renwu.png" alt="用户头像">
        </div>
        <!-- 用户下拉菜单 -->
        <div class="user-dropdown" v-show="showUserDropdown">
          <a href="">个人中心</a>
          <router-link to="/login">退出登录</router-link>
        </div>
      </div>
    </header>
    <!-- 主内容容器 -->
    <div class="main-content-container">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <ul class="sidebar-menu">
          <li><router-link to="/dashboard/orderList" class="sidebar-link">订单列表</router-link></li>
          <li><router-link to="/dashboard/dataStatistics" class="sidebar-link">数据统计</router-link></li>
        </ul>
      </div>
      <!-- 订单详情内容 -->
      <div class="data-content">
        <h2>订单详情</h2>
        <div class="order-details-container">
          <div class="order-details-grid">
            <template v-for="(value, key) in formattedOrderData">
              <div v-if="key !== '备注'" :key="key" class="grid-item">
                <span class="detail-label">{{ key }}:</span>
                <span class="detail-value">{{ value }}</span>
              </div>
            </template>
          </div>
          <div v-if="formattedOrderData['备注']" class="remark-container">
            <span class="remark-label">备注:</span>
            <span class="remark-content">{{ formattedOrderData['备注'] }}</span>
          </div>
          <div class="accept-order-btn" id="acceptOrderBtn" @click="acceptOrder">接取订单</div>
        </div>
      </div>
    </div>
    <!-- 成功提示模态框 -->
    <div class="modal-overlay" v-show="showSuccessModal" id="successModal" @click="closeModal">
      <div class="modal-content">接单成功！</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const orderId = computed(() => route.params.id)

// 状态
const orderData = ref({})
const currentTime = ref('')
const showUserDropdown = ref(false)
const showSuccessModal = ref(false)
let timeInterval = null

// 标签映射
const labelMap = {
  contact_name: "客户姓名",
  request_id: "订单编号",
  created_at: "下单时间",
  amount: "订单金额",
  destination: "目的地",
  departure_date: "出发日期",
  return_date: "结束日期",
  adults: "成人数量",
  children: "儿童数量",
  designer_num: "定制师数",
  min_budget: "最低预算",
  max_budget: "最高预算",
  status: "订单状态",
  contact_date: "联系日期",
  contact_time: "联系时间",
  remark: "备注",
  contact_phone: "联系电话"
}

// 格式化订单数据
const formattedOrderData = computed(() => {
  const formatted = {}
  if (!orderData.value) return formatted
  
  Object.keys(orderData.value).forEach(key => {
    if (labelMap[key]) {
      let value = orderData.value[key]
      
      // 格式化日期
      if (['departure_date', 'return_date', 'created_at', 'contact_date'].includes(key) && value) {
        value = value.split('T')[0]
      }
      
      // 格式化预算
      if (['min_budget', 'max_budget'].includes(key)) {
        value = `￥${value}`
      }
      
      formatted[labelMap[key]] = value
    }
  })
  
  return formatted
})

// 更新时间函数
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString()
}

// 切换用户下拉菜单
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    const response = await api.getOrderDetail(orderId.value)
    orderData.value = response.order || {}
  } catch (error) {
    console.error('获取订单详情时出错:', error)
  }
}

// 接取订单
const acceptOrder = async () => {
  try {
    showSuccessModal.value = true
    
    // 3秒后自动关闭模态框
    setTimeout(() => {
      closeModal()
    }, 3000)
  } catch (error) {
    console.error('接取订单时出错:', error)
    alert('接取订单失败，请稍后重试')
  }
}

// 关闭模态框
const closeModal = () => {
  showSuccessModal.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const userIcon = document.querySelector('.user-icon')
  const userDropdown = document.querySelector('.user-dropdown')
  
  if (userIcon && userDropdown && !userIcon.contains(event.target) && !userDropdown.contains(event.target)) {
    showUserDropdown.value = false
  }
}

// 组件挂载时
onMounted(() => {
  // 获取订单详情
  fetchOrderDetail()
  
  // 设置定时器更新时间
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // 添加点击事件监听器
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时
onUnmounted(() => {
  // 清除定时器
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  
  // 移除事件监听器
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 头部样式 */
.header {
  background-color: #2c3e50;
  padding: 10px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.header-title {
  font-size: 24px;
  color: #ecf0f1;
  margin: 0;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  position: relative;
}

.time-info {
  margin-right: 20px;
  color: #ecf0f1;
  font-size: 14px;
}

.user-icon {
  position: relative;
  margin-left: 15px;
  cursor: pointer;
  transition: transform 0.2s;
}

.user-icon:hover {
  transform: scale(1.1);
}

.user-icon img {
  width: 24px;
  height: 24px;
}

.user-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  min-width: 120px;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-dropdown a {
  display: block;
  padding: 8px 15px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.user-dropdown a:hover {
  background-color: #f5f5f5;
}

/* 主内容容器 */
.order-detail-container {
  width: 100%;
  min-height: 100vh;
}

.main-content-container {
  display: flex;
  margin-top: 60px; /* 为固定的头部留出空间 */
  min-height: calc(100vh - 60px);
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  background-color: #34495e;
  color: #ecf0f1;
  padding: 20px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 5px;
}

.sidebar-link {
  display: block;
  padding: 10px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background-color 0.2s;
  border-left: 3px solid transparent;
}

.sidebar-link:hover,
.sidebar-link.router-link-active {
  background-color: #2c3e50;
  border-left-color: #3498db;
}

/* 数据内容 */
.data-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 24px;
}

/* 订单详情样式 */
.order-details-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.order-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.grid-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.remark-container {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-top: 20px;
}

.remark-label {
  font-weight: bold;
  color: #34495e;
  margin-right: 10px;
}

.remark-content {
  color: #7f8c8d;
}

#order-details-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.order-detail-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.detail-label {
  font-weight: bold;
  width: 120px;
  color: #34495e;
}

.detail-value {
  flex: 1;
}

.accept-order-btn {
  display: inline-block;
  background-color: #96DED1;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  margin: 30px auto 0;
  padding: 12px 0;
  background-color: #96DED1;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.accept-order-btn:hover {
  background-color: #96DED1;
  transform: scale(1.1);
  transform-origin: center;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background-color: white;
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  font-size: 18px;
  color: #96DED1;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  
  .sidebar-link {
    padding: 10px;
    text-align: center;
  }
  
  .sidebar-link span {
    display: none;
  }
  
  .data-content {
    padding: 10px;
  }
  
  .detail-label {
    width: 100px;
  }
}
</style>
