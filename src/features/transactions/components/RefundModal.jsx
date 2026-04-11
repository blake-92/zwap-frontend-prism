import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, Modal, SegmentControl, SectionLabel, InfoBanner } from '@/shared/ui'

export default function RefundModal({ trx, onClose }) {
  const { isDarkMode }              = useTheme()
  const [refundType, setRefundType] = useState('total')
  const [feeBearer, setFeeBearer]   = useState('hotel')
  const [partial, setPartial]       = useState('')

  if (!trx) return null

  const refundAmount = refundType === 'parcial' ? (partial || '0.00') : trx.amount
  const warningText  = feeBearer === 'hotel'
    ? `El cliente recibirá $${refundAmount} completos. El hotel asumirá el costo transaccional de $3.50.`
    : `El cliente recibirá $${refundAmount} menos la comisión bancaria de $3.50. El saldo del hotel no se verá afectado.`

  const description = (
    <>
      Cobro original:{' '}
      <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>${trx.amount}</span>
      {' '}a {trx.client || 'Cliente Anónimo'}
    </>
  )

  const footer = (
    <>
      <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose}>Cancelar</Button>
      <Button className="flex-1 !py-3.5 !bg-rose-500 hover:!bg-rose-600 !border-rose-400 !shadow-[0_8px_25px_rgba(244,63,94,0.3)]">
        <RotateCcw size={18} /> Procesar Devolución
      </Button>
    </>
  )

  return (
    <Modal
      onClose={onClose}
      icon={<RotateCcw className="text-rose-500" size={24} />}
      title="Solicitar Devolución"
      description={description}
      maxWidth="600px"
      footer={footer}
    >
      <div className="p-5 sm:p-8 space-y-8">

        {/* Tipo de reembolso */}
        <div>
          <SectionLabel className="mb-4">TIPO DE REEMBOLSO</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'total',   label: 'Total',   sub: `$${trx.amount}`,      subColor: 'text-rose-500' },
              { id: 'parcial', label: 'Parcial', sub: 'Monto personalizado', subColor: isDarkMode ? 'text-[#888991]' : 'text-[#67656E]' },
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
                min="0"
                max={parseFloat(trx.amount.replace(/,/g, ''))}
                value={partial}
                onChange={e => {
                  const val = e.target.value
                  const maxAmount = parseFloat(trx.amount.replace(/,/g, ''))
                  if (val === '' || parseFloat(val) <= maxAmount) setPartial(val)
                }}
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
          <SectionLabel className="mb-4">¿QUIÉN ABSORBE LA COMISIÓN BANCARIA?</SectionLabel>
          <SegmentControl
            options={[
              { value: 'hotel',   label: 'El Hotel (Reembolso exacto)' },
              { value: 'cliente', label: 'El Cliente (Menos comisión)' },
            ]}
            value={feeBearer}
            onChange={setFeeBearer}
          />
          <InfoBanner className="mt-4">{warningText}</InfoBanner>
        </div>
      </div>
    </Modal>
  )
}
