<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const classes = computed(() => {
  const d = themeStore.isDarkMode
  const useBlur = perfStore.useBlur
  if (d) {
    return useBlur
      ? 'bg-[#7C3AED]/10 backdrop-blur-md border-[#7C3AED]/25 text-[#D8D7D9]'
      : 'bg-[#7C3AED]/12 border-[#7C3AED]/30 text-[#D8D7D9]'
  }
  return useBlur
    ? 'bg-[#7C3AED]/8 backdrop-blur-md border-[#DBD3FB] text-[#45434A]'
    : 'bg-[#F0ECFF] border-[#DBD3FB] text-[#45434A]'
})
</script>

<template>
  <div
    :class="[
      'rounded-xl border px-6 py-5 mb-12 text-sm leading-relaxed',
      classes,
    ]"
  >
    <slot />
  </div>
</template>
