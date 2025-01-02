<script setup>
import { ref, onMounted } from 'vue'
import { stockApi } from '../services/api'
import { useErrorStore } from '../stores/error'
import { useStrategyStore } from '../stores/strategy'

const backtestRecords = ref([])
const isLoading = ref(true)
const errorStore = useErrorStore()
const strategyStore = useStrategyStore()

onMounted(async () => {
  try {
    await strategyStore.fetchTypes()
    const { data } = await stockApi.getBacktestResults()
    backtestRecords.value = data
  } catch (error) {
    errorStore.showError('获取回测记录失败')
  } finally {
    isLoading.value = false
  }
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">历史回测记录</h1>
        <router-link to="/" class="text-blue-500 hover:text-blue-600">
          ← 返回上一页
        </router-link>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="backtestRecords.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-lg font-medium mb-1">暂无回测记录</p>
        <p class="text-sm text-gray-400">请先进行回测分析</p>
      </div>

      <div v-else class="grid gap-6">
        <router-link
            v-for="record in backtestRecords"
            :key="record.BacktestTimes"
            :to="`/history/${record.BacktestTimes}`"
            class="block p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200
                 hover:shadow-md transition-shadow duration-300"
        >
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold text-gray-800">第 {{ record.BacktestTimes }} 次回测</h2>
            <span
                class="text-lg font-medium"
                :class="record.TotalProfit >= 0 ? 'text-red-600' : 'text-green-600'"
            >
              {{ formatNumber(record.TotalProfit) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">回测期间：</span>
              {{ formatDate(record.BacktestStartDate) }} - {{ formatDate(record.BacktestEndDate) }}
            </div>
            <div>
              <span class="font-medium">交易次数：</span>
              {{ record.TransactionCount }}
            </div>
            <div>
              <span class="font-medium">策略类型：</span>
              {{ strategyStore.getStrategyName(record.StrategyTypeID) }}
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
