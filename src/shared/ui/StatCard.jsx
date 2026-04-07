import { useTheme } from '@/shared/context/ThemeContext'
import Card from './Card'
import Badge from './Badge'

/**
 * StatCard — Prism UI
 *
 * Tarjeta de KPI/métrica estándar. Soporta dos layouts:
 *
 *  'kpi'     — label e ícono arriba, valor grande, badge + sufijo abajo (dashboard)
 *  'balance' — ícono + badge arriba, label, valor grande (liquidaciones/wallet)
 *
 * Props:
 *   label        string        — título de la métrica
 *   value        string        — valor principal (ej. "$47,392")
 *   icon         LucideIcon    — componente de ícono
 *   iconVariant  string        — 'default'|'success'|'warning'|'danger'
 *   badge        string        — texto del badge
 *   badgeVariant string        — variante del Badge
 *   badgeSuffix  string?       — texto plano tras el badge (ej. "vs. ayer") — solo layout kpi
 *   negative     bool?         — valor en rojo (solo layout balance)
 *   layout       'kpi'|'balance' — Default: 'kpi'
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  iconVariant = 'default',
  badge,
  badgeVariant,
  badgeSuffix,
  negative = false,
  layout = 'kpi',
}) {
  const { isDarkMode } = useTheme()

  const iconColors = {
    default: isDarkMode
      ? 'bg-[#7C3AED]/15 text-[#7C3AED] group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]'
      : 'bg-[#DBD3FB]/60 text-[#561BAF] group-hover:shadow-md',
    success: isDarkMode
      ? 'bg-emerald-500/15 text-emerald-500 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
      : 'bg-emerald-100 text-emerald-600 group-hover:shadow-md',
    warning: isDarkMode
      ? 'bg-amber-500/15 text-amber-500 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
      : 'bg-amber-100 text-amber-600 group-hover:shadow-md',
    danger: isDarkMode
      ? 'bg-rose-500/15 text-rose-500 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]'
      : 'bg-rose-100 text-rose-600 group-hover:shadow-md',
  }

  const iconBubble = (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${iconColors[iconVariant]}`}>
      <Icon size={20} />
    </div>
  )

  const badgeEl = badge && (
    <Badge variant={badgeVariant}>{badge}</Badge>
  )

  const valueEl = (
    <h3 className={`text-3xl font-mono font-bold tracking-tight ${
      negative
        ? isDarkMode ? 'text-rose-500' : 'text-rose-600'
        : isDarkMode ? 'text-white' : 'text-[#111113]'
    }`}>
      {value}
    </h3>
  )

  if (layout === 'balance') {
    return (
      <Card hoverEffect className="p-6 cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          {iconBubble}
          {badgeEl}
        </div>
        <p className={`text-sm font-semibold mb-1 transition-colors ${
          isDarkMode ? 'text-[#888991] group-hover:text-[#D8D7D9]' : 'text-[#67656E] group-hover:text-[#111113]'
        }`}>
          {label}
        </p>
        {valueEl}
      </Card>
    )
  }

  // layout === 'kpi' (default)
  return (
    <Card hoverEffect className="p-6 cursor-pointer group">
      <div className="flex justify-between items-start mb-6">
        <span className={`text-sm font-semibold transition-colors ${
          isDarkMode ? 'text-[#B0AFB4] group-hover:text-white' : 'text-[#67656E] group-hover:text-[#111113]'
        }`}>
          {label}
        </span>
        {iconBubble}
      </div>
      {valueEl}
      {(badge || badgeSuffix) && (
        <div className="mt-4 flex items-center gap-2">
          {badgeEl}
          {badgeSuffix && (
            <span className="text-xs font-medium text-[#888991]">{badgeSuffix}</span>
          )}
        </div>
      )}
    </Card>
  )
}
