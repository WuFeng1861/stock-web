import axios from 'axios'
import { useErrorStore } from '../stores/error'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
})

// 错误消息映射
const errorMessages = {
  401: '未授权，请检查Cookie设置',
  400: '请求参数错误',
  500: '服务器内部错误'
}

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorStore = useErrorStore()
    const status = error.response?.status
    const message = error.response?.data?.message ||
      errorMessages[status] ||
      '请求失败，请重试'

    errorStore.showError(message)
    return Promise.reject(error)
  })

export const stockApi = {
  // 获取推荐股票
  getRecommendStocks() {
    return api.get('/recommendStocks')
  },

  // 启动股票推荐分析
  startStockRecommend(params = {}) {
    return api.get('/startStockRecommend', { params })
  },

  // 启动回测
  startBackTest(params) {
    return api.get('/startBackTest', { params })
  },

  // 获取模拟持仓
  getMockStockHolding(times) {
    return api.get('/getMockStockHolding', { params: { times } })
  },

  // 获取任务状态
  getTaskStatus() {
    return api.get('/taskStatus')
  },

  // 获取回测次数
  getBackTestTimes() {
    return api.get('/getBackTestTimes')
  },

  // 设置Cookie
  setCookie(cookie) {
    return api.post('/setCookie', { cookie })
  },

  // 获取回测策略类型
  getBackTestTypes() {
    return api.get('/getBackTestTypes')
  },

  // 获取回测结果列表
  getBacktestResults() {
    return api.get('/getBacktestResults')
  }
}
