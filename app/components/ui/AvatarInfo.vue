<script setup>
import { User } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import Avatar from './Avatar.vue'

defineProps({
  initials: { type: String, default: null },
  primary: { type: String, required: true },
  secondary: { type: String, default: '' },
  meta: { type: String, default: '' },
  glow: { type: Boolean, default: false },
})

const themeStore = useThemeStore()
</script>

<template>
  <div class="flex items-center gap-3 min-w-0">
    <Avatar v-if="initials" :initials="initials" :glow="glow" />
    <div
      v-else
      :class="[
        'w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed shrink-0',
        themeStore.isDarkMode ? 'bg-[#111113]/50 border-white/20 text-[#888991]' : 'bg-gray-50 border-gray-300 text-gray-400',
      ]"
    >
      <User :size="16" />
    </div>
    <div class="min-w-0">
      <p :class="['font-bold text-sm truncate', themeStore.isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]']">
        {{ primary }}
        <span v-if="meta" class="font-mono text-[10px] text-[#888991] ml-1">({{ meta }})</span>
      </p>
      <p v-if="secondary" :class="['text-xs mt-0.5 font-medium truncate', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ secondary }}
      </p>
    </div>
  </div>
</template>
