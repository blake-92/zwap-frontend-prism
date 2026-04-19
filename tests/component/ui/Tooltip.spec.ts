import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Tooltip from '~/components/ui/Tooltip.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('no renderiza tooltip sin hover', () => {
    const w = mountComponent(Tooltip, {
      props: { content: 'Tooltip text' },
      slots: { default: '<button>trigger</button>' },
    })
    expect(w.html()).not.toContain('Tooltip text')
  })

  it('mouseenter con delay de 300ms muestra el tooltip', async () => {
    const w = mountComponent(Tooltip, {
      props: { content: 'Tooltip text' },
      slots: { default: '<button>trigger</button>' },
    })
    await w.find('div').trigger('mouseenter')
    expect(w.html()).not.toContain('Tooltip text')
    vi.advanceTimersByTime(250)
    await w.vm.$nextTick()
    expect(w.html()).not.toContain('Tooltip text')
    vi.advanceTimersByTime(60)
    await w.vm.$nextTick()
    expect(w.html()).toContain('Tooltip text')
  })

  it('mouseleave antes del delay cancela el show', async () => {
    const w = mountComponent(Tooltip, {
      props: { content: 'Tooltip text' },
      slots: { default: '<button>trigger</button>' },
    })
    await w.find('div').trigger('mouseenter')
    vi.advanceTimersByTime(150)
    await w.find('div').trigger('mouseleave')
    vi.advanceTimersByTime(500)
    await w.vm.$nextTick()
    expect(w.html()).not.toContain('Tooltip text')
  })

  it('focus del trigger también dispara tooltip (a11y)', async () => {
    const w = mountComponent(Tooltip, {
      props: { content: 'Tooltip text' },
      slots: { default: '<button>trigger</button>' },
    })
    await w.find('div').trigger('focus')
    vi.advanceTimersByTime(310)
    await w.vm.$nextTick()
    expect(w.html()).toContain('Tooltip text')
  })

  it('blur oculta el tooltip', async () => {
    const w = mountComponent(Tooltip, {
      props: { content: 'Tooltip text' },
      slots: { default: '<button>trigger</button>' },
    })
    await w.find('div').trigger('focus')
    vi.advanceTimersByTime(310)
    await w.vm.$nextTick()
    expect(w.html()).toContain('Tooltip text')
    await w.find('div').trigger('blur')
    await w.vm.$nextTick()
    expect(w.html()).not.toContain('Tooltip text')
  })

  it('position prop acepta top/bottom/left/right', () => {
    for (const position of ['top', 'bottom', 'left', 'right']) {
      const w = mountComponent(Tooltip, {
        props: { content: 'x', position },
        slots: { default: '<button>t</button>' },
      })
      expect(w.exists()).toBe(true)
    }
  })

  it('aria-describedby se setea solo cuando el tooltip es visible', async () => {
    const w = mountComponent(Tooltip, {
      props: { content: 'x' },
      slots: { default: '<button>t</button>' },
    })
    const trigger = w.find('div')
    expect(trigger.attributes('aria-describedby')).toBeUndefined()
    await trigger.trigger('mouseenter')
    vi.advanceTimersByTime(310)
    await w.vm.$nextTick()
    expect(trigger.attributes('aria-describedby')).toBeDefined()
  })
})
