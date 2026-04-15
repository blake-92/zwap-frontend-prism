<script setup>
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  steps: { type: Array, required: true },
})
const themeStore = useThemeStore()

const connectorColor = (i) => {
  if (props.steps[i].done) return 'bg-emerald-500/70'
  if (props.steps[i].active) return 'bg-[#7C3AED]/60'
  return themeStore.isDarkMode ? 'bg-white/10' : 'bg-gray-200'
}

const circleClass = (step) => {
  if (step.done) return 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
  if (step.active) return 'bg-[#7C3AED] text-white shadow-[0_0_20px_rgba(124,58,237,0.7)] outline outline-4 outline-[#7C3AED]/20'
  return themeStore.isDarkMode
    ? 'bg-[#252429] border border-white/10 text-[#45434A]'
    : 'bg-gray-100 border border-gray-200 text-gray-400'
}

const labelClass = (step) => {
  if (step.done) return 'text-emerald-500'
  if (step.active) return themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'
  return themeStore.isDarkMode ? 'text-[#45434A]' : 'text-[#B0AFB4]'
}

const subClass = (step) => {
  if (step.done) return themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
  if (step.active) return themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'
  return themeStore.isDarkMode ? 'text-[#45434A]/60' : 'text-[#B0AFB4]/60'
}
</script>

<template>
  <div class="flex items-start w-full">
    <div v-for="(step, i) in steps" :key="step.label" class="flex items-start flex-1 min-w-0">
      <div class="flex flex-col items-center flex-1 min-w-0">
        <div class="flex items-center w-full mb-3">
          <div v-if="i > 0" :class="['flex-1 h-0.5 transition-colors', connectorColor(i - 1)]" />
          <div :class="['w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300', circleClass(step)]">
            <component :is="step.icon" :size="14" :class="step.active ? 'animate-spin-slow' : ''" />
          </div>
          <div v-if="i !== steps.length - 1" :class="['flex-1 h-0.5 transition-colors', connectorColor(i)]" />
        </div>
        <div class="text-center px-0.5">
          <p :class="['text-[10px] font-bold leading-tight uppercase tracking-wide', labelClass(step)]">
            {{ step.label }}
          </p>
          <p :class="['text-[9px] font-medium mt-0.5', subClass(step)]">
            {{ step.sub }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
