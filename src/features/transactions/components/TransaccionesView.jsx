import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Download,
  LinkIcon, Clock, CreditCard, Globe2,
  FileText, RotateCcw, Filter, Loader2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll'
import { Card, Button, Badge, AvatarInfo, DropdownFilter, Pagination, SearchInput, EmptySearchState, Tooltip, PageHeader, TableToolbar, SwipeableCard } from '@/shared/ui'
import { listVariants, itemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { TRANSACTIONS } from '@/services/mocks/mockData'
import { ROUTES } from '@/router/routes'
import ReceiptModal from './ReceiptModal'
import RefundModal  from './RefundModal'

export default function TransaccionesView() {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()
  const navigate       = useNavigate()
  const isDesktop      = useMediaQuery('(min-width: 1024px)')
  const [search, setSearch]         = useState('')
  const [receiptTrx, setReceiptTrx] = useState(null)
  const [refundTrx, setRefundTrx]   = useState(null)

  const [statusFilter, setStatusFilter] = useState('Todos')
  const [dateFilter, setDateFilter]     = useState('Cualquier fecha')
  const [currentPage, setCurrentPage]   = useState(1)
  const ITEMS_PER_PAGE = 7

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter(t => {
      const matchSearch = !search ||
        t.client?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'Todos' || t.status === statusFilter

      let matchDate = true
      if (dateFilter === 'Hoy') {
        const today = new Date()
        const day = today.getDate()
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        const monthStr = months[today.getMonth()]
        const yearStr = today.getFullYear()
        matchDate = t.date.includes(`${day} ${monthStr}`) && t.date.includes(`${yearStr}`)
      }
      if (dateFilter === 'Últimos 7 días') {
        // Mock: show last 3 days of data (27-29 Mar)
        matchDate = t.date.includes('29 Mar') || t.date.includes('28 Mar') || t.date.includes('27 Mar')
      }
      if (dateFilter === 'Este mes') {
        const today = new Date()
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        const monthStr = months[today.getMonth()]
        matchDate = t.date.includes(monthStr)
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
    <motion.div variants={pageVariants} initial="hidden" animate="show">

      <PageHeader title={t('transactions.title')} description={t('transactions.description')}>
        <Button onClick={() => navigate(ROUTES.LINKS)} className="hidden sm:flex">
          <LinkIcon size={18} /> {t('transactions.viewLinks')}
        </Button>
      </PageHeader>

      <TableToolbar 
        actions={
          <Button variant="successExport" size="sm" className="!px-2 sm:!px-3">
            <Download size={14} />
            <span className="hidden sm:inline ml-1.5">{t('common.export')}</span>
          </Button>
        }
        search={
          <SearchInput
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            placeholder={t('transactions.searchPlaceholder')}
            className="w-full sm:w-72"
          />
        }
      >
        <DropdownFilter
          label={t('filters.date')}
          icon={Calendar}
          options={[t('filters.anyDate'), t('filters.today'), t('filters.last7days'), t('filters.thisMonth')]}
          defaultValue={t('filters.anyDate')}
          value={dateFilter}
          onChange={(val) => { setDateFilter(val); setCurrentPage(1) }}
        />
        <DropdownFilter
          label={t('filters.status')}
          icon={Filter}
          options={[t('filters.all'), t('filters.successful'), t('filters.pending'), t('filters.refunded')]}
          defaultValue={t('filters.all')}
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setCurrentPage(1) }}
        />
      </TableToolbar>

      {/* Table (desktop) */}
      <Card className="pb-2 hidden lg:block">
        <div className="overflow-x-auto">
          <table aria-label={t('transactions.title')} className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode
                  ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
                  : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-4 min-w-[140px]">{t('transactions.tableDate')}</th>
                <th className="px-6 py-4 min-w-[220px]">{t('transactions.tableClient')}</th>
                <th className="px-6 py-4 min-w-[280px]">{t('transactions.tableDetails')}</th>
                <th className="px-6 py-4 text-right min-w-[140px]">{t('transactions.tableAmount')}</th>
                <th className="px-8 py-4 text-right min-w-[160px]">{t('transactions.tableActions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="show">
              {paginatedData.length > 0 ? (
                paginatedData.map((trx) => (
                  <motion.tr
                    variants={itemVariants}
                    key={trx.id}
                    className={`group transition-colors duration-200 ${
                      isDarkMode
                        ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                        : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                    }`}
                  >
                    {/* Fecha */}
                    <td className="px-8 py-4">
                      <p className={`font-bold text-sm ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                        {trx.date}
                      </p>
                      <p className={`text-xs font-medium mt-1 flex items-center gap-1.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        <Clock size={12} className="opacity-70" /> {trx.time}
                      </p>
                    </td>

                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 min-w-0 max-w-[200px]">
                        <p className={`font-bold text-sm truncate ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`} title={trx.client || t('common.anonymousClient')}>
                          {trx.client || t('common.anonymousClient')}
                        </p>
                        <div className={`flex items-center gap-1.5 text-[11px] font-medium truncate ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <CreditCard size={12} className="opacity-70" />
                            <span className="font-mono tracking-widest opacity-70">••</span>
                            <span className="font-mono">{trx.last4}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Detalles */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <Badge variant={trx.statusVariant} icon={trx.StatusIcon}>
                          {trx.status}
                        </Badge>
                        <div className={`flex items-center gap-2 text-[11px] font-medium flex-wrap ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <span className="flex items-center gap-1.5">
                            <trx.ChannelIcon size={12} className="opacity-70" />
                            <span className="hidden xl:inline">{trx.channel}</span>
                            <span className="inline xl:hidden">{trx.channel.includes('POS') ? 'POS' : 'Link'}</span>
                          </span>
                          <span className="opacity-40">•</span>
                          <span className="flex items-center gap-1.5" title={trx.country}>
                            {trx.countryCode === 'xx'
                              ? <Globe2 size={12} className="opacity-70" />
                              : <img src={`https://flagcdn.com/w20/${trx.countryCode}.png`} alt={trx.country} className="w-3.5 h-3.5 rounded-full object-cover" />
                            }
                            <span className="hidden xl:inline">{trx.country}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Monto */}
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono font-bold text-lg tracking-tight ${
                        trx.status === 'Reembolsado'
                          ? 'text-rose-500 line-through opacity-70'
                          : isDarkMode ? 'text-white' : 'text-[#111113]'
                      }`}>
                        ${trx.amount}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip content={t('transactions.viewReceipt')} position="top">
                          <Button
                            variant="action" size="sm"
                            onClick={() => setReceiptTrx(trx)}
                            className="!px-3 !py-2"
                          >
                            <FileText size={15} />
                            <span className="hidden xl:inline ml-1">{t('transactions.receiptShort')}</span>
                          </Button>
                        </Tooltip>
                        {trx.status === 'Reembolsado' ? (
                          <Tooltip content={t('transactions.refundReceipt')} position="top">
                            <Button
                              variant="outline" size="sm"
                              onClick={() => setRefundTrx(trx)}
                              className="!px-3 !py-2"
                            >
                              <FileText size={15} />
                              <span className="hidden xl:inline ml-1">{t('transactions.refundReceipt')}</span>
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip content={t('transactions.refund')} position="top">
                            <Button
                              variant="danger" size="sm"
                              onClick={() => setRefundTrx(trx)}
                              className="!px-3 !py-2"
                              disabled={trx.status === 'Pendiente'}
                            >
                              <RotateCcw size={15} />
                              <span className="hidden xl:inline ml-1">{t('transactions.refund')}</span>
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <EmptySearchState colSpan={5} term={search} onClear={() => setSearch('')} />
              )}
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
            {visibleData.map((trx) => (
              <motion.div key={trx.id} variants={itemVariants}>
                <SwipeableCard
                  actions={[
                    { label: t('transactions.viewReceipt'), icon: FileText, onClick: () => setReceiptTrx(trx) },
                    trx.status === 'Reembolsado'
                      ? { label: t('transactions.refundReceipt'), icon: FileText, onClick: () => setRefundTrx(trx) }
                      : { label: t('transactions.refund'), icon: RotateCcw, variant: 'danger', disabled: trx.status === 'Pendiente', onClick: () => setRefundTrx(trx) }
                  ]}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <p className={`font-bold text-sm truncate ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`} title={trx.client || t('common.anonymousClient')}>
                          {trx.client || t('common.anonymousClient')}
                        </p>
                        <div className={`flex items-center gap-1.5 text-[11px] font-medium truncate ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <CreditCard size={12} className="opacity-70" />
                            <span className="font-mono tracking-widest opacity-70">••</span>
                            <span className="font-mono">{trx.last4}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`font-mono font-bold text-lg tracking-tight mt-0.5 flex-shrink-0 ${
                        trx.status === 'Reembolsado'
                          ? 'text-rose-500 line-through opacity-70'
                          : isDarkMode ? 'text-white' : 'text-[#111113]'
                      }`}>
                        ${trx.amount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={trx.statusVariant} icon={trx.StatusIcon} title={trx.status} />
                        <span className={`text-[11px] font-medium flex items-center gap-1 opacity-70 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`} title={trx.channel}>
                          <trx.ChannelIcon size={14} />
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium flex items-center gap-1.5 opacity-80 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        <Clock size={12} /> {trx.date} {trx.time}
                      </span>
                    </div>
                  </div>
                </SwipeableCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-8 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              No se encontraron transacciones{search ? ` para "${search}"` : ''}.
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="mt-2">
                Limpiar busqueda
              </Button>
            )}
          </Card>
        )}
        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="flex justify-center py-4">
          {hasMore && <Loader2 size={20} className="animate-spin text-[#7C3AED]" />}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {receiptTrx && <ReceiptModal key="receipt" trx={receiptTrx} onClose={() => setReceiptTrx(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {refundTrx  && <RefundModal  key="refund" trx={refundTrx}  onClose={() => setRefundTrx(null)}  />}
      </AnimatePresence>
    </motion.div>
  )
}
