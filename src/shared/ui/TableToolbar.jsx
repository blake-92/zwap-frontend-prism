import { useState, useEffect, useCallback, Children, isValidElement, cloneElement } from 'react'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { useHeaderSearch } from '@/shared/context/ViewSearchContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import Button from './Button'
import BottomSheet from './BottomSheet'

/**
 * TableToolbar — Prism UI
 *
 * Desktop (≥ lg): barra glass con filtros + acciones.
 * Mobile  (< lg): invisible en el DOM de la vista. Registra un callback
 *                  en ViewSearchContext para que el Header pueda abrir el
 *                  BottomSheet de filtros. La búsqueda vive en el Header.
 *
 * Props:
 *   children   node?      — filtros (DropdownFilter, SegmentControl, etc.)
 *   actions    node?      — controles derechos (botón exportar, etc.)
 *   onReset    function?  — callback para limpiar todos los filtros
 *   className  string?    — clase extra sobre el wrapper
 */
export default function TableToolbar({ children, actions, onReset, className = '' }) {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { setFilterOpener } = useHeaderSearch()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [sheetOpen, setSheetOpen] = useState(false)

  const hasFiltersOrActions = !!(children || actions)

  // Register filter opener callback with ViewSearchContext
  const openSheet = useCallback(() => setSheetOpen(true), [])

  useEffect(() => {
    if (!isDesktop && hasFiltersOrActions) {
      setFilterOpener(openSheet)
      return () => setFilterOpener(null)
    }
  }, [isDesktop, hasFiltersOrActions, setFilterOpener, openSheet])

  const glassClasses = isDarkMode
    ? 'bg-[#252429]/20 backdrop-blur-xl border-white/10'
    : 'bg-white/40 backdrop-blur-xl border-white shadow-sm'

  const handleReset = () => {
    onReset?.()
    setSheetOpen(false)
  }

  /* ── Desktop: layout original ── */
  if (isDesktop) {
    if (!children && !actions) return null

    return (
      <div className={`relative z-20 mb-6 p-2 rounded-2xl border flex items-center justify-between gap-2 ${glassClasses} ${className}`}>
        {(children || onReset) && (
          <div className="flex items-center gap-2 flex-wrap">
            {children}
            {onReset && (
              <button
                onClick={onReset}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isDarkMode
                    ? 'text-[#888991] hover:text-[#D8D7D9] hover:bg-white/5'
                    : 'text-[#67656E] hover:text-[#111113] hover:bg-black/5'
                }`}
              >
                <RotateCcw size={12} />
                {t('filters.clearFilters')}
              </button>
            )}
          </div>
        )}
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    )
  }

  /* ── Mobile: only BottomSheet (trigger is in Header via context) ── */
  if (!hasFiltersOrActions) return null

  // Clone DropdownFilter children with sheetMode prop for full-width rendering
  const sheetChildren = Children.map(children, child => {
    if (isValidElement(child) && child.type?.displayName === 'DropdownFilter') {
      return cloneElement(child, { sheetMode: true })
    }
    return child
  })

  return (
    <BottomSheet
      isOpen={sheetOpen}
      onClose={() => setSheetOpen(false)}
      title={t('filters.filtersTitle')}
    >
      <div className="px-5 pb-6 space-y-3">
        {sheetChildren}

        {onReset && (
          <button
            onClick={handleReset}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
              isDarkMode
                ? 'text-[#888991] hover:text-[#D8D7D9] hover:bg-white/5 border border-white/10'
                : 'text-[#67656E] hover:text-[#111113] hover:bg-black/5 border border-gray-200'
            }`}
          >
            <RotateCcw size={14} />
            {t('filters.clearFilters')}
          </button>
        )}

        {actions && (
          <div className={`pt-3 mt-1 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
            <div className="flex flex-col gap-2">
              {actions}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
