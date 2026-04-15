<script setup>
import { computed, useId } from 'vue'
import { motion } from 'motion-v'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: [String, Number], required: true },
  layoutId: { type: String, default: undefined },
})
const emit = defineEmits(['update:modelValue'])

const themeStore = useThemeStore()
const autoId = useId()
const lid = computed(() => props.layoutId ?? `segment-${autoId}`)

const wrapperClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-black/60 border border-white/5'
    : 'bg-gray-200/50 border border-black/5',
)

const pillClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429] border border-white/10 shadow-[0_4px_15px_rgba(124,58,237,0.2)]'
    : 'bg-white border border-[#7C3AED]/20 shadow-md',
)

const textClass = (active) => {
  const d = themeStore.isDarkMode
  if (active) return d ? 'text-white' : 'text-[#7C3AED]'
  return d ? 'text-[#888991] hover:text-[#D8D7D9]' : 'text-[#67656E] hover:text-[#111113]'
}
</script>

<template>
  <div role="tablist" :class="['flex rounded-xl p-1.5 shadow-inner', wrapperClass]">
    <button
      v-for="opt in options"
      :key="opt.value"
      role="tab"
      :aria-selected="modelValue === opt.value"
      :class="['relative flex-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-300', textClass(modelValue === opt.value)]"
      @click="emit('update:modelValue', opt.value)"
    >
      <motion.div
        v-if="modelValue === opt.value"
        :layout-id="lid"
        :class="['absolute inset-0 rounded-lg', pillClass]"
        :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
      />
      <span class="relative z-10">{{ opt.label }}</span>
    </button>
  </div>
</template>
