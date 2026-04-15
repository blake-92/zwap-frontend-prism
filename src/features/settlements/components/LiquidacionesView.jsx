import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Calendar, Search,
  CheckCircle2, Landmark, AlertOctagon,
  CalendarDays, Clock, ArrowDownToLine, Filter, Loader2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useViewSearch } from '@/shared/context/ViewSearchContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll'
import { Card, Button, Badge, StatCard, DropdownFilter, Pagination, EmptySearchState, Tooltip, PageHeader, TableToolbar } from '@/shared/ui'
import { listVariants, itemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { PAYOUTS, WALLET_BALANCE, SETTLEMENT_SUMMARY } from '@/services/mocks/mockData'

/* ─────────────────────────────────────────────────────────────
   LiquidacionesView
───────────────────────────────────────────────────────────── */
export default function LiquidacionesView() {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { query: search, setQuery: setSearch, setActiveFilterCount } = useViewSearch(t('settlements.searchPlaceholder'))

  const defaultStatus = t('filters.all')
  const defaultDate   = t('filters.anyDate')
  const tThisWeek     = t('filters.thisWeek')
  const tThisMonth    = t('filters.thisMonth')
  const [statusFilter, setStatusFilter] = useState(defaultStatus)
  const [dateFilter, setDateFilter]     = useState(defaultDate)
  const [currentPage, setCurrentPage]   = useState(1)
  const ITEMS_PER_PAGE = 7

  useEffect(() => { setCurrentPage(1) }, [search])

  const filtersActive = (statusFilter !== defaultStatus ? 1 : 0) + (dateFilter !== defaultDate ? 1 : 0)
  useEffect(() => { setActiveFilterCount(filtersActive) }, [filtersActive, setActiveFilterCount])

  const resetFilters = () => {
    setStatusFilter(defaultStatus)
    setDateFilter(defaultDate)
    setCurrentPage(1)
  }

  const filtered = useMemo(() => {
    return PAYOUTS.filter(p => {
      const matchSearch = !search ||
        p.type.toLowerCase().includes(search.toLowerCase()) ||
        p.closeDate.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === defaultStatus || p.status === statusFilter

      let matchDate = true
      if (dateFilter !== defaultDate) {
        if (dateFilter === tThisWeek) {
          const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
          const today = new Date()
          const weekAgo = new Date(today)
          weekAgo.setDate(today.getDate() - 7)
          const parts = p.closeDate.split(' ')
          if (parts.length === 3) {
            const day = parseInt(parts[0])
            const monthIdx = months.indexOf(parts[1])
            const year = parseInt(parts[2])
            if (monthIdx !== -1) {
              const closeD = new Date(year, monthIdx, day)
              matchDate = closeD >= weekAgo && closeD <= today
            }
          }
        } else if (dateFilter === tThisMonth) {
          const today = new Date()
          const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
          const monthStr = months[today.getMonth()]
          matchDate = p.closeDate.includes(monthStr)
        }
      }

      return matchSearch && matchStatus && matchDate
    })
  }, [search, statusFilter, dateFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const { visibleData, hasMore, sentinelRef } = useInfiniteScroll(filtered, {
    batchSize: 10,
    enabled: !isDesktop,
  })

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show" exit="exit">

      <PageHeader title={t('settlements.title')}>
        <Button variant="outline">
          <Download size={18} /> {t('settlements.downloadFiscal')}
        </Button>
      </PageHeader>

      <div className="sm:hidden mb-6">
        <Button variant="outline" size="lg" className="w-full" >
          <Download size={18} /> {t('settlements.downloadFiscal')}
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-10">
        <StatCard layout="balance"
          icon={CheckCircle2} iconVariant="success"
          label={t('settlements.deposited')}
          value={WALLET_BALANCE.display}
          badge={t('settlements.last30days')} badgeVariant="success"
        />
        <StatCard layout="balance"
          icon={Landmark} iconVariant="warning"
          label={t('settlements.inTransitBanks')}
          value={SETTLEMENT_SUMMARY.inTransit}
          badge={SETTLEMENT_SUMMARY.inTransitBadge} badgeVariant="warning"
        />
        <StatCard layout="balance"
          icon={AlertOctagon} iconVariant="danger"
          label={t('settlements.retentions')}
          value={SETTLEMENT_SUMMARY.adjustments}
          badge={SETTLEMENT_SUMMARY.adjustmentsBadge} badgeVariant="danger"
          negative
        />
      </div>

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
          options={[defaultDate, t('filters.thisWeek'), t('filters.thisMonth')]}
          defaultValue={defaultDate}
          value={dateFilter}
          onChange={(val) => { setDateFilter(val); setCurrentPage(1) }}
        />
        <DropdownFilter
          label={t('filters.status')}
          icon={Filter}
          options={[defaultStatus, t('filters.deposited'), t('filters.pendingAch')]}
          defaultValue={defaultStatus}
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setCurrentPage(1) }}
        />
      </TableToolbar>

      {/* Table (desktop) */}
      <Card className="pb-2 hidden lg:block">
        <div className="overflow-x-auto">
          <table aria-label={t('settlements.title')} className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode
                  ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
                  : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-4">{t('settlements.conceptAndClose')}</th>
                <th className="px-6 py-4">{t('settlements.financialBreakdown')}</th>
                <th className="px-6 py-4 text-right">{t('settlements.netResult')}</th>
                <th className="px-6 py-4 text-center">{t('settlements.depositStatus')}</th>
                <th className="px-8 py-4 text-right">{t('transactions.tableActions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="show">
              {paginatedData.length === 0 ? (
                <EmptySearchState colSpan={5} term={search} onClear={() => setSearch('')} />
              ) : paginatedData.map((lote, idx) => {
                const isDebt = lote.net < 0
                return (
                  <motion.tr
                    variants={itemVariants}
                    key={`${lote.type}-${lote.closeDate}-${idx}`}
                    className={`group transition-colors duration-200 ${
                      isDarkMode
                        ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                        : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                    }`}
                  >
                    {/* Concepto & Cierre */}
                    <td className="px-8 py-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDebt
                            ? isDarkMode ? 'bg-rose-500/15 text-rose-500'   : 'bg-rose-100 text-rose-600'
                            : isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
                        }`}>
                          <lote.typeIcon size={18} />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                            {lote.type}
                          </p>
                          <p className={`text-xs font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                            <CalendarDays size={12} className="opacity-70" /> {lote.closeDate}
                          </p>
                          <p className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'}`}>
                            <Clock size={10} /> Cierre UTC: {lote.closeTime} hrs
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Desglose Financiero */}
                    <td className="px-6 py-4">
                      <div className="w-52 flex flex-col gap-1.5 font-mono text-xs">
                        <div className={`flex justify-between ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                          <span>
                            {t('settlements.volume')}{' '}
                            <span className="font-sans text-[10px] opacity-60">({lote.trxCount} trx)</span>:
                          </span>
                          <span className="font-bold">${lote.gross.toFixed(2)}</span>
                        </div>
                        {lote.fees.pos && (
                          <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                            <span>Fee POS <span className="font-sans text-[10px] opacity-60">({lote.fees.pos.rate})</span>:</span>
                            <span className="text-amber-500">-${lote.fees.pos.amount.toFixed(2)}</span>
                          </div>
                        )}
                        {lote.fees.links && (
                          <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                            <span>Fee Links <span className="font-sans text-[10px] opacity-60">({lote.fees.links.rate})</span>:</span>
                            <span className="text-amber-500">-${lote.fees.links.amount.toFixed(2)}</span>
                          </div>
                        )}
                        {lote.adj !== 0 && (
                          <div className={`flex flex-col mt-1 pt-1.5 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                            <div className={`flex justify-between ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                              <span>{t('settlements.adjustment')}:</span>
                              <span className="font-bold text-rose-500">-${Math.abs(lote.adj).toFixed(2)}</span>
                            </div>
                            {lote.adjReason && (
                              <span className={`font-sans text-[10px] mt-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                                {t('settlements.ref')}: {lote.adjReason}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Neto */}
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono font-bold text-xl tracking-tight ${
                        isDebt
                          ? 'text-rose-500'
                          : isDarkMode ? 'text-white' : 'text-[#111113]'
                      }`}>
                        {isDebt ? '-' : ''}${Math.abs(lote.net).toFixed(2)}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <Badge variant={lote.statusVariant} icon={lote.StatusIcon}>
                          {lote.status}
                        </Badge>
                        {!isDebt && lote.depositDate !== '-' && (
                          <p className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                            <ArrowDownToLine size={10} /> {t('settlements.arrives')}: {lote.depositDate}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-8 py-4 text-right">
                      <div>
                        <Tooltip content={t('settlements.inspectBatch')} position="top">
                          <Button variant="action" size="sm" className="!px-3 !py-2">
                            <Search size={15} />
                            <span className="hidden xl:inline text-xs ml-1">{t('settlements.inspect')}</span>
                          </Button>
                        </Tooltip>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
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
        {visibleData.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
            {visibleData.map((lote, idx) => {
              const isDebt = lote.net < 0
              return (
                <motion.div key={`${lote.type}-${lote.closeDate}-${idx}`} variants={itemVariants}>
                  <Card className="p-4">
                    {/* Header: type icon + concept + net amount */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDebt
                            ? isDarkMode ? 'bg-rose-500/15 text-rose-500' : 'bg-rose-100 text-rose-600'
                            : isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
                        }`}>
                          <lote.typeIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                            {lote.type}
                          </p>
                          <p className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                            <CalendarDays size={12} /> {lote.closeDate}
                          </p>
                        </div>
                      </div>
                      <span className={`font-mono font-bold text-lg tracking-tight flex-shrink-0 ${
                        isDebt ? 'text-rose-500' : isDarkMode ? 'text-white' : 'text-[#111113]'
                      }`}>
                        {isDebt ? '-' : ''}${Math.abs(lote.net).toFixed(2)}
                      </span>
                    </div>

                    {/* Status + close time */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={lote.statusVariant} icon={lote.StatusIcon}>
                          {lote.status}
                        </Badge>
                        {!isDebt && lote.depositDate !== '-' && (
                          <span className={`text-[10px] font-medium flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                            <ArrowDownToLine size={10} /> {lote.depositDate}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'}`}>
                        <Clock size={10} /> {lote.closeTime} UTC
                      </span>
                    </div>

                    {/* Financial breakdown */}
                    <div className={`font-mono text-xs flex flex-col gap-1 mb-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-[#111113]/40' : 'bg-gray-50'
                    }`}>
                      <div className={`flex justify-between ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                        <span>{t('settlements.volume')} <span className="font-sans text-[10px] opacity-60">({lote.trxCount} trx)</span></span>
                        <span className="font-bold">${lote.gross.toFixed(2)}</span>
                      </div>
                      {lote.fees.pos && (
                        <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <span>Fee POS <span className="font-sans text-[10px] opacity-60">({lote.fees.pos.rate})</span></span>
                          <span className="text-amber-500">-${lote.fees.pos.amount.toFixed(2)}</span>
                        </div>
                      )}
                      {lote.fees.links && (
                        <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <span>Fee Links <span className="font-sans text-[10px] opacity-60">({lote.fees.links.rate})</span></span>
                          <span className="text-amber-500">-${lote.fees.links.amount.toFixed(2)}</span>
                        </div>
                      )}
                      {lote.adj !== 0 && (
                        <div className={`flex justify-between pt-1 mt-1 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                          <span className={isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}>{t('settlements.adjustment')}</span>
                          <span className="font-bold text-rose-500">-${Math.abs(lote.adj).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className={`pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                      <Button variant="action" size="sm" className="!px-3 !py-1.5 w-full justify-center">
                        <Search size={14} /> {t('settlements.inspect')}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <Card className="p-8 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              {search ? t('settlements.notFoundFor', { term: search }) : t('settlements.notFound')}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="mt-2">
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
    </motion.div>
  )
}
