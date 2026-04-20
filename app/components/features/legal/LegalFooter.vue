<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { ArrowUp } from 'lucide-vue-next'
import { usePerformanceStore } from '~/stores/performance'
import { SPRING } from '~/utils/springs'

defineProps({
  entity: { type: String, required: true },
  copyright: { type: String, required: true },
  backToTopLabel: { type: String, required: true },
})

const perfStore = usePerformanceStore()

const scrollToTop = () => {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, behavior: perfStore.isLite ? 'auto' : 'smooth' })
}

const tapTransition = computed(() => (perfStore.useSpring ? SPRING : { duration: 0.15 }))
</script>

<template>
  <footer class="bg-[#111113] text-white/55 px-5 sm:px-8 py-10 text-center text-[13px] leading-[1.75]">
    <p v-html="entity" />
    <p class="mt-1">{{ copyright }}</p>
    <motion.button
      type="button"
      :while-tap="perfStore.useSpring ? { scale: 0.96 } : undefined"
      :transition="tapTransition"
      class="inline-flex items-center gap-1.5 mt-4 px-5 py-2 text-[12px] font-semibold text-[#A78BFA] border border-[#7C3AED]/35 rounded-full hover:bg-[#7C3AED]/12 transition-colors cursor-pointer"
      @click="scrollToTop"
    >
      <ArrowUp :size="14" />
      {{ backToTopLabel }}
    </motion.button>
  </footer>
</template>
