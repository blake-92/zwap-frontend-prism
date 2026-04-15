import { Hourglass, RefreshCw, Phone, Eye, LifeBuoy } from 'lucide-vue-next'

export const ACTIONS = {
  esperar: { text: 'text-[#888991]', chip: 'bg-[#888991]/10 border-[#888991]/15', tint: 'bg-[#888991]/8 border-[#888991]/20', Icon: Hourglass, labelKey: 'dashboard.actionEsperar', reasonKey: 'dashboard.reasonEsperar', priority: 5 },
  interes: { text: 'text-emerald-500', chip: 'bg-emerald-500/10 border-emerald-500/15', tint: 'bg-emerald-500/8 border-emerald-500/20', Icon: Eye, labelKey: 'dashboard.actionInteres', reasonKey: 'dashboard.reasonInteres', priority: 4 },
  reenviar: { text: 'text-amber-500', chip: 'bg-amber-500/10 border-amber-500/15', tint: 'bg-amber-500/8 border-amber-500/20', Icon: RefreshCw, labelKey: 'dashboard.actionReenviar', reasonKey: 'dashboard.reasonReenviar', priority: 3 },
  ayudar: { text: 'text-orange-500', chip: 'bg-orange-500/10 border-orange-500/15', tint: 'bg-orange-500/8 border-orange-500/20', Icon: LifeBuoy, labelKey: 'dashboard.actionAyudar', reasonKey: 'dashboard.reasonAyudar', priority: 2 },
  llamar: { text: 'text-rose-500', chip: 'bg-rose-500/10 border-rose-500/15', tint: 'bg-rose-500/8 border-rose-500/20', Icon: Phone, labelKey: 'dashboard.actionLlamar', reasonKey: 'dashboard.reasonLlamar', priority: 1 },
}

export function formatTimeRemaining(mins, t) {
  if (mins == null) return '—'
  if (mins < 60) return `${mins}${t('dashboard.minuteShort')}`
  if (mins < 1440) return `${Math.floor(mins / 60)}${t('dashboard.hourShort')}`
  return `${Math.floor(mins / 1440)}${t('dashboard.dayShort')}`
}
