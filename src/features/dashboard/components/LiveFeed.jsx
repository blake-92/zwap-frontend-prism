import { motion } from 'framer-motion'
import { ArrowRight, User } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, CardHeader } from '@/shared/ui'
import { TRANSACTIONS } from '@/services/mocks/mockData'
import { listVariants, itemVariants } from '@/shared/utils/motionVariants'

export default function LiveFeed({ onViewAll }) {
  const { isDarkMode } = useTheme()

  return (
    <Card className="lg:col-span-2 pb-2 flex flex-col">
      <CardHeader
        title={
          <>
            <motion.span
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [1, 0.2, 1, 0.2, 1] }}
              transition={{ duration: 2, times: [0, 0.2, 0.4, 0.6, 1], ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block"
            />
            Feed en Vivo
          </>
        }
        description="Últimas operaciones procesadas"
        className="p-6 pb-5"
      >
        <Button variant="ghost" size="sm" onClick={onViewAll} className="!text-[#7C3AED] !h-8 !px-2">
          Ver Todas <ArrowRight size={14} className="ml-1" />
        </Button>
      </CardHeader>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className={`text-[10px] uppercase font-bold tracking-widest ${
              isDarkMode ? 'text-[#888991] bg-[#111113]/20' : 'text-[#67656E] bg-white/20'
            }`}>
              <th className="px-6 py-3">Tiempo</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Canal</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-right">Monto</th>
            </tr>
          </thead>
          <motion.tbody variants={listVariants} initial="hidden" animate="show">
            {TRANSACTIONS.slice(0, 4).map((trx, idx) => (
              <motion.tr
                key={idx}
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

                {/* Origin */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border border-black/5 flex-shrink-0">
                      {trx.countryCode === 'xx'
                        ? <User size={12} className="text-gray-400" />
                        : <img src={`https://flagcdn.com/w20/${trx.countryCode}.png`} alt={trx.country} className="w-full h-full object-cover" />
                      }
                    </div>
                    <span className={`font-bold text-xs ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                      {trx.client ? trx.client.split(' ')[0] : 'Mostrador'}
                    </span>
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
    </Card>
  )
}
