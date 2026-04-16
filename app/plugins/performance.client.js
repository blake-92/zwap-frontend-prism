import { usePerformanceStore } from '~/stores/performance'

export default defineNuxtPlugin(() => {
  const perf = usePerformanceStore()
  perf.hydrate()
})
