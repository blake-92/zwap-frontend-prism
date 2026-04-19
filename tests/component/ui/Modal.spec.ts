import { describe, it, expect, vi } from 'vitest'
import Modal from '~/components/ui/Modal.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { pushModal, popModal, isTopModal } from '~/utils/modalStack'

// Helper: mount con Teleport real para acceder al DOM children via document.
// Nuestro stub convierte Teleport en div inline — útil para queries locales.
describe('Modal', () => {
  it('renderiza title + description', () => {
    const w = mountComponent(Modal, {
      props: { title: 'Editar link', description: 'Cambia los datos' },
    })
    expect(w.text()).toContain('Editar link')
    expect(w.text()).toContain('Cambia los datos')
  })

  it('renderiza ícono close button con aria-label (R3 #20)', () => {
    const w = mountComponent(Modal, { props: { title: 'x' } })
    const closeBtn = w.find('[aria-label]')
    expect(closeBtn.exists()).toBe(true)
  })

  it('click backdrop emite close', async () => {
    const w = mountComponent(Modal, { props: { title: 'x' } })
    // Backdrop es el primer div dentro del Teleport — tiene @click="emit('close')"
    const backdrop = w.findAll('div').find(d => d.classes().includes('absolute') && d.classes().includes('inset-0'))
    if (backdrop) {
      await backdrop.trigger('click')
      expect(w.emitted('close')).toBeTruthy()
    }
  })

  it('aria-modal="true" + role="dialog"', () => {
    const w = mountComponent(Modal, { props: { title: 'x' } })
    const dialog = w.find('[role="dialog"]')
    expect(dialog.exists()).toBe(true)
    expect(dialog.attributes('aria-modal')).toBe('true')
  })

  it('footer slot se renderiza condicionalmente', () => {
    const withFooter = mountComponent(Modal, {
      props: { title: 'x' },
      slots: { default: 'body', footer: '<button>ok</button>' },
    })
    expect(withFooter.html()).toContain('>ok<')

    const withoutFooter = mountComponent(Modal, {
      props: { title: 'x' },
      slots: { default: 'body' },
    })
    // Sin slot footer, el wrapper footer no existe
    expect(withoutFooter.html()).not.toContain('footer')
  })

  it('z prop se aplica como inline style', () => {
    const w = mountComponent(Modal, { props: { title: 'x', z: 60 } })
    const container = w.find('div[style*="z-index"]')
    expect(container.attributes('style')).toContain('60')
  })

  it('icon prop renderiza ícono junto al título', () => {
    const { Building2 } = require('lucide-vue-next')
    const w = mountComponent(Modal, { props: { title: 'x', icon: Building2 } })
    expect(w.find('svg').exists()).toBe(true)
  })

  it('maxWidth prop se aplica al container', () => {
    const w = mountComponent(Modal, { props: { title: 'x', maxWidth: '320px' } })
    // Buscar el container con role dialog que debe tener maxWidth
    const dialog = w.find('[role="dialog"]')
    expect(dialog.attributes('style')).toContain('320')
  })

  it('modalStack — push al mount, pop al unmount', () => {
    const id = Symbol('test-modal-stack')
    pushModal(id)
    expect(isTopModal(id)).toBe(true)

    const w = mountComponent(Modal, { props: { title: 'x' } })
    // El nuevo modal está en el top, no el id manual
    expect(isTopModal(id)).toBe(false)

    w.unmount()
    // Después del unmount, vuelve a ser top el id manual
    expect(isTopModal(id)).toBe(true)
    popModal(id)
  })
})
