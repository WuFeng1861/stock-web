import { defineStore } from 'pinia'
import { ref } from 'vue'
import { stockApi } from '../services/api'

export const useStrategyStore = defineStore('strategy', () => {
  const types = ref([])
  const isLoading = ref(false)

  async function fetchTypes() {
    if (types.value.length > 0) return

    try {
      isLoading.value = true
      const { data } = await stockApi.getBackTestTypes()
      types.value = data
    } finally {
      isLoading.value = false
    }
  }

  function getStrategyName(typeId) {
    return types.value[typeId - 1] || '未知策略'
  }

  return {
    types,
    isLoading,
    fetchTypes,
    getStrategyName
  }
})
