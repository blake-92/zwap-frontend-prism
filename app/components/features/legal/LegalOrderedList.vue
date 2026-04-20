<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'

defineProps({
  items: {
    type: Array,
    required: true,
    // Array of strings (may contain HTML)
  },
})

const themeStore = useThemeStore()

const itemColor = computed(() =>
  themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
)
</script>

<template>
  <ol class="legal-ol list-none p-0 my-3 space-y-0">
    <li
      v-for="(item, i) in items"
      :key="i"
      :class="['relative pl-8 py-1.5 text-[14px] leading-relaxed', itemColor]"
    >
      <span
        class="absolute left-0 top-1.5 font-bold text-[#7C3AED]"
      >
        {{ String.fromCharCode(97 + i) }})
      </span>
      <span v-html="item" />
    </li>
  </ol>
</template>

<style scoped>
.legal-ol :deep(strong) {
  font-weight: 700;
}
</style>
