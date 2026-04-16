<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { Download, ChevronDown, Edit2, Mail, Eye, Timer, ListTree, CalendarDays, Copy, QrCode } from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useToastStore } from '~/stores/toast'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { CUSTOM_LINKS } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import TableToolbar from '~/components/ui/TableToolbar.vue'
import EmptySearchState from '~/components/ui/EmptySearchState.vue'
import SwipeableCard from '~/components/ui/SwipeableCard.vue'

const mv = useMotionVariants()
const props = defineProps({
  search: { type: String, default: '' },
})
const emit = defineEmits(['detail', 'edit', 'clearSearch'])

const { t } = useI18n()
const themeStore = useThemeStore()
const toastStore = useToastStore()
const isMobile = useMediaQuery('(max-width: 639px)')

const filtered = computed(() => {
  if (!props.search) return CUSTOM_LINKS
  const q = props.search.toLowerCase()
  return CUSTOM_LINKS.filter(l => l.client.toLowerCase().includes(q))
})

const handleCopy = (link) => {
  if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(`https://zwap.me/pay/${link.id}`)
  const key = isMobile.value ? 'links.linkCopiedShort' : 'links.linkCopied'
  toastStore.addToast(t(key, { name: link.client }), 'success')
}

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

const mobileActions = (link) => [
  { label: t('common.edit'), icon: Edit2, disabled: link.status === 'Pagado', onClick: () => emit('edit', link) },
]
</script>

