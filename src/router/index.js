import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import HistorySelection from '../views/HistorySelection.vue'
import History from '../views/History.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/history/selection',
    name: 'HistorySelection',
    component: HistorySelection
  },
  {
    path: '/history/:times',
    name: 'History',
    component: History
  }
]

const router = createRouter({
  history: createWebHistory('/stock/'),
  routes
})

export default router
