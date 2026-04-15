import { AlertCircle, Info, AlertOctagon } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'

const VARIANTS = {
  warning: {
    icon: AlertCircle,
    onDark:  'bg-amber-500/10 border-amber-500/20 text-amber-200',
    onLight: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  info: {
    icon: Info,
    onDark:  'bg-blue-500/10 border-blue-500/20 text-blue-200',
    onLight: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  danger: {
    icon: AlertOctagon,
    onDark:  'bg-rose-500/10 border-rose-500/20 text-rose-200',
    onLight: 'bg-rose-50 border-rose-200 text-rose-800',
  },
}

/**
 * InfoBanner — Prism UI
 *
 * Banner de alerta con ícono y texto explicativo.
 *
 * Props:
 *   children    node      — mensaje a mostrar
 *   variant     string?   — 'warning' | 'info' | 'danger'. Default: 'warning'
 */
export default function InfoBanner({ children, variant = 'warning', className = '' }) {
  const { isDarkMode } = useTheme()
  const v = VARIANTS[variant] ?? VARIANTS.warning
  const Icon = v.icon

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${isDarkMode ? v.onDark : v.onLight} ${className}`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <p className="text-xs font-medium leading-relaxed">{children}</p>
    </div>
  )
}
