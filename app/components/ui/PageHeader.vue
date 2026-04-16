<script setup>
import { useThemeStore } from '~/stores/theme'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  wrapperClass: { type: String, default: 'mb-8' },
})

const themeStore = useThemeStore()
</script>

<template>
  <div :class="['hidden sm:flex sm:justify-between sm:items-end gap-4', wrapperClass]">
    <div>
      <h1 :class="['text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 tracking-tight', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
        {{ title }}
      </h1>
      <p v-if="description" :class="['text-xs sm:text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.default" class="shrink-0">
      <slot />
    </div>
  </div>
</template>
