<script setup>
import { computed, useId } from 'vue'
import { motion } from 'motion-v'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: [String, Number], required: true },
  layoutId: { type: String, default: undefined },
})
const emit = defineEmits(['update:modelValue'])

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const autoId = useId()
// En Lite el pill no se desliza — aparece instantáneo en la opción activa
const lid = computed(() => perfStore.useNavMorphs ? (props.layoutId ?? `segment-${autoId}`) : undefined)
const haloLid = computed(() => perfStore.useNavMorphs ? `segment-halo-${autoId}` : undefined)

const wrapperClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-black/60 border border-white/5'
    : 'bg-gray-200/50 border border-black/5',
)

const pillClass = computed(() => {
  const neon = perfStore.useNeon
  if (themeStore.isDarkMode) {
    return `bg-[#252429] border border-white/10 ${neon ? 'shadow-[0_4px_15px_rgba(124,58,237,0.2)]' : 'shadow-md'}`
  }
  return 'bg-white border border-[#7C3AED]/20 shadow-md'
})

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
        v-if="modelValue === opt.value && perfStore.useActiveHalo"
        :layout-id="haloLid"
        class="absolute inset-0 rounded-lg bg-[#7C3AED]/20 blur-lg pointer-events-none"
        :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
        aria-hidden="true"
      />
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
