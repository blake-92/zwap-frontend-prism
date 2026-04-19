import { createApp, defineComponent, h, type App } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

/**
 * Ejecuta una función composable dentro de un componente Vue para que `onMounted`,
 * `onUnmounted`, y el sistema reactivo funcionen. Retorna el resultado del composable
 * y una función `unmount` para disparar cleanup.
 *
 * @example
 * const { result, unmount } = withSetup(() => useMyComposable())
 * // ... assertions sobre result
 * unmount()
 */
export function withSetup<T>(composable: () => T): { result: T; app: App; unmount: () => void } {
  let result!: T
  const app = createApp(defineComponent({
    setup() {
      result = composable()
      return () => h('div')
    },
  }))
  // Pinia: algunos composables dependen de stores. Setup una instancia fresca por cada call.
  const pinia = createPinia()
  app.use(pinia)
  setActivePinia(pinia)
  app.mount(document.createElement('div'))
  return { result, app, unmount: () => app.unmount() }
}
