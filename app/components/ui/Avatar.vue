<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  initials: { type: String, required: true },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'purple' },
  glow: { type: Boolean, default: false },
})

const themeStore = useThemeStore()

const sizeClass = computed(() => (props.size === 'sm' ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'))

const variantClass = computed(() => {
  const d = themeStore.isDarkMode
  if (props.variant === 'neutral') {
    return d
      ? 'bg-[#252429] border border-white/15 text-[#D8D7D9]'
      : 'bg-white border border-black/10 text-[#45434A] shadow-sm'
  }
  if (d) {
    return `bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30${props.glow ? ' group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]' : ''}`
  }
  return 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-sm'
})
</script>

<template>
  <div :class="[sizeClass, 'rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-all', variantClass]">
    {{ initials }}
  </div>
</template>
