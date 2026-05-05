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

  describe('a11y modo wizard (ariaList=true)', () => {
    it('default: render como <div>, sin role=list ni aria-current', () => {
      const w = mountComponent(Stepper, { props: { steps } })
      expect(w.element.tagName).toBe('DIV')
      expect(w.attributes('role')).toBeUndefined()
      expect(w.find('[aria-current="step"]').exists()).toBe(false)
    })

    it('ariaList=true: render como <ol role="list"> con <li> por step', () => {
      const w = mountComponent(Stepper, { props: { steps, ariaList: true } })
      expect(w.element.tagName).toBe('OL')
      expect(w.attributes('role')).toBe('list')
      expect(w.findAll('li').length).toBe(3)
    })

    it('aria-current="step" SOLO en el step activo', () => {
      const w = mountComponent(Stepper, { props: { steps, ariaList: true } })
      const items = w.findAll('li')
      expect(items[0].attributes('aria-current')).toBeUndefined()
      expect(items[1].attributes('aria-current')).toBe('step')
      expect(items[2].attributes('aria-current')).toBeUndefined()
    })

    it('aria-label = step.label sin template', () => {
      const w = mountComponent(Stepper, { props: { steps, ariaList: true } })
      const items = w.findAll('li')
      expect(items[0].attributes('aria-label')).toBe('Step 1')
      expect(items[1].attributes('aria-label')).toBe('Step 2')
    })

    it('stepLabelTemplate interpola {n} (1-indexed) y {label}', () => {
      const w = mountComponent(Stepper, {
        props: { steps, ariaList: true, stepLabelTemplate: 'Paso {n}: {label}' },
      })
      const items = w.findAll('li')
      expect(items[0].attributes('aria-label')).toBe('Paso 1: Step 1')
      expect(items[1].attributes('aria-label')).toBe('Paso 2: Step 2')
    })

    it('connectors decorativos llevan aria-hidden="true" en modo ariaList', () => {
      const w = mountComponent(Stepper, { props: { steps, ariaList: true } })
      expect(w.findAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2)
    })
  })
})
