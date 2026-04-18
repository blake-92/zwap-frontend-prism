<script setup>
import { ref, computed, onMounted, onUnmounted, useId } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { ChevronDown, Check, Filter } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { SPRING } from '~/utils/springs'
import Button from './Button.vue'
import BottomSheet from './BottomSheet.vue'

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: String, required: true },
  icon: { type: [Object, Function], default: null },
  defaultValue: { type: String, default: undefined },
  sheetMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const isOpen = ref(false)
const dropdownRef = ref(null)
const pillId = useId()
const pillLayoutId = computed(() => perfStore.useNavMorphs ? `dropdown-pill-${pillId}` : undefined)

const DisplayIcon = computed(() => props.icon || Filter)
const isFiltered = computed(() => {
  if (props.defaultValue != null) return props.modelValue !== props.defaultValue
  return props.modelValue && props.modelValue !== 'Todos' && props.modelValue !== 'Cualquier fecha'
})

const handler = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) isOpen.value = false
}

onMounted(() => {
  if (typeof document !== 'undefined') document.addEventListener('mousedown', handler)
})
onUnmounted(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', handler)
})

const pick = (opt) => {
  emit('update:modelValue', opt)
  isOpen.value = false
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { ...SPRING, stiffness: 500 } },
  exit: { opacity: 0, scale: 0.95, y: -4, transition: { type: 'spring', stiffness: 500, damping: 30 } },
}

const panelClass = computed(() => {
  const isLite = perfStore.isLite
  if (themeStore.isDarkMode) {
    if (isLite) return 'bg-[#1A1A1D] border-white/15'
    return 'bg-[#252429]/95 backdrop-blur-xl border-white/10'
  }
  if (isLite) return 'bg-white border-[#DBD3FB]'
  return 'bg-white/95 backdrop-blur-xl border-gray-200'
})

const optionTextClass = (active) => {
  const d = themeStore.isDarkMode
  if (active) return d ? 'text-white' : 'text-[#561BAF]'
  return d ? 'text-[#888991] hover:text-[#D8D7D9]' : 'text-[#67656E] hover:text-[#111113]'
}

const pillBg = computed(() =>
  themeStore.isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#DBD3FB]/50',
)

const openSheet = () => { isOpen.value = true }
const closeSheet = () => { isOpen.value = false }

const openedButtonClass = computed(() => {
  if (!isOpen.value) return ''
  return themeStore.isDarkMode
    ? 'bg-[#111113]/80 border-[#7C3AED]/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.15)]'
    : 'bg-white border-[#7C3AED]/40 text-[#111113]'
})

const sheetRowClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#252429]/60 border-white/10 hover:bg-[#252429]'
    : 'bg-gray-50 border-gray-200 hover:bg-gray-100',
)
</script>

<template>
  <!-- Sheet mode: full-width row inside BottomSheet context -->
  <template v-if="sheetMode">
    <button
      :class="['w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-colors', sheetRowClass]"
      @click="openSheet"
    >
      <span class="flex items-center gap-2.5">
        <component
          :is="DisplayIcon"
          :size="16"
          :class="isFiltered ? 'text-[#7C3AED]' : themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'"
        />
        <span :class="['text-sm font-semibold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">{{ label }}</span>
      </span>
      <span :class="['text-sm font-medium', isFiltered ? 'text-[#7C3AED]' : themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ modelValue }}
      </span>
    </button>
    <BottomSheet :is-open="isOpen" :title="t('filters.filterBy', { label: label.toLowerCase() })" @close="closeSheet">
      <div role="listbox" :aria-label="label" class="px-4 pb-6 flex flex-col gap-2">
        <button
          v-for="opt in options"
          :key="opt"
          role="option"
          :aria-selected="modelValue === opt"
          :class="['relative flex items-center justify-between w-full px-5 py-4 rounded-2xl text-base font-medium transition-colors duration-150', optionTextClass(modelValue === opt)]"
          @click="pick(opt)"
        >
          <motion.div
            v-if="modelValue === opt"
            :layout-id="pillLayoutId"
            :class="['absolute inset-0 rounded-2xl', pillBg]"
            :transition="SPRING"
          />
          <span class="relative z-10">{{ opt }}</span>
          <Check v-if="modelValue === opt" :size="18" :class="['relative z-10', themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]']" />
        </button>
      </div>
    </BottomSheet>
  </template>

  <!-- Normal mode -->
  <div v-else ref="dropdownRef" class="relative">
    <Button
      variant="outline"
      :size="isDesktop ? 'sm' : 'icon'"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :class="['transition-colors', isDesktop ? '!px-3 flex items-center gap-1.5' : '!w-10 !h-10 !p-0 flex items-center justify-center', openedButtonClass]"
      @click="isOpen = !isOpen"
    >
      <component
        :is="DisplayIcon"
        :size="isDesktop ? 14 : 18"
        :class="isFiltered ? 'text-[#7C3AED]' : 'opacity-70'"
      />
      <template v-if="isDesktop">
        <span class="font-semibold">
          {{ label }}{{ isFiltered ? `: ${modelValue}` : '' }}
        </span>
        <motion.span
          :animate="{ rotate: isOpen ? 180 : 0 }"
          :transition="SPRING"
          class="opacity-70 flex items-center"
        >
          <ChevronDown :size="14" />
        </motion.span>
      </template>
    </Button>

    <!-- Desktop dropdown panel -->
    <AnimatePresence v-if="isDesktop">
      <motion.div
        v-if="isOpen"
        role="listbox"
        :aria-label="label"
        :variants="panelVariants"
        initial="hidden"
        animate="visible"
        exit="exit"
        :style="{ transformOrigin: 'top left' }"
        :class="['absolute top-full left-0 mt-2 min-w-[180px] rounded-2xl border shadow-2xl z-50 overflow-hidden', panelClass]"
      >
        <div class="p-1.5 flex flex-col gap-0.5">
          <button
            v-for="opt in options"
            :key="opt"
            role="option"
            :aria-selected="modelValue === opt"
            :class="['relative flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150', optionTextClass(modelValue === opt)]"
            @click="pick(opt)"
          >
            <motion.div
              v-if="modelValue === opt"
              :layout-id="pillLayoutId"
              :class="['absolute inset-0 rounded-xl', pillBg]"
              :transition="SPRING"
            />
            <span class="relative z-10">{{ opt }}</span>
            <Check v-if="modelValue === opt" :size="14" :class="['relative z-10', themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]']" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>

    <!-- Mobile BottomSheet -->
    <BottomSheet
      v-if="!isDesktop"
      :is-open="isOpen"
      :title="t('filters.filterBy', { label: label.toLowerCase() })"
      @close="closeSheet"
    >
      <div role="listbox" :aria-label="label" class="px-4 pb-6 flex flex-col gap-2">
        <button
          v-for="opt in options"
          :key="opt"
          role="option"
          :aria-selected="modelValue === opt"
          :class="['relative flex items-center justify-between w-full px-5 py-4 rounded-2xl text-base font-medium transition-colors duration-150', optionTextClass(modelValue === opt)]"
          @click="pick(opt)"
        >
          <motion.div
            v-if="modelValue === opt"
            :layout-id="pillLayoutId"
            :class="['absolute inset-0 rounded-2xl', pillBg]"
            :transition="SPRING"
          />
          <span class="relative z-10">{{ opt }}</span>
          <Check v-if="modelValue === opt" :size="18" :class="['relative z-10', themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]']" />
        </button>
      </div>
    </BottomSheet>
  </div>
</template>
