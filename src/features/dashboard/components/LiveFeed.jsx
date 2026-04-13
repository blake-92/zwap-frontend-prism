import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, CardHeader } from '@/shared/ui'
import { TRANSACTIONS } from '@/services/mocks/mockData'
import { listVariants, itemVariants } from '@/shared/utils/motionVariants'
import { ReceiptModal } from '@/features/transactions'

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
  const [receiptTrx, setReceiptTrx] = useState(null)

  return (
    <>
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

      {/* ── Ticker Feed (mobile / tablet) ── */}
      <div className="lg:hidden flex-1 px-4 pb-2 pt-1">
        <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-0.5">
          {TRANSACTIONS.slice(0, 4).map((trx, i) => (
            <motion.div
              key={trx.id}
              variants={itemVariants}
              onClick={() => setReceiptTrx(trx)}
              className={`flex items-center gap-2.5 py-2 cursor-pointer active:opacity-70 transition-opacity ${
                i < 3
                  ? isDarkMode ? 'border-b border-white/5' : 'border-b border-black/5'
                  : ''
              }`}
            >
              {/* Avatar with status ring */}
              <div className={`relative flex-shrink-0 rounded-full p-[2px] ${
                trx.statusVariant === 'success'
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                  : trx.statusVariant === 'danger'
                    ? 'bg-gradient-to-br from-rose-400 to-rose-600'
                    : 'bg-gradient-to-br from-amber-400 to-amber-600'
              }`}>
                <div className={`rounded-full p-[1.5px] ${isDarkMode ? 'bg-[#252429]' : 'bg-white'}`}>
                  <CardBrandAvatar brand={trx.card} />
                </div>
              </div>

              {/* Name · time · channel */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 text-[11px]">
                <span className={`font-bold truncate ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
                  {trx.client ? trx.client.split(' ')[0] : t('dashboard.counter')}
                </span>
                <span className={`opacity-30 ${isDarkMode ? 'text-white' : 'text-black'}`}>·</span>
                <span className={`text-[10px] flex-shrink-0 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  {trx.time}
                </span>
                <span className={`opacity-30 ${isDarkMode ? 'text-white' : 'text-black'}`}>·</span>
                <trx.ChannelIcon size={10} className={`flex-shrink-0 ${isDarkMode ? 'text-[#7C3AED] opacity-70' : 'text-[#561BAF] opacity-60'}`} />
              </div>

              {/* Amount */}
              <span className={`font-mono font-bold text-[13px] tracking-tight flex-shrink-0 ${
                trx.statusVariant === 'danger'
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

    <AnimatePresence>
      {receiptTrx && <ReceiptModal trx={receiptTrx} onClose={() => setReceiptTrx(null)} />}
    </AnimatePresence>
    </>
  )
}
