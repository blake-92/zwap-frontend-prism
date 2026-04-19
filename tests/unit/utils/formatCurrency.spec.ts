import { describe, it, expect } from 'vitest'
import { formatCurrency } from '~/utils/formatCurrency'

describe('formatCurrency', () => {
  it('formatea positivo default (2 decimales, sin signo)', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formatea negativo con signo menos automático', () => {
    expect(formatCurrency(-1234.5)).toBe('-$1,234.50')
  })

  it('showSign fuerza + en positivos', () => {
    expect(formatCurrency(100, { showSign: true })).toBe('+$100.00')
    expect(formatCurrency(-100, { showSign: true })).toBe('-$100.00')
    expect(formatCurrency(0, { showSign: true })).toBe('+$0.00')
  })

  it('abs fuerza valor absoluto', () => {
    expect(formatCurrency(-1234.5, { abs: true })).toBe('$1,234.50')
    expect(formatCurrency(1234.5, { abs: true })).toBe('$1,234.50')
  })

  it('decimals=0 elimina decimales', () => {
    expect(formatCurrency(1234.5, { decimals: 0 })).toBe('$1,235')
  })

  it('decimals=4 agrega ceros', () => {
    expect(formatCurrency(1.5, { decimals: 4 })).toBe('$1.5000')
  })

  it('respeta separador de miles en-US', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
  })

  it('abs + showSign: el abs anula el signo negativo pero showSign aplica', () => {
    // Math.abs(-100) = 100 → num < 0 es false → showSign => '+'
    expect(formatCurrency(-100, { abs: true, showSign: true })).toBe('+$100.00')
  })
})
