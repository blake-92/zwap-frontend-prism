import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useChromeBlur } from '~/composables/useChromeBlur'
import { withSetup } from '../helpers/withSetup'

describe('useChromeBlur', () => {
  beforeEach(() => {
    delete document.body.dataset.modalOpen
    delete document.body.dataset.modalCount
  })

  it('active=true setea data-modal-open="true" + count=1', () => {
    const { unmount } = withSetup(() => useChromeBlur(true))
    expect(document.body.dataset.modalOpen).toBe('true')
    expect(document.body.dataset.modalCount).toBe('1')
    unmount()
  })

  it('onUnmounted limpia attrs cuando count llega a 0', () => {
    const { unmount } = withSetup(() => useChromeBlur(true))
    unmount()
    expect(document.body.dataset.modalOpen).toBeUndefined()
    expect(document.body.dataset.modalCount).toBeUndefined()
  })

  it('múltiples modales simultáneos: counter correcto', () => {
    const a = withSetup(() => useChromeBlur(true))
    const b = withSetup(() => useChromeBlur(true))
    const c = withSetup(() => useChromeBlur(true))
    expect(document.body.dataset.modalCount).toBe('3')
    a.unmount()
    expect(document.body.dataset.modalCount).toBe('2')
    expect(document.body.dataset.modalOpen).toBe('true')
    b.unmount()
    expect(document.body.dataset.modalCount).toBe('1')
    c.unmount()
    expect(document.body.dataset.modalOpen).toBeUndefined()
  })

  it('acepta Ref reactiva', async () => {
    const active = ref(false)
    const { unmount } = withSetup(() => useChromeBlur(active))
    expect(document.body.dataset.modalOpen).toBeUndefined()
    active.value = true
    await Promise.resolve()
    expect(document.body.dataset.modalOpen).toBe('true')
    active.value = false
    await Promise.resolve()
    expect(document.body.dataset.modalOpen).toBeUndefined()
    unmount()
  })
})
