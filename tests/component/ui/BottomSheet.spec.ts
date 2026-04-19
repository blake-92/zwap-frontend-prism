import { describe, it, expect } from 'vitest'
import BottomSheet from '~/components/ui/BottomSheet.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'

describe('BottomSheet', () => {
  it('isOpen=false: no renderiza el panel', () => {
    const w = mountComponent(BottomSheet, { props: { isOpen: false } })
    expect(w.find('[role="dialog"]').exists()).toBe(false)
  })

  it('isOpen=true: renderiza panel con role="dialog" + aria-modal', () => {
    const w = mountComponent(BottomSheet, { props: { isOpen: true, title: 'Filtros' } })
    const dialog = w.find('[role="dialog"]')
    expect(dialog.exists()).toBe(true)
    expect(dialog.attributes('aria-modal')).toBe('true')
  })

  it('renderiza title cuando se provee', () => {
    const w = mountComponent(BottomSheet, { props: { isOpen: true, title: 'Filtros' } })
    expect(w.text()).toContain('Filtros')
  })

  it('no renderiza h3 sin title', () => {
    const w = mountComponent(BottomSheet, { props: { isOpen: true } })
    expect(w.find('h3').exists()).toBe(false)
  })

  it('click backdrop emite close', async () => {
    const w = mountComponent(BottomSheet, { props: { isOpen: true } })
    // Backdrop: el primer motion-stub (.fixed.inset-0)
    const backdrop = w.findAll('div').find(d =>
      d.classes().includes('fixed')
      && d.classes().includes('inset-0')
      && !d.classes().includes('z-[55]'),
    )
    expect(backdrop).toBeTruthy()
    await backdrop!.trigger('click')
    expect(w.emitted('close')).toBeTruthy()
  })

  it('renderiza slot content', () => {
    const w = mountComponent(BottomSheet, {
      props: { isOpen: true },
      slots: { default: '<div class="sheet-body">custom</div>' },
    })
    expect(w.html()).toContain('sheet-body')
  })

  it('grabber handle visible (drag hint)', () => {
    const w = mountComponent(BottomSheet, { props: { isOpen: true } })
    // El handle es un div.w-10.h-1.rounded-full
    const handle = w.findAll('div').find(d =>
      d.classes().includes('w-10') && d.classes().includes('h-1') && d.classes().includes('rounded-full'),
    )
    expect(handle).toBeTruthy()
  })
})
