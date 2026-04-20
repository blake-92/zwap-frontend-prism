<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  variant: {
    type: String,
    default: 'purple',
    validator: (v) => ['purple', 'warning', 'dark'].includes(v),
  },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const classes = computed(() => {
  const d = themeStore.isDarkMode
  const useBlur = perfStore.useBlur
  if (props.variant === 'warning') {
    return d
      ? 'bg-amber-500/10 border-amber-500/25 text-amber-100'
      : 'bg-amber-50 border-amber-200 text-amber-900'
  }
  if (props.variant === 'dark') {
    // Dark callout — legal identity: surface oscura con rim
    return d
      ? 'bg-[#0F0F11] border-[#7C3AED]/30 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
      : 'bg-[#111113] border-[#7C3AED]/35 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
  }
  // purple
  if (d) {
    return useBlur
      ? 'bg-[#7C3AED]/10 backdrop-blur-md border-[#7C3AED]/25 text-[#D8D7D9]'
      : 'bg-[#7C3AED]/12 border-[#7C3AED]/30 text-[#D8D7D9]'
  }
  return useBlur
    ? 'bg-[#7C3AED]/8 backdrop-blur-md border-[#DBD3FB] text-[#45434A]'
    : 'bg-[#F0ECFF] border-[#DBD3FB] text-[#45434A]'
})

const strongClass = computed(() => {
  if (props.variant === 'warning') {
    return themeStore.isDarkMode ? 'text-amber-300 font-bold' : 'text-[#C44536] font-bold'
  }
  if (props.variant === 'dark') return 'text-white font-bold'
  return themeStore.isDarkMode ? 'text-[#A78BFA] font-bold' : 'text-[#7C3AED] font-bold'
})
</script>

<template>
  <div
    :class="[
      'rounded-xl border px-5 py-4 my-4 text-sm leading-relaxed',
      classes,
    ]"
  >
    <div class="legal-callout-content">
      <slot :strong-class="strongClass" />
    </div>
  </div>
</template>

<style scoped>
.legal-callout-content :deep(strong) {
  font-weight: 700;
}
</style>
