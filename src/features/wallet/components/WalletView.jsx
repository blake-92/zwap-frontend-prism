import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpFromLine, Landmark, TrendingUp,
  FileText, Loader2, Calendar, Filter, Download,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useViewSearch } from '@/shared/context/ViewSearchContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll'
import { Card, Button, Badge, Stepper, Pagination, DropdownFilter, EmptySearchState, Tooltip, PageHeader, TableToolbar } from '@/shared/ui'
import { listVariants, itemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { WITHDRAWALS, WALLET_BALANCE, WALLET_STEPS, BANK_ACCOUNT } from '@/services/mocks/mockData'
import WithdrawModal from './WithdrawModal'
import WithdrawReceiptModal from './WithdrawReceiptModal'

/* ─── WalletView ──────────────────────────────────────────── */
export default function WalletView() {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [modalOpen, setModalOpen] = useState(false)
  const [receiptTrx, setReceiptTrx] = useState(null)
  const { query: search, setQuery: setSearch, setActiveFilterCount } = useViewSearch(t('wallet.searchPlaceholder'))
  const [currentPage, setCurrentPage] = useState(1)

  const defaultStatus = t('filters.all')
  const defaultDate   = t('filters.anyDate')
  const [statusFilter, setStatusFilter] = useState(defaultStatus)
  const [dateFilter, setDateFilter]     = useState(defaultDate)

  const filtersActive = (statusFilter !== defaultStatus ? 1 : 0) + (dateFilter !== defaultDate ? 1 : 0)
  useEffect(() => { setActiveFilterCount(filtersActive) }, [filtersActive, setActiveFilterCount])

  const resetFilters = () => {
    setStatusFilter(defaultStatus)
    setDateFilter(defaultDate)
    setCurrentPage(1)
  }

  const ITEMS_PER_PAGE = 5
  useEffect(() => { setCurrentPage(1) }, [search])

  const filtered = useMemo(() => WITHDRAWALS.filter(w => {
    // Search
    if (search) {
      const q = search.toLowerCase()
      const amountNormalized = w.amount.replace(/,/g, '')
      const matchSearch = w.id.toLowerCase().includes(q) ||
        w.amount.includes(search) ||
        amountNormalized.includes(search)
      if (!matchSearch) return false
    }

    // Status filter
    if (statusFilter !== defaultStatus) {
      if (w.status !== statusFilter) return false
    }

    // Date filter
    if (dateFilter !== defaultDate) {
      if (dateFilter === t('filters.today')) {
        const today = new Date()
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        const monthStr = months[today.getMonth()]
        if (!w.date.includes(`${today.getDate()} ${monthStr}`)) return false
      }
      if (dateFilter === t('filters.last7days')) {
        // Mock: show recent dates
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        const today = new Date()
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        // Parse date like "20 Oct, 2026"
        const parts = w.date.replace(',', '').split(' ')
        if (parts.length >= 3) {
          const day = parseInt(parts[0])
          const monthIdx = months.indexOf(parts[1])
          const year = parseInt(parts[2])
          if (monthIdx !== -1) {
            const wDate = new Date(year, monthIdx, day)
            if (wDate < weekAgo || wDate > today) return false
          }
        }
      }
      if (dateFilter === t('filters.thisMonth')) {
        const today = new Date()
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        const monthStr = months[today.getMonth()]
        if (!w.date.includes(monthStr)) return false
      }
    }

    return true
  }), [search, statusFilter, dateFilter, defaultStatus, defaultDate, t])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedWithdrawals = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const { visibleData, hasMore, sentinelRef } = useInfiniteScroll(filtered, {
    batchSize: 5,
    enabled: !isDesktop,
  })


  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">

      <PageHeader
        title={t('wallet.title')}
        description={t('wallet.description')}
      />

      {/* Top section: balance (izq) + retiro + cuenta (der) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">

        {/* ── Saldo Disponible (2/5) ── */}
        <Card className="lg:col-span-2 relative overflow-hidden flex flex-col">
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            isDarkMode ? 'bg-[#7C3AED]/20' : 'bg-[#DBD3FB]/60'
          }`} />

          <div className="relative px-6 pt-6 pb-5">
            <div className="flex items-start justify-between mb-4">
              <p className={`text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                {t('wallet.availableBalance')}
              </p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isDarkMode ? 'text-[#888991] border-white/10' : 'text-[#67656E] border-black/5'}`}>
                {t('common.usd')}
              </span>
            </div>

            <h2 className={`text-[2.6rem] font-mono font-bold tracking-tighter leading-none mb-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              {WALLET_BALANCE.display}
            </h2>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
              <TrendingUp size={9} /> {t('wallet.thisWeek')}
            </span>
          </div>

          <div className={`mx-6 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`} />

          <div className="relative px-6 pt-5 pb-6 flex flex-col gap-3 mt-auto">
            <Button onClick={() => setModalOpen(true)} className="w-full !py-3 justify-center">
              <ArrowUpFromLine size={16} /> {t('wallet.withdrawFunds')}
            </Button>
            <div className={`flex items-center justify-center gap-1.5 text-[11px] ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              <span>{t('wallet.nextAutoDeposit')}:</span>
              <span className={`font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>24 Oct, 2026</span>
            </div>
          </div>
        </Card>

        {/* ── Columna derecha: Retiro + Cuenta (3/5) ── */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">

          {/* Retiro en Progreso */}
          <Card className="p-6 flex flex-col gap-5 flex-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                  {t('wallet.withdrawalInProgress')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  ${WITHDRAWALS[0].amount}
                </span>
                <span className={`text-[10px] font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  {WITHDRAWALS[0].date}
                </span>
              </div>
            </div>

            <Stepper steps={WALLET_STEPS} />
          </Card>

          {/* Cuenta Destino */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF] shadow-sm'
                }`}>
                  <Landmark size={16} />
                </div>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                    {t('wallet.destinationAccount')}
                  </p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
                    {BANK_ACCOUNT.name}{' '}
                    <span className={`font-mono text-xs ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>•••• {BANK_ACCOUNT.last4}</span>
                  </p>
                </div>
              </div>
              <button className={`text-xs font-bold transition-colors ${
                isDarkMode ? 'text-[#7C3AED] hover:text-[#A78BFA]' : 'text-[#7C3AED] hover:text-[#561BAF]'
              }`}>
                {t('common.edit')}
              </button>
            </div>
          </Card>

        </div>
      </div>

      {/* Filters toolbar */}
      <TableToolbar
        onReset={filtersActive > 0 ? resetFilters : undefined}
        actions={
          <Button variant="successExport" size="sm" className="!px-3">
            <Download size={14} />
            <span className="ml-1.5">{t('common.exportCsv')}</span>
          </Button>
        }
      >
        <DropdownFilter
          label={t('filters.date')}
          icon={Calendar}
          options={[defaultDate, t('filters.today'), t('filters.last7days'), t('filters.thisMonth')]}
          defaultValue={defaultDate}
          value={dateFilter}
          onChange={(val) => { setDateFilter(val); setCurrentPage(1) }}
        />
        <DropdownFilter
          label={t('filters.status')}
          icon={Filter}
          options={[defaultStatus, t('wallet.processing'), t('wallet.completed'), t('wallet.failed')]}
          defaultValue={defaultStatus}
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setCurrentPage(1) }}
        />
      </TableToolbar>

      {/* Historial de Retiros (desktop) */}
      <Card className="pb-2 hidden lg:block">
        <div className={`px-8 py-4 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            {t('wallet.withdrawalHistory')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table aria-label={t('wallet.withdrawalHistory')} className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode
                  ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
                  : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-3">{t('wallet.transactionIdHeader')}</th>
                <th className="px-6 py-3">{t('wallet.depositDate')}</th>
                <th className="px-6 py-3 text-right">{t('wallet.amountHeader')}</th>
                <th className="px-6 py-3">{t('wallet.destination')}</th>
                <th className="px-6 py-3 text-center">{t('wallet.statusHeader')}</th>
                <th className="px-8 py-3 text-right">{t('wallet.receiptHeader')}</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="show">
              {paginatedWithdrawals.length === 0 ? (
                <EmptySearchState colSpan={6} term={search} onClear={() => { setSearch(''); setCurrentPage(1) }} />
              ) : paginatedWithdrawals.map((w) => (
                <motion.tr
                  variants={itemVariants}
                  key={w.id}
                  className={`group transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                      : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                  }`}
                >
                  <td className="px-8 py-3.5">
                    <span className={`font-mono font-bold text-sm ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
                      {w.id}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      {w.date}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                      ${w.amount}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <Landmark size={11} className="opacity-60 flex-shrink-0" />
                      {w.bank}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <Badge variant={w.statusVariant} icon={w.StatusIcon}>
                      {w.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-3.5 text-right">
                    <div className="flex justify-end">
                      <Tooltip content={t('wallet.viewReceipt')} position="top">
                        <Button
                          variant="action" size="sm"
                          className="!px-2.5 !py-1.5"
                          disabled={w.status !== 'Completado'}
                          onClick={() => setReceiptTrx(w)}
                        >
                          <FileText size={13} />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
        <div className="px-6 pb-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* Cards (mobile / tablet) */}
      <div className="lg:hidden space-y-3">
        <div className="py-2">
          <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            {t('wallet.withdrawalHistory')}
          </h3>
        </div>
        {visibleData.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
            {visibleData.map((w) => (
              <motion.div key={w.id} variants={itemVariants}>
                <Card className="p-4">
                  {/* Header: ID + amount */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <span className={`font-mono font-bold text-sm truncate block ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
                        {w.id}
                      </span>
                      <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        {w.date}
                      </p>
                    </div>
                    <span className={`font-mono font-bold text-lg tracking-tight flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                      ${w.amount}
                    </span>
                  </div>

                  {/* Status + bank */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={w.statusVariant} icon={w.StatusIcon}>
                      {w.status}
                    </Badge>
                    <span className={`text-xs font-medium flex items-center gap-1 min-w-0 truncate ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <Landmark size={11} className="opacity-60 flex-shrink-0" />
                      <span className="truncate">{w.bank}</span>
                    </span>
                  </div>

                  {/* Action */}
                  {w.status === 'Completado' && (
                    <div className={`pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                      <Button
                        variant="action" size="sm"
                        className="!px-3 !py-1.5 w-full justify-center"
                        onClick={() => setReceiptTrx(w)}
                      >
                        <FileText size={14} /> {t('wallet.viewReceipt')}
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-8 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {search ? t('wallet.notFoundFor', { term: search }) : t('wallet.notFound')}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCurrentPage(1) }} className="mt-2">
                {t('common.clearSearch')}
              </Button>
            )}
          </Card>
        )}
        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="flex justify-center py-4">
          {hasMore && <Loader2 size={20} className="animate-spin text-[#7C3AED]" />}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && <WithdrawModal key="withdraw" onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {receiptTrx && <WithdrawReceiptModal key="withdraw-receipt" trx={receiptTrx} onClose={() => setReceiptTrx(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}
