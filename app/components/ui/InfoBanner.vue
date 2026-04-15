<script setup>
import { computed } from 'vue'
import { AlertCircle, Info, AlertOctagon } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  variant: { type: String, default: 'warning' },
})

const themeStore = useThemeStore()

const VARIANTS = {
  warning: { icon: AlertCircle, onDark: 'bg-amber-500/10 border-amber-500/20 text-amber-200', onLight: 'bg-amber-50 border-amber-200 text-amber-800' },
  info: { icon: Info, onDark: 'bg-blue-500/10 border-blue-500/20 text-blue-200', onLight: 'bg-blue-50 border-blue-200 text-blue-800' },
  danger: { icon: AlertOctagon, onDark: 'bg-rose-500/10 border-rose-500/20 text-rose-200', onLight: 'bg-rose-50 border-rose-200 text-rose-800' },
}

const v = computed(() => VARIANTS[props.variant] || VARIANTS.warning)
const bannerClass = computed(() => (themeStore.isDarkMode ? v.value.onDark : v.value.onLight))
</script>

<template>
  <div :class="['p-4 rounded-xl border flex items-start gap-3', bannerClass]">
    <component :is="v.icon" :size="16" class="mt-0.5 flex-shrink-0" />
    <p class="text-xs font-medium leading-relaxed"><slot /></p>
  </div>
</template>
