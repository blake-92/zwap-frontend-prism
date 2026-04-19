import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useModalOpen } from '~/composables/useModalOpen'
import { withSetup } from '../helpers/withSetup'

describe('useModalOpen', () => {
  beforeEach(() => {
    delete document.body.dataset.modalOpen
  })
  afterEach(() => {
    delete document.body.dataset.modalOpen
  })

  it('arranca en false cuando body no tiene data-modal-open', () => {
    const { result, unmount } = withSetup(() => useModalOpen())
    expect(result.value).toBe(false)
    unmount()
  })

  it('arranca en true cuando body ya tiene data-modal-open="true" al montar', () => {
    document.body.dataset.modalOpen = 'true'
    const { result, unmount } = withSetup(() => useModalOpen())
    expect(result.value).toBe(true)
    unmount()
  })

  it('reacciona a cambios vía MutationObserver', async () => {
    const { result, unmount } = withSetup(() => useModalOpen())
    expect(result.value).toBe(false)
    document.body.dataset.modalOpen = 'true'
    // El MutationObserver es async: esperamos un tick
    await new Promise(r => setTimeout(r, 10))
    expect(result.value).toBe(true)
    delete document.body.dataset.modalOpen
    await new Promise(r => setTimeout(r, 10))
    expect(result.value).toBe(false)
    unmount()
  })
})
