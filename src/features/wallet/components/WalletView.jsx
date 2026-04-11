import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpFromLine, Landmark, TrendingUp,
  FileText,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, Stepper, Pagination, SearchInput, EmptySearchState, Tooltip, PageHeader, TableToolbar } from '@/shared/ui'
import { listVariants, itemVariants, pageVariants } from '@/shared/utils/motionVariants'
import { WITHDRAWALS, WALLET_BALANCE, WALLET_STEPS, BANK_ACCOUNT } from '@/services/mocks/mockData'
import WithdrawModal from './WithdrawModal'
import WithdrawReceiptModal from './WithdrawReceiptModal'

/* ─── WalletView ──────────────────────────────────────────── */
export default function WalletView() {
  const { isDarkMode } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [receiptTrx, setReceiptTrx] = useState(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 5
  const filtered = useMemo(() => WITHDRAWALS.filter(w => {
    if (!search) return true
    const q = search.toLowerCase()
    const amountNormalized = w.amount.replace(/,/g, '')
    return w.id.toLowerCase().includes(q) ||
      w.amount.includes(search) ||
      amountNormalized.includes(search)
  }), [search])
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedWithdrawals = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )


  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show">

      <PageHeader
        title="Billetera &amp; Retiros"
        description="Gestiona el saldo disponible y tus cuentas bancarias conectadas"
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
                Saldo Disponible
              </p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isDarkMode ? 'text-[#888991] border-white/10' : 'text-[#67656E] border-black/5'}`}>
                USD
              </span>
            </div>

            <h2 className={`text-[2.6rem] font-mono font-bold tracking-tighter leading-none mb-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              {WALLET_BALANCE.display}
            </h2>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
              <TrendingUp size={9} /> +$502.09 esta semana
            </span>
          </div>

          <div className={`mx-6 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`} />

          <div className="relative px-6 pt-5 pb-6 flex flex-col gap-3 mt-auto">
            <Button onClick={() => setModalOpen(true)} className="w-full !py-3 justify-center">
              <ArrowUpFromLine size={16} /> Retirar Fondos
            </Button>
            <div className={`flex items-center justify-center gap-1.5 text-[11px] ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              <span>Próximo autodepósito:</span>
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
                  Retiro en Progreso
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
                    Cuenta Destino
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
                Editar
              </button>
            </div>
          </Card>

        </div>
      </div>

      <TableToolbar>
        <SearchInput
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
          placeholder="Buscar por ID o monto..."
        />
      </TableToolbar>

      {/* Historial de Retiros (desktop) */}
      <Card className="pb-2 hidden lg:block">
        <div className={`px-8 py-4 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            Historial de Retiros
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table aria-label="Historial de retiros" className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className={`text-[10px] uppercase font-bold tracking-widest ${
                isDarkMode
                  ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
                  : 'text-[#67656E] border-b border-black/5 bg-white/50'
              }`}>
                <th className="px-8 py-3">ID Transacción</th>
                <th className="px-6 py-3">Fecha Ingreso</th>
                <th className="px-6 py-3 text-right">Monto</th>
                <th className="px-6 py-3">Destino</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-8 py-3 text-right">Recibo</th>
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
                      <Tooltip content="Ver recibo" position="top">
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
            Historial de Retiros
          </h3>
        </div>
        {paginatedWithdrawals.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
            {paginatedWithdrawals.map((w) => (
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
                        <FileText size={14} /> Ver Recibo
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
              No se encontraron retiros{search ? ` para "${search}"` : ''}.
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCurrentPage(1) }} className="mt-2">
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

      <AnimatePresence>
        {modalOpen && <WithdrawModal key="withdraw" onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {receiptTrx && <WithdrawReceiptModal key="withdraw-receipt" trx={receiptTrx} onClose={() => setReceiptTrx(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}
