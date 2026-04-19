import { describe, it, expect, vi } from 'vitest'
import Card from '~/components/ui/Card.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

describe('Card', () => {
  it('renderiza slot', () => {
    const w = mountComponent(Card, { slots: { default: '<p>contenido</p>' } })
    expect(w.html()).toContain('contenido')
  })

  it('sin onClick: NO es clickable (no role/tabindex)', () => {
    const w = mountComponent(Card)
    expect(w.attributes('role')).toBeUndefined()
    expect(w.attributes('tabindex')).toBeUndefined()
  })

  it('con @click: role="button" + tabindex="0"', () => {
    const w = mountComponent(Card, { attrs: { onClick: () => {} } })
    expect(w.attributes('role')).toBe('button')
    expect(w.attributes('tabindex')).toBe('0')
  })

  it('Enter y Space ejecutan onClick (a11y)', async () => {
    const onClick = vi.fn()
    const w = mountComponent(Card, { attrs: { onClick } })
    await w.trigger('keydown', { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
    await w.trigger('keydown', { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('otras teclas NO disparan onClick', async () => {
    const onClick = vi.fn()
    const w = mountComponent(Card, { attrs: { onClick } })
    await w.trigger('keydown', { key: 'Escape' })
    await w.trigger('keydown', { key: 'a' })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('Prism: backdrop-blur + saturate + rim border', () => {
    const w = mountComponent(Card, {
      setup: () => { usePerformanceStore().tier = 'full' },
    })
    const cls = w.classes().join(' ')
    expect(cls).toContain('backdrop-blur-2xl')
    expect(cls).toContain('backdrop-saturate-150')
    expect(cls).toMatch(/border-t-white/)
  })

  it('Normal: backdrop-blur SIN saturate (no rim elevation)', () => {
    const w = mountComponent(Card, {
      setup: () => { usePerformanceStore().tier = 'normal' },
    })
    const cls = w.classes().join(' ')
    expect(cls).toContain('backdrop-blur-2xl')
    expect(cls).not.toContain('backdrop-saturate-150')
  })

  it('Lite dark: sólido sin blur', () => {
    const w = mountComponent(Card, {
      setup: () => {
        usePerformanceStore().tier = 'lite'
        useThemeStore().isDarkMode = true
      },
    })
    const cls = w.classes().join(' ')
    expect(cls).not.toContain('backdrop-blur')
    expect(cls).toContain('bg-[#1A1A1D]')
  })

  it('Lite light: bg blanco + border lavanda brand', () => {
    const w = mountComponent(Card, {
      setup: () => {
        usePerformanceStore().tier = 'lite'
        useThemeStore().isDarkMode = false
      },
    })
    const cls = w.classes().join(' ')
    expect(cls).toContain('bg-white')
    expect(cls).toContain('border-[#DBD3FB]')
  })

  it('hoverEffect=true: hover:-translate-y-1 en Prism/Normal', () => {
    const w = mountComponent(Card, {
      props: { hoverEffect: true },
      setup: () => { usePerformanceStore().tier = 'full' },
    })
    expect(w.classes().join(' ')).toContain('hover:-translate-y-1')
  })

  it('hoverEffect=true + Lite: active:scale, sin hover-lift', () => {
    const w = mountComponent(Card, {
      props: { hoverEffect: true },
      setup: () => { usePerformanceStore().tier = 'lite' },
    })
    const cls = w.classes().join(' ')
    expect(cls).not.toContain('hover:-translate-y-1')
    expect(cls).toContain('active:scale-[0.98]')
  })
})
