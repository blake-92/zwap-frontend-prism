import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Calendar, Search,
  CheckCircle2, Landmark, AlertOctagon,
  CalendarDays, Clock, ArrowDownToLine, Filter
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, DropdownFilter, Pagination, SearchInput, EmptySearchState, Tooltip } from '@/shared/ui'
import { listVariants, itemVariants } from '@/shared/utils/motionVariants'
import { PAYOUTS } from '@/services/mocks/mockData'

/* ─────────────────────────────────────────────────────────────
   KPI Card
───────────────────────────────────────────────────────────── */
function SaldoCard({ icon: Icon, iconVariant, label, value, badge, badgeVariant, negative }) {
  const { isDarkMode } = useTheme()

  const iconColors = {
    success: isDarkMode ? 'bg-emerald-500/15 text-emerald-500' : 'bg-emerald-100 text-emerald-600',
    warning: isDarkMode ? 'bg-amber-500/15 text-amber-500'    : 'bg-amber-100 text-amber-600',
    danger:  isDarkMode ? 'bg-rose-500/15 text-rose-500'      : 'bg-rose-100 text-rose-600',
  }

  return (
    <Card hoverEffect className="p-6 cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${iconColors[iconVariant]}`}>
          <Icon size={20} />
        </div>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
      <p className={`text-sm font-semibold mb-1 transition-colors ${
        isDarkMode ? 'text-[#888991] group-hover:text-[#D8D7D9]' : 'text-[#67656E] group-hover:text-[#111113]'
      }`}>
        {label}
      </p>
      <h3 className={`text-3xl font-mono font-bold tracking-tight ${
        negative
          ? isDarkMode ? 'text-rose-500' : 'text-rose-600'
          : isDarkMode ? 'text-white' : 'text-[#111113]'
      }`}>
        {value}
      </h3>
    </Card>
  )
}

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
      if (dateFilter === 'Esta semana') matchDate = p.closeDate.includes('27') || p.closeDate.includes('28')

      return matchSearch && matchStatus && matchDate
    })
  }, [search, statusFilter, dateFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >

      {/* Page header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            Liquidaciones
          </h1>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Control de Cierres Diarios y Depósitos Bancarios.
          </p>
        </div>
        <Button variant="outline">
          <Download size={18} /> Descargar Reporte Fiscal
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SaldoCard
          icon={CheckCircle2} iconVariant="success"
          label="Depositado (Disponible)"
          value="$12,450.00"
          badge="Últimos 30 días" badgeVariant="success"
        />
        <SaldoCard
          icon={Landmark} iconVariant="warning"
          label="En Tránsito (Bancos)"
          value="$3,772.00"
          badge="En limpieza (2 días hábiles)" badgeVariant="warning"
        />
        <SaldoCard
          icon={AlertOctagon} iconVariant="danger"
          label="Retenciones / Ajustes"
          value="-$150.00"
          badge="Requiere atención" badgeVariant="danger"
          negative
        />
      </div>

      {/* Toolbar */}
      <div className={`relative z-20 mb-6 p-2 rounded-2xl border flex justify-between items-center ${
        isDarkMode
          ? 'bg-[#252429]/20 backdrop-blur-xl border-white/10'
          : 'bg-white/40 backdrop-blur-xl border-white shadow-sm'
      }`}>
        <div className="flex items-center gap-2 flex-1">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
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
        </div>
      </div>

      {/* Table */}
      <Card className="pb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
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
                    key={idx}
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
    </motion.div>
  )
}
