<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import Card from './Card.vue'
import Badge from './Badge.vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  iconVariant: { type: String, default: 'default' },
  badge: { type: String, default: '' },
  badgeVariant: { type: String, default: undefined },
  badgeSuffix: { type: String, default: '' },
  negative: { type: Boolean, default: false },
  layout: { type: String, default: 'kpi' },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const iconBubbleClass = computed(() => {
  const d = themeStore.isDarkMode
  const neon = perfStore.useNeon
  const glow = (color) => (d && neon ? ` group-hover:shadow-[0_0_15px_rgba(${color},0.3)]` : ' group-hover:shadow-md')
  const map = {
    default: d ? `bg-[#7C3AED]/15 text-[#7C3AED]${glow('124,58,237')}` : 'bg-[#DBD3FB]/60 text-[#561BAF] group-hover:shadow-md',
    success: d ? `bg-emerald-500/15 text-emerald-500${glow('16,185,129')}` : 'bg-emerald-100 text-emerald-600 group-hover:shadow-md',
    warning: d ? `bg-amber-500/15 text-amber-500${glow('245,158,11')}` : 'bg-amber-100 text-amber-600 group-hover:shadow-md',
    danger: d ? `bg-rose-500/15 text-rose-500${glow('244,63,94')}` : 'bg-rose-100 text-rose-600 group-hover:shadow-md',
  }
  return map[props.iconVariant]
})

const valueClass = computed(() => {
  if (props.negative) return themeStore.isDarkMode ? 'text-rose-500' : 'text-rose-600'
  return themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'
})

const labelKpiClass = computed(() =>
  themeStore.isDarkMode ? 'text-[#B0AFB4] group-hover:text-white' : 'text-[#67656E] group-hover:text-[#111113]',
)
const labelBalanceClass = computed(() =>
  themeStore.isDarkMode ? 'text-[#888991] group-hover:text-[#D8D7D9]' : 'text-[#67656E] group-hover:text-[#111113]',
)
</script>

<template>
  <Card hover-effect class="p-6 cursor-pointer group">
    <template v-if="layout === 'balance'">
      <div class="flex justify-between items-start mb-4">
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300', iconBubbleClass]">
          <component :is="icon" :size="20" />
        </div>
        <Badge v-if="badge" :variant="badgeVariant">{{ badge }}</Badge>
      </div>
      <p :class="['text-sm font-semibold mb-1 transition-colors', labelBalanceClass]">{{ label }}</p>
      <h3 :class="['text-3xl font-mono font-bold tracking-tight', valueClass]">{{ value }}</h3>
    </template>

    <template v-else>
      <div class="flex justify-between items-start mb-6">
        <span :class="['text-sm font-semibold transition-colors', labelKpiClass]">{{ label }}</span>
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300', iconBubbleClass]">
          <component :is="icon" :size="20" />
        </div>
      </div>
      <h3 :class="['text-3xl font-mono font-bold tracking-tight', valueClass]">{{ value }}</h3>
      <div v-if="badge || badgeSuffix" class="mt-4 flex items-center gap-2">
        <Badge v-if="badge" :variant="badgeVariant">{{ badge }}</Badge>
        <span v-if="badgeSuffix" class="text-xs font-medium text-[#888991]">{{ badgeSuffix }}</span>
      </div>
    </template>
  </Card>
</template>
