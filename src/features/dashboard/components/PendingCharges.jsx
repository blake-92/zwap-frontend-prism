import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, QrCode, Mail, Timer, Eye, Clock, ListTree, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useToast } from '@/shared/context/ToastContext'
import { Card, Button, CardHeader, Tooltip } from '@/shared/ui'
import { listVariants, itemVariants } from '@/shared/utils/motionVariants'
import { CUSTOM_LINKS } from '@/services/mocks/mockData'
import { ROUTES } from '@/router/routes'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import TriageDetailModal, { ACTIONS, formatTimeRemaining } from './TriageDetailModal'

const MAX_ITEMS = 10
const MAX_ITEMS_MOBILE = 5

/* Umbrales del motor de decisión.
 * Cuando la clasificación la haga el backend, estos valores pueden desaparecer
 * del frontend — el API devolverá `action` pre-computada por link. */
const LIFE_EARLY_THRESHOLD = 0.30
const LIFE_LATE_THRESHOLD  = 0.70
const HIGH_FRICTION_VIEWS  = 5

/* ───────────── Motor de decisión ─────────────
 * Combina views × lifeElapsedPct para recomendar acción.
 * - 5+ vistas → AYUDAR (fricción domina, ignora tiempo)
 * - 0 vistas  → ESPERAR / REENVIAR / LLAMAR según vida consumida
 * - 1 vista   → ESPERAR (early/mid) / LLAMAR (late)
 * - 2-4 views → INTERÉS (early/mid) / AYUDAR (late sin conversión)
 */
function classifyAction(views, lifeElapsedPct) {
  const early = lifeElapsedPct < LIFE_EARLY_THRESHOLD
  const late  = lifeElapsedPct >= LIFE_LATE_THRESHOLD
  if (views >= HIGH_FRICTION_VIEWS) return 'ayudar'
  if (views === 0) {
    if (early) return 'esperar'
    if (late)  return 'llamar'
    return 'reenviar'
  }
  if (views === 1) return late ? 'llamar' : 'esperar'
  // 2-4 views
  return late ? 'ayudar' : 'interes'
}


