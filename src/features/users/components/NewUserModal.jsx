import { useState } from 'react'
import { UserPlus, Shield, Calculator, ConciergeBell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, Input, Modal, SectionLabel } from '@/shared/ui'
import { BRANCH_LIST } from '@/services/mocks/mockData'

const ROLE_SELECTED_STYLE = {
  admin:         { onDark: 'bg-[#7C3AED]/10 border-[#7C3AED]/50', onLight: 'bg-[#DBD3FB]/40 border-[#7C3AED]/40' },
  accountant:    { onDark: 'bg-amber-500/10 border-amber-500/50', onLight: 'bg-amber-50 border-amber-400' },
  receptionist:  { onDark: 'bg-emerald-500/10 border-emerald-500/50', onLight: 'bg-emerald-50 border-emerald-400' },
}

const ROLE_ICON_STYLE = {
  admin:        'text-[#7C3AED]',
  accountant:   'text-amber-500',
  receptionist: 'text-emerald-500',
}

export default function NewUserModal({ onClose }) {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [role, setRole]         = useState('receptionist')
  const [branches, setBranches] = useState([])
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')

  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ROLES = [
    {
      id: 'admin',
      icon: Shield,
      label: t('users.roleAdmin'),
      desc: t('users.roleAdminDesc'),
    },
    {
      id: 'accountant',
      icon: Calculator,
      label: t('users.roleAccountant'),
      desc: t('users.roleAccountantDesc'),
    },
    {
      id: 'receptionist',
      icon: ConciergeBell,
      label: t('users.roleReceptionist'),
      desc: t('users.roleReceptionistDesc'),
    },
  ]

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleEmailChange = (e) => {
    const val = e.target.value
    setEmail(val)
    if (emailError && validateEmail(val)) setEmailError('')
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    if (!email.trim() || !validateEmail(email)) {
      setEmailError(t('users.invalidEmail'))
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
        {t('common.cancel')}
      </Button>
      <Button
        className="flex-1 !py-3.5 relative overflow-hidden"
        onClick={handleSubmit}
        disabled={!name.trim() || !email.trim() || branches.length === 0 || isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            {t('common.creating')}...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <UserPlus size={18} /> {t('users.createUser')}
          </span>
        )}
      </Button>
    </>
  )

  return (
    <Modal
      onClose={onClose}
      icon={<UserPlus size={24} />}
      title={t('users.newUser')}
      description={t('users.newUserDesc')}
      maxWidth="540px"
      footer={footer}
    >
      <div className="p-5 sm:p-8 space-y-7">

        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="user-name" className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              {t('users.name')}
            </label>
            <Input
              id="user-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('users.fullNamePlaceholder')}
            />
          </div>

          <div className="relative">
            <label htmlFor="user-email" className={`block text-xs font-bold tracking-widest mb-2 ${isDarkMode ? 'text-[#B0AFB4]' : 'text-[#67656E]'}`}>
              {t('users.emailLabel')}
            </label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={t('users.emailPlaceholder')}
              error={!!emailError}
            />
            {emailError && (
              <span className="absolute -bottom-5 left-1 text-[10px] font-bold text-rose-500">
                {emailError}
              </span>
            )}
          </div>
        </div>

        {/* Role */}
        <div>
          <SectionLabel className="mb-4">{t('users.role')}</SectionLabel>
          <div role="radiogroup" aria-label={t('users.role')} className="grid grid-cols-3 gap-3">
            {ROLES.map(({ id, icon: Icon, label, desc }) => (
              <div
                key={id}
                role="radio"
                aria-checked={role === id}
                tabIndex={0}
                onClick={() => setRole(id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRole(id) } }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  role === id
                    ? isDarkMode ? ROLE_SELECTED_STYLE[id].onDark : ROLE_SELECTED_STYLE[id].onLight
                    : isDarkMode ? 'bg-[#111113]/30 border-white/10 hover:bg-white/5' : 'bg-white/50 border-white hover:bg-white'
                }`}
              >
                <Icon size={20} className={`mb-2 ${role === id ? ROLE_ICON_STYLE[id] : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`} />
                <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>{label}</p>
                <p className={`text-[10px] mt-1 leading-relaxed ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Branches */}
        <div>
          <SectionLabel className="mb-4">{t('users.branchAccess')}</SectionLabel>
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
                      {t('branches.main')}
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
