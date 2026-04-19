import { describe, it, expect } from 'vitest'
import { Check } from 'lucide-vue-next'
import Badge from '~/components/ui/Badge.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

describe('Badge', () => {
  it('renderiza slot content como <span>', () => {
    const w = mountComponent(Badge, { slots: { default: 'OK' } })
    expect(w.element.tagName).toBe('SPAN')
    expect(w.text()).toContain('OK')
  })

  it('icon prop renderiza ícono antes del texto', () => {
    const w = mountComponent(Badge, {
      props: { icon: Check },
      slots: { default: 'Éxito' },
    })
    expect(w.find('svg').exists()).toBe(true)
  })

  it.each(['default', 'success', 'warning', 'danger', 'outline'])(
    'variant=%s: clases específicas',
    (variant) => {
      const w = mountComponent(Badge, { props: { variant } })
      expect(w.classes().length).toBeGreaterThan(3)
    },
  )

  it('Prism/Normal: backdrop-blur-md aplicado', () => {
    const w = mountComponent(Badge, {
      setup: () => { usePerformanceStore().tier = 'full' },
    })
    expect(w.classes().join(' ')).toContain('backdrop-blur-md')
  })

  it('Lite: SIN backdrop-blur (perf guard)', () => {
    const w = mountComponent(Badge, {
      setup: () => { usePerformanceStore().tier = 'lite' },
    })
    expect(w.classes().join(' ')).not.toContain('backdrop-blur-md')
    expect(w.classes().join(' ')).toContain('shadow-xs')
  })

  it('success dark: bg emerald translúcido', () => {
    const w = mountComponent(Badge, {
      props: { variant: 'success' },
      setup: () => { useThemeStore().isDarkMode = true },
    })
    expect(w.classes().join(' ')).toMatch(/emerald/)
  })
})
