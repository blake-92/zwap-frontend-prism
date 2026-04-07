import { Bell, Timer, AlertOctagon, Landmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'
import { Card, Button, Badge, CardHeader } from '@/shared/ui'
import { listVariants, cardItemVariants } from '@/shared/utils/motionVariants'

const alerts = [
  {
    icon: Timer, iconColor: 'amber', title: 'Link expira en 2 hrs',
    body: 'Reserva de Alice Smith ($350.00)',
    action: { label: 'Ver Link', variant: 'outline' },
  },
  {
    icon: AlertOctagon, iconColor: 'rose', title: 'Disputa Abierta',
    body: 'Pago de $150.00 reportado como fraude (Visa •••• 4242).',
    action: { label: 'Gestionar Evidencia', variant: 'danger' },
  },
  {
    icon: Landmark, iconColor: 'emerald', title: 'Depósito Confirmado',
    body: 'Liquidación del 25 Mar ($2,526.00) acreditada en tu cuenta.',
    action: null,
  },
]

export default function AlertsPanel() {
  const { isDarkMode } = useTheme()

  const colorMap = {
    amber:   { bg: isDarkMode ? 'bg-amber-500/20 text-amber-400'     : 'bg-amber-100 text-amber-600',     border: isDarkMode ? 'hover:border-amber-500/30'   : 'hover:border-amber-200' },
    rose:    { bg: isDarkMode ? 'bg-rose-500/20 text-rose-400'       : 'bg-rose-100 text-rose-600',       border: isDarkMode ? 'hover:border-rose-500/30'     : 'hover:border-rose-200' },
    emerald: { bg: isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600', border: isDarkMode ? 'hover:border-emerald-500/30' : 'hover:border-emerald-200' },
  }

  return (
    <Card className="lg:col-span-1 p-0 flex flex-col">
      <CardHeader
        title={<><Bell size={18} className="text-amber-500 animate-pulse" /> Requiere Atención</>}
        description="Alertas de tu operativa hoy"
      >
        <Badge variant="warning">{alerts.length}</Badge>
      </CardHeader>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto p-2 space-y-1"
      >
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            variants={cardItemVariants}
            className={`group p-4 m-1 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
              isDarkMode
                ? `bg-[#252429]/40 border-white/5 hover:bg-[#252429]/80 ${colorMap[alert.iconColor].border}`
                : `bg-white/50 border-black/5 hover:bg-white ${colorMap[alert.iconColor].border}`
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${colorMap[alert.iconColor].bg}`}>
                <alert.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113]'}`}>
                  {alert.title}
                </h4>
                <p className={`text-xs mt-0.5 font-medium leading-relaxed ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                  {alert.body}
                </p>
                {alert.action && (
                  <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button variant={alert.action.variant} size="sm" className="!py-1 !h-7 !text-[10px] w-full">
                      {alert.action.label}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Card>
  )
}
