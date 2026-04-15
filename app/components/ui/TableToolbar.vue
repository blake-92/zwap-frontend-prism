<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { useViewSearchStore } from '~/stores/viewSearch'
import BottomSheet from './BottomSheet.vue'

const props = defineProps({
  hasActions: { type: Boolean, default: false },
})
const emit = defineEmits(['reset'])

const { t } = useI18n()
const themeStore = useThemeStore()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const viewSearch = useViewSearchStore()
const sheetOpen = ref(false)

// Provide sheetMode to DropdownFilter children via provide/inject
import { provide } from 'vue'
const sheetModeRef = ref(false)
provide('tableToolbarSheetMode', sheetModeRef)

const openSheet = () => {
  sheetModeRef.value = true
  sheetOpen.value = true
}
const closeSheet = () => {
  sheetOpen.value = false
  sheetModeRef.value = false
}

watch(
  [isDesktop, () => props.hasActions],
  ([desktop, hasActions]) => {
    if (!desktop && hasActions) viewSearch.setFilterOpener(openSheet)
    else viewSearch.setFilterOpener(null)
  },
  { immediate: true },
)

onUnmounted(() => viewSearch.setFilterOpener(null))

const glassClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429]/20 backdrop-blur-xl border-white/10'
    : 'bg-white/40 backdrop-blur-xl border-white shadow-sm',
)

const resetBtnClass = computed(() =>
  themeStore.isDarkMode
    ? 'text-[#888991] hover:text-[#D8D7D9] hover:bg-white/5'
    : 'text-[#67656E] hover:text-[#111113] hover:bg-black/5',
)

const sheetResetBtnClass = computed(() =>
  themeStore.isDarkMode
    ? 'text-[#888991] hover:text-[#D8D7D9] hover:bg-white/5 border border-white/10'
    : 'text-[#67656E] hover:text-[#111113] hover:bg-black/5 border border-gray-200',
)

const handleReset = () => {
  emit('reset')
  sheetOpen.value = false
}
</script>

<template>
  <!-- Desktop layout -->
  <div
    v-if="isDesktop"
    :class="['relative z-20 mb-6 p-2 rounded-2xl border flex items-center justify-between gap-2', glassClass]"
  >
    <div v-if="$slots.default || $attrs.onReset !== undefined" class="flex items-center gap-2 flex-wrap">
      <slot />
      <button
        v-if="$attrs.onReset !== undefined"
        :class="['flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors', resetBtnClass]"
        @click="emit('reset')"
      >
        <RotateCcw :size="12" />
        {{ t('filters.clearFilters') }}
      </button>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2 flex-shrink-0">
      <slot name="actions" />
    </div>
  </div>

  <!-- Mobile: BottomSheet only -->
  <BottomSheet
    v-else
    :is-open="sheetOpen"
    :title="t('filters.filtersTitle')"
    @close="closeSheet"
  >
    <div class="px-5 pb-6 space-y-3">
      <slot />

      <button
        v-if="$attrs.onReset !== undefined"
        :class="['w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors', sheetResetBtnClass]"
        @click="handleReset"
      >
        <RotateCcw :size="14" />
        {{ t('filters.clearFilters') }}
      </button>

      <div
        v-if="$slots.actions"
        :class="['pt-3 mt-1 border-t', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']"
      >
        <div class="flex flex-col gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </BottomSheet>
</template>
