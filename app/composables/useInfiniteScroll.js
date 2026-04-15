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

  watch(
    () => getData().length,
    () => { visibleCount.value = batchSize },
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

  onMounted(setupObserver)
  watch([sentinelRef, () => getEnabled(), () => getData().length], setupObserver)
  onUnmounted(() => observer?.disconnect())

  const visibleData = computed(() =>
    getEnabled() ? getData().slice(0, visibleCount.value) : getData(),
  )
  const hasMore = computed(() => getEnabled() && visibleCount.value < getData().length)

  return { visibleData, hasMore, sentinelRef }
}
