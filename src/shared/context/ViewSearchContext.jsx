import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

/**
 * ViewSearchContext — Prism UI
 *
 * Contexto ligero que conecta la búsqueda del Header con la vista activa.
 * Cada vista registra su placeholder y callback de filtros al montar.
 *
 * Flujo:
 *   1. Vista monta → llama useViewSearch({ placeholder })
 *   2. TableToolbar llama setFilterOpener(fn) para registrar callback de filtros
 *   3. Header lee query, placeholder, hasFilters
 *   4. Usuario escribe en Header → query se actualiza → vista filtra
 *   5. Usuario toca filtros en Header → openFilters() → TableToolbar abre BottomSheet
 */
const ViewSearchContext = createContext(null)

export function ViewSearchProvider({ children }) {
  const [query, setQuery]             = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [hasFilters, setHasFilters]   = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const filterOpenerRef               = useRef(null)

  const registerView = useCallback((ph) => {
    setPlaceholder(ph || '')
    setQuery('')
  }, [])

  const unregisterView = useCallback(() => {
    setPlaceholder('')
    setQuery('')
    filterOpenerRef.current = null
    setHasFilters(false)
    setActiveFilterCount(0)
  }, [])

  const setFilterOpener = useCallback((fn) => {
    filterOpenerRef.current = fn
    setHasFilters(!!fn)
  }, [])

  const openFilters = useCallback(() => {
    filterOpenerRef.current?.()
  }, [])

  return (
    <ViewSearchContext.Provider value={{
      query, setQuery,
      placeholder, hasFilters, activeFilterCount, setActiveFilterCount,
      openFilters, registerView, unregisterView, setFilterOpener,
    }}>
      {children}
    </ViewSearchContext.Provider>
  )
}

/**
 * useViewSearch — hook para vistas
 *
 * Registra el placeholder de búsqueda al montar. Retorna { query, setQuery }.
 */
export function useViewSearch(placeholder) {
  const ctx = useContext(ViewSearchContext)
  if (!ctx) throw new Error('useViewSearch must be used within ViewSearchProvider')

  const { registerView, unregisterView, query, setQuery, setActiveFilterCount } = ctx

  useEffect(() => {
    registerView(placeholder)
    return unregisterView
  }, [placeholder, registerView, unregisterView])

  return { query, setQuery, setActiveFilterCount }
}

/**
 * useHeaderSearch — hook para Header / SearchPanel
 */
export function useHeaderSearch() {
  const ctx = useContext(ViewSearchContext)
  if (!ctx) throw new Error('useHeaderSearch must be used within ViewSearchProvider')
  return ctx
}
