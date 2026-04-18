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
  <div :class="['fixed inset-0 pointer-events-none z-0 transition-colors duration-300', themeStore.isDarkMode ? 'bg-[#111113]' : 'bg-[#F4F4F6]']">
    <!-- Tier Lite: radial gradients (zero GPU cost) — más tintado en light para dar
         atmósfera a cards blancas que sin blur se perderían. -->
    <div
      v-if="perfStore.isLite"
      :class="[
        'absolute inset-0',
        themeStore.isDarkMode
          ? 'bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(86,27,175,0.15)_0%,transparent_50%)]'
          : 'bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.22)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(86,27,175,0.14)_0%,transparent_55%)]'
      ]"
    />
    <template v-else>
      <!-- Blobs sin transition-colors: el blur-140px + alpha change genera paint muy costosa
           durante 500ms. Cambio instantáneo en theme toggle; la transición del wrapper ya
           da la sensación de crossfade suficiente. -->
      <div
        :class="['prism-blob-a absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full', themeStore.isDarkMode ? 'bg-[#7C3AED]/22' : 'bg-[#7C3AED]/20']"
        :style="{ filter: `blur(${glowA})` }"
      />
      <div
        :class="['prism-blob-b absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full', themeStore.isDarkMode ? 'bg-[#561BAF]/30' : 'bg-[#561BAF]/15']"
        :style="{ filter: `blur(${glowB})` }"
      />
    </template>
  </div>
</template>
