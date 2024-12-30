<script setup>
import { ref, onMounted } from 'vue'
import { stockApi } from '../services/api'

const paramValue = ref('')
const isSubmitting = ref(false)
const emit = defineEmits(['submit'])

const handleSubmit = async () => {
  if (!paramValue.value.trim()) return

  try {
    isSubmitting.value = true
    await stockApi.setCookie(paramValue.value)
    emit('submit', paramValue.value)
    paramValue.value = ''
  } catch (error) {} finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">
      <span class="text-cyan-500 mr-2">⚙️</span>
      cookie参数设置
    </h2>
    <div class="flex gap-3">
      <input
          v-model="paramValue"
          type="text"
          placeholder="请输入百度股市通的cookie"
          class="input flex-1"
          @keyup.enter="handleSubmit"
      />
      <button
          @click="handleSubmit"
          class="btn bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 min-w-[80px]"
          :disabled="isSubmitting"
      >
        {{ isSubmitting ? '设置中...' : '设置' }}
      </button>
    </div>
  </div>
</template>
