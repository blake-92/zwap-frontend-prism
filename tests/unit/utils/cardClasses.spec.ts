import { describe, it, expect } from 'vitest'
import {
  getCardClasses,
  getModalGlass,
  getDropdownGlass,
  getTheadClass,
  getTableRowClass,
} from '~/utils/cardClasses'

describe('getTableRowClass — compartido entre 4 vistas', () => {
  it('dark mode: hover púrpura tenue', () => {
    const cls = getTableRowClass(true)
    expect(cls).toContain('border-white/5')
    expect(cls).toContain('hover:bg-[#7C3AED]/5')
    expect(cls).toContain('last:border-0')
  })

  it('light mode: hover lavanda tenue', () => {
    const cls = getTableRowClass(false)
    expect(cls).toContain('border-black/5')
    expect(cls).toContain('hover:bg-[#DBD3FB]/20')
  })
})

describe('getTheadClass — tier-aware', () => {
  it('dark + Lite: layer oscuro sólido', () => {
    const cls = getTheadClass(true, true)
    expect(cls).toContain('bg-[#1A1A1D]')
    expect(cls).not.toContain('bg-[#111113]/40')
  })

  it('dark + no-Lite: bg translúcido', () => {
    const cls = getTheadClass(true, false)
    expect(cls).toContain('bg-[#111113]/40')
  })

  it('light + Lite: tinte lavanda brand', () => {
    const cls = getTheadClass(false, true)
    expect(cls).toContain('bg-[#F8F7FB]')
    expect(cls).toContain('border-[#DBD3FB]')
  })

  it('light + no-Lite: bg blanco semitransparente', () => {
    const cls = getTheadClass(false, false)
    expect(cls).toContain('bg-white/50')
  })
})

describe('getCardClasses — branches por tier', () => {
  describe('Lite (useBlur=false)', () => {
    it('dark: sin blur, inset highlight + shadow tight', () => {
      const { base } = getCardClasses(true, false, false, false, false)
      expect(base).not.toContain('backdrop-blur')
      expect(base).toContain('bg-[#1A1A1D]')
      expect(base).toContain('inset_0_1px_0_rgba(255,255,255,0.06)')
    })

    it('light: bg blanco + border brand lavanda + shadow branded', () => {
      const { base } = getCardClasses(false, false, false, false, false)
      expect(base).not.toContain('backdrop-blur')
      expect(base).toContain('bg-white')
      expect(base).toContain('border-[#DBD3FB]')
      expect(base).toContain('rgba(124,58,237')
    })
  })

  describe('Prism (useGlassElevation=true)', () => {
    it('dark: liquid glass con saturate + rim borders', () => {
      const { base } = getCardClasses(true, false, true, true, true)
      expect(base).toContain('backdrop-blur-2xl')
      expect(base).toContain('backdrop-saturate-150')
      expect(base).toContain('border-t-white/25')
      expect(base).toContain('border-l-white/10')
    })

    it('light: liquid glass light', () => {
      const { base } = getCardClasses(false, false, true, true, true)
      expect(base).toContain('backdrop-saturate-150')
      expect(base).toContain('border-t-white')
    })
  })

  describe('Normal (useBlur=true, useGlassElevation=false)', () => {
    it('dark: glass base sin saturate', () => {
      const { base } = getCardClasses(true, false, true, false, false)
      expect(base).toContain('backdrop-blur-2xl')
      expect(base).not.toContain('backdrop-saturate-150')
    })
  })

  describe('hover effect', () => {
    it('hoverEffect=false: hover vacío', () => {
      const { hover } = getCardClasses(true, false, true, true, false)
      expect(hover).toBe('')
    })

    it('hoverEffect=true + Prism + dark: neon glow en hover', () => {
      const { hover } = getCardClasses(true, true, true, true, false)
      expect(hover).toContain('hover:-translate-y-1')
      expect(hover).toContain('hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(124,58,237,0.10)]')
    })

    it('hoverEffect=true + Lite: active:scale, sin translate-y', () => {
      const { hover } = getCardClasses(true, true, false, false, false)
      expect(hover).not.toContain('hover:-translate-y-1')
      expect(hover).toContain('active:scale-[0.98]')
    })

    it('hoverEffect=true + Normal (no neon): shadow-2xl plano', () => {
      const { hover } = getCardClasses(true, true, true, false, false)
      expect(hover).toContain('hover:shadow-2xl')
      expect(hover).not.toContain('rgba(124,58,237,0.10)')
    })
  })
})

describe('getModalGlass — shadow levels + tier', () => {
  it('Lite dark: bg sólido + shadow depth', () => {
    const cls = getModalGlass(true, false, 'deep', false)
    expect(cls).toContain('bg-[#1A1A1D]')
    expect(cls).not.toContain('backdrop-blur')
  })

  it('Prism: elevation con saturate', () => {
    const cls = getModalGlass(true, true, 'deep', true)
    expect(cls).toContain('backdrop-saturate-150')
    expect(cls).toContain('backdrop-blur-3xl')
  })

  it('shadow level deep/medium/compact son distintos', () => {
    const deep = getModalGlass(true, true, 'deep', false)
    const medium = getModalGlass(true, true, 'medium', false)
    const compact = getModalGlass(true, true, 'compact', false)
    expect(deep).not.toEqual(medium)
    expect(medium).not.toEqual(compact)
  })

  it('shadowLevel inválido cae a deep', () => {
    const cls = getModalGlass(true, true, 'bogus', false)
    const deep = getModalGlass(true, true, 'deep', false)
    expect(cls).toBe(deep)
  })
})

describe('getDropdownGlass — opacidad mayor que modal', () => {
  it('Prism dark: 85% vs 65% de modal (mejor readability en options)', () => {
    const cls = getDropdownGlass(true, true, 'deep', true)
    expect(cls).toContain('bg-[#252429]/85')
  })

  it('Lite dark: bg sólido', () => {
    const cls = getDropdownGlass(true, false, 'deep', false)
    expect(cls).toContain('bg-[#1A1A1D]')
  })
})
