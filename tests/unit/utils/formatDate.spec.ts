import { describe, it, expect } from 'vitest'
import { formatDate, formatDateShort, parseIsoDate } from '~/utils/formatDate'

describe('formatDate', () => {
  // Usamos Date instances locales para evitar el edge-case de timezone que afecta
  // `new Date('2026-03-29')` (UTC midnight → día anterior en TZ negativas).
  // El util parseIsoDate SÍ maneja este caso; formatDate con string ISO no.
  const MARCH_29 = new Date(2026, 2, 29) // marzo 29 en TZ local

  it('formatea Date en español', () => {
    const result = formatDate(MARCH_29, 'es')
    expect(result).toMatch(/29/)
    expect(result).toMatch(/mar/i)
    expect(result).toMatch(/2026/)
  })

  it('formatea Date en inglés', () => {
    const result = formatDate(MARCH_29, 'en')
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/29/)
    expect(result).toMatch(/2026/)
  })

  it('acepta string ISO con tiempo (evita timezone shift)', () => {
    // "2026-03-29T12:00" es interpretado con mediodía local → no shiftea.
    const result = formatDate('2026-03-29T12:00', 'es')
    expect(result).toMatch(/29/)
    expect(result).toMatch(/mar/i)
    expect(result).toMatch(/2026/)
  })

  it('devuelve vacío en input null/undefined/empty', () => {
    expect(formatDate(null, 'es')).toBe('')
    expect(formatDate(undefined, 'es')).toBe('')
    expect(formatDate('', 'es')).toBe('')
  })

  it('devuelve vacío en input inválido', () => {
    expect(formatDate('not-a-date', 'es')).toBe('')
    expect(formatDate('2026-99-99', 'es')).toBe('')
  })

  it('respeta options override', () => {
    const result = formatDate(MARCH_29, 'en', { month: 'long', year: 'numeric' })
    expect(result).toMatch(/March/)
    expect(result).toMatch(/2026/)
  })

  it('default locale es "es"', () => {
    const resEs = formatDate(MARCH_29, 'es')
    const resDefault = formatDate(MARCH_29)
    expect(resDefault).toBe(resEs)
  })
})

describe('formatDateShort', () => {
  it('omite el año', () => {
    const d = new Date(2026, 2, 29)
    const result = formatDateShort(d, 'en')
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/29/)
    expect(result).not.toMatch(/2026/)
  })
})

describe('parseIsoDate', () => {
  it('parsea YYYY-MM-DD a Date local (no UTC)', () => {
    const d = parseIsoDate('2026-03-29')
    expect(d).toBeInstanceOf(Date)
    expect(d!.getFullYear()).toBe(2026)
    expect(d!.getMonth()).toBe(2) // March (0-indexed)
    expect(d!.getDate()).toBe(29)
  })

  it('parsea ISO con hora T ignorando time', () => {
    const d = parseIsoDate('2026-03-29T10:30:00')
    expect(d!.getDate()).toBe(29)
  })

  it('devuelve null en input inválido', () => {
    expect(parseIsoDate(null as unknown as string)).toBeNull()
    expect(parseIsoDate('')).toBeNull()
    expect(parseIsoDate('bad')).toBeNull()
    expect(parseIsoDate('2026')).toBeNull()
    expect(parseIsoDate('2026-03')).toBeNull()
    expect(parseIsoDate('2026-AA-29')).toBeNull()
  })

  it('no tiene desfase de timezone (el día es el mismo que el string)', () => {
    // Este es el bug clásico que motivó la función: new Date("2026-03-29") en timezone
    // negativa devuelve el día anterior. parseIsoDate usa componentes locales.
    const d = parseIsoDate('2026-03-29')
    expect(d!.getDate()).toBe(29)
  })
})
