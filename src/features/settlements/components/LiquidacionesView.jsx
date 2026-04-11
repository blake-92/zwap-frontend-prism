import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Calendar, Search,
  CheckCircle2, Landmark, AlertOctagon,
  CalendarDays, Clock, ArrowDownToLine, Filter
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, StatCard, DropdownFilter, Pagination, SearchInput, EmptySearchState, Tooltip, PageHeader, TableToolbar } from '@/shared/ui'
import { listVariants, itemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { PAYOUTS, WALLET_BALANCE, SETTLEMENT_SUMMARY } from '@/services/mocks/mockData'

/* ─────────────────────────────────────────────────────────────
   LiquidacionesView
───────────────────────────────────────────────────────────── */
export default function LiquidacionesView() {
  const { isDarkMode } = useTheme()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [dateFilter, setDateFilter]     = useState('Cualquier fecha')
  const [currentPage, setCurrentPage]   = useState(1)
  const ITEMS_PER_PAGE = 7

  const filtered = useMemo(() => {
    return PAYOUTS.filter(p => {
      const matchSearch = !search ||
        p.type.toLowerCase().includes(search.toLowerCase()) ||
        p.closeDate.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'Todos' || p.status === statusFilter

      let matchDate = true
      if (dateFilter === 'Esta semana') {
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        const today = new Date()
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        // Parse closeDate like "28 Mar 2026"
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
      }
      if (dateFilter === 'Este mes') {
        const today = new Date()
        const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        const monthStr = months[today.getMonth()]
        matchDate = p.closeDate.includes(monthStr)
      }

      return matchSearch && matchStatus && matchDate
    })
  }, [search, statusFilter, dateFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">

      <PageHeader title="Liquidaciones" description="Control de Cierres Diarios y Depósitos Bancarios.">
        <Button variant="outline">
          <Download size={18} /> Descargar Reporte Fiscal
        </Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8 mb-10">
        <StatCard layout="balance"
          icon={CheckCircle2} iconVariant="success"
          label="Depositado (Disponible)"
          value={WALLET_BALANCE.display}
          badge="Últimos 30 días" badgeVariant="success"
        />
        <StatCard layout="balance"
          icon={Landmark} iconVariant="warning"
          label="En Tránsito (Bancos)"
          value={SETTLEMENT_SUMMARY.inTransit}
          badge={SETTLEMENT_SUMMARY.inTransitBadge} badgeVariant="warning"
        />
        <StatCard layout="balance"
          icon={AlertOctagon} iconVariant="danger"
          label="Retenciones / Ajustes"
          value={SETTLEMENT_SUMMARY.adjustments}
          badge={SETTLEMENT_SUMMARY.adjustmentsBadge} badgeVariant="danger"
          negative
        />
      </div>

      <TableToolbar>
        <SearchInput
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
          placeholder="Buscar concepto o fecha..."
        />
        <DropdownFilter
          label="Fecha"
          icon={Calendar}
          options={['Cualquier fecha', 'Esta semana', 'Este mes']}
          value={dateFilter}
          onChange={(val) => { setDateFilter(val); setCurrentPage(1) }}
        />
        <DropdownFilter
          label="Estado"
          icon={Filter}
          options={['Todos', 'Depositado', 'Pendiente (ACH)']}
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setCurrentPage(1) }}
        />
      </TableToolbar>

      {/* Table (desktop) */}
      <Card className="pb-2 hidden lg:block">
        <div className="overflow-x-auto">
          <table aria-label="Liquidaciones y depósitos" className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode
                  ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
                  : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-4">Concepto & Cierre</th>
                <th className="px-6 py-4">Desglose Financiero</th>
                <th className="px-6 py-4 text-right">Neto Resultante</th>
                <th className="px-6 py-4 text-center">Estado del Depósito</th>
                <th className="px-8 py-4 text-right">Acciones</th>
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
                            Volumen{' '}
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
                              <span>Ajuste:</span>
                              <span className="font-bold text-rose-500">-${Math.abs(lote.adj).toFixed(2)}</span>
                            </div>
                            {lote.adjReason && (
                              <span className={`font-sans text-[10px] mt-0.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                                Ref: {lote.adjReason}
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
                            <ArrowDownToLine size={10} /> Llega: {lote.depositDate}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-8 py-4 text-right">
                      <div>
                        <Tooltip content="Inspeccionar lote" position="top">
                          <Button variant="action" size="sm" className="!px-3 !py-2">
                            <Search size={15} />
                            <span className="hidden xl:inline text-xs ml-1">Inspeccionar</span>
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
        {paginatedData.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
            {paginatedData.map((lote, idx) => {
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
                        <span>Volumen <span className="font-sans text-[10px] opacity-60">({lote.trxCount} trx)</span></span>
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
                          <span className={isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}>Ajuste</span>
                          <span className="font-bold text-rose-500">-${Math.abs(lote.adj).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className={`pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                      <Button variant="action" size="sm" className="!px-3 !py-1.5 w-full justify-center">
                        <Search size={14} /> Inspeccionar
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
              No se encontraron liquidaciones{search ? ` para "${search}"` : ''}.
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="mt-2">
                Limpiar busqueda
              </Button>
            )}
          </Card>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </motion.div>
  )
}
