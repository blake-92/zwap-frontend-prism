<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])

const themeStore = useThemeStore()

const btnClass = computed(() => {
  const d = themeStore.isDarkMode
  if (props.active) {
    return d
      ? 'bg-[#7C3AED] border border-[#7C3AED]/50 shadow-[0_0_12px_rgba(124,58,237,0.4)]'
      : 'bg-[#7C3AED] border border-[#7C3AED]/30'
  }
  return d
    ? 'bg-[#252429] border border-white/10'
    : 'bg-gray-200 border border-gray-300'
})

const handle = () => { if (!props.disabled) emit('toggle') }
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="active"
    :disabled="disabled"
    :class="[
      'w-10 h-5 rounded-full p-0.5 flex items-center outline-hidden transition-colors duration-300',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      btnClass,
    ]"
    @click="handle"
  >
    <motion.div
      class="w-4 h-4 rounded-full bg-white shadow-xs"
      :animate="{ x: active ? 20 : 0 }"
      :transition="{ type: 'spring', stiffness: 500, damping: 30 }"
    />
  </button>
</template>
