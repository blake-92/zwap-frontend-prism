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
export default function TableToolbar({ search, children, actions, className = '' }) {
  const { isDarkMode } = useTheme()

  return (
    <div className={`relative z-20 mb-6 p-2 rounded-2xl border flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${
      isDarkMode
        ? 'bg-[#252429]/20 backdrop-blur-xl border-white/10'
        : 'bg-white/40 backdrop-blur-xl border-white shadow-sm'
    } ${className}`}>
      {search && (
        <div className="w-full sm:flex-1">
          {search}
        </div>
      )}
      
      {(children || actions) && (
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
          {children && (
            <div className="flex items-center gap-2 flex-wrap">
              {children}
            </div>
          )}
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}
    </div>
  )
}
