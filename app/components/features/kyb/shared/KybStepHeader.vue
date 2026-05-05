<script setup>
import { motion } from 'motion-v'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT } from '~/utils/springs'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  // Step number 1-indexed para el sub-label "Paso N de M". Opcional — algunos screens
  // (start, review) no son steps numerados.
  step: { type: Number, default: null },
  total: { type: Number, default: null },
})

const themeStore = useThemeStore()
</script>

<template>
  <motion.header
    class="mb-6 sm:mb-8"
    :initial="{ opacity: 0, y: 8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="SPRING_SOFT"
  >
    <p
      v-if="step !== null && total !== null"
      :class="[
        'text-xs font-bold tracking-widest uppercase mb-2',
        themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]',
      ]"
    >
      {{ $t('kyb.wizard.stepOf', { current: step, total }) }}
    </p>
    <h1
      :class="[
        'text-2xl sm:text-3xl font-bold tracking-tight mb-2',
        themeStore.isDarkMode ? 'text-white' : 'text-[#111113]',
      ]"
    >
      {{ title }}
    </h1>
    <p
      v-if="description"
      :class="[
        'text-sm font-medium leading-relaxed max-w-2xl',
        themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
      ]"
    >
      {{ description }}
    </p>
  </motion.header>
</template>
