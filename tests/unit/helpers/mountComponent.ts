import { mount, type MountingOptions } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { h, defineComponent, type Component } from 'vue'
import { createI18n, type I18n } from 'vue-i18n'
import { vi } from 'vitest'
import esJson from '../../../i18n/locales/es.json' with { type: 'json' }
import enJson from '../../../i18n/locales/en.json' with { type: 'json' }

interface MountOpts extends MountingOptions<unknown> {
  /** Callback que corre DESPUÉS de setActivePinia pero ANTES del mount —
   *  para setear state de stores que el componente lee en setup. */
  setup?: (ctx: { pinia: Pinia; i18n: I18n }) => void
}

/**
 * Mount helper para componentes Vue que consumen Pinia + vue-i18n + Nuxt auto-imports.
 * Setup fresco por call — sin cross-contamination entre tests.
 */
export function mountComponent(component: Component, options: MountOpts = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const i18n = createI18n({
    legacy: false,
    locale: 'es',
    fallbackLocale: 'en',
    messages: { es: esJson, en: enJson },
  })

  // Stubs de auto-imports Nuxt que algunos componentes UI usan (useI18n, useRoute, etc.)
  // Solo se stubbean si no existen ya — respeta mocks custom por test.
  if (typeof globalThis.useI18n === 'undefined') {
    vi.stubGlobal('useI18n', () => ({
      t: (key: string, params?: Record<string, unknown>) => i18n.global.t(key, params),
      tm: (key: string) => i18n.global.tm(key),
      locale: i18n.global.locale,
      setLocale: (loc: string) => { (i18n.global.locale as { value: string }).value = loc },
    }))
  }
  if (typeof globalThis.useRoute === 'undefined') {
    vi.stubGlobal('useRoute', () => ({ path: '/app/dashboard', params: {}, query: {} }))
  }
  if (typeof globalThis.useRouter === 'undefined') {
    vi.stubGlobal('useRouter', () => ({ push: vi.fn(), replace: vi.fn() }))
  }
  if (typeof globalThis.navigateTo === 'undefined') {
    vi.stubGlobal('navigateTo', vi.fn())
  }
  if (typeof globalThis.useCookie === 'undefined') {
    vi.stubGlobal('useCookie', () => ({ value: null }))
  }
  if (typeof globalThis.useId === 'undefined') {
    let counter = 0
    vi.stubGlobal('useId', () => `id-${++counter}`)
  }

  options.setup?.({ pinia, i18n })

  const { setup: _, ...mountOptions } = options
  return mount(component, {
    ...mountOptions,
    global: {
      plugins: [pinia, i18n],
      stubs: {
        Teleport: true,
        ClientOnly: { template: '<div><slot /></div>' },
        ...mountOptions.global?.stubs,
      },
      ...mountOptions.global,
    },
  })
}

/**
 * Mount wrapper para composables dentro de componentes ya con Pinia + i18n.
 */
export function mountWithProviders<T>(setupFn: () => T) {
  let result: T
  const Wrapper = defineComponent({
    setup() {
      result = setupFn()
      return () => h('div')
    },
  })
  const wrapper = mountComponent(Wrapper)
  return { result: result!, wrapper, unmount: () => wrapper.unmount() }
}
