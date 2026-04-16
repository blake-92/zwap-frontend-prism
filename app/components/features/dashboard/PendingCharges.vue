<script setup>
import { ref, computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { Copy, QrCode, Mail, Timer, Eye, Clock, ListTree, CalendarDays } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { listVariants, itemVariants } from '~/utils/motionVariants'
import { CUSTOM_LINKS } from '~/utils/mockData'
import { ROUTES } from '~/utils/routes'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import TriageDetailModal from './TriageDetailModal.vue'
import { ACTIONS, formatTimeRemaining } from './triage.js'

const MAX_ITEMS = 10
const MAX_ITEMS_MOBILE = 5
const LIFE_EARLY_THRESHOLD = 0.30
const LIFE_LATE_THRESHOLD = 0.70
const HIGH_FRICTION_VIEWS = 5

const HIGH_FRICTION = HIGH_FRICTION_VIEWS

function classifyAction(views, lifeElapsedPct) {
  const early = lifeElapsedPct < LIFE_EARLY_THRESHOLD
  const late = lifeElapsedPct >= LIFE_LATE_THRESHOLD
  if (views >= HIGH_FRICTION) return 'ayudar'
  if (views === 0) {
    if (early) return 'esperar'
    if (late) return 'llamar'
    return 'reenviar'
  }
  if (views === 1) return late ? 'llamar' : 'esperar'
  return late ? 'ayudar' : 'interes'
}

const { t } = useI18n()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const isMobile = useMediaQuery('(max-width: 639px)')
const detail = ref(null)

const links = computed(() => (
  CUSTOM_LINKS
    .filter((l) => l.status === 'Pendiente')
    .map((l) => {
      const total = (l.createdMinutesAgo ?? 0) + (l.expiresInMinutes ?? 0)
      const lifeElapsedPct = total > 0 ? (l.createdMinutesAgo ?? 0) / total : 0
      const action = classifyAction(l.views ?? 0, lifeElapsedPct)
      return { ...l, action }
    })
    .sort((a, b) => {
      const pa = ACTIONS[a.action].priority
      const pb = ACTIONS[b.action].priority
      if (pa !== pb) return pa - pb
      return (a.expiresInMinutes ?? Infinity) - (b.expiresInMinutes ?? Infinity)
    })
    .slice(0, MAX_ITEMS)
))

const mobileLinks = computed(() => links.value.slice(0, MAX_ITEMS_MOBILE))

const handleCopy = (link) => {
  if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(`https://zwap.me/pay/${link.id}`)
  const key = isMobile.value ? 'links.linkCopiedShort' : 'links.linkCopied'
  toastStore.addToast(t(key, { name: link.client }), 'success')
}

const goLinks = () => navigateTo(ROUTES.LINKS)

const theadClass = computed(() =>
  themeStore.isDarkMode
    ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
    : 'text-[#67656E] border-b border-black/5 bg-white/50',
)
const trClass = computed(() =>
  themeStore.isDarkMode
    ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
    : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0',
)

const timeClass = (mins) => {
  const m = mins ?? Infinity
  if (m < 60) return 'text-rose-500'
  if (m < 180) return 'text-amber-500'
  return themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'
}

const rowBorder = (i, total) => {
  if (i >= total - 1) return ''
  return themeStore.isDarkMode ? 'border-b border-white/5' : 'border-b border-black/5'
}
</script>

<template>
  <!-- Mobile view -->
  <template v-if="!isDesktop">
    <Card class="p-0 overflow-hidden">
      <div :class="['px-4 pt-3.5 pb-3 flex items-center justify-between border-b', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
        <div class="flex items-center gap-2 min-w-0">
          <Clock :size="14" class="text-amber-500 shrink-0" />
          <p :class="['text-xs font-bold truncate', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ t('dashboard.pendingLinks') }}</p>
        </div>
        <Button variant="ghost" size="sm" class="!text-[#7C3AED] !h-7 !px-2 !text-[11px]" @click="goLinks">
          {{ t('dashboard.viewAllShort') }}
        </Button>
      </div>

      <motion.div :variants="listVariants" initial="hidden" animate="show">
        <motion.button
          v-for="(link, i) in mobileLinks"
          :key="link.id"
          :variants="itemVariants"
          :class="[
            'w-full flex items-stretch gap-3 px-4 py-2.5 text-left cursor-pointer active:opacity-70 transition-opacity',
            rowBorder(i, mobileLinks.length)
          ]"
          @click="detail = link"
        >
          <div class="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            <div class="flex items-center justify-between gap-2">
              <p :class="['text-[13px] font-bold truncate', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ link.client }}</p>
              <span :class="['font-mono font-bold text-[15px] tracking-tight shrink-0', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ link.amount }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold', ACTIONS[link.action].chip, ACTIONS[link.action].text]">
                <Eye :size="11" :stroke-width="2.5" />
                <span class="font-mono">{{ link.views }}</span>
              </span>
              <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold', ACTIONS[link.action].chip, ACTIONS[link.action].text]">
                <Timer :size="11" :stroke-width="2.5" />
                <span class="font-mono">{{ formatTimeRemaining(link.expiresInMinutes, t) }}</span>
              </span>
            </div>
          </div>
        </motion.button>
      </motion.div>
    </Card>

    <AnimatePresence>
      <TriageDetailModal
        v-if="detail"
        :link="detail"
        @close="detail = null"
        @copy="handleCopy"
      />
    </AnimatePresence>
  </template>

  <!-- Desktop view -->
  <Card v-else class="p-0 flex flex-col">
    <CardHeader :description="t('dashboard.pendingLinksDesc')">
      <template #title>
        <Clock :size="18" class="text-amber-500" /> {{ t('dashboard.pendingLinks') }}
      </template>
      <Button variant="ghost" size="sm" @click="goLinks">{{ t('dashboard.viewAllShort') }}</Button>
    </CardHeader>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[820px]" :aria-label="t('dashboard.pendingLinks')">
        <thead>
          <tr :class="['text-[10px] uppercase font-bold tracking-widest', theadClass]">
            <th class="px-6 py-3">{{ t('transactions.tableClient') }}</th>
            <th class="px-6 py-3">{{ t('settlements.tableDetail') }}</th>
            <th class="px-4 py-3 text-center">{{ t('dashboard.views') }}</th>
            <th class="px-6 py-3">{{ t('dashboard.expiresIn') }}</th>
            <th class="px-4 py-3 text-center">{{ t('dashboard.recommendation') }}</th>
            <th class="px-6 py-3 text-right">{{ t('transactions.tableActions') }}</th>
          </tr>
        </thead>
        <motion.tbody :variants="listVariants" initial="hidden" animate="show">
          <motion.tr
            v-for="link in links"
            :key="link.id"
            :variants="itemVariants"
            :class="['group transition-colors duration-200', trClass]"
          >
            <td class="px-6 py-3.5">
              <p :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ link.client }}</p>
              <p :class="['text-xs font-medium mt-0.5 truncate max-w-[200px]', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ link.email }}</p>
            </td>
            <td class="px-6 py-3.5">
              <p :class="['font-mono font-bold text-[15px] tracking-tight', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ link.amount }}</p>
              <p :class="['text-[11px] font-medium flex items-center gap-1.5 mt-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                <ListTree :size="12" class="opacity-70" /> {{ link.items }} {{ t('dashboard.items') }}
              </p>
            </td>
            <td class="px-4 py-3.5">
              <div class="flex justify-center">
                <span :class="['font-mono font-bold text-2xl leading-none tracking-tight', ACTIONS[link.action].text]">{{ link.views }}</span>
              </div>
            </td>
            <td class="px-6 py-3.5">
              <p :class="['text-xs font-bold flex items-center gap-1.5', timeClass(link.expiresInMinutes)]">
                <Timer :size="14" class="opacity-70" />
                {{ t('links.expires', { date: link.expires }) }}
              </p>
              <p :class="['text-[10px] font-medium flex items-center gap-1.5 mt-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                <CalendarDays :size="12" class="opacity-70" /> {{ t('links.created', { date: link.createdAt }) }}
              </p>
            </td>
            <td class="px-4 py-3.5">
              <div class="flex flex-col items-center gap-1">
                <component :is="ACTIONS[link.action].Icon" :size="18" :class="ACTIONS[link.action].text" :stroke-width="2.25" />
                <span :class="['text-[10px] font-bold uppercase tracking-wider', ACTIONS[link.action].text]">{{ t(ACTIONS[link.action].labelKey) }}</span>
              </div>
            </td>
            <td class="px-6 py-3.5 text-right">
              <div class="flex items-center justify-end gap-1">
                <Tooltip :content="t('links.copyLink')" position="top">
                  <Button variant="ghost" size="sm" class="!px-2" @click="handleCopy(link)">
                    <Copy :size="15" />
                  </Button>
                </Tooltip>
                <Tooltip :content="t('links.generateQr')" position="top">
                  <Button variant="ghost" size="sm" class="!px-2">
                    <QrCode :size="15" />
                  </Button>
                </Tooltip>
                <Tooltip :content="t('users.sendByEmail')" position="top">
                  <Button variant="action" size="sm" class="!px-3 ml-1">
                    <Mail :size="15" />
                    <span class="hidden xl:inline text-xs ml-1">{{ t('links.send') }}</span>
                  </Button>
                </Tooltip>
              </div>
            </td>
          </motion.tr>
        </motion.tbody>
      </table>
    </div>
  </Card>
</template>
