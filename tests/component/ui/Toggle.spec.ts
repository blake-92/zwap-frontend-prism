import { describe, it, expect } from 'vitest'
import Toggle from '~/components/ui/Toggle.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

describe('Toggle', () => {
  it('renderiza button con role="switch" + aria-checked', () => {
    const w = mountComponent(Toggle, { props: { active: true } })
    const btn = w.find('button')
    expect(btn.attributes('role')).toBe('switch')
    expect(btn.attributes('aria-checked')).toBe('true')
  })

  it('aria-checked se actualiza con active prop', async () => {
    const w = mountComponent(Toggle, { props: { active: false } })
    expect(w.find('button').attributes('aria-checked')).toBe('false')
    await w.setProps({ active: true })
    expect(w.find('button').attributes('aria-checked')).toBe('true')
  })

  it('click emite toggle cuando no disabled', async () => {
    const w = mountComponent(Toggle, { props: { active: false } })
    await w.find('button').trigger('click')
    expect(w.emitted('toggle')).toBeTruthy()
  })

  it('disabled=true: NO emite toggle + opacity-50', async () => {
    const w = mountComponent(Toggle, { props: { active: false, disabled: true } })
    const btn = w.find('button')
    expect(btn.classes().join(' ')).toContain('opacity-50')
    expect(btn.classes().join(' ')).toContain('cursor-not-allowed')
    await btn.trigger('click')
    expect(w.emitted('toggle')).toBeFalsy()
  })

  it('active + Prism dark: shadow neon (R1 guard confirmado)', () => {
    const w = mountComponent(Toggle, {
      props: { active: true },
      setup: () => {
        usePerformanceStore().tier = 'full'
        useThemeStore().isDarkMode = true
      },
    })
    expect(w.find('button').classes().join(' ')).toMatch(/shadow-\[0_0_12px_rgba\(124,58,237/)
  })

  it('active + Lite dark: SIN shadow neon', () => {
    const w = mountComponent(Toggle, {
      props: { active: true },
      setup: () => {
        usePerformanceStore().tier = 'lite'
        useThemeStore().isDarkMode = true
      },
    })
    expect(w.find('button').classes().join(' ')).not.toMatch(/shadow-\[0_0_12px_rgba\(124,58,237/)
  })
})
