import { describe, it, expect } from 'vitest'
import { Search } from 'lucide-vue-next'
import Input from '~/components/ui/Input.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

describe('Input', () => {
  it('renderiza <input> con v-model', async () => {
    const w = mountComponent(Input, { props: { modelValue: 'hola' } })
    const input = w.find('input')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('hola')
  })

  it('@input emite update:modelValue', async () => {
    const w = mountComponent(Input, { props: { modelValue: '' } })
    await w.find('input').setValue('x')
    expect(w.emitted('update:modelValue')).toBeTruthy()
    expect(w.emitted('update:modelValue')![0]).toEqual(['x'])
  })

  it('icon prop renderiza ícono a la izquierda + padding pl-11', () => {
    const w = mountComponent(Input, { props: { icon: Search } })
    expect(w.find('svg').exists()).toBe(true)
    const inputCls = w.find('input').classes().join(' ')
    expect(inputCls).toContain('pl-11')
  })

  it('prefix prop renderiza texto + padding pl-8', () => {
    const w = mountComponent(Input, { props: { prefix: '$' } })
    expect(w.text()).toContain('$')
    const inputCls = w.find('input').classes().join(' ')
    expect(inputCls).toContain('pl-8')
  })

  it('error=true aplica clases rose + sin focus ring brand', () => {
    const w = mountComponent(Input, { props: { error: true, modelValue: '' } })
    const cls = w.find('input').classes().join(' ')
    expect(cls).toMatch(/rose/)
  })

  it('Lite tier light: bg lavanda tenue + border brand', () => {
    const w = mountComponent(Input, {
      props: { modelValue: '' },
      setup: () => {
        usePerformanceStore().tier = 'lite'
        useThemeStore().isDarkMode = false
      },
    })
    const cls = w.find('input').classes().join(' ')
    expect(cls).toMatch(/bg-\[#F8F7FB\]/)
    expect(cls).toMatch(/border-\[#DBD3FB\]/)
  })

  it('Lite tier dark: bg layered', () => {
    const w = mountComponent(Input, {
      props: { modelValue: '' },
      setup: () => {
        usePerformanceStore().tier = 'lite'
        useThemeStore().isDarkMode = true
      },
    })
    const cls = w.find('input').classes().join(' ')
    expect(cls).toMatch(/bg-\[#0F0F11\]/)
  })

  it('Prism dark: focus:shadow neon morado (R1 #2 guard)', () => {
    const w = mountComponent(Input, {
      props: { modelValue: '' },
      setup: () => {
        usePerformanceStore().tier = 'full'
        useThemeStore().isDarkMode = true
      },
    })
    const cls = w.find('input').classes().join(' ')
    expect(cls).toMatch(/focus:shadow-\[0_0_15px_rgba\(124,58,237/)
  })

  it('Normal dark: sin focus:shadow neon (guard respetado)', () => {
    const w = mountComponent(Input, {
      props: { modelValue: '' },
      setup: () => {
        usePerformanceStore().tier = 'normal'
        useThemeStore().isDarkMode = true
      },
    })
    const cls = w.find('input').classes().join(' ')
    expect(cls).not.toMatch(/focus:shadow-\[0_0_15px_rgba\(124,58,237/)
  })

  it('placeholder se propaga al input', () => {
    const w = mountComponent(Input, { attrs: { placeholder: 'Buscar…' } })
    expect(w.find('input').attributes('placeholder')).toBe('Buscar…')
  })

  it('defineExpose({ el }) permite acceder al input desde el parent', () => {
    const w = mountComponent(Input, { props: { modelValue: '' } })
    expect(w.vm.el).toBeDefined()
  })
})
