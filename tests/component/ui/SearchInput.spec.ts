import { describe, it, expect } from 'vitest'
import SearchInput from '~/components/ui/SearchInput.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { useThemeStore } from '~/stores/theme'

describe('SearchInput', () => {
  it('renderiza input + ícono Search', () => {
    const w = mountComponent(SearchInput)
    expect(w.find('input').exists()).toBe(true)
    expect(w.find('svg').exists()).toBe(true)
  })

  it('v-model bidireccional: modelValue → input.value', () => {
    const w = mountComponent(SearchInput, { props: { modelValue: 'query' } })
    expect(w.find('input').element.value).toBe('query')
  })

  it('@input emite update:modelValue', async () => {
    const w = mountComponent(SearchInput)
    await w.find('input').setValue('hola')
    expect(w.emitted('update:modelValue')![0]).toEqual(['hola'])
  })

  it('placeholder custom se aplica', () => {
    const w = mountComponent(SearchInput, { props: { placeholder: 'Buscar clientes…' } })
    expect(w.find('input').attributes('placeholder')).toBe('Buscar clientes…')
  })

  it('aria-label limpia el "..." del placeholder', () => {
    const w = mountComponent(SearchInput, { props: { placeholder: 'Buscar...' } })
    expect(w.find('input').attributes('aria-label')).toBe('Buscar')
  })

  it('wrapperClass override se aplica', () => {
    const w = mountComponent(SearchInput, { props: { wrapperClass: 'custom-class' } })
    expect(w.classes().join(' ')).toContain('custom-class')
  })

  it('dark mode: clases específicas', () => {
    const w = mountComponent(SearchInput, {
      setup: () => { useThemeStore().isDarkMode = true },
    })
    expect(w.classes().join(' ')).toMatch(/bg-\[#111113\]/)
  })
})
