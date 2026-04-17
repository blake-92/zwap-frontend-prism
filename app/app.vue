<script setup>
import { useThemeStore } from '~/stores/theme'
const themeStore = useThemeStore()
</script>

<template>
  <div :class="['min-h-screen font-sans', themeStore.isDarkMode ? 'bg-[#252429]' : 'bg-white']">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
