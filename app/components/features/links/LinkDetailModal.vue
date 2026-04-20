<script setup>
import { computed } from 'vue'
import { Copy, Mail, QrCode, Eye, Timer, CalendarDays, ListTree, ExternalLink } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { copyToClipboard } from '~/utils/clipboard'
import { formatDate } from '~/utils/formatDate'

const props = defineProps({ link: { type: Object, required: true } })
const emit = defineEmits(['close', 'edit'])

const { t, locale } = useI18n()
const formattedCreatedAt = computed(() => {
  const iso = (props.link.createdAt || '').split('T')[0]
  return formatDate(iso, locale.value)
})
const themeStore = useThemeStore()
const toastStore = useToastStore()
const isMobile = useMediaQuery('(max-width: 639px)')

const url = computed(() => `https://zwap.me/pay/${props.link.id}`)

const handleCopy = async () => {
  const ok = await copyToClipboard(url.value)
  if (ok) {
    const key = isMobile.value ? 'links.linkCopiedShort' : 'links.linkCopied'
    toastStore.addToast(t(key, { name: props.link.client }), 'success')
  } else {
    toastStore.addToast(t('common.copyFailed'), 'error')
  }
}

const handleEdit = () => {
  emit('close')
  emit('edit', props.link)
}
</script>

<template>
  <Modal
    :title="t('links.linkDetail')"
    :description="link.client"
    :icon="ExternalLink"
    max-width="480px"
    @close="emit('close')"
  >
    <div class="p-5 sm:p-8 space-y-6">
      <div class="flex items-center justify-between">
        <span :class="['font-mono font-bold text-3xl tracking-tighter', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ link.amount }}</span>
        <Badge :variant="link.statusVariant" :icon="link.StatusIcon">{{ t(`status.${link.status}`) }}</Badge>
      </div>

      <div :class="['flex items-center gap-4 flex-wrap text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        <span class="flex items-center gap-1.5"><Eye :size="13" /> {{ link.views }} {{ t('links.views') }}</span>
        <span class="flex items-center gap-1.5"><ListTree :size="13" /> {{ link.items }} {{ t('dashboard.items') }}</span>
        <span :class="['flex items-center gap-1.5', link.status === 'expired' ? 'text-rose-500' : '']">
          <Timer :size="13" />
          {{ link.expires ? t('links.expires', { date: link.expires }) : t('links.noExpiration') }}
        </span>
      </div>

      <div :class="['p-4 rounded-xl border', themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5']">
        <SectionLabel class="mb-3">{{ t('links.sentTo') }}</SectionLabel>
        <p :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ link.client }}</p>
        <p :class="['text-xs font-medium mt-0.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ link.email }}</p>
      </div>

      <div>
        <SectionLabel class="mb-3">{{ t('links.linkUrl') }}</SectionLabel>
        <div :class="['flex items-center gap-2 p-3 rounded-xl border', themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5']">
          <span :class="['flex-1 text-xs font-mono truncate', themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]']">{{ url }}</span>
          <Button :aria-label="t('links.copyLink')" variant="ghost" size="sm" class="!p-1.5 shrink-0" @click="handleCopy">
            <Copy :size="14" />
          </Button>
        </div>
      </div>

      <div :class="['flex items-center gap-3 text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        <CalendarDays :size="13" />
        <span>{{ t('links.created', { date: formattedCreatedAt }) }}</span>
      </div>

      <div class="flex gap-2">
        <Button variant="outline" size="sm" class="flex-1 !py-2.5 justify-center" :disabled="link.status === 'expired'" @click="handleCopy">
          <Copy :size="15" /> {{ t('links.copyLink') }}
        </Button>
        <Button variant="outline" size="sm" class="flex-1 !py-2.5 justify-center" :disabled="link.status === 'expired'">
          <QrCode :size="15" /> {{ t('links.generateQr') }}
        </Button>
        <Button variant="outline" size="sm" class="flex-1 !py-2.5 justify-center" :disabled="link.status === 'paid'" @click="handleEdit">
          {{ t('common.edit') }}
        </Button>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" class="flex-1 !py-3.5" @click="emit('close')">{{ t('common.close') }}</Button>
      <Button class="flex-1 !py-3.5" :disabled="link.status === 'expired' || link.status === 'paid'">
        <Mail :size="16" /> {{ t('links.send') }}
      </Button>
    </template>
  </Modal>
</template>
