import { ref, computed, watch, unref } from 'vue'

/**
 * Encapsula el patrón repetido en vistas con tablas filtradas:
 *   defaultX (computed i18n) → filterX (ref) → watch(immediate) → isDirty → reset
 *
 * Retorna refs/computeds para que el caller pueda destructurar con nombres propios
 * y el template auto-unwrap funcione sin `.value` anidados.
 *
 * @param {Function|import('vue').Ref|import('vue').ComputedRef} defaultValueSource
 */
export function useFilterSlot(defaultValueSource) {
  const defaultValue = computed(() =>
    typeof defaultValueSource === 'function' ? defaultValueSource() : unref(defaultValueSource),
  )
  const current = ref('')
  watch(defaultValue, (v) => { if (!current.value) current.value = v }, { immediate: true })
  const isDirty = computed(() => current.value !== defaultValue.value)
  const reset = () => { current.value = defaultValue.value }
  return { current, defaultValue, isDirty, reset }
}
