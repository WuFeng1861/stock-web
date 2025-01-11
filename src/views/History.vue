<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { stockApi } from '../services/api'
import { nextTick } from 'vue'
import { useErrorStore } from '../stores/error'
import TradeStatistics from '../components/TradeStatistics.vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import {
  CanvasRenderer
} from 'echarts/renderers'
import { onUnmounted } from 'vue'

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LineChart,
  CanvasRenderer
])

const route = useRoute()
const errorStore = useErrorStore()
const holdings = ref([])
const isLoading = ref(true)
const chartRef = ref(null)
let profitChart = null
let screenWidth = window.innerWidth

onMounted(async () => {
  try {
    const { data } = await stockApi.getMockStockHolding(route.params.times)
    holdings.value = data
  } catch (error) {
    console.log(error)
    errorStore.showError('获取回测详情失败')
  } finally {
    isLoading.value = false
    await nextTick()
    initChart()
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: 'compact',
    compactDisplay: 'short'
  }).format(num)
}

const formatPercent = (num) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'percent'
  }).format(num)
}

const calculateDailyProfits = () => {
  const dailyProfits = new Map()
  let runningProfit = 0

  // 按日期排序
  const sortedTrades = [...holdings.value]
      .filter(h => h.sellDate)
      .sort((a, b) => new Date(a.sellDate) - new Date(b.sellDate))

  sortedTrades.forEach(trade => {
    const date = formatDate(trade.sellDate)
    runningProfit += Number(trade.profit)
    dailyProfits.set(date, runningProfit)
  })

  return Array.from(dailyProfits.entries()).map(([date, profit]) => ({
    date,
    profit
  }))
}

const initChart = () => {
  if (!chartRef.value) return

  if (profitChart) {
    profitChart.dispose()
  }

  const dailyProfits = calculateDailyProfits()

  profitChart = echarts.init(chartRef.value)

  const option = {
    title: {
      text: '累计收益走势',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16
      }
    },
    grid: {
      left: screenWidth <= 768 ? '20%' : '10%',
      right: '5%',
      bottom: '15%',
      top: '15%'
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params) => {
        const data = params[0]
        return `${data.name}<br/>累计收益: ${new Intl.NumberFormat('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(data.value)}元`
      }
    },
    xAxis: {
      type: 'category',
      data: dailyProfits.map(item => item.date),
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        margin: 15
      }
    },
    yAxis: {
      type: 'value',
      name: '收益(元)',
      nameGap: 35,
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: (value) => formatNumber(value),
        fontSize: 10,
        margin: 16,
        width: 60,
        overflow: 'break',
        align: 'right'
      }
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        height: 20,
        bottom: 0,
        borderColor: 'transparent',
        backgroundColor: '#f1f5f9',
        fillerColor: 'rgba(59,130,246,0.1)',
        handleStyle: {
          color: '#3b82f6',
          borderColor: '#3b82f6'
        },
        textStyle: {
          color: '#64748b'
        },
        moveHandleStyle: {
          color: '#3b82f6'
        },
        selectedDataBackground: {
          lineStyle: {
            color: '#3b82f6'
          },
          areaStyle: {
            color: '#3b82f6'
          }
        }
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true
      }
    ],
    series: [{
      data: dailyProfits.map(item => item.profit),
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#3b82f6'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59,130,246,0.3)' },
          { offset: 1, color: 'rgba(59,130,246,0.1)' }
        ])
      }
    }]
  }

  profitChart.setOption(option)
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  screenWidth = window.innerWidth
  initChart()
  profitChart?.resize()
}

window.addEventListener('resize', handleResize)

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  profitChart?.dispose()
})
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

        <!-- 收益走势图 -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-800">收益走势</h2>
          </div>
          <div ref="chartRef" class="w-full h-[450px] px-4 py-4"></div>
        </div>

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
                    :class="holding.profit >= 0 ? 'text-red-600' : 'text-green-600'">
                  {{ holding.profit ? formatNumber(holding.profit) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm"
                    :class="holding.profitRate >= 0 ? 'text-red-600' : 'text-green-600'">
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
