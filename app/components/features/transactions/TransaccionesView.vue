<script setup>
import { ref, computed, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import {
  Calendar, Download,
  Link as LinkIcon, Clock, CreditCard, Globe2,
  FileText, RotateCcw, Filter, Loader2,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useViewSearch } from '~/composables/useViewSearch'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { listVariants, itemVariants, pageVariants } from '~/utils/motionVariants'
import { TRANSACTIONS } from '~/utils/mockData'
import { ROUTES } from '~/utils/routes'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import DropdownFilter from '~/components/ui/DropdownFilter.vue'
import Pagination from '~/components/ui/Pagination.vue'
import EmptySearchState from '~/components/ui/EmptySearchState.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import TableToolbar from '~/components/ui/TableToolbar.vue'
import SwipeableCard from '~/components/ui/SwipeableCard.vue'
import ReceiptModal from './ReceiptModal.vue'
import RefundModal from './RefundModal.vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const viewSearch = useViewSearch(computed(() => t('transactions.searchPlaceholder')))

const receiptTrx = ref(null)
const refundTrx = ref(null)

const defaultStatus = computed(() => t('filters.all'))
const defaultDate = computed(() => t('filters.anyDate'))
const statusFilter = ref('')
const dateFilter = ref('')
watch(defaultStatus, (v) => { if (!statusFilter.value) statusFilter.value = v }, { immediate: true })
watch(defaultDate, (v) => { if (!dateFilter.value) dateFilter.value = v }, { immediate: true })

const currentPage = ref(1)
const ITEMS_PER_PAGE = 7

watch(() => viewSearch.query, () => { currentPage.value = 1 })

const filtersActive = computed(() =>
  (statusFilter.value !== defaultStatus.value ? 1 : 0) +
  (dateFilter.value !== defaultDate.value ? 1 : 0),
)
watch(filtersActive, (v) => viewSearch.setActiveFilterCount(v), { immediate: true })

const resetFilters = () => {
  statusFilter.value = defaultStatus.value
  dateFilter.value = defaultDate.value
  currentPage.value = 1
}

const filtered = computed(() => {
  const q = viewSearch.query?.toLowerCase() || ''
  const tToday = t('filters.today')
  const tLast7 = t('filters.last7days')
  const tThisMonth = t('filters.thisMonth')
  return TRANSACTIONS.filter(trx => {
    const matchSearch = !q ||
      (trx.client?.toLowerCase().includes(q)) ||
      (trx.email?.toLowerCase().includes(q)) ||
      trx.id.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === defaultStatus.value || trx.status === statusFilter.value
    let matchDate = true
    if (dateFilter.value !== defaultDate.value) {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const today = new Date()
      if (dateFilter.value === tToday) {
        const monthStr = months[today.getMonth()]
        matchDate = trx.date.includes(`${today.getDate()} ${monthStr}`) && trx.date.includes(`${today.getFullYear()}`)
      } else if (dateFilter.value === tLast7) {
        matchDate = trx.date.includes('29 Mar') || trx.date.includes('28 Mar') || trx.date.includes('27 Mar')
      } else if (dateFilter.value === tThisMonth) {
        matchDate = trx.date.includes(months[today.getMonth()])
      }
    }
    return matchSearch && matchStatus && matchDate
  })
})

const totalPages = computed(() => Math.ceil(filtered.value.length / ITEMS_PER_PAGE))
const paginatedData = computed(() =>
  filtered.value.slice((currentPage.value - 1) * ITEMS_PER_PAGE, currentPage.value * ITEMS_PER_PAGE),
)

const { visibleData, hasMore, sentinelRef } = useInfiniteScroll(filtered, {
  batchSize: 10,
  enabled: computed(() => !isDesktop.value),
})

const amountClass = (trx) => {
  if (trx.status === 'Reembolsado') return 'text-rose-500 line-through opacity-70'
  return themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'
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

const mobileActions = (trx) => [
  { label: t('transactions.viewReceipt'), icon: FileText, onClick: () => { receiptTrx.value = trx } },
  trx.status === 'Reembolsado'
    ? { label: t('transactions.refundReceipt'), icon: FileText, onClick: () => { refundTrx.value = trx } }
    : { label: t('transactions.refund'), icon: RotateCcw, variant: 'danger', disabled: trx.status === 'Pendiente', onClick: () => { refundTrx.value = trx } },
]

const goLinks = () => navigateTo(ROUTES.LINKS)
</script>

<template>
  <motion.div :variants="pageVariants" initial="hidden" animate="show" exit="exit">
    <PageHeader :title="t('transactions.title')">
      <Button class="hidden sm:flex" @click="goLinks">
        <LinkIcon :size="18" /> {{ t('transactions.viewLinks') }}
      </Button>
    </PageHeader>

    <TableToolbar :has-actions="true" :on-reset="filtersActive > 0 ? resetFilters : undefined" @reset="resetFilters">
      <DropdownFilter
        :label="t('filters.date')"
        :icon="Calendar"
        :options="[defaultDate, t('filters.today'), t('filters.last7days'), t('filters.thisMonth')]"
        :default-value="defaultDate"
        :model-value="dateFilter"
        @update:model-value="(v) => { dateFilter = v; currentPage = 1 }"
      />
      <DropdownFilter
        :label="t('filters.status')"
        :icon="Filter"
        :options="[defaultStatus, t('filters.successful'), t('filters.pending'), t('filters.refunded')]"
        :default-value="defaultStatus"
        :model-value="statusFilter"
        @update:model-value="(v) => { statusFilter = v; currentPage = 1 }"
      />
      <template #actions>
        <Button variant="successExport" size="sm" class="!px-3">
          <Download :size="14" /><span class="ml-1.5">{{ t('common.exportCsv') }}</span>
        </Button>
      </template>
    </TableToolbar>

    <!-- Desktop table -->
    <Card class="pb-2 hidden lg:block">
      <div class="overflow-x-auto">
        <table :aria-label="t('transactions.title')" class="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr :class="['text-[10px] uppercase font-bold tracking-widest', theadClass]">
              <th class="px-8 py-4 min-w-[140px]">{{ t('transactions.tableDate') }}</th>
              <th class="px-6 py-4 min-w-[220px]">{{ t('transactions.tableClient') }}</th>
              <th class="px-6 py-4 min-w-[280px]">{{ t('transactions.tableDetails') }}</th>
              <th class="px-6 py-4 text-right min-w-[140px]">{{ t('transactions.tableAmount') }}</th>
              <th class="px-8 py-4 text-right min-w-[160px]">{{ t('transactions.tableActions') }}</th>
            </tr>
          </thead>
          <motion.tbody :variants="listVariants" initial="hidden" animate="show">
            <template v-if="paginatedData.length === 0">
              <EmptySearchState :col-span="5" :term="viewSearch.query" @clear="viewSearch.setQuery('')" />
            </template>
            <motion.tr
              v-for="trx in paginatedData"
              v-else
              :key="trx.id"
              :variants="itemVariants"
              :class="['group transition-colors duration-200', trClass]"
            >
              <td class="px-8 py-4">
                <p :class="['font-bold text-sm', themeStore.isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]']">{{ trx.date }}</p>
                <p :class="['text-xs font-medium mt-1 flex items-center gap-1.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  <Clock :size="12" class="opacity-70" /> {{ trx.time }}
                </p>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col gap-0.5 min-w-0 max-w-[200px]">
                  <p :class="['font-bold text-sm truncate', themeStore.isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]']" :title="trx.client || t('common.anonymousClient')">
                    {{ trx.client || t('common.anonymousClient') }}
                  </p>
                  <div :class="['flex items-center gap-1.5 text-[11px] font-medium truncate', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                    <span class="flex items-center gap-1 flex-shrink-0">
                      <CreditCard :size="12" class="opacity-70" />
                      <span class="font-mono tracking-widest opacity-70">••</span>
                      <span class="font-mono">{{ trx.last4 }}</span>
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col items-start gap-2">
                  <Badge :variant="trx.statusVariant" :icon="trx.StatusIcon">{{ trx.status }}</Badge>
                  <div :class="['flex items-center gap-2 text-[11px] font-medium flex-wrap', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                    <span class="flex items-center gap-1.5">
                      <component :is="trx.ChannelIcon" :size="12" class="opacity-70" />
                      <span class="hidden xl:inline">{{ trx.channel }}</span>
                      <span class="inline xl:hidden">{{ trx.channel.includes('POS') ? 'POS' : 'Link' }}</span>
                    </span>
                    <span class="opacity-40">•</span>
                    <span class="flex items-center gap-1.5" :title="trx.country">
                      <Globe2 v-if="trx.countryCode === 'xx'" :size="12" class="opacity-70" />
                      <img v-else :src="`https://flagcdn.com/w20/${trx.countryCode}.png`" :alt="trx.country" class="w-3.5 h-3.5 rounded-full object-cover" />
                      <span class="hidden xl:inline">{{ trx.country }}</span>
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <span :class="['font-mono font-bold text-lg tracking-tight', amountClass(trx)]">${{ trx.amount }}</span>
              </td>
              <td class="px-8 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <Tooltip :content="t('transactions.viewReceipt')" position="top">
                    <Button variant="action" size="sm" class="!px-3 !py-2" @click="receiptTrx = trx">
                      <FileText :size="15" />
                      <span class="hidden xl:inline ml-1">{{ t('transactions.receiptShort') }}</span>
                    </Button>
                  </Tooltip>
                  <Tooltip v-if="trx.status === 'Reembolsado'" :content="t('transactions.refundReceipt')" position="top">
                    <Button variant="outline" size="sm" class="!px-3 !py-2" @click="refundTrx = trx">
                      <FileText :size="15" />
                      <span class="hidden xl:inline ml-1">{{ t('transactions.refundReceipt') }}</span>
                    </Button>
                  </Tooltip>
                  <Tooltip v-else :content="t('transactions.refund')" position="top">
                    <Button variant="danger" size="sm" class="!px-3 !py-2" :disabled="trx.status === 'Pendiente'" @click="refundTrx = trx">
                      <RotateCcw :size="15" />
                      <span class="hidden xl:inline ml-1">{{ t('transactions.refund') }}</span>
                    </Button>
                  </Tooltip>
                </div>
              </td>
            </motion.tr>
          </motion.tbody>
        </table>
      </div>
      <div class="px-6 pb-2">
        <Pagination :current-page="currentPage" :total-pages="totalPages" @page-change="currentPage = $event" />
      </div>
    </Card>

    <!-- Mobile cards with SwipeableCard -->
    <div class="lg:hidden space-y-3">
      <motion.div v-if="visibleData.length > 0" :variants="listVariants" initial="hidden" animate="show" class="space-y-3">
        <motion.div v-for="trx in visibleData" :key="trx.id" :variants="itemVariants">
          <SwipeableCard :actions="mobileActions(trx)">
            <div class="p-4">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex flex-col gap-0.5 min-w-0">
                  <p :class="['font-bold text-sm truncate', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']" :title="trx.client || t('common.anonymousClient')">
                    {{ trx.client || t('common.anonymousClient') }}
                  </p>
                  <div :class="['flex items-center gap-1.5 text-[11px] font-medium truncate', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                    <span class="flex items-center gap-1 flex-shrink-0">
                      <CreditCard :size="12" class="opacity-70" />
                      <span class="font-mono tracking-widest opacity-70">••</span>
                      <span class="font-mono">{{ trx.last4 }}</span>
                    </span>
                  </div>
                </div>
                <span :class="['font-mono font-bold text-lg tracking-tight mt-0.5 flex-shrink-0', amountClass(trx)]">${{ trx.amount }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <Badge :variant="trx.statusVariant" :icon="trx.StatusIcon" :title="trx.status" />
                  <span :class="['text-[11px] font-medium flex items-center gap-1 opacity-70', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']" :title="trx.channel">
                    <component :is="trx.ChannelIcon" :size="14" />
                  </span>
                </div>
                <span :class="['text-[11px] font-medium flex items-center gap-1.5 opacity-80', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  <Clock :size="12" /> {{ trx.date }} {{ trx.time }}
                </span>
              </div>
            </div>
          </SwipeableCard>
        </motion.div>
      </motion.div>
      <Card v-else class="p-8 text-center">
        <p :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ viewSearch.query ? t('transactions.notFoundFor', { term: viewSearch.query }) : t('transactions.notFound') }}
        </p>
        <Button v-if="viewSearch.query" variant="ghost" size="sm" class="mt-2" @click="viewSearch.setQuery('')">
          {{ t('common.clearSearch') }}
        </Button>
      </Card>
      <div ref="sentinelRef" class="flex justify-center py-4">
        <Loader2 v-if="hasMore" :size="20" class="animate-spin text-[#7C3AED]" />
      </div>
    </div>

    <AnimatePresence>
      <ReceiptModal v-if="receiptTrx" key="receipt" :trx="receiptTrx" @close="receiptTrx = null" />
    </AnimatePresence>
    <AnimatePresence>
      <RefundModal v-if="refundTrx" key="refund" :trx="refundTrx" @close="refundTrx = null" />
    </AnimatePresence>
  </motion.div>
</template>
