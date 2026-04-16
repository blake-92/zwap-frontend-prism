<script setup>
import { computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Buscar...' },
  wrapperClass: { type: String, default: 'w-full sm:w-72' },
})
const emit = defineEmits(['update:modelValue'])

const themeStore = useThemeStore()

const containerClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#111113]/50 border border-white/5 focus-within:border-[#7C3AED]/40'
    : 'bg-white/60 border border-white focus-within:border-[#7C3AED]/30',
)

const inputClass = computed(() =>
  themeStore.isDarkMode
    ? 'text-[#D8D7D9] placeholder:text-[#888991]'
    : 'text-[#111113] placeholder:text-[#B0AFB4]',
)

const ariaLabel = computed(() => props.placeholder.replace('...', '').trim())
</script>

<template>
  <div :class="['flex items-center px-4 py-2 rounded-xl transition-all', containerClass, wrapperClass]">
    <Search :size="14" :class="['shrink-0', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']" />
    <input
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      :aria-label="ariaLabel"
      :class="['bg-transparent border-none outline-hidden text-xs ml-2 w-full font-medium', inputClass]"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
