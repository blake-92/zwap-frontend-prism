<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import Button from './Button.vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})
const emit = defineEmits(['pageChange'])

const themeStore = useThemeStore()
const { t } = useI18n()

const pages = computed(() => {
  const arr = []
  for (let i = 1; i <= props.totalPages; i++) {
    if (i === 1 || i === props.totalPages || (i >= props.currentPage - 1 && i <= props.currentPage + 1)) {
      arr.push(i)
    } else if (i === props.currentPage - 2 || i === props.currentPage + 2) {
      arr.push('...')
    }
  }
  return arr.filter((p, i, a) => p !== '...' || a[i - 1] !== '...')
})

const pageBtnClass = (p) => {
  const active = props.currentPage === p
  const d = themeStore.isDarkMode
  if (active) {
    return d
      ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
      : 'bg-[#DBD3FB]/60 text-[#561BAF] border border-[#7C3AED]/20 shadow-sm'
  }
  return d
    ? 'text-[#888991] hover:bg-white/5 hover:text-white'
    : 'text-[#67656E] hover:bg-gray-100 hover:text-[#111113]'
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    :aria-label="t('pagination.showingPage', { current: currentPage, total: totalPages })"
    :class="['flex items-center justify-between pt-4 border-t', themeStore.isDarkMode ? 'border-white/10' : 'border-gray-200']"
  >
    <span :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
      {{ t('pagination.showingPage', { current: currentPage, total: totalPages }) }}
    </span>
    <div class="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        :disabled="currentPage === 1"
        class="!h-8 !w-8"
        @click="emit('pageChange', Math.max(1, currentPage - 1))"
      >
        <ChevronLeft :size="14" />
      </Button>
      <template v-for="(p, idx) in pages" :key="p === '...' ? `e-${idx}` : p">
        <span
          v-if="p === '...'"
          :class="['px-2 text-xs font-bold', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']"
        >...</span>
        <button
          v-else
          :class="['h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center', pageBtnClass(p)]"
          @click="emit('pageChange', p)"
        >{{ p }}</button>
      </template>
      <Button
        variant="outline"
        size="icon"
        :disabled="currentPage === totalPages"
        class="!h-8 !w-8"
        @click="emit('pageChange', Math.min(totalPages, currentPage + 1))"
      >
        <ChevronRight :size="14" />
      </Button>
    </div>
  </nav>
</template>
