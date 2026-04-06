import { useState } from 'react'
import { X, ArrowUpFromLine, AlertCircle, Landmark } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button } from '@/shared/ui'

export default function WithdrawModal({ onClose }) {
  const { isDarkMode } = useTheme()
  const [amount, setAmount] = useState('')

  const balance = 12450.00
  const fee = 0
  const parsedAmt = parseFloat(amount.replace(',', '.')) || 0
  const net = parsedAmt - fee

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-xl ${isDarkMode ? 'bg-black/70' : 'bg-black/40'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-[480px] rounded-[24px] border overflow-hidden shadow-2xl animate-scale-in ${
        isDarkMode
          ? 'bg-[#252429]/80 backdrop-blur-3xl border-white/20 border-t-white/30'
          : 'bg-white/90 backdrop-blur-3xl border-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
      }`}>

        {/* Header */}
        <div className={`px-8 py-6 border-b flex justify-between items-start ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <div>
            <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              <ArrowUpFromLine className="text-[#7C3AED]" size={24} /> Retirar Fondos
            </h2>
            <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              Saldo disponible:{' '}
              <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Amount input */}
          <div>
            <label className={`block text-xs font-bold tracking-widest mb-3 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              MONTO A RETIRAR (USD)
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-3.5 font-bold text-lg ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 rounded-xl border outline-none font-mono font-bold text-xl transition-all ${
                  isDarkMode
                    ? 'bg-[#111113]/50 border-white/10 text-white focus:border-[#7C3AED]/50 placeholder-[#45434A]'
                    : 'bg-white/60 border-white text-[#111113] focus:border-[#7C3AED]/40 shadow-sm placeholder-gray-300'
                }`}
              />
            </div>
            <button
              onClick={() => setAmount(balance.toFixed(2))}
              className={`mt-2 text-xs font-bold ${isDarkMode ? 'text-[#7C3AED] hover:text-[#A78BFA]' : 'text-[#7C3AED] hover:text-[#561BAF]'} transition-colors`}
            >
              Retirar todo el saldo disponible
            </button>
          </div>

          {/* Destination account */}
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${
            isDarkMode ? 'bg-[#111113]/30 border-white/10' : 'bg-gray-50/60 border-gray-200'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDarkMode ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-[#DBD3FB]/60 text-[#561BAF]'
            }`}>
              <Landmark size={18} />
            </div>
            <div>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>Destino</p>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                Banco Mercantil SCZ
              </p>
              <p className={`text-xs font-mono ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                •••• 1234
              </p>
            </div>
          </div>

          {/* Summary */}
          {parsedAmt > 0 && (
            <div className={`p-4 rounded-xl border space-y-2 font-mono text-sm animate-fade-in ${
              isDarkMode ? 'bg-[#111113]/30 border-white/10' : 'bg-gray-50/60 border-gray-200'
            }`}>
              <div className={`flex justify-between ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                <span>Monto solicitado</span>
                <span className="font-bold">${parsedAmt.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                <span>Comisión de retiro</span>
                <span className="text-emerald-500 font-bold">Gratis</span>
              </div>
              <div className={`flex justify-between pt-2 border-t font-bold text-base ${
                isDarkMode ? 'border-white/10 text-white' : 'border-black/5 text-[#111113]'
              }`}>
                <span>Total a depositar</span>
                <span>${net.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Info */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              Los retiros se procesan en 1-2 días hábiles. El dinero llegará a tu cuenta bancaria registrada.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-6 flex gap-4 border-t ${isDarkMode ? 'bg-[#111113]/40 border-white/10' : 'bg-gray-50/50 border-black/5'}`}>
          <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 !py-3.5" disabled={parsedAmt <= 0 || parsedAmt > balance}>
            <ArrowUpFromLine size={18} /> Confirmar Retiro
          </Button>
        </div>
      </div>
    </div>
  )
}
