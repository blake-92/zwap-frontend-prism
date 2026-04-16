<script setup>
import { useThemeStore } from '~/stores/theme'

defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  wrapperClass: { type: String, default: 'p-6' },
})

const themeStore = useThemeStore()
</script>

<template>
  <div :class="['border-b flex justify-between items-center', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5', wrapperClass]">
    <div>
      <h3 :class="['font-bold text-lg tracking-tight flex items-center gap-2', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
        <slot name="title">{{ title }}</slot>
      </h3>
      <p v-if="description" :class="['text-xs font-medium mt-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.default" class="shrink-0">
      <slot />
    </div>
  </div>
</template>
