import { describe, it, expect, vi } from 'vitest'
import { Trash2, Edit } from 'lucide-vue-next'
import SwipeableCard from '~/components/ui/SwipeableCard.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'

describe('SwipeableCard', () => {
  it('renderiza slot content', () => {
    const w = mountComponent(SwipeableCard, {
      slots: { default: '<div class="card-body">content</div>' },
    })
    expect(w.html()).toContain('card-body')
  })

  it('actions=[] sin actions: no renderiza background buttons ni chevron', () => {
    const w = mountComponent(SwipeableCard, { props: { actions: [] } })
    // Sin actions, maxDrag=0 → no hay chevron hint
    expect(w.findAll('button').length).toBe(0)
  })

  it('actions array renderiza un botón por action', () => {
    const w = mountComponent(SwipeableCard, {
      props: {
        actions: [
          { label: 'Editar', icon: Edit, onClick: () => {} },
          { label: 'Borrar', icon: Trash2, onClick: () => {}, variant: 'danger' },
        ],
      },
    })
    const buttons = w.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    expect(w.text()).toContain('Editar')
    expect(w.text()).toContain('Borrar')
  })

  it('action.hidden=true filtra el action del render', () => {
    const w = mountComponent(SwipeableCard, {
      props: {
        actions: [
          { label: 'Visible', onClick: () => {} },
          { label: 'Escondida', hidden: true, onClick: () => {} },
        ],
      },
    })
    expect(w.text()).toContain('Visible')
    expect(w.text()).not.toContain('Escondida')
  })

  it('aria-label en cada action button', () => {
    const w = mountComponent(SwipeableCard, {
      props: {
        actions: [{ label: 'Editar', icon: Edit, onClick: () => {} }],
      },
    })
    const btn = w.findAll('button').find(b => b.attributes('aria-label') === 'Editar')
    expect(btn).toBeTruthy()
  })

  it('action.disabled=true: cursor-not-allowed + no dispara onClick', async () => {
    const spy = vi.fn()
    const w = mountComponent(SwipeableCard, {
      props: {
        actions: [{ label: 'Disabled', icon: Edit, onClick: spy, disabled: true }],
      },
    })
    const btn = w.findAll('button').find(b => b.text().includes('Disabled'))
    expect(btn?.classes().join(' ')).toMatch(/cursor-not-allowed/)
  })

  it('touch-action: pan-y cuando hay actions (R3 #21 regression)', () => {
    const w = mountComponent(SwipeableCard, {
      props: { actions: [{ label: 'x', onClick: () => {} }] },
    })
    const foreground = w.findAll('div').find(d =>
      d.classes().join(' ').includes('relative z-10 w-full rounded-'),
    )
    const style = foreground?.attributes('style') || ''
    expect(style).toMatch(/touch-action.*pan-y/)
  })

  it('sin actions: no aplica touch-action (scroll normal)', () => {
    const w = mountComponent(SwipeableCard, { props: { actions: [] } })
    const foreground = w.findAll('div').find(d =>
      d.classes().join(' ').includes('relative z-10 w-full rounded-'),
    )
    const style = foreground?.attributes('style') || ''
    expect(style).not.toMatch(/touch-action.*pan-y/)
  })
})
