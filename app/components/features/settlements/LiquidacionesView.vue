<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'
import {
  Download, Calendar, Search,
  CheckCircle2, Landmark, AlertOctagon,
  CalendarDays, Clock, ArrowDownToLine, Filter, Loader2,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useViewSearch } from '~/composables/useViewSearch'
import { useDebouncedSearch } from '~/composables/useDebouncedSearch'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { useFilterSlot } from '~/composables/useFilterSlot'
import { useDateRangeMatcher } from '~/composables/useDateRangeMatcher'
import { PAYOUTS, WALLET_BALANCE, SETTLEMENT_SUMMARY } from '~/utils/mockData'
import { formatDate } from '~/utils/formatDate'
import { getTheadClass, getTableRowClass } from '~/utils/cardClasses'
import { usePerformanceStore } from '~/stores/performance'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import StatCard from '~/components/ui/StatCard.vue'
import DropdownFilter from '~/components/ui/DropdownFilter.vue'
import Pagination from '~/components/ui/Pagination.vue'
import EmptySearchState from '~/components/ui/EmptySearchState.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import TableToolbar from '~/components/ui/TableToolbar.vue'

const mv = useMotionVariants()
const { t, locale } = useI18n()
const fmtDate = (iso) => formatDate(iso, locale.value)
const themeStore = useThemeStore()
const perfStore = usePerformanceStore()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const viewSearch = useViewSearch(computed(() => t('settlements.searchPlaceholder')))

const {
  current: statusFilter, defaultValue: defaultStatus,
  isDirty: statusDirty, reset: resetStatus,
} = useFilterSlot(() => t('filters.all'))
const {
  current: dateFilter, defaultValue: defaultDate,
  isDirty: dateDirty, reset: resetDate,
} = useFilterSlot(() => t('filters.anyDate'))
const { match: matchDate } = useDateRangeMatcher(t)

const currentPage = ref(1)
const ITEMS_PER_PAGE = 7

// Debounce solo en Lite + reset page inmediato
const debouncedQuery = useDebouncedSearch(
  () => viewSearch.query,
  { onInput: () => { currentPage.value = 1 } },
)

const filtersActive = computed(() => (statusDirty.value ? 1 : 0) + (dateDirty.value ? 1 : 0))
watch(filtersActive, (v) => viewSearch.setActiveFilterCount(v), { immediate: true })

const resetFilters = () => {
  resetStatus()
  resetDate()
  currentPage.value = 1
}

