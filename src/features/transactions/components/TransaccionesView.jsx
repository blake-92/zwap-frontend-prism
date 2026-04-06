import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Calendar, Download,
  LinkIcon, Clock, CreditCard, Globe2, User,
  FileText, RotateCcw, SearchX, Filter
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, DropdownFilter, Pagination } from '@/shared/ui'
import { TRANSACTIONS } from '@/services/mocks/mockData'
import { ROUTES } from '@/router/routes'
import ReceiptModal from './ReceiptModal'
import RefundModal  from './RefundModal'

export default function TransaccionesView() {
  const { isDarkMode } = useTheme()
  const navigate       = useNavigate()
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
      if (dateFilter === 'Hoy') matchDate = t.date.includes('Hoy') || t.date.includes('Abr 2026')
      if (dateFilter === 'Últimos 7 días') matchDate = true

      return matchSearch && matchStatus && matchDate
    })
  }, [search, statusFilter, dateFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="animate-fade-in">

      {/* Page header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            Transacciones
          </h1>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Historial de cobros y pagos procesados
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.LINKS)}>
          <LinkIcon size={18} /> Ver Links de Pago
        </Button>
      </div>

      {/* Toolbar */}
      <div className={`relative z-20 mb-6 p-2 rounded-2xl border flex justify-between items-center ${
        isDarkMode
          ? 'bg-[#252429]/20 backdrop-blur-xl border-white/10'
          : 'bg-white/40 backdrop-blur-xl border-white shadow-sm'
      }`}>
        <div className="flex items-center gap-2 flex-1">
          <div className={`flex items-center px-4 py-2 rounded-xl w-72 transition-all ${
            isDarkMode
              ? 'bg-[#111113]/50 border border-white/5 focus-within:border-[#7C3AED]/40'
              : 'bg-white/60 border border-white focus-within:border-[#7C3AED]/30'
          }`}>
            <Search size={14} className={isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'} />
            <input
              type="text"
              placeholder="Buscar por cliente o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`bg-transparent border-none outline-none text-xs ml-2 w-full font-medium ${
                isDarkMode ? 'text-[#D8D7D9] placeholder:text-[#888991]' : 'text-[#111113] placeholder:text-[#B0AFB4]'
              }`}
            />
          </div>
          <DropdownFilter
            label="Fecha"
            icon={Calendar}
            options={['Cualquier fecha', 'Hoy', 'Últimos 7 días', 'Este mes']}
            value={dateFilter}
            onChange={(val) => { setDateFilter(val); setCurrentPage(1) }}
          />
          <DropdownFilter
            label="Estado"
            icon={Filter}
            options={['Todos', 'Completado', 'Pendiente', 'Reembolsado']}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1) }}
          />
        </div>
        <Button variant="successExport" size="sm">
          <Download size={14} /> Exportar
        </Button>
      </div>

      {/* Table */}
      <Card className="pb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode
                  ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
                  : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-4 min-w-[140px]">Fecha</th>
                <th className="px-6 py-4 min-w-[220px]">Cliente</th>
                <th className="px-6 py-4 min-w-[280px]">Detalles de Operación</th>
                <th className="px-6 py-4 text-right min-w-[140px]">Monto (USD)</th>
                <th className="px-8 py-4 text-right min-w-[160px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((trx, idx) => (
                  <tr
                    key={idx}
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
                      <div className="flex items-center gap-3">
                        {trx.client ? (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${
                            isDarkMode
                              ? 'bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                              : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-sm'
                          }`}>
                            {trx.initials}
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed flex-shrink-0 ${
                            isDarkMode ? 'bg-[#111113]/50 border-white/20 text-[#888991]' : 'bg-gray-50 border-gray-300 text-gray-400'
                          }`}>
                            <User size={16} />
                          </div>
                        )}
                        <div>
                          <p className={`font-bold text-sm ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                            {trx.client || 'Cliente Anónimo'}
                          </p>
                          <p className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                            {trx.email || <span className={`text-[10px] uppercase tracking-wider font-bold ${isDarkMode ? 'text-[#45434A]' : 'text-[#B0AFB4]'}`}>Venta en mostrador</span>}
                          </p>
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
                            <CreditCard size={12} className="opacity-70" />
                            <span className="font-mono tracking-widest opacity-70">••</span>
                            <span className="font-mono">{trx.last4}</span>
                          </span>
                          <span className="opacity-40">•</span>
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
                      <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="action" size="sm"
                          onClick={() => setReceiptTrx(trx)}
                          className="!px-3 !py-2"
                        >
                          <FileText size={15} />
                          <span className="hidden xl:inline">Recibo</span>
                        </Button>
                        <Button
                          variant="danger" size="sm"
                          onClick={() => setRefundTrx(trx)}
                          className="!px-3 !py-2"
                          disabled={trx.status === 'Reembolsado'}
                        >
                          <RotateCcw size={15} />
                          <span className="hidden xl:inline">Devolución</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center animate-fade-in">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                        isDarkMode
                          ? 'bg-[#111113]/50 border border-white/10 text-[#888991]'
                          : 'bg-gray-50 border border-gray-200 text-[#B0AFB4]'
                      }`}>
                        <SearchX size={32} strokeWidth={1.5} />
                      </div>
                      <h3 className={`text-lg font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        No se encontraron resultados
                      </h3>
                      <p className={`text-sm font-medium max-w-[300px] mx-auto mb-6 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        No pudimos encontrar ninguna transacción que coincida con &quot;{search}&quot;.
                      </p>
                      <Button variant="outline" onClick={() => setSearch('')}>
                        Limpiar búsqueda
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
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

      {/* Modals */}
      {receiptTrx && <ReceiptModal trx={receiptTrx} onClose={() => setReceiptTrx(null)} />}
      {refundTrx  && <RefundModal  trx={refundTrx}  onClose={() => setRefundTrx(null)}  />}
    </div>
  )
}
