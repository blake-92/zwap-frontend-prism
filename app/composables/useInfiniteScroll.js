import { ref, computed, watch, onMounted, onUnmounted, toValue } from 'vue'

/**
 * useInfiniteScroll — carga progresiva con IntersectionObserver.
 *
 * @param {Ref<Array>|Function|Array} data — array ya filtrado (reactivo)
 * @param {{ batchSize?: number, enabled?: Ref<boolean>|boolean }} options
 * @returns {{ visibleData, hasMore, sentinelRef }}
 */
export function useInfiniteScroll(data, { batchSize = 10, enabled = true } = {}) {
  const visibleCount = ref(batchSize)
  const sentinelRef = ref(null)
  let observer = null

  const getData = () => toValue(data) || []
  const getEnabled = () => !!toValue(enabled)

  // Solo resetear cuando el dataset se reduce (filtro aplicado).
  // Growth (append/paginación) debe preservar la posición del usuario.
  watch(
    () => getData().length,
    (newLen, oldLen) => {
      if (oldLen === undefined) return
      if (newLen < oldLen) visibleCount.value = batchSize
    },
  )

  const setupObserver = () => {
    if (observer) { observer.disconnect(); observer = null }
    if (!getEnabled() || !sentinelRef.value || typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visibleCount.value = Math.min(visibleCount.value + batchSize, getData().length)
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinelRef.value)
  }

  // El observer solo depende de sentinel + enabled. Los cambios de length no requieren
  // re-instanciar: el callback lee getData() en vivo cuando dispara.
  onMounted(setupObserver)
  watch([sentinelRef, () => getEnabled()], setupObserver)
  onUnmounted(() => observer?.disconnect())

  const visibleData = computed(() =>
    getEnabled() ? getData().slice(0, visibleCount.value) : getData(),
  )
  const hasMore = computed(() => getEnabled() && visibleCount.value < getData().length)

  return { visibleData, hasMore, sentinelRef }
}
