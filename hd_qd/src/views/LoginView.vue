<template>
  <div class="login-page" :class="{ 'background-clear': isLoggingIn }">
    <div class="login-container" :class="{ 'fade-out': isLoggingIn }">
      <h2>管理员登录</h2>
      <form @submit.prevent="handleLogin">
        <label for="username">管理员账号</label>
        <input type="text" id="username" v-model="username" placeholder="请输入账号" required>
        <label for="password">密码</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码" required>
        <div class="login-options">
          <div class="remember-me">
            <input type="checkbox" id="remember-me" v-model="rememberMe">
            <label for="remember-me">保持登录状态</label>
          </div>
          <a href="#" class="forgot-password">忘记密码</a>
        </div>
        <button type="submit">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoggingIn = ref(false)

const handleLogin = () => {
  // 简单模拟验证，与原代码保持一致
  if (username.value === '123456' && password.value === '123456') {
    // 验证通过，执行转场效果
    performLoginTransition()
  } else {
    alert('用户名或密码错误')
  }
}

const performLoginTransition = () => {
  // 添加淡出动画类
  isLoggingIn.value = true

  // 等待动画完成后跳转到 dashboard 页面
  setTimeout(() => {
    router.push('/dashboard')
  }, 500) // 动画时长为 500ms
}
</script>

<style scoped>
.login-page {
  background-image: url('/image/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  backdrop-filter: blur(5px) brightness(0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  transition: backdrop-filter 0.5s ease;
}

.background-clear {
  backdrop-filter: blur(0) brightness(1);
}

.login-container {
  width: 320px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  animation: fadeIn 0.5s ease-in-out;
  transition: transform 0.3s ease, opacity 0.5s ease;
}

.login-container:hover {
  transform: scale(1.02);
}

.fade-out {
  opacity: 0;
  transform: translateY(-20px);
}

.login-container h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.login-container form label {
  display: block;
  margin-top: 10px;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.login-container form input[type="text"],
.login-container form input[type="password"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.login-container form input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input[type="checkbox"] {
  margin-right: 5px;
}

.forgot-password {
  color: #3498db;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-container form button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-bottom: 15px;
}

.login-container form button:hover {
  background-color: #2980b9;
}

.google-auth {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.google-auth:hover {
  background-color: #f5f5f5;
}

.google-auth img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>