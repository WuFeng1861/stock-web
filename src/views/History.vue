<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { stockApi } from '../services/api'
import { useErrorStore } from '../stores/error'
import TradeStatistics from '../components/TradeStatistics.vue'

const route = useRoute()
const errorStore = useErrorStore()
const holdings = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const { data } = await stockApi.getMockStockHolding(route.params.times)
    holdings.value = data
  } catch (error) {
    errorStore.showError('获取回测详情失败')
  } finally {
    isLoading.value = false
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

const formatPercent = (num) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'percent'
  }).format(num)
}

const trades = ref(holdings.value.filter(h => h.sellDate))
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">回测详情</h1>
        <router-link to="/history/selection" class="text-blue-500 hover:text-blue-600">
          ← 返回列表
        </router-link>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <template v-else>
        <!-- 交易统计 -->
        <TradeStatistics :trades="holdings" />

        <!-- 交易记录表格 -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-800">交易记录</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票代码</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">买入日期</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">买入价格</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">卖出日期</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">卖出价格</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">持仓数量</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">盈亏金额</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">盈亏比例</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">交易费用</th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="holding in holdings" :key="holding.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ holding.stockId }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ holding.stockName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(holding.buyDate) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatNumber(holding.buyPrice) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ holding.sellDate ? formatDate(holding.sellDate) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ holding.sellPrice ? formatNumber(holding.sellPrice) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ holding.amount }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm"
                    :class="holding.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ holding.profit ? formatNumber(holding.profit) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm"
                    :class="holding.profitRate >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ holding.profitRate ? formatPercent(holding.profitRate/100) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ holding.fee ? formatNumber(holding.fee) : '-' }}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
