import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useScrollLock } from '~/composables/useScrollLock'
import { withSetup } from '../helpers/withSetup'

describe('useScrollLock', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    delete document.documentElement.dataset.overlayCount
  })

  it('active=true agrega clase has-overlay + counter=1', () => {
    const { unmount } = withSetup(() => useScrollLock(true))
    expect(document.documentElement.classList.contains('has-overlay')).toBe(true)
    expect(document.documentElement.dataset.overlayCount).toBe('1')
    unmount()
  })

  it('onUnmounted remueve la clase cuando counter llega a 0', () => {
    const { unmount } = withSetup(() => useScrollLock(true))
    expect(document.documentElement.dataset.overlayCount).toBe('1')
    unmount()
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)
    expect(document.documentElement.dataset.overlayCount).toBeUndefined()
  })

  it('2 overlays simultáneos: counter=2, primer unmount mantiene clase', () => {
    const a = withSetup(() => useScrollLock(true))
    const b = withSetup(() => useScrollLock(true))
    expect(document.documentElement.dataset.overlayCount).toBe('2')
    a.unmount()
    expect(document.documentElement.classList.contains('has-overlay')).toBe(true)
    expect(document.documentElement.dataset.overlayCount).toBe('1')
    b.unmount()
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)
  })

  it('acepta Ref reactiva: toggling on→off→on', async () => {
    const active = ref(false)
    const { unmount } = withSetup(() => useScrollLock(active))
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)
    active.value = true
    await Promise.resolve()
    expect(document.documentElement.classList.contains('has-overlay')).toBe(true)
    active.value = false
    await Promise.resolve()
    expect(document.documentElement.classList.contains('has-overlay')).toBe(false)
    unmount()
  })
})
