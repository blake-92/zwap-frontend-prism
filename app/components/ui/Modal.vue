<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { motion } from 'motion-v'
import { X } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { useScrollLock } from '~/composables/useScrollLock'
import { useChromeBlur } from '~/composables/useChromeBlur'
import { usePerformanceStore } from '~/stores/performance'
import { getModalGlass } from '~/utils/cardClasses'
import Button from './Button.vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: [Object, Function, null], default: null },
  maxWidth: { type: String, default: '480px' },
  wrapperClass: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const themeStore = useThemeStore()
const isDesktopSm = useMediaQuery('(min-width: 640px)')
const isMobile = computed(() => !isDesktopSm.value)
const containerRef = ref(null)
let trigger = null

useScrollLock(true)
useChromeBlur(true)

const mobileInitial = { y: '100%' }
const mobileAnimate = { y: 0, transition: { type: 'spring', stiffness: 380, damping: 36 } }
const mobileExit = { y: '100%' }

const desktopInitial = { opacity: 0, scale: 0.95, y: 10 }
const desktopAnimate = {
  opacity: 1,
  scale: 1,
  y: 0,
  transition: {
    opacity: { duration: 0.15 },
    scale: { type: 'spring', stiffness: 400, damping: 30 },
    y: { type: 'spring', stiffness: 400, damping: 30 },
  },
}
const desktopExit = { opacity: 0, scale: 0.95, y: 10 }

const getContainerEl = () => containerRef.value?.$el ?? containerRef.value

const onKey = (e) => {
  if (e.key === 'Escape') emit('close')
  const el = getContainerEl()
  if (e.key !== 'Tab' || !el?.querySelectorAll) return
  const focusable = el.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

onMounted(() => {
  if (typeof document === 'undefined') return
  trigger = document.activeElement
  document.addEventListener('keydown', onKey)
  const el = getContainerEl()
  const focusable = el?.querySelectorAll?.(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable || focusable.length === 0) return
  // Preferir el primer input/textarea/select (contenido real) sobre el botón cerrar.
  const preferred = el.querySelector(
    'input:not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])',
  )
  ;(preferred ?? focusable[0]).focus()
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKey)
  if (trigger && document.contains(trigger)) trigger.focus()
})

const onDragEnd = (_e, info) => {
  if (!isMobile.value) return
  if (info.offset.y > 100 || info.velocity.y > 500) {
    if (typeof document !== 'undefined') document.activeElement?.blur()
    emit('close')
  }
}

const perfStore = usePerformanceStore()
const modalClass = computed(() => getModalGlass(themeStore.isDarkMode, perfStore.useBlur, perfStore.modalShadow, perfStore.useGlassElevation))
const backdropFilterClass = computed(() => perfStore.modalBackdropFilter)
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <motion.div
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.15 }"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      >
        <motion.div
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.15 }"
          :class="['absolute inset-0', backdropFilterClass, themeStore.isDarkMode ? 'bg-black/70' : 'bg-[#111113]/40']"
          @click="emit('close')"
        />
        <motion.div
          ref="containerRef"
          :initial="isMobile ? mobileInitial : desktopInitial"
          :animate="isMobile ? mobileAnimate : desktopAnimate"
          :exit="isMobile ? mobileExit : desktopExit"
          :drag="isMobile ? 'y' : false"
          :drag-constraints="{ top: 0, bottom: 600 }"
          :drag-elastic="0.2"
          :drag-snap-to-origin="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          :style="{ maxWidth }"
          :class="[
            'relative w-full flex flex-col rounded-t-[24px] sm:rounded-[24px] overflow-hidden max-h-[95vh] sm:max-h-[90vh] pb-[env(safe-area-inset-bottom)] sm:pb-0',
            modalClass,
            wrapperClass,
          ]"
          @drag-end="onDragEnd"
        >
          <div class="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div :class="['w-10 h-1 rounded-full', themeStore.isDarkMode ? 'bg-white/20' : 'bg-black/10']" />
          </div>

          <div :class="['px-5 sm:px-8 py-4 sm:py-6 border-b flex justify-between items-start shrink-0', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
            <div>
              <h2 id="modal-title" :class="['text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
                <span v-if="icon" class="text-[#7C3AED]"><component :is="icon" :size="24" /></span>
                {{ title }}
              </h2>
              <p v-if="description" :class="['text-sm mt-1 font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                {{ description }}
              </p>
            </div>
            <Button variant="ghost" size="icon" class="!w-11 !h-11 sm:!w-10 sm:!h-10" @click="emit('close')">
              <X :size="20" />
            </Button>
          </div>

          <div class="flex-1 overflow-y-auto min-h-0 flex flex-col">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            :class="['px-5 sm:px-8 py-5 sm:py-6 flex gap-3 sm:gap-4 border-t shrink-0', themeStore.isDarkMode ? 'bg-[#111113]/40 border-white/10' : 'bg-gray-50/50 border-black/5']"
          >
            <slot name="footer" />
          </div>
        </motion.div>
      </motion.div>
    </Teleport>
  </ClientOnly>
</template>
