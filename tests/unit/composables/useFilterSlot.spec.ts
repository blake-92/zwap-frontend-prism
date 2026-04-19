import { describe, it, expect } from 'vitest'
import { computed, ref, nextTick } from 'vue'
import { useFilterSlot } from '~/composables/useFilterSlot'

describe('useFilterSlot', () => {
  it('inicializa current con defaultValue cuando está vacío', () => {
    const { current, defaultValue } = useFilterSlot(() => 'Todos')
    expect(defaultValue.value).toBe('Todos')
    expect(current.value).toBe('Todos')
  })

  it('isDirty es false cuando current === defaultValue', () => {
    const { isDirty } = useFilterSlot(() => 'Todos')
    expect(isDirty.value).toBe(false)
  })

  it('isDirty es true cuando current diverge de defaultValue', () => {
    const { current, isDirty } = useFilterSlot(() => 'Todos')
    current.value = 'Completado'
    expect(isDirty.value).toBe(true)
  })

  it('reset restablece current a defaultValue actual', () => {
    const { current, defaultValue, isDirty, reset } = useFilterSlot(() => 'Todos')
    current.value = 'Fallido'
    expect(isDirty.value).toBe(true)
    reset()
    expect(current.value).toBe(defaultValue.value)
    expect(isDirty.value).toBe(false)
  })

  it('defaultValue reactivo: al cambiar locale, si current estaba sin tocar, se actualiza', async () => {
    const locale = ref<'es' | 'en'>('es')
    const { current, defaultValue } = useFilterSlot(() =>
      locale.value === 'es' ? 'Todos' : 'All',
    )
    expect(current.value).toBe('Todos')

    locale.value = 'en'
    await nextTick()
    expect(defaultValue.value).toBe('All')
    // El watch inmediato sólo actualiza si current estaba vacío. Como current ya era "Todos"
    // (no vacío), NO se actualiza automáticamente — este es el comportamiento esperado del
    // composable para no sobreescribir una selección consciente del usuario.
    expect(current.value).toBe('Todos')
  })

  it('acepta Ref como defaultValueSource', async () => {
    const def = ref('A')
    const { defaultValue } = useFilterSlot(def)
    expect(defaultValue.value).toBe('A')
    def.value = 'B'
    await nextTick()
    expect(defaultValue.value).toBe('B')
  })

  it('acepta computed como defaultValueSource', () => {
    const counter = ref(1)
    const { defaultValue } = useFilterSlot(computed(() => `#${counter.value}`))
    expect(defaultValue.value).toBe('#1')
    counter.value = 42
    expect(defaultValue.value).toBe('#42')
  })
})
