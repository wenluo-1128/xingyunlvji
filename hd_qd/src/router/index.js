import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      children: [
        {
          path: '',
          name: 'dashboardDefault',
          redirect: { name: 'orderList' }
        },
        {
          path: 'orderList',
          name: 'orderList',
          component: () => import('../components/OrderList.vue')
        },
        {
          path: 'dataStatistics',
          name: 'dataStatistics',
          component: () => import('../components/DataStatistics.vue')
        }
      ]
    },
    {
      path: '/orderDetail/:id',
      name: 'orderDetail',
      component: () => import('../views/OrderDetailView.vue')
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 简单的路由保护，可以根据实际需求扩展
  if (to.path !== '/login') {
    // 这里可以添加登录状态检查逻辑
    // const isLoggedIn = localStorage.getItem('isLoggedIn')
    // if (!isLoggedIn) return next('/login')
  }
  next()
})

export default router