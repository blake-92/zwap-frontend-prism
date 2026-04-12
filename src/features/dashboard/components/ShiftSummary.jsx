import { TrendingUp, ArrowRightLeft, LinkIcon, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, SectionLabel } from '@/shared/ui'
import { TODAY_SUMMARY } from '@/services/mocks/mockData'

export default function ShiftSummary() {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()

  return (
    <Card className="p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
        isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#DBD3FB]/50'
      }`} />

      <SectionLabel className="relative">{t('dashboard.todaySummary')}</SectionLabel>

      {/* Big number */}
      <div className="relative">
        <p className={`text-3xl font-mono font-bold tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
          {TODAY_SUMMARY.total}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
            <TrendingUp size={9} /> {t('dashboard.charges_other', { count: TODAY_SUMMARY.count })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className={`flex flex-col gap-2 pt-3 border-t relative ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            <LinkIcon size={12} className="opacity-70" /> {t('dashboard.mainChannel')}
          </span>
          <span className={`text-[11px] font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
            {TODAY_SUMMARY.mainChannel} ({TODAY_SUMMARY.mainChannelPct}%)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            <Clock size={12} className="opacity-70" /> {t('dashboard.lastCharge')}
          </span>
          <span className={`text-[11px] font-bold ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
            {TODAY_SUMMARY.lastChargeAgo}
          </span>
        </div>
      </div>
    </Card>
  )
}
