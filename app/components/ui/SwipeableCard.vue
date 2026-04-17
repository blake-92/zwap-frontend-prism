<script setup>
import { ref, computed } from 'vue'
import { motion, useAnimationControls } from 'motion-v'
import { ChevronLeft } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'
import { getCardClasses } from '~/utils/cardClasses'

const props = defineProps({
  actions: { type: Array, default: () => [] },
})

const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const controls = useAnimationControls()
const isOpen = ref(false)
const isDragging = ref(false)

const validActions = computed(() => props.actions.filter(a => !a.hidden))
const actionWidth = 76
const maxDrag = computed(() => validActions.value.length * actionWidth)

const cardClasses = computed(() => getCardClasses(themeStore.isDarkMode, false, perfStore.useBlur, perfStore.useNeon, perfStore.useGlassElevation))

const closeCard = () => {
  controls.start({ x: 0 })
  isOpen.value = false
}

const onDragStart = () => { isDragging.value = true }

const onDragEnd = (_e, info) => {
  isDragging.value = false
  const threshold = -maxDrag.value / 2
  if (info.offset.x < threshold || info.velocity.x < -500) {
    controls.start({ x: -maxDrag.value })
    isOpen.value = true
  } else {
    controls.start({ x: 0 })
    isOpen.value = false
  }
}

const handleCardClick = () => { if (isOpen.value) closeCard() }

const handleAction = (act) => {
  if (act.disabled) return
  act.onClick?.()
  closeCard()
}

const actionClass = (act) => {
  const d = themeStore.isDarkMode
  if (act.disabled) return d ? 'text-[#888991]/40 cursor-not-allowed' : 'text-[#67656E]/40 cursor-not-allowed'
  if (act.variant === 'danger') return d ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
  return d ? 'text-[#A78BFA] hover:bg-white/5' : 'text-[#561BAF] hover:bg-[#7C3AED]/10'
}

const bgActionsClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#111113]/50 border border-white/5'
    : 'bg-gray-100 border border-black/5',
)

const chevronBg = computed(() =>
  themeStore.isDarkMode
    ? 'bg-gradient-to-l from-[#252429] via-[#252429]/80 to-transparent text-white/40'
    : 'bg-gradient-to-l from-white via-white/80 to-transparent text-black/30',
)
</script>

<template>
  <div class="relative overflow-hidden rounded-[24px]">
    <!-- Background actions layer -->
    <div
      :class="[
        'absolute inset-y-0 right-0 flex justify-end overflow-hidden transition-opacity duration-150 rounded-[24px]',
        (isOpen || isDragging) ? 'opacity-100' : 'opacity-0',
        bgActionsClass,
      ]"
      :style="{ width: maxDrag + 'px' }"
    >
      <button
        v-for="act in validActions"
        :key="act.label"
        :aria-label="act.label"
        :disabled="act.disabled"
        :style="{ width: actionWidth + 'px' }"
        :class="['flex flex-col items-center justify-center gap-1.5 h-full text-[10px] font-bold transition-colors', actionClass(act)]"
        @click.stop="handleAction(act)"
      >
        <component
          :is="act.icon"
          v-if="act.icon"
          :size="18"
          :class="act.variant === 'danger' && !act.disabled ? '' : 'opacity-80'"
        />
        <span :class="act.variant === 'danger' && !act.disabled ? '' : 'opacity-90'">{{ act.label }}</span>
      </button>
    </div>

    <!-- Foreground card -->
    <motion.div
      :drag="maxDrag > 0 ? 'x' : false"
      :drag-constraints="{ left: -maxDrag, right: 0 }"
      :drag-elastic="0.1"
      :animate="controls"
      :class="['relative z-10 w-full rounded-[24px] border overflow-hidden', cardClasses.base]"
      @drag-start="onDragStart"
      @drag-end="onDragEnd"
      @click="handleCardClick"
    >
      <slot />

      <motion.div
        v-if="maxDrag > 0 && !isOpen"
        :initial="{ x: 5 }"
        :animate="{ x: 0 }"
        :transition="{
          type: 'spring',
          stiffness: 120,
          damping: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }"
        :class="['absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center w-10 pointer-events-none rounded-r-[24px]', chevronBg]"
      >
        <ChevronLeft :size="16" :stroke-width="3" class="ml-2" />
      </motion.div>
    </motion.div>
  </div>
</template>
