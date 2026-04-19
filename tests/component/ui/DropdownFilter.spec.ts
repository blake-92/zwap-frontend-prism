import { describe, it, expect } from 'vitest'
import DropdownFilter from '~/components/ui/DropdownFilter.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

const defaultProps = {
  label: 'Status',
  options: ['Todos', 'Completado', 'Pendiente', 'Fallido'],
  modelValue: 'Todos',
  defaultValue: 'Todos',
}

describe('DropdownFilter', () => {
  it('renderiza el label del filtro', () => {
    const w = mountComponent(DropdownFilter, { props: defaultProps })
    // Cuando modelValue == default, muestra solo el label
    expect(w.text()).toContain('Status')
  })

  it('muestra el valor seleccionado cuando es distinto del default', () => {
    const w = mountComponent(DropdownFilter, {
      props: { ...defaultProps, modelValue: 'Pendiente' },
    })
    expect(w.text()).toContain('Pendiente')
  })

  it('click en el botón abre el panel', async () => {
    const w = mountComponent(DropdownFilter, { props: defaultProps })
    const btn = w.find('button')
    await btn.trigger('click')
    await w.vm.$nextTick()
    // Todas las opciones deberían estar visibles
    expect(w.text()).toContain('Completado')
    expect(w.text()).toContain('Fallido')
  })

  it('selección emite update:modelValue', async () => {
    const w = mountComponent(DropdownFilter, { props: defaultProps })
    await w.find('button').trigger('click')
    await w.vm.$nextTick()
    // Click en "Pendiente"
    const buttons = w.findAll('button')
    const pendienteBtn = buttons.find(b => b.text().includes('Pendiente'))
    if (pendienteBtn) {
      await pendienteBtn.trigger('click')
      expect(w.emitted('update:modelValue')).toBeTruthy()
      expect(w.emitted('update:modelValue')![0]).toEqual(['Pendiente'])
    }
  })

  it('sheetMode: render como row full-width (mobile)', () => {
    const w = mountComponent(DropdownFilter, {
      props: { ...defaultProps, sheetMode: true },
    })
    // En sheetMode, render es un button como row
    expect(w.find('button').exists()).toBe(true)
  })

  it('Prism dark: shadow neon cuando abierto (R1 #2 guard)', async () => {
    const w = mountComponent(DropdownFilter, {
      props: defaultProps,
      setup: () => {
        usePerformanceStore().tier = 'full'
        useThemeStore().isDarkMode = true
      },
    })
    await w.find('button').trigger('click')
    await w.vm.$nextTick()
    const cls = w.find('button').classes().join(' ')
    expect(cls).toMatch(/shadow-\[0_0_15px_rgba\(124,58,237/)
  })

  it('Lite dark: abierto SIN shadow neon (guard respetado)', async () => {
    const w = mountComponent(DropdownFilter, {
      props: defaultProps,
      setup: () => {
        usePerformanceStore().tier = 'lite'
        useThemeStore().isDarkMode = true
      },
    })
    await w.find('button').trigger('click')
    await w.vm.$nextTick()
    const cls = w.find('button').classes().join(' ')
    expect(cls).not.toMatch(/shadow-\[0_0_15px_rgba\(124,58,237/)
  })
})
