import { X, Printer, ArrowRightLeft } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'

export default function ReceiptModal({ trx, onClose }) {
  const { isDarkMode } = useTheme()
  if (!trx) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-xl ${isDarkMode ? 'bg-black/70' : 'bg-black/40'}`}
        onClick={onClose}
      />

      {/* Ticket */}
      <div className="relative animate-scale-in">
        <div className="w-full max-w-[380px] bg-white rounded-t-xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="px-8 pt-10 pb-8 text-center font-mono text-gray-800">

            {/* Brand icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-[#7C3AED] rounded-2xl flex items-center justify-center text-white">
              <ArrowRightLeft size={30} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold mb-1 tracking-widest uppercase">ZWAP Hotel POS</h2>
            <p className="text-xs text-gray-500 mb-6">COMPROBANTE ELECTRÓNICO</p>

            <div className="border-t-2 border-dashed border-gray-300 my-4" />

            {/* Data rows */}
            <div className="text-left text-sm space-y-2 my-6">
              <div className="flex justify-between">
                <span className="text-gray-500">FECHA:</span>
                <span className="font-bold">{trx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">HORA:</span>
                <span className="font-bold">{trx.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ID TRANS:</span>
                <span className="font-bold">{trx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">MÉTODO:</span>
                <span className="font-bold">{trx.card} •••• {trx.last4}</span>
              </div>
              {trx.client && (
                <div className="flex justify-between">
                  <span className="text-gray-500">CLIENTE:</span>
                  <span className="font-bold uppercase">{trx.client}</span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-dashed border-gray-300 my-4" />

            {/* Total */}
            <div className="text-left my-6">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">TOTAL</span>
                <span className="text-3xl font-bold tracking-tighter">${trx.amount}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right">MONEDA: USD</p>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 my-4" />
            <p className="text-xs text-gray-500 mt-6">¡Gracias por su preferencia!</p>
          </div>

          {/* Jagged bottom edge */}
          <div className="receipt-edge w-full" />
        </div>

        {/* Floating action buttons */}
        <div className="absolute -right-16 top-0 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="p-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
          >
            <X size={22} />
          </button>
          <button className="p-3.5 rounded-full bg-[#7C3AED] hover:bg-[#561BAF] text-white border border-[#7C3AED]/50 transition-all shadow-[0_0_30px_rgba(124,58,237,0.5)]">
            <Printer size={22} />
          </button>
        </div>
      </div>
    </div>
  )
}
