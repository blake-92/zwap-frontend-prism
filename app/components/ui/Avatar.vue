<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  initials: { type: String, required: true },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'purple' },
  glow: { type: Boolean, default: false },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const sizeClass = computed(() => (props.size === 'sm' ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'))

const variantClass = computed(() => {
  const d = themeStore.isDarkMode
  const isLite = perfStore.isLite
  if (props.variant === 'neutral') {
    return d
      ? 'bg-[#252429] border border-white/15 text-[#D8D7D9]'
      : 'bg-white border border-black/10 text-[#45434A] shadow-xs'
  }
  if (d) {
    const glowShadow = props.glow
      ? (perfStore.useNeon ? ' group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]' : ' group-hover:shadow-md')
      : ''
    return `bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30${glowShadow}`
  }
  // Light default: en Lite bg full-alpha + borde primary-light visible (no border-white invisible)
  if (isLite) return 'bg-[#DBD3FB] border border-[#A78BFA]/40 text-[#561BAF] shadow-xs'
  return 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-xs'
})
</script>

<template>
  <div :class="[sizeClass, 'rounded-full flex items-center justify-center font-bold shrink-0 transition-colors', variantClass]">
    {{ initials }}
  </div>
</template>
