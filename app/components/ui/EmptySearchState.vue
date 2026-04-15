<script setup>
import { SearchX } from 'lucide-vue-next'
import { motion } from 'motion-v'
import { useThemeStore } from '~/stores/theme'
import { SPRING_SOFT as SPRING } from '~/utils/springs'
import Button from './Button.vue'

defineProps({
  colSpan: { type: Number, required: true },
  term: { type: String, default: '' },
})

const emit = defineEmits(['clear'])
const themeStore = useThemeStore()
const { t } = useI18n()
</script>

<template>
  <tr>
    <td :colspan="colSpan" class="px-8 py-16 text-center">
      <motion.div
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="SPRING"
        class="flex flex-col items-center justify-center"
      >
        <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center mb-4', themeStore.isDarkMode ? 'bg-[#111113]/50 border border-white/10 text-[#888991]' : 'bg-gray-50 border border-gray-200 text-[#B0AFB4]']">
          <SearchX :size="32" :stroke-width="1.5" />
        </div>
        <h3 :class="['text-lg font-bold mb-2 tracking-tight', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          {{ t('errors.noResults') }}
        </h3>
        <p :class="['text-sm font-medium max-w-[300px] mx-auto mb-6', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ t('errors.noResultsFor', { term }) }}
        </p>
        <Button variant="outline" @click="emit('clear')">
          {{ t('common.clearSearch') }}
        </Button>
      </motion.div>
    </td>
  </tr>
</template>
