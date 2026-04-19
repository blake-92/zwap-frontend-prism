import { describe, it, expect } from 'vitest'
import Avatar from '~/components/ui/Avatar.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

describe('Avatar', () => {
  it('renderiza initials como texto', () => {
    const w = mountComponent(Avatar, { props: { initials: 'AB' } })
    expect(w.text()).toContain('AB')
  })

  it('size="sm" → w-9 h-9 text-xs', () => {
    const w = mountComponent(Avatar, { props: { initials: 'X', size: 'sm' } })
    expect(w.classes().join(' ')).toContain('w-9')
    expect(w.classes().join(' ')).toContain('h-9')
  })

  it('size="md" (default) → w-10 h-10', () => {
    const w = mountComponent(Avatar, { props: { initials: 'X' } })
    expect(w.classes().join(' ')).toContain('w-10')
    expect(w.classes().join(' ')).toContain('h-10')
  })

  it('variant="neutral" en dark: bg-[#252429]', () => {
    const w = mountComponent(Avatar, {
      props: { initials: 'X', variant: 'neutral' },
      setup: () => { useThemeStore().isDarkMode = true },
    })
    expect(w.classes().join(' ')).toMatch(/bg-\[#252429\]/)
  })

  it('glow=true + Prism dark: hover shadow neon morado (R1 #2 guard)', () => {
    const w = mountComponent(Avatar, {
      props: { initials: 'X', glow: true },
      setup: () => {
        usePerformanceStore().tier = 'full'
        useThemeStore().isDarkMode = true
      },
    })
    expect(w.classes().join(' ')).toMatch(/group-hover:shadow-\[0_0_20px_rgba\(124,58,237/)
  })

  it('glow=true + Normal dark: hover shadow-md plano (sin neon)', () => {
    const w = mountComponent(Avatar, {
      props: { initials: 'X', glow: true },
      setup: () => {
        usePerformanceStore().tier = 'normal'
        useThemeStore().isDarkMode = true
      },
    })
    expect(w.classes().join(' ')).toContain('group-hover:shadow-md')
    expect(w.classes().join(' ')).not.toMatch(/group-hover:shadow-\[0_0_20px/)
  })

  it('glow=false: sin hover shadow extra', () => {
    const w = mountComponent(Avatar, {
      props: { initials: 'X' },
      setup: () => { useThemeStore().isDarkMode = true },
    })
    expect(w.classes().join(' ')).not.toMatch(/group-hover:shadow/)
  })

  it('Lite light: bg full-alpha + border brand (visible, no invisible)', () => {
    const w = mountComponent(Avatar, {
      props: { initials: 'X' },
      setup: () => {
        usePerformanceStore().tier = 'lite'
        useThemeStore().isDarkMode = false
      },
    })
    const cls = w.classes().join(' ')
    expect(cls).toMatch(/bg-\[#DBD3FB\](?!\/)/) // full-alpha, no /60
    expect(cls).toMatch(/border-\[#A78BFA\]/)
  })
})
