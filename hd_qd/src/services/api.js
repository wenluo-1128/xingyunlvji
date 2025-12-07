// API服务模块
import axios from 'axios'

const baseURL = 'http://120.26.58.110:3000'

// 创建axios实例
const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息等
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// API方法
export default {
  // 获取所有订单
  getOrders() {
    return apiClient.get('/api/orders')
  },
  
  // 获取单个订单详情
  getOrderDetail(id) {
    return apiClient.get(`/api/orders/${id}`)
  },
  
  // 接取订单
  acceptOrder(id) {
    return apiClient.post(`/api/orders/${id}/accept`)
  },
  
  // 搜索订单
  searchOrders(searchType, searchValue) {
    return apiClient.get('/api/orders', {
      params: {
        [searchType]: searchValue
      }
    })
  }
}