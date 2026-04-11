import { useEffect, useRef } from 'react'
import { X, Printer, ArrowRightLeft, CheckCircle2, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'

export default function ReceiptModal({ trx, onClose }) {
  const { isDarkMode } = useTheme()
  const containerRef = useRef(null)

  // ESC key handler
  useEffect(() => {
    if (!trx) return
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [trx, onClose])

  // Body scroll lock
  useEffect(() => {
    if (!trx) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [trx])

  // Focus trap
  useEffect(() => {
    if (!trx) return
    const el = containerRef.current
    if (!el) return
    const getFocusable = () => el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const initial = getFocusable()
    if (initial.length > 0) initial[0].focus()
    const handleTab = (e) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [trx])

  if (!trx) return null

  return (
    <motion.div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Comprobante de Pago"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-md ${isDarkMode ? 'bg-[#111113]/80' : 'bg-white/60'}`}
        onClick={onClose}
      />

        {/* Digital Receipt Card */}
        <motion.div 
          initial={{ y: 20, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-[400px]"
        >
          {/* Floating action buttons (Top Right) */}
          <div className="absolute -top-12 right-0 flex gap-2">
            <button className={`p-2 rounded-full backdrop-blur-xl transition-all shadow-lg ${
              isDarkMode 
                ? 'bg-[#252429]/80 border border-white/10 text-white hover:bg-white/10' 
                : 'bg-white border border-[#7C3AED]/20 text-[#561BAF] hover:bg-gray-50'
            }`} title="Imprimir">
              <Printer size={18} />
            </button>
            <button className={`p-2 rounded-full backdrop-blur-xl transition-all shadow-lg ${
              isDarkMode 
                ? 'bg-[#252429]/80 border border-white/10 text-white hover:bg-white/10' 
                : 'bg-white border border-[#7C3AED]/20 text-[#561BAF] hover:bg-gray-50'
            }`} title="Descargar PDF">
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full backdrop-blur-xl transition-all shadow-lg ${
                isDarkMode 
                  ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30' 
                  : 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100'
              }`} title="Cerrar">
              <X size={18} />
            </button>
          </div>

          {/* Main Card */}
          <div className={`overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl ${
            isDarkMode 
              ? 'bg-[#252429]/90 border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]' 
              : 'bg-white/90 border-white shadow-[0_30px_80px_rgba(124,58,237,0.15)]'
          }`}>
            {/* Header Glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#7C3AED]/20 to-transparent pointer-events-none" />

            <div className="px-8 pt-10 pb-8 relative z-10">
              {/* Brand icon */}
              <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg ${
                isDarkMode 
                  ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30 shadow-[0_0_20px_rgba(124,58,237,0.3)]' 
                  : 'bg-gradient-to-tr from-[#7C3AED] to-[#B9A4F8] text-white shadow-[0_10px_20px_rgba(124,58,237,0.3)]'
              }`}>
                <ArrowRightLeft size={28} strokeWidth={2} />
              </div>
              
              <div className="text-center mb-8">
                <h2 className={`text-xl font-bold mb-1 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                  ZWAP Hotel
                </h2>
                <p className={`text-xs font-medium uppercase tracking-widest ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  Comprobante de Pago
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center mb-8">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  trx.status === 'Exitoso'
                    ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : trx.status === 'Reembolsado'
                      ? isDarkMode ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'bg-rose-100 text-rose-700 border border-rose-200'
                      : isDarkMode ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  <CheckCircle2 size={14} />
                  {trx.status.toUpperCase()}
                </div>
              </div>

              <div className={`border-t border-dashed my-6 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`} />

              {/* Total Amount */}
              <div className="text-center my-6">
                <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>Monto Total</p>
                <div className={`text-4xl font-mono font-bold tracking-tighter ${
                  trx.status === 'Reembolsado' 
                    ? 'text-rose-500 line-through opacity-70' 
                    : isDarkMode ? 'text-white' : 'text-[#111113]'
                }`}>
                  ${trx.amount} <span className="text-lg text-[#888991] font-sans">USD</span>
                </div>
              </div>

              <div className={`border-t border-dashed my-6 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`} />

              {/* Data rows */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>Fecha y Hora</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>{trx.date}, {trx.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>ID Transacción</span>
                  <span className={`text-sm font-mono font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>{trx.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>Método de Pago</span>
                  <span className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
                    <span className="capitalize">{trx.card || 'Tarjeta'}</span> •••• {trx.last4}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>Cliente</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>{trx.client || 'Cliente Anónimo'}</span>
                </div>
              </div>

              {/* Footer text */}
              <div className={`mt-8 pt-6 border-t border-dashed text-center ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  Procesado de forma segura por <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>Zwap</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
    </motion.div>
  )
}
