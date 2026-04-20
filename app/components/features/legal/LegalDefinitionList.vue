<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'

defineProps({
  items: {
    type: Array,
    required: true,
    // [{ term: '"Zwap"', definition: 'La pasarela...' }, ...]
  },
})

const themeStore = useThemeStore()

const termColor = computed(() =>
  themeStore.isDarkMode ? 'text-white' : 'text-[#111113]',
)
const defColor = computed(() =>
  themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
)
</script>

<template>
  <dl class="my-4">
    <template v-for="(item, i) in items" :key="i">
      <dt
        :class="['font-bold text-[14px] flex items-center gap-2 mt-3.5', termColor]"
      >
        <span class="inline-block w-1.5 h-1.5 rounded-sm bg-[#7C3AED] flex-shrink-0" />
        <span v-html="item.term" />
      </dt>
      <dd
        :class="['text-[14px] leading-[1.65] ml-5 mb-1.5', defColor]"
      >
        <span v-html="item.definition" />
      </dd>
    </template>
  </dl>
</template>
