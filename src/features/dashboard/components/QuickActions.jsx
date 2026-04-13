import { Plus, Smartphone, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, SectionLabel } from '@/shared/ui'
import { PENDING_CHARGES } from '@/services/mocks/mockData'

export default function QuickActions({ onNewCharge }) {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()
  const { addToast }   = useToast()

  const handleResendLast = () => {
    if (PENDING_CHARGES.length > 0) {
      const last = PENDING_CHARGES[0]
      navigator.clipboard.writeText(last.url)
      const key = window.innerWidth < 640 ? 'dashboard.lastLinkCopiedShort' : 'dashboard.lastLinkCopied'
      addToast(t(key, { client: last.client }), 'success')
    }
  }

  const actions = [
    {
      label: t('dashboard.newCharge'),
      icon: Plus,
      onClick: onNewCharge,
      accent: true,
    },
    {
      label: t('dashboard.posCharge'),
      icon: Smartphone,
      onClick: () => addToast(t('dashboard.posComingSoon'), 'info'),
      accent: false,
    },
    {
      label: t('dashboard.resendLastLink'),
      icon: Send,
      onClick: handleResendLast,
      accent: false,
    },
  ]

  return (
    <Card className="p-4 flex flex-col gap-3">
      <SectionLabel>{t('dashboard.quickActions')}</SectionLabel>

      <div className="flex flex-col gap-2">
        {actions.map(({ label, icon: Icon, onClick, accent }) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
              accent
                ? isDarkMode
                  ? 'bg-[#7C3AED]/15 border-[#7C3AED]/30 text-[#A78BFA] hover:bg-[#7C3AED]/25 hover:border-[#7C3AED]/50'
                  : 'bg-[#DBD3FB]/30 border-[#7C3AED]/15 text-[#7C3AED] hover:bg-[#DBD3FB]/60 hover:border-[#7C3AED]/30'
                : isDarkMode
                  ? 'bg-[#252429]/40 border-white/5 text-[#D8D7D9] hover:bg-[#252429]/80 hover:border-white/15'
                  : 'bg-white/50 border-black/5 text-[#111113] hover:bg-white hover:border-black/10'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              accent
                ? isDarkMode ? 'bg-[#7C3AED]/20' : 'bg-[#7C3AED]/10'
                : isDarkMode ? 'bg-white/5' : 'bg-black/5'
            }`}>
              <Icon size={16} />
            </div>
            <span className="text-sm font-bold">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}
