<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { QrCode, Copy, ExternalLink, Maximize } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { SPRING_DOTS } from '~/utils/springs'
import { copyToClipboard } from '~/utils/clipboard'
import Card from '~/components/ui/Card.vue'
import Toggle from '~/components/ui/Toggle.vue'
import QrLightbox from '~/components/ui/QrLightbox.vue'

const props = defineProps({ links: { type: Array, required: true } })
const emit = defineEmits(['toggle'])

const { t } = useI18n()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const isMobile = useMediaQuery('(max-width: 639px)')

const index = ref(Math.max(0, props.links.findIndex(l => l.active)))
const isQrOpen = ref(false)

const selected = computed(() => props.links[index.value])

const goNext = () => { index.value = (index.value + 1) % props.links.length }
const goPrev = () => { index.value = (index.value - 1 + props.links.length) % props.links.length }

const onDragEnd = (_e, info) => {
  if (info.velocity.x < -200 || info.offset.x < -50) goNext()
  else if (info.velocity.x > 200 || info.offset.x > 50) goPrev()
}

const handleCopy = async () => {
  if (!selected.value.active) return
  const ok = await copyToClipboard(`https://${selected.value.url}`)
  if (ok) {
    const key = isMobile.value ? 'links.linkCopiedShort' : 'links.linkCopied'
    toastStore.addToast(t(key, { name: selected.value.name }), 'success')
  } else {
    toastStore.addToast(t('common.copyFailed'), 'error')
  }
}

const handleOpen = () => {
  if (!selected.value.active) return
  if (typeof window !== 'undefined') window.open(`https://${selected.value.url}`, '_blank')
}

const dotAnimate = (i) => ({
  width: i === index.value ? 16 : 6,
  backgroundColor: i === index.value ? '#7C3AED' : (themeStore.isDarkMode ? '#45434A' : '#D1D0D6'),
})

const actionBtnClass = (active) => active
  ? (themeStore.isDarkMode ? 'text-[#D8D7D9] hover:bg-white/8 active:bg-white/12' : 'text-[#45434A] hover:bg-black/5 active:bg-black/8')
  : 'opacity-25 cursor-not-allowed'

const urlTextClass = computed(() => {
  if (selected.value.active) return themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
  return themeStore.isDarkMode ? 'text-[#45434A]' : 'text-[#C5C3CC]'
})
</script>

<template>
  <Card class="p-0 overflow-hidden bg-gradient-to-b from-[#7C3AED]/5 to-transparent">
    <div class="flex items-stretch">
      <motion.div
        drag="x"
        :drag-constraints="{ left: 0, right: 0 }"
        :drag-elastic="0.12"
        :style="{ touchAction: 'pan-y' }"
        class="flex-1 flex items-center gap-4 px-4 py-4 min-w-0 cursor-grab active:cursor-grabbing select-none"
        @drag-end="onDragEnd"
      >
        <motion.div
          layout-id="ql-qr-mini"
          layout
          :class="[
            'relative shrink-0 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 group',
            selected.active ? 'cursor-pointer' : 'cursor-default'
          ]"
          @click="selected.active && (isQrOpen = true)"
        >
          <QrCode
            :size="84"
            :class="['text-black transition-opacity duration-300', selected.active ? 'opacity-100' : 'opacity-10']"
            :stroke-width="1.5"
          />
          <AnimatePresence>
            <motion.div
              v-if="!selected.active"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :exit="{ opacity: 0 }"
              :transition="{ duration: 0.18 }"
              class="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[2px]"
            >
              <span class="text-[9px] font-bold text-[#888991] uppercase tracking-wide">{{ t('links.inactive') }}</span>
            </motion.div>
          </AnimatePresence>
          <div
            v-if="selected.active"
            class="absolute inset-0 flex items-center justify-center bg-black/[0.04] rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none"
          >
            <div class="bg-[#7C3AED] rounded-full p-1.5 shadow-md">
              <Maximize :size="11" class="text-white" />
            </div>
          </div>
        </motion.div>

        <div class="flex flex-col gap-1 min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              :key="selected.id"
              :initial="{ opacity: 0, y: 5 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -5 }"
              :transition="{ duration: 0.13 }"
            >
              <p :class="['text-sm font-bold truncate', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ selected.name }}</p>
              <p :class="['text-[10px] font-mono truncate mt-0.5', urlTextClass]">{{ selected.url }}</p>
            </motion.div>
          </AnimatePresence>

          <div class="flex gap-1.5 mt-2.5">
            <motion.div
              v-for="(link, i) in links"
              :key="link.id"
              :animate="dotAnimate(i)"
              :transition="SPRING_DOTS"
              class="h-1.5 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      <div :class="['w-px my-3 shrink-0', themeStore.isDarkMode ? 'bg-white/8' : 'bg-black/5']" />

      <div class="flex flex-col items-center justify-center gap-2.5 px-3 py-4 shrink-0">
        <button
          :aria-label="t('links.copyLink')"
          :disabled="!selected.active"
          :class="['p-2 rounded-xl transition-colors', actionBtnClass(selected.active)]"
          @click="handleCopy"
        >
          <Copy :size="16" />
        </button>
        <div :class="['w-5 border-t', themeStore.isDarkMode ? 'border-white/8' : 'border-black/6']" />
        <button
          :aria-label="t('common.open')"
          :disabled="!selected.active"
          :class="['p-2 rounded-xl transition-colors', actionBtnClass(selected.active)]"
          @click="handleOpen"
        >
          <ExternalLink :size="16" />
        </button>
        <div :class="['w-5 border-t', themeStore.isDarkMode ? 'border-white/8' : 'border-black/6']" />
        <Toggle :aria-label="t('common.toggleFor', { name: selected.name })" :active="selected.active" @toggle="emit('toggle', selected.id)" />
      </div>
    </div>
  </Card>

  <QrLightbox
    :is-open="isQrOpen && !!selected"
    layout-id="ql-qr-mini"
    :name="selected?.name"
    :url="selected?.url"
    :qr-size="260"
    @close="isQrOpen = false"
  />
</template>
