import { useState } from 'react'
import { X, Building2 } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button } from '@/shared/ui'

export default function NewBranchModal({ onClose }) {
  const { isDarkMode } = useTheme()
  const [name, setName]       = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity]       = useState('')

  const fields = [
    { label: 'Nombre de la Sucursal', val: name, set: setName, ph: 'ej. Hotel del Mar', full: true },
    { label: 'Dirección',             val: address, set: setAddress, ph: 'Av. Costanera 456', full: false },
    { label: 'Ciudad / Región',       val: city,    set: setCity,    ph: 'Santa Cruz, Bolivia', full: false },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-md backdrop-saturate-200 transition-colors ${isDarkMode ? 'bg-black/70' : 'bg-[#111113]/40'}`}
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
              <Building2 className="text-[#7C3AED]" size={24} /> Nueva Sucursal
            </h2>
            <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              Agrega una nueva propiedad o punto de venta
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          {fields.filter(f => f.full).map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                {label.toUpperCase()}
              </label>
              <input
                value={val}
                onChange={e => set(e.target.value)}
                placeholder={ph}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-[#111113]/50 border-white/10 text-white placeholder-[#45434A] focus:border-[#7C3AED]/50'
                    : 'bg-white/60 border-white text-[#111113] placeholder-gray-300 focus:border-[#7C3AED]/40 shadow-sm'
                }`}
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {fields.filter(f => !f.full).map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
                  {label.toUpperCase()}
                </label>
                <input
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder={ph}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-[#111113]/50 border-white/10 text-white placeholder-[#45434A] focus:border-[#7C3AED]/50'
                      : 'bg-white/60 border-white text-[#111113] placeholder-gray-300 focus:border-[#7C3AED]/40 shadow-sm'
                  }`}
                />
              </div>
            ))}
          </div>

          <p className={`text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            Podrás asignar usuarios y configurar links de pago una vez creada la sucursal.
          </p>
        </div>

        {/* Footer */}
        <div className={`px-8 py-6 flex gap-4 border-t ${isDarkMode ? 'bg-[#111113]/40 border-white/10' : 'bg-gray-50/50 border-black/5'}`}>
          <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 !py-3.5">
            <Building2 size={18} /> Crear Sucursal
          </Button>
        </div>
      </div>
    </div>
  )
}