const filtered = computed(() => {
  const q = debouncedQuery.value?.toLowerCase() || ''
  return PAYOUTS.filter(p => {
    const typeLabel = t(`type.${p.type}`).toLowerCase()
    const matchSearch = !q || typeLabel.includes(q) || fmtDate(p.closeDate).toLowerCase().includes(q)
    const matchStatus = !statusDirty.value || t(`status.${p.status}`) === statusFilter.value
    return matchSearch && matchStatus && matchDate(p.closeDate, dateFilter.value, defaultDate.value)
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

const theadClass = computed(() => getTheadClass(themeStore.isDarkMode, perfStore.isLite))
const trClass = computed(() => getTableRowClass(themeStore.isDarkMode))

const typeIconClass = (isDebt) => {
  if (isDebt) return themeStore.isDarkMode ? 'bg-rose-500/15 text-rose-500' : 'bg-rose-100 text-rose-600'
  return themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
}
const netClass = (isDebt) => {
  if (isDebt) return 'text-rose-500'
  return themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'
}
</script>

<template>
  <motion.div :variants="mv.page.value" initial="hidden" animate="show" exit="exit">
    <PageHeader :title="t('settlements.title')">
      <Button variant="outline"><Download :size="18" /> {{ t('settlements.downloadFiscal') }}</Button>
    </PageHeader>

    <div class="sm:hidden mb-6">
      <Button variant="outline" size="lg" class="w-full">
        <Download :size="18" /> {{ t('settlements.downloadFiscal') }}
      </Button>
    </div>

    <!-- KPI row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-10">
      <StatCard layout="balance" :icon="CheckCircle2" icon-variant="success"
        :label="t('settlements.deposited')" :value="WALLET_BALANCE.display"
        :badge="t('settlements.last30days')" badge-variant="success" />
      <StatCard layout="balance" :icon="Landmark" icon-variant="warning"
        :label="t('settlements.inTransitBanks')" :value="SETTLEMENT_SUMMARY.inTransit"
        :badge="SETTLEMENT_SUMMARY.inTransitBadge" badge-variant="warning" />
      <StatCard layout="balance" :icon="AlertOctagon" icon-variant="danger"
        :label="t('settlements.retentions')" :value="SETTLEMENT_SUMMARY.adjustments"
        :badge="SETTLEMENT_SUMMARY.adjustmentsBadge" badge-variant="danger" negative />
    </div>

    <TableToolbar :has-actions="true" :on-reset="filtersActive > 0 ? resetFilters : undefined" @reset="resetFilters">
      <DropdownFilter
        :label="t('filters.date')"
        :icon="Calendar"
        :options="[defaultDate, t('filters.thisWeek'), t('filters.thisMonth')]"
        :default-value="defaultDate"
        :model-value="dateFilter"
        @update:model-value="(v) => { dateFilter = v; currentPage = 1 }"
      />
      <DropdownFilter
        :label="t('filters.status')"
        :icon="Filter"
        :options="[defaultStatus, t('status.deposited'), t('status.processing'), t('status.inTransit'), t('status.held'), t('status.compensated')]"
        :default-value="defaultStatus"
        :model-value="statusFilter"
        @update:model-value="(v) => { statusFilter = v; currentPage = 1 }"
      />
      <template #actions>
        <Button variant="successExport" size="sm" class="!px-3">
          <Download :size="14" />
          <span class="ml-1.5">{{ t('common.exportCsv') }}</span>
        </Button>
      </template>
    </TableToolbar>

    <!-- Desktop table -->
    <Card class="pb-2 hidden lg:block">
      <div class="overflow-x-auto">
        <table :aria-label="t('settlements.title')" class="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr :class="['text-[10px] uppercase font-bold tracking-widest', theadClass]">
              <th class="px-8 py-4">{{ t('settlements.conceptAndClose') }}</th>
              <th class="px-6 py-4">{{ t('settlements.financialBreakdown') }}</th>
              <th class="px-6 py-4 text-right">{{ t('settlements.netResult') }}</th>
              <th class="px-6 py-4 text-center">{{ t('settlements.depositStatus') }}</th>
              <th class="px-8 py-4 text-right">{{ t('transactions.tableActions') }}</th>
            </tr>
          </thead>
          <motion.tbody :variants="mv.list.value" initial="hidden" animate="show">
            <template v-if="paginatedData.length === 0">
              <EmptySearchState :col-span="5" :term="viewSearch.query" @clear="viewSearch.setQuery('')" />
            </template>
            <motion.tr
              v-for="(lote, idx) in paginatedData"
              v-else
              :key="`${lote.type}-${lote.closeDate}-${idx}`"
              :variants="mv.item.value"
              :class="['group transition-colors duration-200', trClass]"
            >
              <td class="px-8 py-4">
                <div class="flex items-start gap-4">
                  <div :class="['w-10 h-10 rounded-full flex items-center justify-center shrink-0', typeIconClass(lote.net < 0)]">
                    <component :is="lote.typeIcon" :size="18" />
                  </div>
                  <div>
                    <p :class="['font-bold text-sm', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ t(`type.${lote.type}`) }}</p>
                    <p :class="['text-xs font-medium flex items-center gap-1.5 mt-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                      <CalendarDays :size="12" class="opacity-70" /> {{ fmtDate(lote.closeDate) }}
                    </p>
                    <p :class="['text-[10px] font-bold flex items-center gap-1 mt-0.5', themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]']">
                      <Clock :size="10" /> Cierre UTC: {{ lote.closeTime }} hrs
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="w-52 flex flex-col gap-1.5 font-mono text-xs">
                  <div :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
                    <span>
                      {{ t('settlements.volume') }}
                      <span class="font-sans text-[10px] opacity-60">({{ lote.trxCount }} trx)</span>:
                    </span>
                    <span class="font-bold">${{ lote.gross.toFixed(2) }}</span>
                  </div>
                  <div v-if="lote.fees.pos" :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                    <span>Fee POS <span class="font-sans text-[10px] opacity-60">({{ lote.fees.pos.rate }})</span>:</span>
                    <span class="text-amber-500">-${{ lote.fees.pos.amount.toFixed(2) }}</span>
                  </div>
                  <div v-if="lote.fees.links" :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                    <span>Fee Links <span class="font-sans text-[10px] opacity-60">({{ lote.fees.links.rate }})</span>:</span>
                    <span class="text-amber-500">-${{ lote.fees.links.amount.toFixed(2) }}</span>
                  </div>
                  <div v-if="lote.adj !== 0" :class="['flex flex-col mt-1 pt-1.5 border-t', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
                    <div :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
                      <span>{{ t('settlements.adjustment') }}:</span>
                      <span class="font-bold text-rose-500">-${{ Math.abs(lote.adj).toFixed(2) }}</span>
                    </div>
                    <span v-if="lote.adjReason" :class="['font-sans text-[10px] mt-0.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                      {{ t('settlements.ref') }}: {{ lote.adjReason }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <span :class="['font-mono font-bold text-xl tracking-tight', netClass(lote.net < 0)]">
                  {{ lote.net < 0 ? '-' : '' }}${{ Math.abs(lote.net).toFixed(2) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex flex-col items-center gap-1.5">
                  <Badge :variant="lote.statusVariant" :icon="lote.StatusIcon">{{ t(`status.${lote.status}`) }}</Badge>
                  <p v-if="lote.net >= 0 && lote.depositDate" :class="['text-[10px] font-medium flex items-center gap-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                    <ArrowDownToLine :size="10" /> {{ t('settlements.arrives') }}: {{ fmtDate(lote.depositDate) }}
                  </p>
                </div>
              </td>
              <td class="px-8 py-4 text-right">
                <Tooltip :content="t('settlements.inspectBatch')" position="top">
                  <Button :aria-label="t('settlements.inspectBatch')" variant="action" size="sm" class="!px-3 !py-2">
                    <Search :size="15" />
                    <span class="hidden xl:inline text-xs ml-1">{{ t('settlements.inspect') }}</span>
                  </Button>
                </Tooltip>
              </td>
            </motion.tr>
          </motion.tbody>
        </table>
      </div>
      <div class="px-6 pb-2">
        <Pagination :current-page="currentPage" :total-pages="totalPages" @page-change="currentPage = $event" />
      </div>
    </Card>

    <!-- Mobile cards -->
    <div class="lg:hidden space-y-3">
      <motion.div
        v-if="visibleData.length > 0"
        :variants="mv.list.value"
        initial="hidden"
        animate="show"
        class="space-y-3"
      >
        <motion.div v-for="(lote, idx) in visibleData" :key="`${lote.type}-${lote.closeDate}-${idx}`" :variants="mv.item.value">
          <Card class="p-4">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-start gap-3 min-w-0">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center shrink-0', typeIconClass(lote.net < 0)]">
                  <component :is="lote.typeIcon" :size="18" />
                </div>
                <div class="min-w-0">
                  <p :class="['font-bold text-sm', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ t(`type.${lote.type}`) }}</p>
                  <p :class="['text-xs font-medium flex items-center gap-1 mt-0.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                    <CalendarDays :size="12" /> {{ fmtDate(lote.closeDate) }}
                  </p>
                </div>
              </div>
              <span :class="['font-mono font-bold text-lg tracking-tight shrink-0', netClass(lote.net < 0)]">
                {{ lote.net < 0 ? '-' : '' }}${{ Math.abs(lote.net).toFixed(2) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-2 flex-wrap">
                <Badge :variant="lote.statusVariant" :icon="lote.StatusIcon">{{ t(`status.${lote.status}`) }}</Badge>
                <span v-if="lote.net >= 0 && lote.depositDate" :class="['text-[10px] font-medium flex items-center gap-1', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  <ArrowDownToLine :size="10" /> {{ fmtDate(lote.depositDate) }}
                </span>
              </div>
              <span :class="['text-[10px] font-bold flex items-center gap-1', themeStore.isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]']">
                <Clock :size="10" /> {{ lote.closeTime }} UTC
              </span>
            </div>
            <div :class="['font-mono text-xs flex flex-col gap-1 mb-3 p-3 rounded-lg', themeStore.isDarkMode ? 'bg-[#111113]/40' : 'bg-gray-50']">
              <div :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">
                <span>{{ t('settlements.volume') }} <span class="font-sans text-[10px] opacity-60">({{ lote.trxCount }} trx)</span></span>
                <span class="font-bold">${{ lote.gross.toFixed(2) }}</span>
              </div>
              <div v-if="lote.fees.pos" :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                <span>Fee POS <span class="font-sans text-[10px] opacity-60">({{ lote.fees.pos.rate }})</span></span>
                <span class="text-amber-500">-${{ lote.fees.pos.amount.toFixed(2) }}</span>
              </div>
              <div v-if="lote.fees.links" :class="['flex justify-between', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                <span>Fee Links <span class="font-sans text-[10px] opacity-60">({{ lote.fees.links.rate }})</span></span>
                <span class="text-amber-500">-${{ lote.fees.links.amount.toFixed(2) }}</span>
              </div>
              <div v-if="lote.adj !== 0" :class="['flex justify-between pt-1 mt-1 border-t', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
                <span :class="themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'">{{ t('settlements.adjustment') }}</span>
                <span class="font-bold text-rose-500">-${{ Math.abs(lote.adj).toFixed(2) }}</span>
              </div>
            </div>
            <div :class="['pt-3 border-t', themeStore.isDarkMode ? 'border-white/5' : 'border-black/5']">
              <Button variant="action" size="sm" class="!px-3 !py-1.5 w-full justify-center">
                <Search :size="14" /> {{ t('settlements.inspect') }}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
      <Card v-else class="p-8 text-center">
        <p :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ viewSearch.query ? t('settlements.notFoundFor', { term: viewSearch.query }) : t('settlements.notFound') }}
        </p>
        <Button v-if="viewSearch.query" variant="ghost" size="sm" class="mt-2" @click="viewSearch.setQuery('')">
          {{ t('common.clearSearch') }}
        </Button>
      </Card>
      <div ref="sentinelRef" class="flex justify-center py-4">
        <Loader2 v-if="hasMore && perfStore.useContinuousAnim" :size="20" class="animate-spin text-[#7C3AED]" />
        <div v-else-if="hasMore" class="w-5 h-5 rounded-full border-2 border-[#7C3AED]/60" />
      </div>
    </div>
  </motion.div>
</template>
