import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Copy, Send, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, Badge, Avatar, CardHeader } from '@/shared/ui'
import { listVariants, cardItemVariants } from '@/shared/utils/motionVariants'
import { PENDING_CHARGES } from '@/services/mocks/mockData'
import { ROUTES } from '@/router/routes'

export default function PendingCharges() {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()
  const { addToast }   = useToast()
  const navigate       = useNavigate()

  const handleCopy = (charge) => {
    navigator.clipboard.writeText(charge.url)
    const key = window.innerWidth < 640 ? 'dashboard.linkCopiedShort' : 'dashboard.linkCopied'
    addToast(t(key, { client: charge.client }), 'success')
  }

  const handleResend = (charge) => {
    addToast(t('dashboard.linkResent', { email: charge.email }), 'success')
  }

  return (
    <Card className="lg:col-span-2 p-0 flex flex-col">
      <CardHeader
        title={<><Clock size={18} className="text-amber-500" /> {t('dashboard.pendingCharges')}</>}
        description={t('dashboard.pendingChargesDesc')}
      >
        <div className="flex items-center gap-2">
          <Badge variant="warning">{PENDING_CHARGES.length}</Badge>
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LINKS)}>
            {t('dashboard.viewAllShort')}
          </Button>
        </div>
      </CardHeader>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto p-2 space-y-1"
      >
        {PENDING_CHARGES.map((charge) => (
          <motion.div
            key={charge.id}
            variants={cardItemVariants}
            className={`group p-4 m-1 rounded-xl border transition-all duration-300 hover:shadow-md ${
              isDarkMode
                ? 'bg-[#252429]/40 border-white/5 hover:bg-[#252429]/80 hover:border-amber-500/20'
                : 'bg-white/50 border-black/5 hover:bg-white hover:border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar initials={charge.initials} size="sm" variant="purple" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                    {charge.client}
                  </p>
                  <span className={`font-mono font-bold text-sm flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                    ${charge.amount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className={`text-[11px] font-medium truncate ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                    {charge.email}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      <Clock size={10} /> {charge.expires}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => handleCopy(charge)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-white/10 text-[#888991] hover:text-white' : 'hover:bg-black/5 text-[#67656E] hover:text-[#111113]'
                  }`}
                  title={t('dashboard.copyLink')}
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => handleResend(charge)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-[#7C3AED]/20 text-[#888991] hover:text-[#A78BFA]' : 'hover:bg-[#DBD3FB]/40 text-[#67656E] hover:text-[#7C3AED]'
                  }`}
                  title={t('dashboard.resendLink')}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Card>
  )
}
