import { useState } from 'react'
import { UserPlus, Shield, Calculator, ConciergeBell } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, Input, Modal, SectionLabel } from '@/shared/ui'
import { BRANCH_LIST } from '@/services/mocks/mockData'

const ROLES = [
  {
    id: 'Administrador',
    icon: Shield,
    desc: 'Acceso total a todas las sucursales y configuraciones.',
    color: 'default',
  },
  {
    id: 'Contador',
    icon: Calculator,
    desc: 'Acceso a reportes, liquidaciones y exportaciones.',
    color: 'warning',
  },
  {
    id: 'Recepcionista',
    icon: ConciergeBell,
    desc: 'Cobros, links de pago y transacciones diarias.',
    color: 'success',
  },
]

const ROLE_SELECTED_STYLE = {
  Administrador: { dark: 'bg-[#7C3AED]/10 border-[#7C3AED]/50', light: 'bg-[#DBD3FB]/40 border-[#7C3AED]/40' },
  Contador:      { dark: 'bg-amber-500/10 border-amber-500/50', light: 'bg-amber-50 border-amber-400' },
  Recepcionista: { dark: 'bg-emerald-500/10 border-emerald-500/50', light: 'bg-emerald-50 border-emerald-400' },
}

const ROLE_ICON_STYLE = {
  Administrador: 'text-[#7C3AED]',
  Contador:      'text-amber-500',
  Recepcionista: 'text-emerald-500',
}

export default function NewUserModal({ onClose }) {
  const { isDarkMode } = useTheme()
  const [role, setRole]         = useState('Recepcionista')
  const [branches, setBranches] = useState([])
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')

  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleEmailChange = (e) => {
    const val = e.target.value
    setEmail(val)
    if (emailError && validateEmail(val)) setEmailError('')
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    if (!email.trim() || !validateEmail(email)) {
      setEmailError('Ingresa un correo electrónico válido')
      return
    }
    if (branches.length === 0) return
    setIsSubmitting(true)
    setTimeout(() => { setIsSubmitting(false); onClose() }, 1500)
  }

  const toggleBranch = id =>
    setBranches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])

  const footer = (
    <>
      <Button variant="outline" className="flex-1 !py-3.5" onClick={onClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button
        className="flex-1 !py-3.5 relative overflow-hidden"
        onClick={handleSubmit}
        disabled={!name.trim() || !email.trim() || branches.length === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            Creando...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <UserPlus size={18} /> Crear Usuario
          </span>
        )}
      </Button>
    </>
  )

  return (
    <Modal
      onClose={onClose}
      icon={<UserPlus size={24} />}
      title="Nuevo Usuario"
      description="Invita a un miembro del equipo"
      maxWidth="540px"
      footer={footer}
    >
      <div className="p-8 space-y-7">

        {/* Name + Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              NOMBRE
            </label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ej. Carlos Pérez"
            />
          </div>

          <div className="relative">
            <label className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="carlos@hotel.com"
              className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm font-medium transition-all ${
                emailError
                  ? isDarkMode
                    ? 'bg-rose-500/10 border-rose-500/50 text-white focus:border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                  : isDarkMode
                    ? 'bg-[#111113]/50 border-white/10 text-white placeholder-[#45434A] focus:border-[#7C3AED]/50'
                    : 'bg-white/60 border-white text-[#111113] placeholder-gray-300 focus:border-[#7C3AED]/40 shadow-sm'
              }`}
            />
            {emailError && (
              <span className="absolute -bottom-5 left-1 text-[10px] font-bold text-rose-500 animate-fade-in">
                {emailError}
              </span>
            )}
          </div>
        </div>

        {/* Role */}
        <div>
          <SectionLabel className="mb-4">ROL</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {ROLES.map(({ id, icon: Icon, desc }) => (
              <div
                key={id}
                onClick={() => setRole(id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  role === id
                    ? isDarkMode ? ROLE_SELECTED_STYLE[id].dark : ROLE_SELECTED_STYLE[id].light
                    : isDarkMode ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white'
                }`}
              >
                <Icon size={20} className={`mb-2 ${role === id ? ROLE_ICON_STYLE[id] : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`} />
                <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>{id}</p>
                <p className={`text-[10px] mt-1 leading-relaxed ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Branches */}
        <div>
          <SectionLabel className="mb-4">SUCURSALES CON ACCESO</SectionLabel>
          <div className="flex flex-col gap-2">
            {BRANCH_LIST.map(b => (
              <label
                key={b.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  branches.includes(b.id)
                    ? isDarkMode ? 'bg-[#7C3AED]/10 border-[#7C3AED]/30' : 'bg-[#DBD3FB]/30 border-[#7C3AED]/30'
                    : isDarkMode ? 'bg-[#111113]/20 border-white/5 hover:bg-white/5' : 'bg-white/40 border-white hover:bg-white/70'
                }`}
              >
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
                  {b.name}
                  {b.isMain && (
                    <span className={`ml-2 text-[10px] font-bold uppercase ${isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'}`}>
                      Principal
                    </span>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={branches.includes(b.id)}
                  onChange={() => toggleBranch(b.id)}
                  className="w-4 h-4 accent-[#7C3AED] rounded"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
