<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

// Radio de blur por tier — preserva identidad con costo decreciente.
const glowA = computed(() => ({ full: '140px', normal: '100px', lite: '60px' }[perfStore.tier] || '140px'))
const glowB = computed(() => ({ full: '120px', normal: '80px', lite: '50px' }[perfStore.tier] || '120px'))

// Parallax drift muy sutil solo en Prism vía classes prism-blob-a/b
// (CSS decide si animar según html.perf-full)
</script>

<template>
  <div :class="['fixed inset-0 pointer-events-none z-0 transition-colors duration-500', themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-[#F4F4F6]']">
    <!-- Blob A (top-left): primary purple — light source superior -->
    <div
      :class="['prism-blob-a absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full transition-colors duration-500', themeStore.isDarkMode ? 'bg-[#7C3AED]/22' : 'bg-[#7C3AED]/20']"
      :style="{ filter: `blur(${glowA})` }"
    />
    <!-- Blob B (bottom-right): primary-darker — depth accent, mismo family púrpura -->
    <div
      :class="['prism-blob-b absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full transition-colors duration-500', themeStore.isDarkMode ? 'bg-[#561BAF]/30' : 'bg-[#561BAF]/15']"
      :style="{ filter: `blur(${glowB})` }"
    />
  </div>
</template>
