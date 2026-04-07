import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, Modal } from '@/shared/ui'

export default function NewBranchModal({ onClose }) {
  const { isDarkMode } = useTheme()
  const [name, setName]       = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity]       = useState('')

  const fields = [
    { label: 'Nombre de la Sucursal', val: name,    set: setName,    ph: 'ej. Hotel del Mar',    full: true  },
    { label: 'Dirección',             val: address,  set: setAddress, ph: 'Av. Costanera 456',    full: false },
    { label: 'Ciudad / Región',       val: city,     set: setCity,    ph: 'Santa Cruz, Bolivia',  full: false },
  ]

  const footer = (
    <>
      <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose}>Cancelar</Button>
      <Button className="flex-1 !py-3.5">
        <Building2 size={18} /> Crear Sucursal
      </Button>
    </>
  )

  return (
    <Modal
      onClose={onClose}
      icon={<Building2 size={24} />}
      title="Nueva Sucursal"
      description="Agrega una nueva propiedad o punto de venta"
      footer={footer}
    >
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
    </Modal>
  )
}
