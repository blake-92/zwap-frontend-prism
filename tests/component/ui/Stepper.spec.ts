import { describe, it, expect } from 'vitest'
import { CheckCircle, Zap, Rocket } from 'lucide-vue-next'
import Stepper from '~/components/ui/Stepper.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

const steps = [
  { label: 'Step 1', sub: 'done', icon: CheckCircle, done: true, active: false },
  { label: 'Step 2', sub: 'now', icon: Zap, done: false, active: true },
  { label: 'Step 3', sub: 'later', icon: Rocket, done: false, active: false },
]

describe('Stepper', () => {
  it('renderiza un círculo por step con label y sub', () => {
    const w = mountComponent(Stepper, { props: { steps } })
    expect(w.text()).toContain('Step 1')
    expect(w.text()).toContain('now')
    expect(w.text()).toContain('Step 3')
  })

  it('step done: bg emerald', () => {
    const w = mountComponent(Stepper, { props: { steps } })
    const html = w.html()
    expect(html).toContain('emerald')
  })

  it('step activo + Prism dark: outline + shadow neon', () => {
    const w = mountComponent(Stepper, {
      props: { steps },
      setup: () => {
        usePerformanceStore().tier = 'full'
        useThemeStore().isDarkMode = true
      },
    })
    const html = w.html()
    expect(html).toContain('outline')
    expect(html).toMatch(/shadow-\[0_0_20px_rgba\(124,58,237/)
  })

  it('step activo + Normal/Lite: SIN outline ni neon (shadow-md plano)', () => {
    const w = mountComponent(Stepper, {
      props: { steps },
      setup: () => {
        usePerformanceStore().tier = 'normal'
        useThemeStore().isDarkMode = true
      },
    })
    const html = w.html()
    expect(html).not.toMatch(/shadow-\[0_0_20px_rgba\(124,58,237/)
    expect(html).toContain('shadow-md')
  })

  it('step activo + useContinuousAnim: ícono animate-spin-slow', () => {
    const w = mountComponent(Stepper, {
      props: { steps },
      setup: () => { usePerformanceStore().tier = 'full' },
    })
    const html = w.html()
    expect(html).toContain('animate-spin-slow')
  })

  it('step activo + Lite: ícono SIN animate-spin-slow', () => {
    const w = mountComponent(Stepper, {
      props: { steps },
      setup: () => { usePerformanceStore().tier = 'lite' },
    })
    const html = w.html()
    expect(html).not.toContain('animate-spin-slow')
  })
})
