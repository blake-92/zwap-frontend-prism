<script setup>
import { ref, computed, watch } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import {
  ArrowUpFromLine, Landmark, TrendingUp,
  FileText, Loader2, Calendar, Filter, Download,
} from 'lucide-vue-next'
import { useThemeStore } from '~/stores/theme'
import { useViewSearch } from '~/composables/useViewSearch'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { useMotionVariants } from '~/composables/useMotionVariants'
import { WITHDRAWALS, WALLET_BALANCE, WALLET_STEPS, BANK_ACCOUNT } from '~/utils/mockData'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import Stepper from '~/components/ui/Stepper.vue'
import Pagination from '~/components/ui/Pagination.vue'
import DropdownFilter from '~/components/ui/DropdownFilter.vue'
import EmptySearchState from '~/components/ui/EmptySearchState.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import TableToolbar from '~/components/ui/TableToolbar.vue'
import WithdrawModal from './WithdrawModal.vue'
import WithdrawReceiptModal from './WithdrawReceiptModal.vue'

const mv = useMotionVariants()
const { t } = useI18n()
const themeStore = useThemeStore()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const viewSearch = useViewSearch(computed(() => t('wallet.searchPlaceholder')))

const modalOpen = ref(false)
const receiptTrx = ref(null)
const currentPage = ref(1)

const defaultStatus = computed(() => t('filters.all'))
const defaultDate = computed(() => t('filters.anyDate'))
const statusFilter = ref('')
const dateFilter = ref('')
watch(defaultStatus, (v) => { if (!statusFilter.value) statusFilter.value = v }, { immediate: true })
watch(defaultDate, (v) => { if (!dateFilter.value) dateFilter.value = v }, { immediate: true })

const filtersActive = computed(() =>
  (statusFilter.value !== defaultStatus.value ? 1 : 0) +
  (dateFilter.value !== defaultDate.value ? 1 : 0),
)
watch(filtersActive, (v) => viewSearch.setActiveFilterCount(v), { immediate: true })
watch(() => viewSearch.query, () => { currentPage.value = 1 })

const resetFilters = () => {
  statusFilter.value = defaultStatus.value
  dateFilter.value = defaultDate.value
  currentPage.value = 1
}

const ITEMS_PER_PAGE = 5

const filtered = computed(() => {
  const q = viewSearch.query?.toLowerCase() || ''
  const tToday = t('filters.today')
  const tLast7 = t('filters.last7days')
  const tThisMonth = t('filters.thisMonth')
  return WITHDRAWALS.filter(w => {
    if (q) {
      const amountNormalized = w.amount.replace(/,/g, '')
      const matchSearch = w.id.toLowerCase().includes(q) || w.amount.includes(q) || amountNormalized.includes(q)
      if (!matchSearch) return false
    }
    if (statusFilter.value !== defaultStatus.value) {
      if (w.status !== statusFilter.value) return false
    }
    if (dateFilter.value !== defaultDate.value) {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const today = new Date()
      if (dateFilter.value === tToday) {
        const monthStr = months[today.getMonth()]
        if (!w.date.includes(`${today.getDate()} ${monthStr}`)) return false
      }
      if (dateFilter.value === tLast7) {
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        const parts = w.date.replace(',', '').split(' ')
        if (parts.length >= 3) {
          const day = parseInt(parts[0])
          const mi = months.indexOf(parts[1])
          const y = parseInt(parts[2])
          if (mi !== -1) {
            const wDate = new Date(y, mi, day)
            if (wDate < weekAgo || wDate > today) return false
          }
        }
      }
      if (dateFilter.value === tThisMonth) {
        if (!w.date.includes(months[today.getMonth()])) return false
      }
    }
    return true
  })
})

const totalPages = computed(() => Math.ceil(filtered.value.length / ITEMS_PER_PAGE))
const paginatedWithdrawals = computed(() =>
  filtered.value.slice((currentPage.value - 1) * ITEMS_PER_PAGE, currentPage.value * ITEMS_PER_PAGE),
)

const { visibleData, hasMore, sentinelRef } = useInfiniteScroll(filtered, {
  batchSize: 5,
  enabled: computed(() => !isDesktop.value),
})

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
</script>

