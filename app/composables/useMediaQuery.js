import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useMediaQuery(query) {
  const resolve = (q) => (typeof q === 'function' ? q() : q)

  // Evaluar sincrónicamente para evitar FOUC en SPA mode.
  const initialMatches = typeof window !== 'undefined'
    ? window.matchMedia(resolve(query)).matches
    : false

  const matches = ref(initialMatches)
  let mql = null
  let handler = null

  const setup = (q) => {
    if (typeof window === 'undefined') return
    if (mql) mql.removeEventListener('change', handler)
    mql = window.matchMedia(q)
    matches.value = mql.matches
    handler = (e) => { matches.value = e.matches }
    mql.addEventListener('change', handler)
  }

  onMounted(() => setup(resolve(query)))

  watch(() => resolve(query), (q) => setup(q))

  onUnmounted(() => {
    if (mql && handler) mql.removeEventListener('change', handler)
  })

  return matches
}
