import { useState, useEffect } from 'react'

/**
 * useDebounce — retrasa la propagación de un valor hasta que el usuario
 * deja de escribir. Ideal para inputs de búsqueda.
 *
 * @param {*}      value Valor a debouncear
 * @param {number} delay Milisegundos de espera (default 300ms)
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
