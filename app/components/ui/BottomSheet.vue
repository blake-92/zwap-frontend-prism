<script setup>
import { computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useThemeStore } from '~/stores/theme'
import { useScrollLock } from '~/composables/useScrollLock'
import { useChromeBlur } from '~/composables/useChromeBlur'
import { SPRING } from '~/utils/springs'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const themeStore = useThemeStore()

useScrollLock(() => props.isOpen)
useChromeBlur(() => props.isOpen)

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: SPRING },
  exit: { y: '100%', transition: { type: 'spring', stiffness: 400, damping: 36 } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const onDragEnd = (_e, info) => {
  if (info.offset.y > 100 || info.velocity.y > 500) {
    if (typeof document !== 'undefined') document.activeElement?.blur()
    emit('close')
  }
}

const panelClass = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#1A1A1D] border-white/10'
    : 'bg-white border-black/5 shadow-[0_-8px_40px_rgba(0,0,0,0.1)]',
)
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <AnimatePresence>
        <template v-if="isOpen">
          <motion.div
            key="sheet-backdrop"
            :variants="backdropVariants"
            initial="hidden"
            animate="visible"
            exit="exit"
            class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
            @click="emit('close')"
          />
          <motion.div
            key="sheet-panel"
            :variants="sheetVariants"
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            :drag-constraints="{ top: 0, bottom: 500 }"
            :drag-elastic="0.2"
            :drag-snap-to-origin="true"
            :class="[
              'fixed bottom-0 inset-x-0 z-[55] rounded-t-[24px] border-t pb-[env(safe-area-inset-bottom)]',
              panelClass,
            ]"
            role="dialog"
            aria-modal="true"
            @click.stop
            @drag-end="onDragEnd"
          >
            <div class="flex justify-center pt-3 pb-2">
              <div :class="['w-10 h-1 rounded-full', themeStore.isDarkMode ? 'bg-white/20' : 'bg-black/10']" />
            </div>
            <h3
              v-if="title"
              :class="['px-5 py-3 text-sm font-bold opacity-50', themeStore.isDarkMode ? 'text-white' : 'text-black']"
            >
              {{ title }}
            </h3>
            <slot />
          </motion.div>
        </template>
      </AnimatePresence>
    </Teleport>
  </ClientOnly>
</template>
