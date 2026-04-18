<script setup>
import { computed, ref } from 'vue'
import { motion } from 'motion-v'
import { QrCode, Copy, ExternalLink } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { copyToClipboard } from '~/utils/clipboard'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Toggle from '~/components/ui/Toggle.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import QrLightbox from '~/components/ui/QrLightbox.vue'

const props = defineProps({ link: { type: Object, required: true } })
const emit = defineEmits(['toggle'])

const { t } = useI18n()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const isMobile = useMediaQuery('(max-width: 639px)')
const isQrOpen = ref(false)

const qrLayoutId = computed(() => `qr-permanent-${props.link.id}`)
const qrUrl = computed(() => `zwap.me/pay/${props.link.id}`)

const handleCopy = async () => {
  const ok = await copyToClipboard(`https://zwap.me/pay/${props.link.id}`)
  if (ok) {
    const key = isMobile.value ? 'links.linkCopiedShort' : 'links.linkCopied'
    toastStore.addToast(t(key, { name: props.link.name }), 'success')
  } else {
    toastStore.addToast(t('common.copyFailed'), 'error')
  }
}

const openQr = () => { if (props.link.active) isQrOpen.value = true }

const iconClass = computed(() => {
  if (props.link.active) {
    return themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
  }
  return themeStore.isDarkMode ? 'bg-[#252429] text-[#888991]' : 'bg-gray-100 text-[#67656E]'
})
const titleClass = computed(() => {
  if (props.link.active) return themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'
  return themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
})
</script>

<template>
  <Card class="p-6 relative group">
    <div class="flex justify-between items-start mb-4">
      <motion.div
        :layout-id="qrLayoutId"
        layout
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300',
          link.active ? 'cursor-pointer' : 'cursor-default',
          iconClass,
        ]"
        :aria-label="t('links.viewQr')"
        role="button"
        :tabindex="link.active ? 0 : -1"
        @click="openQr"
        @keydown.enter="openQr"
        @keydown.space.prevent="openQr"
      >
        <QrCode :size="22" />
      </motion.div>
      <Toggle :active="link.active" @toggle="emit('toggle')" />
    </div>

    <h4 :class="['text-lg font-bold tracking-tight mb-1', titleClass]">{{ link.name }}</h4>
    <p :class="['text-xs font-medium mb-6', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ link.desc }}</p>

    <div :class="['pt-4 border-t flex justify-between items-center', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
      <div class="flex gap-2">
        <Tooltip :content="t('links.viewQr')" position="top">
          <Button variant="ghost" size="icon" class="!p-1.5" :disabled="!link.active" @click="openQr">
            <QrCode :size="16" />
          </Button>
        </Tooltip>
        <Tooltip :content="t('links.copyLink')" position="top">
          <Button variant="ghost" size="icon" class="!p-1.5" :disabled="!link.active" @click="handleCopy">
            <Copy :size="16" />
          </Button>
        </Tooltip>
      </div>
      <Button variant="outline" size="sm" :disabled="!link.active" class="!py-1.5 !px-3 !text-xs">
        {{ t('common.open') }} <ExternalLink :size="12" />
      </Button>
    </div>

    <QrLightbox
      :is-open="isQrOpen"
      :layout-id="qrLayoutId"
      :name="link.name"
      :url="qrUrl"
      @close="isQrOpen = false"
    />
  </Card>
</template>