<template>
  <TableToolbar :has-actions="true">
    <Button variant="outline" size="sm">
      {{ t('filters.status') }} <ChevronDown :size="12" />
    </Button>
    <template #actions>
      <Button variant="successExport" size="sm"><Download :size="14" /> {{ t('common.exportCsv') }}</Button>
    </template>
  </TableToolbar>

  <!-- Desktop table -->
  <Card class="pb-2 hidden lg:block">
    <div class="overflow-x-auto">
      <table :aria-label="t('links.title')" class="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr :class="['text-[10px] uppercase font-bold tracking-widest', theadClass]">
            <th class="px-8 py-4">{{ t('transactions.tableClient') }}</th>
            <th class="px-6 py-4">{{ t('settlements.tableDetail') }}</th>
            <th class="px-6 py-4">{{ t('settlements.tableTiming') }}</th>
            <th class="px-6 py-4 text-center">{{ t('filters.status') }}</th>
            <th class="px-8 py-4 text-right">{{ t('transactions.tableActions') }}</th>
          </tr>
        </thead>
        <motion.tbody :variants="mv.list.value" initial="hidden" animate="show">
          <template v-if="filtered.length === 0">
            <EmptySearchState :col-span="5" :term="search" @clear="emit('clearSearch')" />
          </template>
          <motion.tr
            v-for="link in filtered"
            v-else
            :key="link.id"
            :variants="mv.item.value"
            :class="['group transition-colors duration-200', trClass]"
          >
            <td class="px-8 py-4">
              <div>
                <p :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ link.client }}</p>
                <p :class="['text-xs font-medium mt-0.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ link.email }}</p>
              </div>
            </td>
            <td class="px-6 py-4">
              <p :class="['font-mono font-bold text-[15px] tracking-tight', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ link.amount }}</p>
              <p :class="['text-[11px] font-medium flex items-center gap-1.5 mt-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                <ListTree :size="12" class="opacity-70" /> {{ link.items }} {{ t('dashboard.items') }}
              </p>
            </td>
            <td class="px-6 py-4">
              <p :class="[
                'text-xs font-bold flex items-center gap-1.5',
                link.status === 'Expirado' ? 'text-rose-500' : themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'
              ]">
                <Timer :size="14" class="opacity-70" />
                {{ link.expires !== '-' ? t('links.expires', { date: link.expires }) : t('links.noExpiration') }}
              </p>
              <p :class="['text-[10px] font-medium flex items-center gap-1.5 mt-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                <CalendarDays :size="12" class="opacity-70" /> {{ t('links.created', { date: link.createdAt }) }}
              </p>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex flex-col items-center gap-1.5">
                <Badge :variant="link.statusVariant" :icon="link.StatusIcon">{{ link.status }}</Badge>
                <p :class="['text-[10px] font-medium flex items-center gap-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  <Eye :size="10" /> {{ link.views }} {{ t('links.views') }}
                </p>
              </div>
            </td>
            <td class="px-8 py-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <Tooltip :content="t('common.edit')" position="top">
                  <Button variant="ghost" size="sm" class="!px-2" :disabled="link.status === 'Pagado'" @click="emit('edit', link)">
                    <Edit2 :size="15" />
                  </Button>
                </Tooltip>
                <Tooltip :content="t('links.copyLink')" position="top">
                  <Button variant="ghost" size="sm" class="!px-2" :disabled="link.status === 'Expirado'" @click="handleCopy(link)">
                    <Copy :size="15" />
                  </Button>
                </Tooltip>
                <Tooltip :content="t('links.generateQr')" position="top">
                  <Button variant="ghost" size="sm" class="!px-2" :disabled="link.status === 'Expirado'">
                    <QrCode :size="15" />
                  </Button>
                </Tooltip>
                <Tooltip :content="t('users.sendByEmail')" position="top">
                  <Button variant="action" size="sm" class="!px-3 ml-1" :disabled="link.status === 'Expirado' || link.status === 'Pagado'">
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

  <!-- Mobile cards with SwipeableCard -->
  <div class="lg:hidden">
    <motion.div v-if="filtered.length > 0" :variants="mv.list.value" initial="hidden" animate="show" class="space-y-3">
      <motion.div v-for="link in filtered" :key="link.id" :variants="mv.cardItem.value">
        <SwipeableCard :actions="mobileActions(link)">
          <div class="p-4" @click="emit('detail', link)">
            <div class="flex items-center justify-between gap-2 mb-2.5">
              <p :class="['text-sm font-bold truncate min-w-0', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ link.client }}</p>
              <span :class="['font-mono font-bold text-lg tracking-tight shrink-0', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ link.amount }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-2.5">
                <Badge :variant="link.statusVariant" :icon="link.StatusIcon" />
                <span :class="['text-[10px] font-medium flex items-center gap-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']"><ListTree :size="10" /> {{ link.items }}</span>
                <span :class="['text-[10px] font-medium flex items-center gap-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']"><Eye :size="10" /> {{ link.views }}</span>
              </div>
              <span :class="[
                'text-[11px] font-bold flex items-center gap-1',
                link.status === 'Expirado' ? 'text-rose-500' : themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
              ]">
                <Timer :size="11" />
                {{ link.expires !== '-' ? link.expires : t('links.noExpiration') }}
              </span>
            </div>
          </div>
          <div :class="['flex items-center gap-1.5 px-4 pb-4', themeStore.isDarkMode ? 'border-white/5' : 'border-black/5']">
            <Button variant="ghost" size="sm" class="!p-2.5 flex-1 justify-center" :disabled="link.status === 'Expirado' || link.status === 'Pagado'" @click.stop>
              <Mail :size="16" />
            </Button>
            <Button variant="ghost" size="sm" class="!p-2.5 flex-1 justify-center" :disabled="link.status === 'Expirado'" @click.stop="handleCopy(link)">
              <Copy :size="16" />
            </Button>
            <Button variant="ghost" size="sm" class="!p-2.5 flex-1 justify-center" :disabled="link.status === 'Expirado'" @click.stop>
              <QrCode :size="16" />
            </Button>
          </div>
        </SwipeableCard>
      </motion.div>
    </motion.div>
    <Card v-else class="p-8 text-center">
      <p :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
        {{ search ? t('links.notFoundFor', { term: search }) : t('links.notFound') }}
      </p>
      <Button v-if="search" variant="ghost" size="sm" class="mt-2" @click="emit('clearSearch')">
        {{ t('common.clearSearch') }}
      </Button>
    </Card>
  </div>
</template>
