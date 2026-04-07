import { useTheme } from '@/shared/context/ThemeContext'

/**
 * TableToolbar — Prism UI
 *
 * Barra glass estándar de filtros y acciones sobre tablas.
 *
 * Props:
 *   children   node    — controles izquierdos (SearchInput, DropdownFilter, pills, etc.)
 *   actions    node?   — controles derechos (botón exportar, etc.)
 *   className  string? — clase extra sobre el wrapper
 */
export default function TableToolbar({ children, actions, className = '' }) {
  const { isDarkMode } = useTheme()

  return (
    <div className={`relative z-20 mb-6 p-2 rounded-2xl border flex justify-between items-center ${
      isDarkMode
        ? 'bg-[#252429]/20 backdrop-blur-xl border-white/10'
        : 'bg-white/40 backdrop-blur-xl border-white shadow-sm'
    } ${className}`}>
      <div className="flex items-center gap-2 flex-1">
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
