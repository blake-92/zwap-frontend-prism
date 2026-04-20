<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

defineProps({
  headers: {
    type: Array,
    required: true,
    // ['Categoría', 'Datos']
  },
  rows: {
    type: Array,
    required: true,
    // Array of arrays of strings (may contain HTML)
  },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()

// Legal docs always use dark thead (identity) — overrides Lite light-mode thead behavior
const wrapperClass = computed(() => {
  const d = themeStore.isDarkMode
  if (perfStore.isLite) {
    return d
      ? 'bg-[#1A1A1D] border border-white/10'
      : 'bg-white border border-[#DBD3FB]'
  }
  return d
    ? 'bg-[#1A1A1D]/50 backdrop-blur-sm border border-white/10'
    : 'bg-white border border-[#E5E2EE]'
})

const theadClass = 'bg-[#111113] text-white'
const rowTextClass = computed(() =>
  themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
)
const firstColClass = computed(() =>
  themeStore.isDarkMode ? 'text-white font-semibold' : 'text-[#111113] font-semibold',
)
const stripeClass = computed(() =>
  themeStore.isDarkMode ? 'even:bg-white/[0.02]' : 'even:bg-[#F8F7FB]',
)
const borderRow = computed(() =>
  themeStore.isDarkMode ? 'border-b border-white/5' : 'border-b border-[#E5E2EE]',
)
</script>

<template>
  <div :class="['rounded-lg overflow-hidden my-4', wrapperClass]">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-[13.5px]">
        <thead :class="theadClass">
          <tr>
            <th
              v-for="h in headers"
              :key="h"
              class="px-4 py-2.5 text-left font-bold text-[11.5px] uppercase tracking-[0.03em] first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap"
            >
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in rows"
            :key="i"
            :class="[stripeClass, i < rows.length - 1 ? borderRow : '']"
          >
            <td
              v-for="(cell, j) in row"
              :key="j"
              :class="[
                'px-4 py-2.5 align-top leading-relaxed',
                j === 0 ? firstColClass : rowTextClass,
                j === 0 ? 'whitespace-nowrap' : '',
              ]"
            >
              <span v-html="cell" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
