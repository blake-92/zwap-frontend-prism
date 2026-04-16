<script setup>
import { useThemeStore } from '~/stores/theme'
import { usePerformanceMode } from '~/composables/usePerformanceMode'
const themeStore = useThemeStore()
const performanceMode = usePerformanceMode()
</script>

<template>
  <div :class="['fixed inset-0 pointer-events-none z-0 transition-colors duration-500', themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-[#F4F4F6]']">
    <div :class="[
      'absolute top-[-10%] left-[-10%] rounded-full transition-colors duration-500',
      performanceMode ? 'w-[38%] h-[38%] blur-[64px]' : 'w-[55%] h-[55%] blur-[140px]',
      themeStore.isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#7C3AED]/20'
    ]" />
    <div
      v-if="!performanceMode"
      :class="['absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] transition-colors duration-500', themeStore.isDarkMode ? 'bg-[#300C67]/40' : 'bg-[#561BAF]/15']"
    />
  </div>
</template>
