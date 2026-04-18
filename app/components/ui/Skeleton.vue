<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  width: { type: [String, Number], default: '100%' },
  height: { type: [String, Number], default: '1rem' },
  rounded: { type: String, default: 'rounded-lg' },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const wrapperStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

const shimmerStyle = computed(() => ({
  background: themeStore.isDarkMode
    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)'
    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
}))
</script>

<template>
  <div
    v-if="perfStore.isLite"
    :style="wrapperStyle"
    :class="[
      'animate-pulse overflow-hidden',
      rounded,
      themeStore.isDarkMode ? 'bg-[#252429] border border-white/5' : 'bg-gray-200 border border-black/5',
    ]"
  />
  <motion.div
    v-else
    :initial="{ opacity: 0.5 }"
    :animate="{ opacity: 1 }"
    :transition="{ repeat: Infinity, duration: 1.5, repeatType: 'reverse', ease: 'easeInOut' }"
    :style="wrapperStyle"
    :class="[
      'relative overflow-hidden',
      rounded,
      themeStore.isDarkMode ? 'bg-[#252429] border border-white/5' : 'bg-gray-200 border border-black/5',
    ]"
  >
    <motion.div
      :animate="{ x: ['-100%', '200%'] }"
      :transition="{ repeat: Infinity, duration: 1.5, ease: 'linear' }"
      class="absolute inset-0 z-10"
      :style="shimmerStyle"
    />
  </motion.div>
</template>
