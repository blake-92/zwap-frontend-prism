<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { MousePointerClick, QrCode, Copy, ExternalLink, Maximize } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { SPRING_DOTS } from '~/utils/springs'
import { PERMANENT_LINKS } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import SegmentControl from '~/components/ui/SegmentControl.vue'
import QrLightbox from '~/components/ui/QrLightbox.vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const isMobile = useMediaQuery('(max-width: 639px)')

const activeLinks = PERMANENT_LINKS.filter(l => l.active)
const active = ref(activeLinks[0]?.id ?? null)
const desktopSelected = computed(() => PERMANENT_LINKS.find(l => l.id === active.value) ?? activeLinks[0])

const mobileIndex = ref(0)
const mobileSelected = computed(() => PERMANENT_LINKS[mobileIndex.value] ?? PERMANENT_LINKS[0])

const isQrMaximized = ref(false)

const lightboxLink = computed(() => isDesktop.value ? desktopSelected.value : mobileSelected.value)

const handleCopy = () => {
  if (!desktopSelected.value?.url) return
  if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(desktopSelected.value.url)
  const key = isMobile.value ? 'links.linkCopiedShort' : 'links.linkCopied'
  toastStore.addToast(t(key, { name: desktopSelected.value.name }), 'success')
}

const goNext = () => { mobileIndex.value = (mobileIndex.value + 1) % PERMANENT_LINKS.length }
const goPrev = () => { mobileIndex.value = (mobileIndex.value - 1 + PERMANENT_LINKS.length) % PERMANENT_LINKS.length }

const onDragEnd = (_e, info) => {
  if (info.velocity.x < -200 || info.offset.x < -50) goNext()
  else if (info.velocity.x > 200 || info.offset.x > 50) goPrev()
}

const openUrl = () => {
  if (typeof window !== 'undefined') window.open(desktopSelected.value?.url, '_blank')
}

const segmentOptions = computed(() => activeLinks.map(l => ({ value: l.id, label: l.name })))

const dotAnimate = (i) => ({
  width: i === mobileIndex.value ? 16 : 6,
  backgroundColor: i === mobileIndex.value ? '#7C3AED' : (themeStore.isDarkMode ? '#45434A' : '#D1D0D6'),
})

const urlTextClass = computed(() => {
  if (mobileSelected.value.active) return themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
  return themeStore.isDarkMode ? 'text-[#45434A]' : 'text-[#C5C3CC]'
})
</script>

<template>
  <!-- Desktop card -->
  <Card v-if="isDesktop" class="p-0 flex flex-col bg-gradient-to-b from-[#7C3AED]/5 to-transparent relative z-10">
    <div :class="['p-6 border-b flex items-center justify-between', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
      <div>
        <h3 :class="['font-bold text-lg flex items-center gap-2', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
          <MousePointerClick :size="18" class="text-[#7C3AED]" />
          {{ t('dashboard.quickCharge') }}
        </h3>
        <p :class="['text-xs font-medium mt-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ t('dashboard.scanToPay') }}</p>
      </div>
    </div>

    <div class="p-6 flex flex-col items-center flex-1">
      <div class="w-full mb-6">
        <SegmentControl v-model="active" :options="segmentOptions" layout-id="quickLinkTab" />
      </div>

      <motion.div
        layout-id="qr-code"
        class="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 mb-6 relative group cursor-pointer"
        @click="isQrMaximized = true"
      >
        <QrCode :size="140" class="text-black" :stroke-width="1.5" />
        <div class="absolute inset-0 flex items-center justify-center bg-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="action" size="icon" class="!rounded-full shadow-lg pointer-events-none">
            <Maximize :size="16" />
          </Button>
        </div>
      </motion.div>

      <div class="text-center w-full mt-auto">
        <p :class="['text-[11px] font-mono font-bold mb-3 truncate', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
          {{ desktopSelected?.url }}
        </p>
        <div class="grid grid-cols-2 gap-3 w-full">
          <Button variant="outline" class="w-full !py-2.5 shadow-xs" @click="handleCopy">
            <Copy :size="16" /> {{ t('dashboard.copy') }}
          </Button>
          <Button class="w-full !py-2.5 shadow-lg" @click="openUrl">
            <ExternalLink :size="16" /> {{ t('common.open') }}
          </Button>
        </div>
      </div>
    </div>
  </Card>

  <!-- Mobile card -->
  <Card v-else class="p-0 overflow-hidden bg-gradient-to-b from-[#7C3AED]/5 to-transparent">
    <div :class="['px-4 pt-3.5 pb-0 flex items-center gap-2 border-b', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
      <MousePointerClick :size="14" class="text-[#7C3AED] shrink-0" />
      <p :class="['text-xs font-bold pb-3.5', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ t('dashboard.quickCharge') }}</p>
    </div>

    <motion.div
      drag="x"
      :drag-constraints="{ left: 0, right: 0 }"
      :drag-elastic="0.12"
      :style="{ touchAction: 'pan-y' }"
      class="flex items-center justify-center gap-4 px-6 py-4 cursor-grab active:cursor-grabbing select-none"
      @drag-end="onDragEnd"
    >
      <motion.div
        layout-id="qr-code"
        :class="[
          'relative shrink-0 bg-white p-3 rounded-2xl shadow-lg border border-gray-100 group',
          mobileSelected.active ? 'cursor-pointer' : 'cursor-default'
        ]"
        @click="mobileSelected.active && (isQrMaximized = true)"
      >
        <QrCode
          :size="84"
          :class="['text-black transition-opacity duration-300', mobileSelected.active ? 'opacity-100' : 'opacity-10']"
          :stroke-width="1.5"
        />
        <AnimatePresence>
          <motion.div
            v-if="!mobileSelected.active"
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
          v-if="mobileSelected.active"
          class="absolute inset-0 flex items-center justify-center bg-black/[0.04] rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none"
        >
          <div class="bg-[#7C3AED] rounded-full p-1.5 shadow-md">
            <Maximize :size="11" class="text-white" />
          </div>
        </div>
      </motion.div>

      <div class="flex flex-col gap-1 min-w-0 max-w-[160px]">
        <AnimatePresence mode="wait">
          <motion.div
            :key="mobileSelected.id"
            :initial="{ opacity: 0, y: 5 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -5 }"
            :transition="{ duration: 0.13 }"
          >
            <p :class="['text-sm font-bold truncate', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ mobileSelected.name }}</p>
            <p :class="['text-[10px] font-mono truncate mt-0.5', urlTextClass]">{{ mobileSelected.url }}</p>
          </motion.div>
        </AnimatePresence>

        <div class="flex gap-1.5 mt-2.5">
          <motion.div
            v-for="(link, i) in PERMANENT_LINKS"
            :key="link.id"
            :animate="dotAnimate(i)"
            :transition="SPRING_DOTS"
            class="h-1.5 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  </Card>

  <QrLightbox
    :is-open="isQrMaximized"
    layout-id="qr-code"
    :name="lightboxLink?.name"
    :url="lightboxLink?.url"
    @close="isQrMaximized = false"
  />
</template>