/* ───────────── Widget ───────────── */
export default function PendingCharges() {
  const { t }          = useTranslation()
  const { isDarkMode } = useTheme()
  const { addToast }   = useToast()
  const navigate       = useNavigate()
  const isDesktop      = useMediaQuery('(min-width: 1024px)')
  const isMobile       = useMediaQuery('(max-width: 639px)')
  const [detail, setDetail] = useState(null)

  // Hasta MAX_ITEMS pendings, ordenados por urgencia de acción (y luego expiración).
  // TODO(api): reemplazar CUSTOM_LINKS por hook/query del backend.
  //   - Agregar la fuente de datos a las deps del useMemo.
  //   - Si el backend devuelve `action` pre-computada: eliminar el .map() de
  //     classifyAction y dejar solo el sort + slice.
  //   - Si el backend pagina: mover el slice al query param (limit=MAX_ITEMS).
  const links = useMemo(() => (
    CUSTOM_LINKS
      .filter((l) => l.status === 'Pendiente')
      .map((l) => {
        const total = (l.createdMinutesAgo ?? 0) + (l.expiresInMinutes ?? 0)
        const lifeElapsedPct = total > 0 ? (l.createdMinutesAgo ?? 0) / total : 0
        const action = classifyAction(l.views ?? 0, lifeElapsedPct)
        return { ...l, action }
      })
      .sort((a, b) => {
        const pa = ACTIONS[a.action].priority
        const pb = ACTIONS[b.action].priority
        if (pa !== pb) return pa - pb
        return (a.expiresInMinutes ?? Infinity) - (b.expiresInMinutes ?? Infinity)
      })
      .slice(0, MAX_ITEMS)
  ), [])

  const handleCopy = (link) => {
    navigator.clipboard.writeText(`https://zwap.me/pay/${link.id}`)
    const key = isMobile ? 'links.linkCopiedShort' : 'links.linkCopied'
    addToast(t(key, { name: link.client }), 'success')
  }

  if (!isDesktop) {
    const mobileLinks = links.slice(0, MAX_ITEMS_MOBILE)
    return (
      <>
        <Card className="p-0 overflow-hidden">
          {/* Header compacto (siguiendo patrón QuickLinkCard mobile) */}
          <div className={`px-4 pt-3.5 pb-3 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={14} className="text-amber-500 flex-shrink-0" />
              <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                {t('dashboard.pendingLinks')}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="!text-[#7C3AED] !h-7 !px-2 !text-[11px]" onClick={() => navigate(ROUTES.LINKS)}>
              {t('dashboard.viewAllShort')}
            </Button>
          </div>

          {/* Ticker */}
          <motion.div variants={listVariants} initial="hidden" animate="show">
            {mobileLinks.map((link, i) => {
              const cfg = ACTIONS[link.action]
              return (
                <motion.button
                  key={link.id}
                  variants={itemVariants}
                  onClick={() => setDetail(link)}
                  aria-label={`${link.client} — $${link.amount} — ${t(ACTIONS[link.action].labelKey)}`}
                  className={`w-full flex items-stretch gap-3 px-4 py-2.5 text-left cursor-pointer active:opacity-70 transition-opacity ${
                    i < mobileLinks.length - 1
                      ? isDarkMode ? 'border-b border-white/5' : 'border-b border-black/5'
                      : ''
                  }`}
                >
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                    {/* Línea 1: cliente + monto */}
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        {link.client}
                      </p>
                      <span className={`font-mono font-bold text-[15px] tracking-tight flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                        ${link.amount}
                      </span>
                    </div>

                    {/* Línea 2: stat chips (vistas + tiempo) */}
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${cfg.chip} ${cfg.text}`}>
                        <Eye size={11} strokeWidth={2.5} />
                        <span className="font-mono">{link.views}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${cfg.chip} ${cfg.text}`}>
                        <Timer size={11} strokeWidth={2.5} />
                        <span className="font-mono">{formatTimeRemaining(link.expiresInMinutes, t)}</span>
                      </span>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        </Card>

        <AnimatePresence>
          {detail && (
            <TriageDetailModal
              link={detail}
              onClose={() => setDetail(null)}
              onCopy={handleCopy}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <Card className="p-0 flex flex-col">
      <CardHeader
        title={<><Clock size={18} className="text-amber-500" /> {t('dashboard.pendingLinks')}</>}
        description={t('dashboard.pendingLinksDesc')}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LINKS)}>
          {t('dashboard.viewAllShort')}
        </Button>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[820px]" aria-label={t('dashboard.pendingLinks')}>
          <thead>
            <tr className={`text-[10px] uppercase font-bold tracking-widest ${
              isDarkMode
                ? 'text-[#888991] border-b border-white/10 bg-[#111113]/40'
                : 'text-[#67656E] border-b border-black/5 bg-white/50'
            }`}>
              <th className="px-6 py-3">{t('transactions.tableClient')}</th>
              <th className="px-6 py-3">{t('settlements.tableDetail')}</th>
              <th className="px-4 py-3 text-center">{t('dashboard.views')}</th>
              <th className="px-6 py-3">{t('dashboard.expiresIn')}</th>
              <th className="px-4 py-3 text-center">{t('dashboard.recommendation')}</th>
              <th className="px-6 py-3 text-right">{t('transactions.tableActions')}</th>
            </tr>
          </thead>
          <motion.tbody variants={listVariants} initial="hidden" animate="show">
            {links.map((link) => {
              const cfg = ACTIONS[link.action]
              return (
                <motion.tr
                  key={link.id}
                  variants={itemVariants}
                  className={`group transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-b border-white/5 hover:bg-[#7C3AED]/5 last:border-0'
                      : 'border-b border-black/5 hover:bg-[#DBD3FB]/20 last:border-0'
                  }`}
                >
                  {/* Cliente */}
                  <td className="px-6 py-3.5">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                      {link.client}
                    </p>
                    <p className={`text-xs font-medium mt-0.5 truncate max-w-[200px] ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      {link.email}
                    </p>
                  </td>

                  {/* Detalle */}
                  <td className="px-6 py-3.5">
                    <p className={`font-mono font-bold text-[15px] tracking-tight ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                      ${link.amount}
                    </p>
                    <p className={`text-[11px] font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <ListTree size={12} className="opacity-70" /> {link.items} {t('dashboard.items')}
                    </p>
                  </td>

                  {/* Vistas */}
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      <span className={`font-mono font-bold text-2xl leading-none tracking-tight ${cfg.text}`}>
                        {link.views}
                      </span>
                    </div>
                  </td>

                  {/* Tiempos */}
                  <td className="px-6 py-3.5">
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${
                      (link.expiresInMinutes ?? Infinity) < 60
                        ? 'text-rose-500'
                        : (link.expiresInMinutes ?? Infinity) < 180
                          ? 'text-amber-500'
                          : isDarkMode ? 'text-[#D8D7D9]' : 'text-[#45434A]'
                    }`}>
                      <Timer size={14} className="opacity-70" />
                      {t('links.expires', { date: link.expires })}
                    </p>
                    <p className={`text-[10px] font-medium flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                      <CalendarDays size={12} className="opacity-70" /> {t('links.created', { date: link.createdAt })}
                    </p>
                  </td>

                  {/* Recomendación — icono + verbo */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col items-center gap-1">
                      <cfg.Icon size={18} className={cfg.text} strokeWidth={2.25} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                        {t(cfg.labelKey)}
                      </span>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content={t('links.copyLink')} position="top">
                        <Button variant="ghost" size="sm" className="!px-2" onClick={() => handleCopy(link)}>
                          <Copy size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('links.generateQr')} position="top">
                        <Button variant="ghost" size="sm" className="!px-2">
                          <QrCode size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content={t('users.sendByEmail')} position="top">
                        <Button variant="action" size="sm" className="!px-3 ml-1">
                          <Mail size={15} />
                          <span className="hidden xl:inline text-xs ml-1">{t('links.send')}</span>
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
      </div>
    </Card>
  )
}

