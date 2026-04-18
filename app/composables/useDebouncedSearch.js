import { ref, watch, onUnmounted } from 'vue'
import { usePerformanceStore } from '~/stores/performance'

/**
 * Ref espejo del sourceGetter con debounce activado solo en Lite.
 * En Prism/Normal responde instantáneamente. `onInput` dispara cada keystroke (útil para reset de página).
 */
export function useDebouncedSearch(sourceGetter, options = {}) {
  const { liteDelay = 250, onInput } = options
  const perfStore = usePerformanceStore()
  const debounced = ref(sourceGetter())
  let timeout = null

  watch(sourceGetter, (newVal) => {
    if (onInput) onInput(newVal)
    if (timeout) { clearTimeout(timeout); timeout = null }
    if (perfStore.isLite) {
      timeout = setTimeout(() => { debounced.value = newVal; timeout = null }, liteDelay)
    } else {
      debounced.value = newVal
    }
  })

  onUnmounted(() => { if (timeout) clearTimeout(timeout) })

  return debounced
}
