import { useState } from 'react'
import { X, RotateCcw, AlertCircle } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, SegmentControl } from '@/shared/ui'

export default function RefundModal({ trx, onClose }) {
  const { isDarkMode }            = useTheme()
  const [refundType, setRefundType] = useState('total')
  const [feeBearer, setFeeBearer]   = useState('hotel')
  const [partial, setPartial]       = useState('')

  if (!trx) return null

  const refundAmount = refundType === 'parcial' ? (partial || '0.00') : trx.amount
  const warningText  = feeBearer === 'hotel'
    ? `El cliente recibirá $${refundAmount} completos. El hotel asumirá el costo transaccional de $3.50.`
    : `El cliente recibirá $${refundAmount} menos la comisión bancaria de $3.50. El saldo del hotel no se verá afectado.`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-xl ${isDarkMode ? 'bg-black/70' : 'bg-black/40'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-[600px] rounded-[24px] border overflow-hidden shadow-2xl animate-scale-in ${
        isDarkMode
          ? 'bg-[#252429]/80 backdrop-blur-3xl border-white/20 border-t-white/30'
          : 'bg-white/90 backdrop-blur-3xl border-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
      }`}>

        {/* Header */}
        <div className={`px-8 py-6 border-b flex justify-between items-start ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <div>
            <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              <RotateCcw className="text-rose-500" size={24} /> Solicitar Devolución
            </h2>
            <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              Cobro original:{' '}
              <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>${trx.amount}</span>
              {' '}a {trx.client || 'Cliente Anónimo'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">

          {/* Tipo de reembolso */}
          <div>
            <h3 className={`text-xs font-bold tracking-widest mb-4 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              TIPO DE REEMBOLSO
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'total',   label: 'Total',   sub: `$${trx.amount}`,          subColor: 'text-rose-500' },
                { id: 'parcial', label: 'Parcial', sub: 'Monto personalizado',     subColor: isDarkMode ? 'text-[#888991]' : 'text-[#67656E]' },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setRefundType(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    refundType === opt.id
                      ? opt.id === 'total'
                        ? isDarkMode ? 'bg-rose-500/10 border-rose-500/50' : 'bg-rose-50 border-rose-400'
                        : isDarkMode ? 'bg-[#7C3AED]/10 border-[#7C3AED]/50' : 'bg-[#DBD3FB]/40 border-[#7C3AED]/40'
                      : isDarkMode ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>{opt.label}</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      refundType === opt.id
                        ? opt.id === 'total' ? 'border-rose-500' : 'border-[#7C3AED]'
                        : isDarkMode ? 'border-[#45434A]' : 'border-gray-300'
                    }`}>
                      {refundType === opt.id && (
                        <div className={`w-2 h-2 rounded-full ${opt.id === 'total' ? 'bg-rose-500' : 'bg-[#7C3AED]'}`} />
                      )}
                    </div>
                  </div>
                  <p className={`text-sm font-mono ${opt.subColor}`}>{opt.sub}</p>
                </div>
              ))}
            </div>

            {refundType === 'parcial' && (
              <div className="mt-4 animate-fade-in relative">
                <span className={`absolute left-4 top-3.5 font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={partial}
                  onChange={e => setPartial(e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 rounded-xl border outline-none font-mono font-bold text-lg transition-all ${
                    isDarkMode
                      ? 'bg-[#111113]/50 border-white/10 text-white focus:border-[#7C3AED]/50 placeholder-[#45434A]'
                      : 'bg-white/60 border-white text-[#111113] focus:border-[#7C3AED]/40 shadow-sm placeholder-gray-300'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Fee bearer */}
          <div>
            <h3 className={`text-xs font-bold tracking-widest mb-4 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              ¿QUIÉN ABSORBE LA COMISIÓN BANCARIA?
            </h3>
            <SegmentControl
              options={[
                { value: 'hotel',   label: 'El Hotel (Reembolso exacto)' },
                { value: 'cliente', label: 'El Cliente (Menos comisión)' },
              ]}
              value={feeBearer}
              onChange={setFeeBearer}
            />
            <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
              isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium leading-relaxed">{warningText}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-6 flex gap-4 border-t ${isDarkMode ? 'bg-[#111113]/40 border-white/10' : 'bg-gray-50/50 border-black/5'}`}>
          <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose}>Cancelar</Button>
          <Button
            className="flex-1 !py-3.5 !bg-rose-500 hover:!bg-rose-600 !border-rose-400 !shadow-[0_8px_25px_rgba(244,63,94,0.3)]"
          >
            <RotateCcw size={18} /> Procesar Devolución
          </Button>
        </div>
      </div>
    </div>
  )
}
