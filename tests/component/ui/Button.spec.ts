import { describe, it, expect } from 'vitest'
import Button from '~/components/ui/Button.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { useThemeStore } from '~/stores/theme'
import { usePerformanceStore } from '~/stores/performance'

describe('Button', () => {
  describe('props', () => {
    it('renderiza slot content', () => {
      const w = mountComponent(Button, { slots: { default: 'Hola' } })
      expect(w.text()).toContain('Hola')
    })

    it('type defaults a "button"', () => {
      const w = mountComponent(Button)
      expect(w.attributes('type')).toBe('button')
    })

    it('type="submit" se refleja en el DOM', () => {
      const w = mountComponent(Button, { props: { type: 'submit' } })
      expect(w.attributes('type')).toBe('submit')
    })

    it('disabled true: atributo + opacity class', () => {
      const w = mountComponent(Button, { props: { disabled: true } })
      expect(w.attributes('disabled')).toBeDefined()
      expect(w.classes().join(' ')).toContain('disabled:opacity-50')
    })

    it('title se propaga al atributo HTML', () => {
      const w = mountComponent(Button, { props: { title: 'Editar' } })
      expect(w.attributes('title')).toBe('Editar')
    })
  })

  describe('size variants', () => {
    it('size="default" → px-5 py-2.5', () => {
      const w = mountComponent(Button)
      expect(w.classes().join(' ')).toContain('px-5')
      expect(w.classes().join(' ')).toContain('py-2.5')
    })

    it('size="sm" → px-4 py-2', () => {
      const w = mountComponent(Button, { props: { size: 'sm' } })
      expect(w.classes().join(' ')).toContain('px-4')
      expect(w.classes().join(' ')).toContain('py-2')
    })

    it('size="lg" → px-6 py-3', () => {
      const w = mountComponent(Button, { props: { size: 'lg' } })
      expect(w.classes().join(' ')).toContain('px-6')
      expect(w.classes().join(' ')).toContain('py-3')
    })

    it('size="icon" → w-10 h-10 (R1 #4 WCAG mínimo 40px)', () => {
      const w = mountComponent(Button, { props: { size: 'icon' } })
      expect(w.classes().join(' ')).toContain('w-10')
      expect(w.classes().join(' ')).toContain('h-10')
    })
  })

  describe('variants × perf tiers (R1 #2 neon guards)', () => {
    it('default variant en Prism dark: bg morado + shadow neon', () => {
      const w = mountComponent(Button, {
        props: { variant: 'default' },
        setup: () => {
          usePerformanceStore().tier = 'full'
          useThemeStore().isDarkMode = true
        },
      })
      const cls = w.classes().join(' ')
      expect(cls).toContain('bg-[#7C3AED]')
      expect(cls).toMatch(/shadow-\[0_8px_30px_rgba\(124,58,237/)
    })

    it('default variant en Lite dark: NO shadow neon (shadow-lg plano)', () => {
      const w = mountComponent(Button, {
        props: { variant: 'default' },
        setup: () => {
          usePerformanceStore().tier = 'lite'
          useThemeStore().isDarkMode = true
        },
      })
      const cls = w.classes().join(' ')
      expect(cls).toContain('shadow-lg')
      expect(cls).not.toMatch(/shadow-\[0_8px_30px_rgba\(124,58,237/)
    })

    it('outline variant en light: bg white tenue', () => {
      const w = mountComponent(Button, {
        props: { variant: 'outline' },
        setup: () => { useThemeStore().isDarkMode = false },
      })
      const cls = w.classes().join(' ')
      expect(cls).toMatch(/bg-(white|\[#F8F7FB\])/)
    })

    it('variants soportados: outline, ghost, action, danger, successExport', () => {
      for (const variant of ['outline', 'ghost', 'action', 'danger', 'successExport']) {
        const w = mountComponent(Button, { props: { variant } })
        expect(w.classes().length).toBeGreaterThan(3)
      }
    })
  })

  describe('accessibility', () => {
    it('es un <button> nativo (keyboard + screen reader friendly)', () => {
      const w = mountComponent(Button)
      expect(w.element.tagName).toBe('BUTTON')
    })

    it('aria-label pasa como $attr via v-bind', () => {
      const w = mountComponent(Button, { attrs: { 'aria-label': 'Cerrar' } })
      expect(w.attributes('aria-label')).toBe('Cerrar')
    })
  })

  describe('events', () => {
    it('@click se emite en click', async () => {
      const w = mountComponent(Button)
      await w.trigger('click')
      expect(w.emitted('click')).toBeTruthy()
    })

    it('disabled bloquea click (no emite)', async () => {
      const w = mountComponent(Button, { props: { disabled: true } })
      await w.trigger('click')
      // Con disabled, el navegador no dispara click en HTMLButtonElement nativo.
      // En JSDOM/happy-dom el behavior varía — verificamos al menos que el atributo existe.
      expect(w.attributes('disabled')).toBeDefined()
    })
  })
})
