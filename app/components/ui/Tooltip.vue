<script setup>
import { ref, onUnmounted, watch, nextTick } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
  content: { type: String, required: true },
  position: { type: String, default: 'top' },
})

const themeStore = useThemeStore()
const isVisible = ref(false)
const coords = ref({ top: -9999, left: -9999 })
const triggerRef = ref(null)
const tooltipRef = ref(null)
let timeoutId = null
const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`

const getEl = (r) => r?.$el ?? r
const updatePosition = async () => {
  await nextTick()
  const triggerEl = getEl(triggerRef.value)
  const tooltipEl = getEl(tooltipRef.value)
  if (!triggerEl?.getBoundingClientRect || !tooltipEl?.getBoundingClientRect) return
  const rect = triggerEl.getBoundingClientRect()
  const tooltipRect = tooltipEl.getBoundingClientRect()

  let top = rect.top - tooltipRect.height - 8
  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)

  if (props.position === 'bottom') {
    top = rect.bottom + 8
  } else if (props.position === 'left') {
    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2)
    left = rect.left - tooltipRect.width - 8
  } else if (props.position === 'right') {
    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2)
    left = rect.right + 8
  }
  coords.value = { top, left }
}

const showTooltip = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => { isVisible.value = true }, 300)
}

const hideTooltip = () => {
  clearTimeout(timeoutId)
  isVisible.value = false
  coords.value = { top: -9999, left: -9999 }
}

const onScrollOrResize = () => hideTooltip()

watch(isVisible, (v) => {
  if (v) {
    updatePosition()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onScrollOrResize)
      window.addEventListener('scroll', onScrollOrResize, true)
    }
  } else {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }
})

onUnmounted(() => clearTimeout(timeoutId))
</script>

<template>
  <div
    ref="triggerRef"
    class="inline-flex items-center justify-center"
    :aria-describedby="isVisible ? tooltipId : undefined"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
  >
    <slot />
  </div>

  <ClientOnly>
    <Teleport to="body">
      <AnimatePresence>
        <motion.div
          v-if="isVisible"
          ref="tooltipRef"
          :id="tooltipId"
          role="tooltip"
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 500, damping: 30 }"
          :style="{
            position: 'fixed',
            top: coords.top + 'px',
            left: coords.left + 'px',
            pointerEvents: 'none',
            zIndex: 99999,
            visibility: coords.top === -9999 ? 'hidden' : 'visible',
          }"
          :class="[
            'px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl',
            themeStore.isDarkMode
              ? 'bg-[#252429]/90 backdrop-blur-md border border-white/10 text-white'
              : 'bg-white/90 backdrop-blur-md border border-[#7C3AED]/20 text-[#111113]',
          ]"
        >
          {{ content }}
        </motion.div>
      </AnimatePresence>
    </Teleport>
  </ClientOnly>
</template>
