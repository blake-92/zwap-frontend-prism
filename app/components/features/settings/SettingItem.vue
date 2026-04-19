<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'

defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  last: { type: Boolean, default: false },
})

const themeStore = useThemeStore()

const rowClass = computed(() => themeStore.isDarkMode ? 'border-white/5' : 'border-black/5')
const bubbleClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#7C3AED]/15 text-[#7C3AED]'
    : 'bg-[#DBD3FB]/50 text-[#561BAF]',
)
const titleClass = computed(() => themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]')
const descClass = computed(() => themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]')
</script>

<template>
  <div :class="['py-5 flex items-start sm:items-center justify-between gap-4', last ? '' : `border-b ${rowClass}`]">
    <div class="flex gap-4">
      <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0', bubbleClass]">
        <component :is="icon" :size="18" />
      </div>
      <div>
        <h4 :class="['text-sm font-bold', titleClass]">{{ title }}</h4>
        <p v-if="description" :class="['text-xs mt-0.5 font-medium', descClass]">{{ description }}</p>
      </div>
    </div>
    <div v-if="$slots.default" class="shrink-0">
      <slot />
    </div>
  </div>
</template>
