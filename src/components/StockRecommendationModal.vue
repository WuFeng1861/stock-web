<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { getRandomGradient } from '../utils/colors'
import { useStrategyStore } from '../stores/strategy'
import { ref, watch } from 'vue'

const strategyStore = useStrategyStore()
const selectedType = ref('')

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  },
  stocks: {
    type: Array,
    required: true
  }
})

const stocksWithGradients = computed(() => {
  const filtered = selectedType.value
      ? props.stocks.filter(stock => stock.type === Number(selectedType.value))
      : props.stocks

  return filtered.map(stock => ({
    ...stock,
    gradient: getRandomGradient()
  }))
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">今日推荐股票</h3>
        <div class="flex items-center gap-4">
          <select
              v-model="selectedType"
              class="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部策略</option>
            <option
                v-for="(type, index) in strategyStore.types"
                :key="index"
                :value="index + 1"
            >
              {{ type }}
            </option>
          </select>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="stocks.length > 0" class="space-y-4 overflow-y-auto flex-1 pr-2">
        <div v-for="stock in stocksWithGradients" :key="stock.code"
             class="p-4 rounded-lg transition-shadow duration-300 hover:shadow-md"
             :class="[
               'bg-gradient-to-br',
               stock.gradient.from,
               stock.gradient.to,
               stock.gradient.border
             ]">
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">股票代码：</span>
            <span class="font-medium">{{ stock.code }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">股票名称：</span>
            <span class="font-medium">{{ stock.name }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">推荐策略：</span>
            <span class="font-medium">{{ strategyStore.getStrategyName(stock.type) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">最新价格：</span>
            <span class="font-medium">{{ stock.lastPrice }}</span>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center flex-1 py-12 text-gray-500">
        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-lg font-medium mb-1">暂无推荐股票</p>
      </div>

      <div class="mt-4 pt-4 flex justify-end border-t">
        <button @click="close" class="btn">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>
