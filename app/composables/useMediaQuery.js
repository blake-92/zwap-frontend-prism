import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useMediaQuery(query) {
  const matches = ref(false)
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

  onMounted(() => setup(typeof query === 'function' ? query() : query))

  watch(() => (typeof query === 'function' ? query() : query), (q) => setup(q))

  onUnmounted(() => {
    if (mql && handler) mql.removeEventListener('change', handler)
  })

  return matches
}
