import { useEffect } from 'react'

/**
 * useScrollLock — bloquea el scroll del contenedor principal (<main>)
 * mientras overlays, modales o sheets están abiertos.
 *
 * Usa un contador en documentElement.dataset.overlayCount para coordinar
 * múltiples consumidores apilados sin conflictos al restaurar el estado.
 *
 * AppShell mantiene su propio lock permanente sobre html+body para iOS Safari
 * (necesario para contener el scroll en el <main>). Este hook complementa ese
 * lock bloqueando el overflow del propio <main> cuando hay overlays activos.
 *
 * @param {boolean} active — activa el lock cuando es true
 */
export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    const el = document.documentElement
    const count = parseInt(el.dataset.overlayCount || '0', 10)
    el.dataset.overlayCount = String(count + 1)
    el.classList.add('has-overlay')
    return () => {
      const next = parseInt(el.dataset.overlayCount || '1', 10) - 1
      el.dataset.overlayCount = String(next)
      if (next <= 0) {
        el.classList.remove('has-overlay')
        delete el.dataset.overlayCount
      }
    }
  }, [active])
}
