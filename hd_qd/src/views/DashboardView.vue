<template>
  <div class="dashboard-container">
    <!-- 头部 -->
    <header class="header">
      <!-- 标题链接 -->
      <router-link to="/dashboard">
        <h1 class="header-title">"行云旅迹"订单管理系统</h1>
      </router-link>
      <div class="header-right">
        <span class="time-info">当前时间: <span id="current-time">{{ currentTime }}</span></span>
        <!-- 通知图标 -->
        <div class="notification-icon" @click="toggleNotifications">
          <img src="/image/notice.png" alt="通知图标">
          <span class="notification-badge">3</span>
        </div>
        <!-- 信息图标 -->
        <div class="message-icon" @click="toggleMessages">
          <img src="/image/massage.png" alt="信息图标">
          <span class="message-badge">1</span>
        </div>
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
      <!-- 数据内容 -->
      <div class="data-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 当前时间状态
const currentTime = ref('')
let timeInterval = null

// 下拉菜单状态
const showUserDropdown = ref(false)
const showNotifications = ref(false)
const showMessages = ref(false)

// 更新时间函数
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString()
}

// 切换用户下拉菜单
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
  // 关闭其他下拉菜单
  showNotifications.value = false
  showMessages.value = false
}

// 切换通知菜单
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  // 关闭其他下拉菜单
  showUserDropdown.value = false
  showMessages.value = false
}

// 切换消息菜单
const toggleMessages = () => {
  showMessages.value = !showMessages.value
  // 关闭其他下拉菜单
  showUserDropdown.value = false
  showNotifications.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const userIcon = document.querySelector('.user-icon')
  const userDropdown = document.querySelector('.user-dropdown')
  const notificationIcon = document.querySelector('.notification-icon')
  const messageIcon = document.querySelector('.message-icon')
  
  if (userIcon && userDropdown && !userIcon.contains(event.target) && !userDropdown.contains(event.target)) {
    showUserDropdown.value = false
  }
  
  if (notificationIcon && !notificationIcon.contains(event.target)) {
    showNotifications.value = false
  }
  
  if (messageIcon && !messageIcon.contains(event.target)) {
    showMessages.value = false
  }
}

// 组件挂载时
onMounted(() => {
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
  animation: slideDown 0.5s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
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

.notification-icon,
.message-icon,
.user-icon {
  position: relative;
  margin-left: 15px;
  cursor: pointer;
  transition: transform 0.2s;
}

.notification-icon:hover,
.message-icon:hover,
.user-icon:hover {
  transform: scale(1.1);
}

.notification-icon img,
.message-icon img,
.user-icon img {
  width: 24px;
  height: 24px;
}

.notification-badge,
.message-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e74c3c;
  color: white;
  font-size: 12px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
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
.dashboard-container {
  width: 100%;
  min-height: 100vh;
  overflow-x: auto;
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
  transition: width 0.3s;
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
}
</style>