import { useState } from 'react'

/**
 * usePagination — hook reutilizable para paginar cualquier array.
 * Usado en: TransaccionesView, LiquidacionesView, WalletView.
 *
 * @param {Array}  items        Array ya filtrado a paginar
 * @param {number} itemsPerPage Elementos por página
 * @returns {{ currentPage, setCurrentPage, totalPages, paginated, resetPage }}
 */
export function usePagination(items, itemsPerPage) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const paginated  = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const resetPage = () => setCurrentPage(1)

  return { currentPage, setCurrentPage, totalPages, paginated, resetPage }
}
