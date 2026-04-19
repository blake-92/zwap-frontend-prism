<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  title: { type: String, default: undefined },
})

defineOptions({ inheritAttrs: true })

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const SIZES = {
  default: 'px-5 py-2.5 text-sm',
  sm: 'px-4 py-2 text-xs',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2 w-10 h-10',
}

const variantClass = computed(() => {
  const d = themeStore.isDarkMode
  const neon = perfStore.useNeon
  const isLite = perfStore.isLite
  // Shadow del botón default (morado): neon en full, shadow-lg neutro en normal/lite/minimal
  const defaultShadow = neon
    ? (d ? 'shadow-[0_8px_30px_rgba(124,58,237,0.4)]' : 'shadow-[0_8px_25px_rgba(124,58,237,0.3)]')
    : 'shadow-lg'
  // Shimmer sweep sutil que cruza el botón cada 8s — solo Prism (useGlassElevation === tier === 'full')
  const shimmer = perfStore.useGlassElevation ? ' prism-button-shimmer' : ''
  // Outline/successExport en Lite light: fondo tintado + borde lavanda (sin depender de blur)
  const outlineLight = isLite
    ? 'bg-[#F8F7FB] border border-[#DBD3FB] text-[#45434A] hover:bg-white active:bg-[#EEECF2] shadow-xs'
    : 'bg-white/60 border border-white text-[#45434A] hover:bg-white active:bg-gray-100 shadow-xs'
  const successExportLight = isLite
    ? 'bg-[#F8F7FB] border border-[#DBD3FB] text-[#45434A] hover:bg-emerald-50 active:bg-emerald-100 hover:text-emerald-600 hover:border-emerald-200 shadow-xs'
    : 'bg-white/60 border border-white text-[#45434A] hover:bg-emerald-50 active:bg-emerald-100 hover:text-emerald-600 hover:border-emerald-200 shadow-xs'
  const v = {
    default: d
      ? `bg-[#7C3AED] hover:bg-[#561BAF] active:bg-[#4C1599] text-white ${defaultShadow} border border-[#7C3AED]/60 border-t-[#B9A4F8]/50${shimmer}`
      : `bg-[#7C3AED] hover:bg-[#561BAF] active:bg-[#4C1599] text-white ${defaultShadow} border border-[#7C3AED]/30 border-t-white/50${shimmer}`,
    outline: d
      ? 'bg-transparent border border-white/10 text-[#D8D7D9] hover:bg-white/5 active:bg-white/10'
      : outlineLight,
    ghost: d
      ? 'bg-transparent hover:bg-white/10 active:bg-white/15 text-[#888991] hover:text-white border border-transparent'
      : 'bg-transparent hover:bg-black/5 active:bg-black/10 text-[#67656E] hover:text-[#111113] border border-transparent',
    action: d
      ? 'text-[#B9A4F8] bg-[#7C3AED]/10 border border-[#7C3AED]/20 hover:bg-[#7C3AED]/30 active:bg-[#7C3AED]/40 hover:border-[#7C3AED]/50'
      : 'text-[#7C3AED] bg-[#DBD3FB]/50 border border-[#DBD3FB] hover:bg-[#DBD3FB] active:bg-[#CEC3F5] hover:text-[#561BAF]',
    danger: d
      ? 'text-[#888991] bg-transparent border border-white/10 hover:bg-rose-500/20 active:bg-rose-500/30 hover:text-rose-400 hover:border-rose-500/40'
      : 'text-[#67656E] bg-white border border-gray-200 hover:bg-rose-50 active:bg-rose-100 hover:text-rose-600 hover:border-rose-200',
    successExport: d
      ? 'bg-transparent border border-white/10 text-[#D8D7D9] hover:bg-emerald-500/15 active:bg-emerald-500/25 hover:text-emerald-400 hover:border-emerald-500/30'
      : successExportLight,
  }
  return v[props.variant]
})

const whileTap = computed(() => (props.disabled ? undefined : { scale: 0.94 }))
</script>

<template>
  <motion.button
    :type="type"
    :title="title"
    :disabled="disabled"
    :while-tap="whileTap"
    :transition="{ type: 'spring', stiffness: 500, damping: 30 }"
    :class="[
      'inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 outline-hidden rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
      SIZES[size],
      variantClass,
    ]"
  >
    <slot />
  </motion.button>
</template>
