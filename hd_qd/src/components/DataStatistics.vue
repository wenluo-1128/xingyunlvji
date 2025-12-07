
<template>
  <div id="dataStatistics">
    <h2>数据统计</h2>
    <div class="data-cards-container">
      <div class="data-card">
        <p class="data-value">{{ statistics.totalOrders || 0 }}</p>
        <p class="data-label">总订单数</p>
        <div class="chart-container">
          <canvas ref="totalOrdersChart" width="200" height="200"></canvas>
        </div>
      </div>
      <div class="data-card">
        <p class="data-value">{{ statistics.paidOrders || 0 }}</p>
        <p class="data-label">已支付订单数</p>
        <div class="chart-container">
          <canvas ref="paidOrdersChart" width="200" height="200"></canvas>
        </div>
      </div>
      <div class="data-card">
        <p class="data-value">{{ statistics.unpaidOrders || 0 }}</p>
        <p class="data-label">未支付订单数</p>
        <div class="chart-container">
          <canvas ref="unpaidOrdersChart" width="200" height="200"></canvas>
        </div>
      </div>
      <div class="data-card">
        <p class="data-value">{{ statistics.completedOrders || 0 }}</p>
        <p class="data-label">已完成订单数</p>
        <div class="chart-container">
          <canvas ref="completedOrdersChart" width="200" height="200"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import api from '../services/api'

// 图表引用
const totalOrdersChart = ref(null)
const paidOrdersChart = ref(null)
const unpaidOrdersChart = ref(null)
const completedOrdersChart = ref(null)

// 统计数据
const statistics = reactive({
  totalOrders: 10,
  paidOrders: 0,
  unpaidOrders: 0,
  completedOrders: 10
})

// 图表实例
let charts = {}

// 销毁图表
const destroyCharts = () => {
  Object.values(charts).forEach(chart => chart.destroy())
  charts = {}
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await api.getOrders()
    if (response.statistics) {
      Object.assign(statistics, response.statistics)
    }
  } catch (error) {
    console.error('获取统计数据时出错:', error)
  }
}

// 创建图表
const createCharts = () => {
  // 总订单图表
  if (totalOrdersChart.value) {
    charts.totalOrders = new Chart(totalOrdersChart.value, {
      type: 'doughnut',
      data: {
        labels: ['已完成', '进行中'],
        datasets: [{
          data: [statistics.completedOrders, statistics.totalOrders - statistics.completedOrders],
          backgroundColor: ['#2ecc71', '#3498db'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  // 已支付订单图表
  if (paidOrdersChart.value) {
    charts.paidOrders = new Chart(paidOrdersChart.value, {
      type: 'doughnut',
      data: {
        labels: ['已支付', '总订单'],
        datasets: [{
          data: [statistics.paidOrders, statistics.totalOrders - statistics.paidOrders],
          backgroundColor: ['#f39c12', '#3498db'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  // 未支付订单图表
  if (unpaidOrdersChart.value) {
    charts.unpaidOrders = new Chart(unpaidOrdersChart.value, {
      type: 'doughnut',
      data: {
        labels: ['未支付', '总订单'],
        datasets: [{
          data: [statistics.unpaidOrders, statistics.totalOrders - statistics.unpaidOrders],
          backgroundColor: ['#e74c3c', '#3498db'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  // 已完成订单图表
  if (completedOrdersChart.value) {
    charts.completedOrders = new Chart(completedOrdersChart.value, {
      type: 'doughnut',
      data: {
        labels: ['已完成', '总订单'],
        datasets: [{
          data: [statistics.completedOrders, statistics.totalOrders - statistics.completedOrders],
          backgroundColor: ['#2ecc71', '#3498db'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }
}

// 组件挂载时
onMounted(async () => {
  await fetchStatistics()
  nextTick(() => {
    destroyCharts()
    createCharts()
  })
})
</script>

<style scoped>
#dataStatistics {
  width: 100%;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 24px;
}

.data-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.data-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  height: 400px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.data-value {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.data-label {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 15px;
}

.chart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  width: auto !important;
  height: auto !important;
}

@media (max-width: 768px) {
  .data-cards-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .data-card {
    height: 400px;
  }
}
</style>