import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useErrorStore = defineStore('error', () => {
  const message = ref('')
  const show = ref(false)

  function showError(errorMessage, duration = 10*1000) {
    message.value = errorMessage
    show.value = true

    if (duration > 0) {
      setTimeout(() => {
        closeError()
      }, duration)
    }
  }

  function closeError() {
    show.value = false
    message.value = ''
  }

  return {
    message,
    show,
    showError,
    closeError
  }
})
