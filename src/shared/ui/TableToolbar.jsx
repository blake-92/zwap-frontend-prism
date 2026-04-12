import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import Button from './Button'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

/**
 * TableToolbar — Prism UI
 *
 * Barra glass estándar de filtros y acciones sobre tablas.
 *
 * Desktop (≥ lg): fila con search + filtros + acciones.
 * Mobile  (< lg): fila compacta de íconos. Al tocar búsqueda, se expande
 *                  con spring tomando todo el ancho; los filtros se ocultan.
 *
 * Props:
 *   search     node?   — SearchInput element (rendered expandable on mobile)
 *   children   node?   — filtros (DropdownFilter, SegmentControl, etc.)
 *   actions    node?   — controles derechos (botón exportar, etc.)
 *   className  string? — clase extra sobre el wrapper
 */
export default function TableToolbar({ search, children, actions, className = '' }) {
  const { isDarkMode } = useTheme()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [searchExpanded, setSearchExpanded] = useState(false)
  const inputContainerRef = useRef(null)

  // Auto-focus the search input when expanded on mobile
  useEffect(() => {
    if (searchExpanded && inputContainerRef.current) {
      const input = inputContainerRef.current.querySelector('input')
      if (input) input.focus()
    }
  }, [searchExpanded])

  const glassClasses = isDarkMode
    ? 'bg-[#252429]/20 backdrop-blur-xl border-white/10'
    : 'bg-white/40 backdrop-blur-xl border-white shadow-sm'

  /* ── Desktop: layout original ── */
  if (isDesktop) {
    return (
      <div className={`relative z-20 mb-6 p-2 rounded-2xl border flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${glassClasses} ${className}`}>
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

  /* ── Mobile: compact icon row with expandable search ── */
  return (
    <div className={`relative z-20 mb-6 p-2 rounded-2xl border ${glassClasses} ${className}`}>
      <div className="flex items-center gap-2 min-h-[40px]">
        <AnimatePresence mode="wait" initial={false}>
          {searchExpanded ? (
            /* ── Expanded search ── */
            <motion.div
              key="search-expanded"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              transition={SPRING}
              className="flex items-center gap-2 w-full overflow-hidden"
              ref={inputContainerRef}
            >
              <div className="flex-1 min-w-0">
                {search}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchExpanded(false)}
                className="flex-shrink-0 !w-10 !h-10"
              >
                <X size={18} />
              </Button>
            </motion.div>
          ) : (
            /* ── Compact icon row ── */
            <motion.div
              key="search-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 w-full"
            >
              {/* Search icon trigger */}
              {search && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSearchExpanded(true)}
                  className="!w-10 !h-10 !p-0 flex items-center justify-center flex-shrink-0"
                >
                  <Search size={18} className="opacity-70" />
                </Button>
              )}

              {/* Filter icons */}
              {children && (
                <div className="flex items-center gap-2">
                  {children}
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Actions (export, etc.) */}
              {actions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {actions}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
