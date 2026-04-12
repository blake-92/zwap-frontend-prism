import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * useInfiniteScroll — hook para carga progresiva en mobile.
 *
 * Usa IntersectionObserver sobre un elemento "sentinel" para cargar más
 * items conforme el usuario scrollea. Diseñado para reemplazar Pagination
 * en viewports móviles.
 *
 * @param {Array}   data             — array completo de datos (ya filtrado)
 * @param {Object}  options
 * @param {number}  options.batchSize — items por lote (default 10)
 * @param {boolean} options.enabled   — activa/desactiva el hook (default true)
 *
 * @returns {{ visibleData: Array, hasMore: boolean, sentinelRef: React.RefObject }}
 */
export default function useInfiniteScroll(data, { batchSize = 10, enabled = true } = {}) {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const sentinelRef = useRef(null)

  // Reset visible count when filtered data changes or batch size changes
  useEffect(() => {
    setVisibleCount(batchSize)
  }, [data.length, batchSize])

  // IntersectionObserver: loads next batch when sentinel enters viewport
  useEffect(() => {
    if (!enabled) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + batchSize, data.length))
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [data.length, batchSize, enabled])

  const visibleData = enabled ? data.slice(0, visibleCount) : data
  const hasMore = enabled && visibleCount < data.length

  return { visibleData, hasMore, sentinelRef }
}
