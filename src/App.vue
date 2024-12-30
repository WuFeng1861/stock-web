<template>
  <div>
    <router-view></router-view>
    <ErrorNotification />
    <Notification />
  </div>
</template>

<script setup>
import ErrorNotification from './components/ErrorNotification.vue'
import Notification from './components/Notification.vue'
</script>
