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
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.2 }"
            class="absolute inset-0 bg-black/60 backdrop-blur-md"
            @click="emit('close')"
          />
          <motion.div
            :layout-id="layoutId"
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
        </div>
      </AnimatePresence>
    </Teleport>
  </ClientOnly>
</template>
