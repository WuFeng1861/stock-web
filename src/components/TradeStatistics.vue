<script setup>
import {computed} from 'vue'

const props = defineProps({
  trades: {
    type: Array,
    required: true
  }
})

// 计算交易次数
const totalTrades = computed(() => props.trades.length)

// 计算盈利次数
const profitableTrades = computed(() =>
    props.trades.filter(trade => (trade.profit || 0) >= 0).length
)

// 计算总收益
const totalProfit = computed(() =>
    props.trades.reduce((sum, trade) => sum + Number(trade.profit || 0), 0)
)

// 计算最大回撤
const maxDrawdown = computed(() => {
  let maxDrawdown = 0
  let peak = 0
  let runningSum = 0

  props.trades.forEach(trade => {
    runningSum += Number(trade.profit)
    if (runningSum > peak) {
      peak = runningSum
    }
    const currentDrawdown = peak - runningSum
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown
    }
  })

  return maxDrawdown
})

// 计算最大连续亏损次数
const maxConsecutiveLosses = computed(() => {
  let currentStreak = 0
  let maxStreak = 0

  props.trades.forEach(trade => {
    if (trade.profit < 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })

  return maxStreak
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
    <div
        class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
      <h3 class="text-sm font-medium text-gray-500 mb-1">交易次数</h3>
      <div class="flex items-baseline">
        <span class="text-2xl font-semibold">{{ totalTrades }}</span>
        <span class="ml-2 text-sm text-gray-500">次</span>
      </div>
      <div class="text-sm text-gray-500 mt-1">
        盈利：{{ profitableTrades }} 次
      </div>
    </div>

    <div
        class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-300">
      <h3 class="text-sm font-medium text-gray-500 mb-1">总收益</h3>
      <div class="flex items-baseline">
        <span class="text-2xl font-semibold" :class="totalProfit >= 0 ? 'text-red-600' : 'text-green-600'">
          {{ formatNumber(totalProfit) }}
        </span>
        <span class="ml-2 text-sm text-gray-500">元</span>
      </div>
    </div>

    <div
        class="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-lg shadow-sm border border-red-100 hover:shadow-md transition-shadow duration-300">
      <h3 class="text-sm font-medium text-gray-500 mb-1">最大回撤</h3>
      <div class="flex items-baseline">
        <span class="text-2xl font-semibold text-red-600">
          {{ formatNumber(maxDrawdown) }}
        </span>
        <span class="ml-2 text-sm text-gray-500">元</span>
      </div>
    </div>

    <div
        class="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
      <h3 class="text-sm font-medium text-gray-500 mb-1">胜率</h3>
      <div class="flex items-baseline">
        <span class="text-2xl font-semibold">
          {{ formatNumber((profitableTrades / totalTrades) * 100) }}
        </span>
        <span class="ml-2 text-sm text-gray-500">%</span>
      </div>
    </div>

    <div
        class="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300">
      <h3 class="text-sm font-medium text-gray-500 mb-1">最多连续亏损</h3>
      <div class="flex items-baseline">
        <span class="text-2xl font-semibold text-amber-600">
          {{ maxConsecutiveLosses }}
        </span>
        <span class="ml-2 text-sm text-gray-500">次</span>
      </div>
    </div>

    <div
        class="bg-gradient-to-br from-red-50 to-purple-50 p-6 rounded-lg shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300">
      <h3 class="text-sm font-medium text-gray-500 mb-1">初始资金</h3>
      <div class="flex items-baseline">
        <span class="text-2xl font-semibold">
          {{ 2*31.73 }}亿
        </span>
        <span class="ml-2 text-sm text-gray-500">元</span>
      </div>
    </div>
  </div>
</template>
