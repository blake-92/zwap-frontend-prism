<script setup>
import { computed } from 'vue'
import { Copy, QrCode, Mail, Timer, ListTree, CalendarDays, Clock } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import { useThemeStore } from '~/stores/theme'
import { ACTIONS, formatTimeRemaining } from './triage.js'

const props = defineProps({ link: { type: Object, required: true } })
const emit = defineEmits(['close', 'copy'])

const { t } = useI18n()
const themeStore = useThemeStore()
const cfg = computed(() => ACTIONS[props.link.action])

const timeClass = computed(() => {
  const m = props.link.expiresInMinutes ?? Infinity
  if (m < 60) return 'text-rose-500'
  if (m < 180) return 'text-amber-500'
  return themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'
})
</script>

<template>
  <Modal
    :title="link.client"
    :description="link.email"
    :icon="Clock"
    max-width="440px"
    @close="emit('close')"
  >
    <div class="p-5 sm:p-8 space-y-5">
      <div :class="['p-4 rounded-xl border', cfg.tint]">
        <SectionLabel class="mb-2">{{ t('dashboard.recommendation') }}</SectionLabel>
        <div class="flex items-start gap-3">
          <component :is="cfg.Icon" :size="22" :class="[cfg.text, 'shrink-0 mt-0.5']" :stroke-width="2.25" />
          <div class="flex-1 min-w-0">
            <p :class="['text-xl font-bold capitalize leading-none', cfg.text]">{{ t(cfg.labelKey) }}</p>
            <p :class="['text-xs font-medium mt-1.5', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
              {{ t(cfg.reasonKey) }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-baseline justify-between">
        <span :class="['font-mono font-bold text-3xl tracking-tighter', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ link.amount }}</span>
        <span :class="['flex items-center gap-1.5 text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          <ListTree :size="13" /> {{ link.items }} {{ t('dashboard.items') }}
        </span>
      </div>

      <div :class="['p-4 rounded-xl border', themeStore.isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5']">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p :class="['text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
              <Eye :size="11" /> {{ t('dashboard.views') }}
            </p>
            <p :class="['font-mono font-bold text-2xl leading-none', cfg.text]">{{ link.views }}</p>
          </div>
          <div>
            <p :class="['text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
              <Timer :size="11" /> {{ t('dashboard.expiresIn') }}
            </p>
            <p :class="['font-mono font-bold text-2xl leading-none', timeClass]">{{ formatTimeRemaining(link.expiresInMinutes, t) }}</p>
          </div>
        </div>
      </div>

      <div :class="['flex items-center gap-1.5 text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        <CalendarDays :size="13" /> {{ t('links.created', { date: link.createdAt }) }}
      </div>

      <div class="flex gap-2">
        <Button variant="outline" size="sm" class="flex-1 !py-2.5 justify-center">
          <QrCode :size="15" /> {{ t('links.generateQr') }}
        </Button>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" class="flex-1 !py-3.5" @click="emit('copy', link)">
        <Copy :size="16" /> {{ t('links.copyLink') }}
      </Button>
      <Button class="flex-1 !py-3.5">
        <Mail :size="16" /> {{ t('links.send') }}
      </Button>
    </template>
  </Modal>
</template>
