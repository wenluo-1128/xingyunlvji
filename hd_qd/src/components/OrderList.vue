<template>
  <div id="orderList">
    <h2>订单列表</h2>
    <!-- 搜索框容器 -->
    <div class="order-search-container">
      <div class="search-container">
        <select v-model="searchType" id="searchObject">
          <option value="destination">目的地</option>
          <option value="departure_date">出发日期</option>
          <option value="return_date">回来日期</option>
          <option value="adults">成人人数</option>
          <option value="children">儿童人数</option>
        </select>
        <input type="text" v-model="searchValue" id="searchInput" placeholder="输入您想查找的内容" class="search-input">
        <button @click="searchOrders" id="searchButton">搜索</button>
      </div>
    </div>
    <table id="orderTable">
      <thead>
        <tr>
          <th>姓名</th>
          <th>目的地</th>
          <th>出发日期</th>
          <th>回来日期</th>
          <th>成人人数</th>
          <th>儿童人数</th>
          <th>总人数</th>
          <th>最低预算</th>
          <th>最高预算</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.request_id" @click="viewOrderDetail(order.request_id)">
          <td>{{ order.contact_name }}</td>
          <td>{{ order.destination }}</td>
          <td>{{ formatDate(order.departure_date) }}</td>
          <td>{{ formatDate(order.return_date) }}</td>
          <td>{{ order.adults }}</td>
          <td>{{ order.children }}</td>
          <td>{{ order.adults + order.children }}</td>
          <td>￥{{ order.min_budget }}</td>
          <td>￥{{ order.max_budget }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue' 
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const orders = ref([])
const originalOrders = ref([]) 
const searchType = ref('destination')
const searchValue = ref('')

// 获取订单数据
const fetchOrders = async () => {
  try {
    const response = await api.getOrders()
    originalOrders.value = response.orders || [] 
    orders.value = originalOrders.value 
  } catch (error) {
    console.error('获取订单数据时出错:', error)
  }
}

// 搜索订单 (Client-side filtering)
const searchOrders = () => {
  const term = searchValue.value.trim().toLowerCase()
  if (!term) {
    orders.value = originalOrders.value // Reset to full list if search is empty
    return
  }

  orders.value = originalOrders.value.filter(order => {
    const value = order[searchType.value]
    if (value === null || value === undefined) {
      return false
    }
    // Handle date fields specifically if needed (assuming they are strings like 'YYYY-MM-DD')
    if (['departure_date', 'return_date'].includes(searchType.value)) {
        // Assuming date format is 'YYYY-MM-DDTHH:mm:ss.sssZ', extract date part
        const datePart = value.split('T')[0];
        return datePart.includes(term);
    }
    // Handle numeric fields
    if (['adults', 'children'].includes(searchType.value)) {
      return value.toString().includes(term)
    }
    // Handle string fields (destination)
    if (typeof value === 'string') {
      return value.toLowerCase().includes(term)
    }
    return false
  })
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/orderDetail/${orderId}`)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
#orderList {
  width: 100%;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 24px;
}

.order-search-container {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  gap: 10px;
  max-width: 600px;
}

select, input, button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

select {
  min-width: 120px;
}

input {
  flex: 1;
}

button {
  background-color: #96DED1;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #2980b9;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-radius: 8px;
}

thead {
  background-color: #34495e;
  color: white;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

tbody tr:hover {
  background-color: #ecf0f1;
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
  }
  
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px 10px;
  }
}
</style>