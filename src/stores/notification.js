import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const message = ref('')
  const show = ref(false)
  const type = ref('info') // 'success', 'info', 'warning', 'error'

  function showNotification(notificationMessage, notificationType = 'info', duration = 10*1000) {
    message.value = notificationMessage
    type.value = notificationType
    show.value = true

    if (duration > 0) {
      setTimeout(() => {
        closeNotification()
      }, duration)
    }
  }

  function closeNotification() {
    show.value = false
    message.value = ''
  }

  return {
    message,
    show,
    type,
    showNotification,
    closeNotification
  }
})
