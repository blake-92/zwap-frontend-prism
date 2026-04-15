import { Copy, QrCode, Mail, Timer, ListTree, CalendarDays, Clock, Hourglass, RefreshCw, Phone, Eye, LifeBuoy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, Modal, SectionLabel } from '@/shared/ui'

/* Mapa de configuración visual + i18n por acción de triage.
 * Exportado para que PendingCharges pueda acceder a chip/text colors
 * al renderizar las filas del widget. */
export const ACTIONS = {
  esperar: {
    text: 'text-[#888991]',
    chip: 'bg-[#888991]/10 border-[#888991]/15',
    tint: 'bg-[#888991]/8 border-[#888991]/20',
    Icon: Hourglass,
    labelKey:  'dashboard.actionEsperar',
    reasonKey: 'dashboard.reasonEsperar',
    priority: 5,
  },
  interes: {
    text: 'text-emerald-500',
    chip: 'bg-emerald-500/10 border-emerald-500/15',
    tint: 'bg-emerald-500/8 border-emerald-500/20',
    Icon: Eye,
    labelKey:  'dashboard.actionInteres',
    reasonKey: 'dashboard.reasonInteres',
    priority: 4,
  },
  reenviar: {
    text: 'text-amber-500',
    chip: 'bg-amber-500/10 border-amber-500/15',
    tint: 'bg-amber-500/8 border-amber-500/20',
    Icon: RefreshCw,
    labelKey:  'dashboard.actionReenviar',
    reasonKey: 'dashboard.reasonReenviar',
    priority: 3,
  },
  ayudar: {
    text: 'text-orange-500',
    chip: 'bg-orange-500/10 border-orange-500/15',
    tint: 'bg-orange-500/8 border-orange-500/20',
    Icon: LifeBuoy,
    labelKey:  'dashboard.actionAyudar',
    reasonKey: 'dashboard.reasonAyudar',
    priority: 2,
  },
  llamar: {
    text: 'text-rose-500',
    chip: 'bg-rose-500/10 border-rose-500/15',
    tint: 'bg-rose-500/8 border-rose-500/20',
    Icon: Phone,
    labelKey:  'dashboard.actionLlamar',
    reasonKey: 'dashboard.reasonLlamar',
    priority: 1,
  },
}

/* Formatea minutos a una etiqueta compacta: "10m", "2h", "1d" */
export function formatTimeRemaining(mins, t) {
  if (mins == null) return '—'
  if (mins < 60)    return `${mins}${t('dashboard.minuteShort')}`
  if (mins < 1440)  return `${Math.floor(mins / 60)}${t('dashboard.hourShort')}`
  return `${Math.floor(mins / 1440)}${t('dashboard.dayShort')}`
}

/* ───────────── Detail modal (mobile tap) ─────────────
 * Modal mínimo con el triage contextualizado: acción recomendada, razón (vistas × tiempo),
 * y acciones rápidas. El Modal de shared/ui ya hace bottom-sheet en mobile.
 */
export default function TriageDetailModal({ link, onClose, onCopy }) {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const cfg = ACTIONS[link.action]

  const footer = (
    <>
      <Button variant="outline" className="flex-1 !py-3.5" onClick={() => onCopy(link)}>
        <Copy size={16} /> {t('links.copyLink')}
      </Button>
      <Button className="flex-1 !py-3.5">
        <Mail size={16} /> {t('links.send')}
      </Button>
    </>
  )

  return (
    <Modal
      onClose={onClose}
      title={link.client}
      description={link.email}
      icon={<Clock size={22} className="text-amber-500" />}
      maxWidth="440px"
      footer={footer}
    >
      <div className="p-5 sm:p-8 space-y-5">

        {/* Recomendación — glass tint con color semántico (estilo Prism) */}
        <div className={`p-4 rounded-xl border ${cfg.tint}`}>
          <SectionLabel className="mb-2">{t('dashboard.recommendation')}</SectionLabel>
          <div className="flex items-start gap-3">
            <cfg.Icon size={22} className={`${cfg.text} flex-shrink-0 mt-0.5`} strokeWidth={2.25} />
            <div className="flex-1 min-w-0">
              <p className={`text-xl font-bold capitalize leading-none ${cfg.text}`}>
                {t(cfg.labelKey)}
              </p>
              <p className={`text-xs font-medium mt-1.5 ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'}`}>
                {t(cfg.reasonKey)}
              </p>
            </div>
          </div>
        </div>

        {/* Amount + items */}
        <div className="flex items-baseline justify-between">
          <span className={`font-mono font-bold text-3xl tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
            ${link.amount}
          </span>
          <span className={`flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
            <ListTree size={13} /> {link.items} {t('dashboard.items')}
          </span>
        </div>

        {/* Inputs del triage: vistas × tiempo */}
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#111113]/30 border-white/5' : 'bg-gray-50/50 border-black/5'}`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                <Eye size={11} /> {t('dashboard.views')}
              </p>
              <p className={`font-mono font-bold text-2xl leading-none ${cfg.text}`}>
                {link.views}
              </p>
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                <Timer size={11} /> {t('dashboard.expiresIn')}
              </p>
              <p className={`font-mono font-bold text-2xl leading-none ${
                (link.expiresInMinutes ?? Infinity) < 60 ? 'text-rose-500'
                  : (link.expiresInMinutes ?? Infinity) < 180 ? 'text-amber-500'
                  : isDarkMode ? 'text-white' : 'text-[#111113]'
              }`}>
                {formatTimeRemaining(link.expiresInMinutes, t)}
              </p>
            </div>
          </div>
        </div>

        {/* Fecha de creación */}
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          <CalendarDays size={13} /> {t('links.created', { date: link.createdAt })}
        </div>

        {/* Acciones extra */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 !py-2.5 justify-center">
            <QrCode size={15} /> {t('links.generateQr')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
