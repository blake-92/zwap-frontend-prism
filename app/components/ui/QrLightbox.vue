<script setup>
import { watch, onUnmounted, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { QrCode } from 'lucide-vue-next'
import { useScrollLock } from '~/composables/useScrollLock'
import { useChromeBlur } from '~/composables/useChromeBlur'
import { usePerformanceStore } from '~/stores/performance'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  layoutId: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  qrSize: { type: Number, default: 280 },
})
const emit = defineEmits(['close'])

const perfStore = usePerformanceStore()

useScrollLock(() => props.isOpen)
useChromeBlur(() => props.isOpen)

const onKey = (e) => { if (e.key === 'Escape') emit('close') }

watch(() => props.isOpen, (open) => {
  if (typeof document === 'undefined') return
  if (open) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})

onUnmounted(() => {
  if (typeof document !== 'undefined') document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <AnimatePresence>
        <!-- Direct child de AnimatePresence debe ser motion component para que layoutId matching sea confiable. -->
        <motion.div
          v-if="isOpen"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.22 }"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click="emit('close')"
        >
          <div
            class="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-none"
            aria-hidden="true"
          />
          <motion.div
            :layout-id="layoutId"
            layout
            :transition="{ layout: { type: 'spring', stiffness: 260, damping: 30 } }"
            class="relative bg-white p-8 sm:p-12 rounded-[32px] shadow-2xl flex flex-col items-center overflow-hidden"
            @click.stop
          >
            <QrCode :size="qrSize" class="text-black mb-6" :stroke-width="1.5" />
            <p class="text-[#111113] font-bold text-xl mb-1 text-center">{{ name }}</p>
            <p class="text-[#67656E] font-mono text-sm text-center">{{ url }}</p>

            <!-- Landing shimmer — solo Prism, se dispara después del morph y sweep one-shot -->
            <div
              v-if="perfStore.useGlassElevation"
              class="absolute inset-0 pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <div class="prism-qr-shimmer absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Teleport>
  </ClientOnly>
</template>
