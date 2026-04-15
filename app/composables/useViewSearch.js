import { watch, onUnmounted, toValue } from 'vue'
import { useViewSearchStore } from '~/stores/viewSearch'

/**
 * useViewSearch — hook para vistas.
 * Registra el placeholder de búsqueda al montar; al desmontar limpia.
 * Acepta string o ref reactiva.
 */
export function useViewSearch(placeholder) {
  const store = useViewSearchStore()

  watch(
    () => toValue(placeholder),
    (ph) => store.registerView(ph),
    { immediate: true },
  )

  onUnmounted(() => store.unregisterView())

  return store
}

export function useHeaderSearch() {
  return useViewSearchStore()
}
