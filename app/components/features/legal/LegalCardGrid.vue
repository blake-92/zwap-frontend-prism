<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { getCardClasses } from '~/utils/cardClasses'

defineProps({
  items: {
    type: Array,
    required: true,
    // [{ label: 'Costo por Transacción', desc: '...', icon?: Component }]
  },
  minItemWidth: { type: String, default: '220px' },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

const cardCls = computed(() =>
  getCardClasses(
    themeStore.isDarkMode,
    false, // hover
    perfStore.useBlur,
    perfStore.useNeon,
    perfStore.useGlassElevation,
  ),
)

const labelColor = computed(() =>
  themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]',
)
const descColor = computed(() =>
  themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
)
</script>

<template>
  <div
    class="grid gap-3 my-4"
    :style="{ gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))` }"
  >
    <div
      v-for="(item, i) in items"
      :key="i"
      :class="[
        'rounded-lg px-4 py-4 border',
        cardCls.base,
      ]"
    >
      <div
        :class="[
          'text-[11.5px] font-bold uppercase tracking-[0.08em] mb-1',
          labelColor,
        ]"
      >
        {{ item.label }}
      </div>
      <div
        :class="[
          'text-[13.5px] leading-[1.6]',
          descColor,
        ]"
      >
        <span v-html="item.desc" />
      </div>
    </div>
  </div>
</template>
