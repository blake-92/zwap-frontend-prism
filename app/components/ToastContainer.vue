<script setup>
import { CheckCircle2, XCircle, Info } from 'lucide-vue-next'
import { AnimatePresence, motion } from 'motion-v'
import { useToastStore } from '~/stores/toast'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceMode } from '~/composables/usePerformanceMode'

const toastStore = useToastStore()
const themeStore = useThemeStore()
const performanceMode = usePerformanceMode()

const iconFor = (type) => ({ success: CheckCircle2, error: XCircle, info: Info }[type] || CheckCircle2)
const iconColor = (type) => ({ success: 'text-emerald-500', error: 'text-rose-500', info: 'text-[#7C3AED]' }[type] || 'text-emerald-500')
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-[70] flex flex-col items-center sm:items-end gap-3 pointer-events-none">
        <AnimatePresence>
          <motion.div
            v-for="toast in toastStore.toasts"
            :key="toast.id"
            :initial="{ opacity: 0, y: 20, scale: 0.95 }"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.95, transition: { type: 'spring', stiffness: 400, damping: 30 } }"
            :class="[
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl',
              performanceMode ? 'backdrop-blur-0 shadow-lg' : '',
              themeStore.isDarkMode
                ? 'bg-[#252429]/95 border-white/10 text-white shadow-black/50'
                : 'bg-white/95 border-gray-200 text-[#111113] shadow-gray-200/50',
            ]"
          >
            <component :is="iconFor(toast.type)" :size="18" :class="iconColor(toast.type)" />
            <span class="text-sm font-bold">{{ toast.message }}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </Teleport>
  </ClientOnly>
</template>
