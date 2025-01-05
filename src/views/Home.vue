<script setup>
import { ref, onMounted } from 'vue'
import StockRecommendationModal from '../components/StockRecommendationModal.vue'
import ParameterSettings from '../components/ParameterSettings.vue'
import { format } from 'date-fns'
import { stockApi } from '../services/api'
import { useNotificationStore } from '../stores/notification'
import { useStrategyStore } from '../stores/strategy'

const notificationStore = useNotificationStore()
const strategyStore = useStrategyStore()

// 日期相关状态
const startDate = ref('')
const endDate = ref('')
const minDate = '2010-01-01'
const maxDate = new Date(Date.now() - 86400000).toISOString().split('T')[0] // Yesterday

// UI 状态
const isCalculating = ref(false)
const showRecommendation = ref(false)
const currentTime = ref(format(new Date(), 'yyyy年MM月dd日 HH:mm:ss'))
const selectedStrategy = ref('')
const selectedBacktestStrategy = ref('')
const shouldUpdate = ref(false)

// 推荐股票数据
const recommendedStocks = ref([])

// 初始化数据
onMounted(async () => {
  await strategyStore.fetchTypes()
})

// 定时更新当前时间
setInterval(() => {
  currentTime.value = format(new Date(), 'yyyy年MM月dd日 HH:mm:ss')
}, 1000)

// 事件处理函数
const handleParameterSubmit = (value) => {
  notificationStore.showNotification('Cookie设置成功', 'success')
}
const handleTokenSubmit = (value) => {
  notificationStore.showNotification('Token设置成功', 'success')
}



const getStockRecommendation = async () => {
  try {
    const { data } = await stockApi.getRecommendStocks()
    recommendedStocks.value = data
    showRecommendation.value = true
  } catch (error) {}
}

const recalculateRecommendation = async (event) => {
  if (!selectedStrategy.value) {
    notificationStore.showNotification('请选择推荐策略', 'warning')
    return
  }

  isCalculating.value = true
  try {
    await stockApi.startStockRecommend({
      update: shouldUpdate.value,
      recommendType: strategyStore.types.indexOf(selectedStrategy.value) + 1
    })
    const { data } = await stockApi.getRecommendStocks()
    recommendedStocks.value = data
    notificationStore.showNotification('计算推荐股票已开启', 'success')
  } catch (error) {} finally {
    isCalculating.value = false
  }
}

const runBacktest = async () => {
  if (!startDate.value) {
    notificationStore.showNotification('请选择回测开始日期', 'warning')
    return
  }
  if (!endDate.value) {
    notificationStore.showNotification('请选择回测结束日期', 'warning')
    return
  }
  if (startDate.value >= endDate.value) {
    notificationStore.showNotification('回测结束日期必须大于回测起始日期', 'warning')
    return
  }
  if (!selectedBacktestStrategy.value) {
    notificationStore.showNotification('请选择回测策略', 'warning')
    return
  }

  try {
    await stockApi.startBackTest({
      startDate: startDate.value,
      endDate: endDate.value,
      backTestType: strategyStore.types.indexOf(selectedBacktestStrategy.value) + 1
    })
    notificationStore.showNotification('回测已启动', 'success')
  } catch (error) {}
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- 标题区域 -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold mb-2">股票交易回测系统</h1>
            <p class="text-blue-100">专业的量化交易策略分析平台</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-mono">{{ currentTime }}</div>
            <div class="text-blue-200 text-sm mt-1">实时市场数据分析中</div>
          </div>
        </div>
      </div>

      <!-- 参数设置区域 -->
      <ParameterSettings @submit="handleParameterSubmit" @token-submit="handleTokenSubmit" />

      <!-- 功能区域 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 股票推荐卡片 -->
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">
            <span class="text-blue-500 mr-2">📈</span>
            股票推荐
          </h2>
          <div class="space-y-4">
            <button
                @click="getStockRecommendation"
                class="w-full btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                :disabled="isCalculating"
            >
              获取股票推荐
            </button>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">选择推荐策略</label>
              <select
                  v-model="selectedStrategy"
                  class="input w-full bg-white"
                  :disabled="isCalculating"
              >
                <option value="">请选择策略</option>
                <option v-for="type in strategyStore.types" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">是否更新数据</label>
              <select
                  v-model="shouldUpdate"
                  class="input w-full bg-white"
                  :disabled="isCalculating"
              >
                <option :value="false">否</option>
                <option :value="true">是</option>
              </select>
            </div>
            <button
                @click="recalculateRecommendation"
                class="w-full btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isCalculating || !selectedStrategy"
            >
              {{ isCalculating ? '计算中...' : '重新计算推荐' }}
            </button>
          </div>
        </div>

        <!-- 量化回测卡片 -->
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">
            <span class="text-purple-500 mr-2">🔍</span>
            量化回测
          </h2>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">选择回测起始日期</label>
              <input
                  type="date"
                  v-model="startDate"
                  :min="minDate"
                  :max="maxDate"
                  class="input w-full"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">选择回测结束日期</label>
              <input
                  type="date"
                  v-model="endDate"
                  :min="minDate"
                  :max="maxDate"
                  class="input w-full"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">选择回测策略</label>
              <select
                  v-model="selectedBacktestStrategy"
                  class="input w-full bg-white"
              >
                <option value="">请选择策略</option>
                <option v-for="type in strategyStore.types" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
            <button
                @click="runBacktest"
                class="w-full btn bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!selectedBacktestStrategy || !startDate || !endDate"
            >
              开始回测分析
            </button>
          </div>
        </div>
      </div>

      <!-- 历史数据链接 -->
      <div class="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div class="flex justify-center gap-4">
          <router-link
              to="/history/selection"
              class="text-lg text-blue-600 hover:text-blue-700 flex items-center group"
          >
            查看历史回测数据
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 股票推荐弹窗 -->
    <StockRecommendationModal
        :is-visible="showRecommendation"
        :stocks="recommendedStocks"
        @close="showRecommendation = false"
    />
  </div>
</template>

<style scoped>
.btn {
  @apply px-4 py-3 text-white rounded-lg transition-all duration-300 font-medium text-center;
}
</style>