<template>
  <motion.div :variants="mv.page.value" initial="hidden" animate="show" exit="exit">
    <PageHeader :title="t('wallet.title')" />

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
      <!-- Saldo Disponible -->
      <Card class="lg:col-span-2 relative overflow-hidden flex flex-col">
        <div :class="['absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none', themeStore.isDarkMode ? 'bg-[#7C3AED]/20' : 'bg-[#DBD3FB]/60']" />

        <div class="relative px-6 pt-6 pb-5">
          <div class="flex items-start justify-between mb-4">
            <p :class="['text-[10px] font-bold tracking-widest uppercase', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
              {{ t('wallet.availableBalance') }}
            </p>
            <span :class="['text-[9px] font-bold px-1.5 py-0.5 rounded-full border', themeStore.isDarkMode ? 'text-[#888991] border-white/10' : 'text-[#67656E] border-black/5']">
              {{ t('common.usd') }}
            </span>
          </div>
          <h2 :class="['text-[2.6rem] font-mono font-bold tracking-tighter leading-none mb-2', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
            {{ WALLET_BALANCE.display }}
          </h2>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
            <TrendingUp :size="9" /> {{ t('wallet.thisWeek') }}
          </span>
        </div>

        <div :class="['mx-6 border-t', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']" />

        <div class="relative px-6 pt-5 pb-6 flex flex-col gap-3 mt-auto">
          <Button class="w-full !py-3 justify-center" @click="modalOpen = true">
            <ArrowUpFromLine :size="16" /> {{ t('wallet.withdrawFunds') }}
          </Button>
          <div :class="['flex items-center justify-center gap-1.5 text-[11px]', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
            <span>{{ t('wallet.nextAutoDeposit') }}:</span>
            <span :class="['font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]']">24 Oct, 2026</span>
          </div>
        </div>
      </Card>

      <!-- Retiro + Cuenta -->
      <div class="lg:col-span-3 flex flex-col gap-4 h-full">
        <Card class="p-6 flex flex-col gap-5 flex-1">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
              <p :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">
                {{ t('wallet.withdrawalInProgress') }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="['text-xs font-mono font-bold', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">${{ WITHDRAWALS[0].amount }}</span>
              <span :class="['text-[10px] font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ WITHDRAWALS[0].date }}</span>
            </div>
          </div>
          <Stepper :steps="WALLET_STEPS" />
        </Card>

        <Card class="p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center shrink-0', themeStore.isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF] shadow-xs']">
                <Landmark :size="16" />
              </div>
              <div>
                <p :class="['text-[10px] font-bold uppercase tracking-widest mb-0.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  {{ t('wallet.destinationAccount') }}
                </p>
                <p :class="['text-sm font-bold', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">
                  {{ BANK_ACCOUNT.name }}
                  <span :class="['font-mono text-xs', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">•••• {{ BANK_ACCOUNT.last4 }}</span>
                </p>
              </div>
            </div>
            <button :class="['text-xs font-bold transition-colors', themeStore.isDarkMode ? 'text-[#7C3AED] hover:text-[#A78BFA]' : 'text-[#7C3AED] hover:text-[#561BAF]']">
              {{ t('common.edit') }}
            </button>
          </div>
        </Card>
      </div>
    </div>

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
        :options="[defaultStatus, t('wallet.processing'), t('wallet.completed'), t('wallet.failed')]"
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
      <div :class="['px-8 py-4 border-b', themeStore.isDarkMode ? 'border-white/10' : 'border-black/5']">
        <h3 :class="['font-bold text-sm', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ t('wallet.withdrawalHistory') }}</h3>
      </div>
      <div class="overflow-x-auto">
        <table :aria-label="t('wallet.withdrawalHistory')" class="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr :class="['text-[10px] uppercase font-bold tracking-widest', theadClass]">
              <th class="px-8 py-3">{{ t('wallet.transactionIdHeader') }}</th>
              <th class="px-6 py-3">{{ t('wallet.depositDate') }}</th>
              <th class="px-6 py-3 text-right">{{ t('wallet.amountHeader') }}</th>
              <th class="px-6 py-3">{{ t('wallet.destination') }}</th>
              <th class="px-6 py-3 text-center">{{ t('wallet.statusHeader') }}</th>
              <th class="px-8 py-3 text-right">{{ t('wallet.receiptHeader') }}</th>
            </tr>
          </thead>
          <motion.tbody :variants="mv.list.value" initial="hidden" animate="show">
            <template v-if="paginatedWithdrawals.length === 0">
              <EmptySearchState :col-span="6" :term="viewSearch.query" @clear="() => { viewSearch.setQuery(''); currentPage = 1 }" />
            </template>
            <motion.tr
              v-for="w in paginatedWithdrawals"
              v-else
              :key="w.id"
              :variants="mv.item.value"
              :class="['group transition-colors duration-200', trClass]"
            >
              <td class="px-8 py-3.5">
                <span :class="['font-mono font-bold text-sm', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ w.id }}</span>
              </td>
              <td class="px-6 py-3.5">
                <span :class="['text-xs font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ w.date }}</span>
              </td>
              <td class="px-6 py-3.5 text-right">
                <span :class="['font-mono font-bold', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ w.amount }}</span>
              </td>
              <td class="px-6 py-3.5">
                <span :class="['text-xs font-medium flex items-center gap-1.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                  <Landmark :size="11" class="opacity-60 shrink-0" />
                  {{ w.bank }}
                </span>
              </td>
              <td class="px-6 py-3.5 text-center">
                <Badge :variant="w.statusVariant" :icon="w.StatusIcon">{{ w.status }}</Badge>
              </td>
              <td class="px-8 py-3.5 text-right">
                <div class="flex justify-end">
                  <Tooltip :content="t('wallet.viewReceipt')" position="top">
                    <Button variant="action" size="sm" class="!px-2.5 !py-1.5" :disabled="w.status !== 'Completado'" @click="receiptTrx = w">
                      <FileText :size="13" />
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

    <!-- Mobile cards -->
    <div class="lg:hidden space-y-3">
      <div class="py-2">
        <h3 :class="['font-bold text-sm', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">{{ t('wallet.withdrawalHistory') }}</h3>
      </div>
      <motion.div v-if="visibleData.length > 0" :variants="mv.list.value" initial="hidden" animate="show" class="space-y-3">
        <motion.div v-for="w in visibleData" :key="w.id" :variants="mv.item.value">
          <Card class="p-4">
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="min-w-0">
                <span :class="['font-mono font-bold text-sm truncate block', themeStore.isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]']">{{ w.id }}</span>
                <p :class="['text-xs font-medium mt-0.5', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">{{ w.date }}</p>
              </div>
              <span :class="['font-mono font-bold text-lg tracking-tight shrink-0', themeStore.isDarkMode ? 'text-white' : 'text-[#111113]']">${{ w.amount }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <Badge :variant="w.statusVariant" :icon="w.StatusIcon">{{ w.status }}</Badge>
              <span :class="['text-xs font-medium flex items-center gap-1 min-w-0 truncate', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
                <Landmark :size="11" class="opacity-60 shrink-0" />
                <span class="truncate">{{ w.bank }}</span>
              </span>
            </div>
            <div v-if="w.status === 'Completado'" :class="['pt-3 border-t', themeStore.isDarkMode ? 'border-white/5' : 'border-black/5']">
              <Button variant="action" size="sm" class="!px-3 !py-1.5 w-full justify-center" @click="receiptTrx = w">
                <FileText :size="14" /> {{ t('wallet.viewReceipt') }}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
      <Card v-else class="p-8 text-center">
        <p :class="['text-sm font-medium', themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]']">
          {{ viewSearch.query ? t('wallet.notFoundFor', { term: viewSearch.query }) : t('wallet.notFound') }}
        </p>
        <Button v-if="viewSearch.query" variant="ghost" size="sm" class="mt-2" @click="() => { viewSearch.setQuery(''); currentPage = 1 }">
          {{ t('common.clearSearch') }}
        </Button>
      </Card>
      <div ref="sentinelRef" class="flex justify-center py-4">
        <Loader2 v-if="hasMore" :size="20" class="animate-spin text-[#7C3AED]" />
      </div>
    </div>

    <AnimatePresence>
      <WithdrawModal v-if="modalOpen" key="withdraw" @close="modalOpen = false" />
    </AnimatePresence>
    <AnimatePresence>
      <WithdrawReceiptModal v-if="receiptTrx" key="withdraw-receipt" :trx="receiptTrx" @close="receiptTrx = null" />
    </AnimatePresence>
  </motion.div>
</template>
