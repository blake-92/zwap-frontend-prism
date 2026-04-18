<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  variant: { type: String, default: 'default' },
  icon: { type: [Object, Function], default: null },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const variantClass = computed(() => {
  const d = themeStore.isDarkMode
  const isLite = perfStore.isLite
  // outline en Lite light: necesita borde visible (no border-white invisible)
  const outlineLight = isLite ? 'bg-white border-[#DBD3FB] text-[#45434A]' : 'bg-white/80 border-white text-[#45434A]'
  return {
    default: d ? 'bg-[#7C3AED]/15 text-[#B9A4F8] border-[#7C3AED]/30' : 'bg-[#DBD3FB]/60 text-[#561BAF] border-[#DBD3FB]',
    success: d ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
    warning: d ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200',
    danger: d ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-200',
    outline: d ? 'bg-[#111113]/50 border-white/10 text-[#D8D7D9]' : outlineLight,
  }[props.variant]
})

// Badges aparecen 30+ veces en tablas. backdrop-blur-md por badge = 30+ composite layers.
// Solo aplicar blur si useBlur (Prism/Normal). En Lite: surface plana, shadow-xs.
const blurClass = computed(() => perfStore.useBlur ? 'backdrop-blur-md shadow-xs' : 'shadow-xs')
</script>

<template>
  <span :class="['px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1.5 border', blurClass, variantClass]">
    <component :is="icon" v-if="icon" :size="12" :stroke-width="3" />
    <slot />
  </span>
</template>
