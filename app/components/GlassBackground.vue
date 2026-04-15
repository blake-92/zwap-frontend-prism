<script setup>
import { useThemeStore } from '~/stores/theme'
const themeStore = useThemeStore()
</script>

<template>
  <div :class="['fixed inset-0 pointer-events-none z-0 transition-colors duration-500', themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-[#F4F4F6]']">
    <div :class="['absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full blur-[140px] transition-colors duration-500', themeStore.isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#7C3AED]/20']" />
    <div :class="['absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] transition-colors duration-500', themeStore.isDarkMode ? 'bg-[#300C67]/40' : 'bg-[#561BAF]/15']" />
  </div>
</template>
