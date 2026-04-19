import { describe, it, expect } from 'vitest'
import Pagination from '~/components/ui/Pagination.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

describe('Pagination', () => {
  it('totalPages=1: no renderiza nav (oculto cuando no hace falta)', () => {
    const w = mountComponent(Pagination, { props: { currentPage: 1, totalPages: 1 } })
    expect(w.find('nav').exists()).toBe(false)
  })

  it('currentPage en el medio muestra ventana + primer y último', () => {
    const w = mountComponent(Pagination, { props: { currentPage: 3, totalPages: 5 } })
    // Con currentPage=3: ventana es 2,3,4. Primer=1, último=5. Todos visibles.
    for (const n of [1, 2, 3, 4, 5]) {
      expect(w.text()).toContain(String(n))
    }
  })

  it('currentPage=1 con totalPages=5: muestra 1,2,...,5 (colapsa por algoritmo)', () => {
    const w = mountComponent(Pagination, { props: { currentPage: 1, totalPages: 5 } })
    // Con currentPage=1: ventana [0..2] = 1,2. Primer=1, último=5. Ellipsis entre.
    expect(w.text()).toContain('1')
    expect(w.text()).toContain('2')
    expect(w.text()).toContain('5')
    expect(w.text()).toContain('...')
  })

  it('totalPages=20, currentPage=10: muestra elipsis', () => {
    const w = mountComponent(Pagination, { props: { currentPage: 10, totalPages: 20 } })
    expect(w.text()).toContain('...')
    expect(w.text()).toContain('10')
    expect(w.text()).toContain('1')
    expect(w.text()).toContain('20')
  })

  it('click en número emite pageChange', async () => {
    const w = mountComponent(Pagination, { props: { currentPage: 3, totalPages: 5 } })
    const btn4 = w.findAll('button').find(b => b.text().trim() === '4')
    expect(btn4).toBeTruthy()
    await btn4!.trigger('click')
    expect(w.emitted('pageChange')).toBeTruthy()
    expect(w.emitted('pageChange')![0]).toEqual([4])
  })

  it('prev desde página 1: disabled', () => {
    const w = mountComponent(Pagination, { props: { currentPage: 1, totalPages: 5 } })
    const prev = w.findAll('button')[0]
    expect(prev.attributes('disabled')).toBeDefined()
  })

  it('next desde última página: disabled', () => {
    const w = mountComponent(Pagination, { props: { currentPage: 5, totalPages: 5 } })
    const buttons = w.findAll('button')
    const next = buttons[buttons.length - 1]
    expect(next.attributes('disabled')).toBeDefined()
  })

  it('aria-current="page" en el botón activo', () => {
    const w = mountComponent(Pagination, { props: { currentPage: 3, totalPages: 5 } })
    const activeBtn = w.findAll('button').find(b => b.attributes('aria-current') === 'page')
    expect(activeBtn?.text()).toBe('3')
  })

  it('Prism dark: botón activo con shadow neon', () => {
    const w = mountComponent(Pagination, {
      props: { currentPage: 2, totalPages: 5 },
      setup: () => {
        usePerformanceStore().tier = 'full'
        useThemeStore().isDarkMode = true
      },
    })
    const active = w.findAll('button').find(b => b.attributes('aria-current') === 'page')
    expect(active?.classes().join(' ')).toMatch(/shadow-\[0_0_12px_rgba\(124,58,237/)
  })

  it('Lite dark: botón activo SIN shadow neon', () => {
    const w = mountComponent(Pagination, {
      props: { currentPage: 2, totalPages: 5 },
      setup: () => {
        usePerformanceStore().tier = 'lite'
        useThemeStore().isDarkMode = true
      },
    })
    const active = w.findAll('button').find(b => b.attributes('aria-current') === 'page')
    expect(active?.classes().join(' ')).not.toMatch(/shadow-\[0_0_12px_rgba\(124,58,237/)
  })
})
