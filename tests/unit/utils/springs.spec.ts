import { describe, it, expect } from 'vitest'
import { SPRING, SPRING_SIDEBAR, SPRING_SOFT, SPRING_DOTS } from '~/utils/springs'

describe('springs constants', () => {
  it('cada spring tiene type=spring + stiffness + damping', () => {
    for (const s of [SPRING, SPRING_SIDEBAR, SPRING_SOFT, SPRING_DOTS]) {
      expect(s.type).toBe('spring')
      expect(typeof s.stiffness).toBe('number')
      expect(typeof s.damping).toBe('number')
      expect(s.stiffness).toBeGreaterThan(0)
      expect(s.damping).toBeGreaterThan(0)
    }
  })

  it('SPRING_SIDEBAR es críticamente amortiguado (damping alto)', () => {
    expect(SPRING_SIDEBAR.damping).toBeGreaterThanOrEqual(40)
  })

  it('SPRING_SOFT es más suave que SPRING default', () => {
    expect(SPRING_SOFT.stiffness).toBeLessThan(SPRING.stiffness)
  })
})
