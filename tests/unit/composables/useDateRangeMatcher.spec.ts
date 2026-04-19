import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDateRangeMatcher } from '~/composables/useDateRangeMatcher'

// El matcher llama t() por cada filtro. Creamos un mock determinístico.
const t = (key: string) => {
  const map: Record<string, string> = {
    'filters.today': 'Hoy',
    'filters.last7days': 'Últimos 7 días',
    'filters.thisWeek': 'Esta semana',
    'filters.thisMonth': 'Este mes',
  }
  return map[key] ?? key
}
const DEFAULT = 'Cualquier fecha'

describe('useDateRangeMatcher', () => {
  beforeEach(() => {
    // Fijamos "hoy" = 29 de marzo 2026 para tests determinísticos
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 29, 12, 0, 0))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('defaultValue: todos pasan', () => {
    const { match } = useDateRangeMatcher(t)
    expect(match('2020-01-01', DEFAULT, DEFAULT)).toBe(true)
    expect(match('2030-12-31', DEFAULT, DEFAULT)).toBe(true)
  })

  it('null/inválido no pasa cuando hay filtro activo', () => {
    const { match } = useDateRangeMatcher(t)
    expect(match(null as unknown as string, 'Hoy', DEFAULT)).toBe(false)
    expect(match('bad', 'Hoy', DEFAULT)).toBe(false)
  })

  describe('filtro "Hoy"', () => {
    it('acepta ISO del día actual', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2026-03-29', 'Hoy', DEFAULT)).toBe(true)
    })
    it('rechaza ayer', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2026-03-28', 'Hoy', DEFAULT)).toBe(false)
    })
    it('rechaza mañana', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2026-03-30', 'Hoy', DEFAULT)).toBe(false)
    })
  })

  describe('filtro "Últimos 7 días" (y "Esta semana" — mismo comportamiento)', () => {
    it('acepta dentro de la ventana', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2026-03-29', 'Últimos 7 días', DEFAULT)).toBe(true)
      expect(match('2026-03-23', 'Últimos 7 días', DEFAULT)).toBe(true)
    })
    it('rechaza fuera de la ventana (8+ días atrás)', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2026-03-21', 'Últimos 7 días', DEFAULT)).toBe(false)
    })
    it('"Esta semana" comparte lógica con "Últimos 7 días"', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2026-03-25', 'Esta semana', DEFAULT)).toBe(true)
      expect(match('2026-03-15', 'Esta semana', DEFAULT)).toBe(false)
    })
  })

  describe('filtro "Este mes"', () => {
    it('acepta cualquier día del mes actual', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2026-03-01', 'Este mes', DEFAULT)).toBe(true)
      expect(match('2026-03-29', 'Este mes', DEFAULT)).toBe(true)
      expect(match('2026-03-31', 'Este mes', DEFAULT)).toBe(true)
    })
    it('rechaza mes anterior', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2026-02-28', 'Este mes', DEFAULT)).toBe(false)
    })
    it('rechaza año distinto mismo mes', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2025-03-15', 'Este mes', DEFAULT)).toBe(false)
    })
  })

  describe('filtro desconocido', () => {
    it('retorna true (no filtra) si el valor no matchea ninguna label', () => {
      const { match } = useDateRangeMatcher(t)
      expect(match('2020-01-01', 'Etiqueta rara', DEFAULT)).toBe(true)
    })
  })
})
