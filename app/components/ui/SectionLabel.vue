<script setup>
import { useThemeStore } from '~/stores/theme'
const themeStore = useThemeStore()
</script>

<template>
  <p :class="['text-xs font-bold tracking-widest', themeStore.isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]']">
    <slot />
  </p>
</template>
