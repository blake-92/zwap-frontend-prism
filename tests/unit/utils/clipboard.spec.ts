import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyToClipboard } from '~/utils/clipboard'

describe('copyToClipboard', () => {
  const origNavigator = window.navigator

  afterEach(() => {
    Object.defineProperty(window, 'navigator', { value: origNavigator, writable: true, configurable: true })
  })

  it('writeText OK: retorna true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window, 'navigator', {
      value: { clipboard: { writeText } }, writable: true, configurable: true,
    })
    const result = await copyToClipboard('hola')
    expect(result).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hola')
  })

  it('writeText rechaza (permission denied): retorna false (no throw)', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window, 'navigator', {
      value: { clipboard: { writeText } }, writable: true, configurable: true,
    })
    const result = await copyToClipboard('x')
    expect(result).toBe(false)
  })

  it('navigator.clipboard no disponible (http insecure): retorna false', async () => {
    Object.defineProperty(window, 'navigator', {
      value: { clipboard: undefined }, writable: true, configurable: true,
    })
    const result = await copyToClipboard('x')
    expect(result).toBe(false)
  })

  it('navigator.clipboard sin writeText: retorna false', async () => {
    Object.defineProperty(window, 'navigator', {
      value: { clipboard: {} }, writable: true, configurable: true,
    })
    const result = await copyToClipboard('x')
    expect(result).toBe(false)
  })
})
