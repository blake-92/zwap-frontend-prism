<script setup>
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  steps: { type: Array, required: true },
  // A11y opcional — cuando se pasa, el Stepper se anuncia como `role="list"` con cada step
  // como `<li>` y aria-current="step" en el activo. Para wizards multistep (KYB, etc.) es
  // requisito WCAG. Default false mantiene compat con WalletView que solo usa el Stepper
  // como decoración visual y ya tiene el a11y resuelto en su propio header.
  ariaList: { type: Boolean, default: false },
  // Opcional — i18n key con `{n}` y `{label}` para construir aria-label de cada step.
  // Ej: `"Paso {n}: {label}"`. Si no se pasa usa el step.label como aria-label.
  stepLabelTemplate: { type: String, default: null },
})
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

function ariaLabelFor(step, i) {
  if (!props.stepLabelTemplate) return step.label
  return props.stepLabelTemplate.replace('{n}', String(i + 1)).replace('{label}', step.label)
}

const connectorColor = (i) => {
  if (props.steps[i].done) return 'bg-emerald-500/70'
  if (props.steps[i].active) return 'bg-[#7C3AED]/60'
  return themeStore.isDarkMode ? 'bg-white/10' : 'bg-gray-200'
}

const circleClass = (step) => {
  const neon = perfStore.useNeon
  if (step.done) return `bg-emerald-500 text-white${neon ? ' shadow-[0_0_12px_rgba(16,185,129,0.5)]' : ' shadow-md'}`
  if (step.active) {
    // Outline + neon halo son un pair visual: en Prism el glow suaviza el outline.
    // Sin glow (Normal/Lite) el outline púrpura/20 queda flotando sobre fondo oscuro
    // y se percibe como aro grisáceo. Solo aplicamos outline cuando hay neon.
    return neon
      ? 'bg-[#7C3AED] text-white outline outline-4 outline-[#7C3AED]/20 shadow-[0_0_20px_rgba(124,58,237,0.7)]'
      : 'bg-[#7C3AED] text-white shadow-md'
  }
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
  <component
    :is="ariaList ? 'ol' : 'div'"
    class="flex items-start w-full"
    :role="ariaList ? 'list' : undefined"
  >
    <component
      :is="ariaList ? 'li' : 'div'"
      v-for="(step, i) in steps"
      :key="step.label"
      class="flex items-start flex-1 min-w-0"
      :aria-current="ariaList && step.active ? 'step' : undefined"
      :aria-label="ariaList ? ariaLabelFor(step, i) : undefined"
    >
      <div class="flex flex-col items-center flex-1 min-w-0">
        <div class="flex items-center w-full mb-3">
          <div v-if="i > 0" :class="['flex-1 h-0.5 transition-colors', connectorColor(i - 1)]" :aria-hidden="ariaList ? 'true' : undefined" />
          <div :class="['w-8 h-8 shrink-0 flex items-center justify-center rounded-full transition-colors duration-300', circleClass(step)]">
            <component :is="step.icon" :size="14" :class="step.active && perfStore.useContinuousAnim ? 'animate-spin-slow' : ''" />
          </div>
          <div v-if="i !== steps.length - 1" :class="['flex-1 h-0.5 transition-colors', connectorColor(i)]" :aria-hidden="ariaList ? 'true' : undefined" />
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
    </component>
  </component>
</template>
