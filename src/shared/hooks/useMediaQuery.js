import { useState, useEffect } from 'react'

/**
 * Hook to detect viewport breakpoints via matchMedia.
 * Accepts a CSS media query string (e.g. '(min-width: 1024px)').
 * Returns true when the query matches, false otherwise.
 *
 * Tailwind default breakpoints for reference:
 *   sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)

    // Set initial value
    setMatches(mql.matches)

    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
