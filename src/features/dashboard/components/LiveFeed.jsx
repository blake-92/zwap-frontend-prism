import { motion } from 'framer-motion'
import { ArrowRight, Clock, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, CardHeader } from '@/shared/ui'
import { TRANSACTIONS } from '@/services/mocks/mockData'
import { listVariants, itemVariants } from '@/shared/utils/motionVariants'

/* ── Status-icon colour by variant ── */
const STATUS_ICON_CLR = {
  success: 'text-emerald-500',
  danger:  'text-rose-500',
  warning: 'text-amber-500',
}

/* ── Simplified card-brand avatar ── */
function CardBrandAvatar({ brand }) {
  if (brand === 'Mastercard') {
    return (
      <div className="w-7 h-7 rounded-full bg-[#1A1A2E] flex items-center justify-center flex-shrink-0 relative overflow-hidden">
        <div className="absolute w-3 h-3 rounded-full bg-[#EB001B] left-[4px] top-1/2 -translate-y-1/2" />
        <div className="absolute w-3 h-3 rounded-full bg-[#F79E1B] right-[4px] top-1/2 -translate-y-1/2 opacity-90" />
      </div>
    )
  }
  if (brand === 'Amex') {
    return (
      <div className="w-7 h-7 rounded-full bg-[#006FCF] flex items-center justify-center flex-shrink-0">
        <span className="text-white font-black text-[7px] tracking-tight leading-none">AX</span>
      </div>
    )
  }
  if (brand === 'Visa') {
    return (
      <div className="w-7 h-7 rounded-full bg-[#1A1F71] flex items-center justify-center flex-shrink-0">
        <span className="text-white font-black text-[10px] italic leading-none">V</span>
      </div>
    )
  }
  /* fallback */
  return (
    <div className="w-7 h-7 rounded-full bg-gray-500/60 flex items-center justify-center flex-shrink-0">
      <CreditCard size={12} className="text-white/80" />
    </div>
  )
}

export default function LiveFeed({ onViewAll }) {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()

  return (
    <Card className="lg:col-span-2 pb-2 flex flex-col">
      <CardHeader
        title={
          <>
            <motion.span
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [1, 0.2, 1, 0.2, 1] }}
              transition={{ duration: 2, times: [0, 0.2, 0.4, 0.6, 1], repeat: Infinity, repeatDelay: 1 }}
              className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block"
            />
            {t('dashboard.liveFeed')}
          </>
        }
        description={t('dashboard.liveFeedDesc')}
        className="p-6 pb-5"
      >
        <Button variant="ghost" size="sm" onClick={onViewAll} className="!text-[#7C3AED] !h-8 !px-2">
          {t('dashboard.viewAll')} <ArrowRight size={14} className="ml-1" />
        </Button>
      </CardHeader>

      {/* ── Table (desktop) ── */}
      <div className="overflow-x-auto flex-1 hidden lg:block">
        <table aria-label={t('dashboard.liveFeed')} className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className={`text-[10px] uppercase font-bold tracking-widest ${
              isDarkMode ? 'text-[#888991] bg-[#111113]/20' : 'text-[#67656E] bg-white/20'
            }`}>
              <th className="px-6 py-3">{t('dashboard.tableTime')}</th>
              <th className="px-4 py-3">{t('dashboard.tableOrigin')}</th>
              <th className="px-4 py-3">{t('dashboard.tableChannel')}</th>
              <th className="px-4 py-3 text-center">{t('dashboard.tableStatus')}</th>
              <th className="px-6 py-3 text-right">{t('dashboard.tableAmount')}</th>
            </tr>
          </thead>
          <motion.tbody variants={listVariants} initial="hidden" animate="show">
            {TRANSACTIONS.slice(0, 4).map((trx) => (
              <motion.tr
                key={trx.id}
                variants={itemVariants}
                className={`group transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                    : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                }`}
              >
                {/* Time */}
                <td className="px-6 py-3">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                    {trx.time}
                  </span>
                </td>

                {/* Origin — card brand avatar + name + card info */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CardBrandAvatar brand={trx.card} />
                    <div>
                      <span className={`font-bold text-xs block ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                        {trx.client ? trx.client.split(' ')[0] : t('dashboard.counter')}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                        <CreditCard size={10} className="opacity-70" />
                        <span className="font-mono tracking-widest opacity-70">••</span>
                        <span className="font-mono">{trx.last4}</span>
                      </span>
                    </div>
                  </div>
                </td>

                {/* Channel */}
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                    <trx.ChannelIcon size={12} className={isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'} />
                    {trx.channel.includes('POS') ? 'POS' : 'Link'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <Badge variant={trx.statusVariant} icon={trx.StatusIcon} className="!py-0.5 !px-2 !text-[9px]">
                    {trx.status}
                  </Badge>
                </td>

                {/* Amount */}
                <td className="px-6 py-3 text-right">
                  <span className={`font-mono font-bold text-sm tracking-tight ${
                    trx.status === 'Reembolsado'
                      ? 'text-rose-500 line-through opacity-70'
                      : isDarkMode ? 'text-white' : 'text-[#111113]'
                  }`}>
                    ${trx.amount}
                  </span>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* ── Cards (mobile / tablet) ── */}
      <div className="lg:hidden flex-1 px-4 pb-3">
        <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-1">
          {TRANSACTIONS.slice(0, 4).map((trx) => (
            <motion.div
              key={trx.id}
              variants={itemVariants}
              className={`grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 py-3 ${
                isDarkMode ? 'border-b border-white/5 last:border-0' : 'border-b border-black/5 last:border-0'
              }`}
            >
              {/* LEFT — avatar + name + card info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <CardBrandAvatar brand={trx.card} />
                <div className="min-w-0">
                  <p className={`font-bold text-xs truncate ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
                    {trx.client ? trx.client.split(' ')[0] : t('dashboard.counter')}
                  </p>
                  <span className={`flex items-center gap-1 text-[10px] font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                    <CreditCard size={10} className="opacity-70 flex-shrink-0" />
                    <span className="font-mono tracking-widest opacity-70">••</span>
                    <span className="font-mono">{trx.last4}</span>
                  </span>
                </div>
              </div>

              {/* MIDDLE — time + status/channel icons */}
              <div className="flex flex-col items-start gap-1 justify-self-center">
                <span className={`font-bold text-xs flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  <Clock size={12} className="opacity-70 flex-shrink-0" /> {trx.time}
                </span>
                <div className="flex items-center gap-1.5 ml-[16px]">
                  <trx.StatusIcon size={12} className={STATUS_ICON_CLR[trx.statusVariant] || 'text-gray-400'} />
                  <span className={`flex items-center opacity-70 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                    <trx.ChannelIcon size={12} />
                  </span>
                </div>
              </div>

              {/* RIGHT — amount */}
              <span className={`font-mono font-bold text-sm tracking-tight justify-self-end text-right ${
                trx.status === 'Reembolsado'
                  ? 'text-rose-500 line-through opacity-70'
                  : isDarkMode ? 'text-white' : 'text-[#111113]'
              }`}>
                ${trx.amount}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Card>
  )
}
