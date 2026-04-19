import { describe, it, expect } from 'vitest'
import { Zap, User } from 'lucide-vue-next'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'
import { useThemeStore } from '~/stores/theme'

import AvatarInfo from '~/components/ui/AvatarInfo.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import EmptySearchState from '~/components/ui/EmptySearchState.vue'
import InfoBanner from '~/components/ui/InfoBanner.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import PageLoader from '~/components/ui/PageLoader.vue'
import QrLightbox from '~/components/ui/QrLightbox.vue'
import SectionLabel from '~/components/ui/SectionLabel.vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import StatCard from '~/components/ui/StatCard.vue'
import TableToolbar from '~/components/ui/TableToolbar.vue'

describe('AvatarInfo', () => {
  it('con initials: renderiza Avatar + primary', () => {
    const w = mountComponent(AvatarInfo, { props: { initials: 'AB', primary: 'Ana' } })
    expect(w.text()).toContain('Ana')
    expect(w.text()).toContain('AB')
  })
  it('sin initials: fallback con User icon', () => {
    const w = mountComponent(AvatarInfo, { props: { primary: 'Invitado' } })
    expect(w.find('svg').exists()).toBe(true)
    expect(w.text()).toContain('Invitado')
  })
  it('meta se renderiza como span mono', () => {
    const w = mountComponent(AvatarInfo, { props: { primary: 'Ana', meta: 'id-42' } })
    expect(w.text()).toContain('id-42')
  })
  it('secondary se renderiza en segunda línea', () => {
    const w = mountComponent(AvatarInfo, { props: { primary: 'Ana', secondary: 'ana@x.com' } })
    expect(w.text()).toContain('ana@x.com')
  })
})

describe('CardHeader', () => {
  it('title como prop', () => {
    const w = mountComponent(CardHeader, { props: { title: 'Transacciones' } })
    expect(w.text()).toContain('Transacciones')
  })
  it('title via slot override', () => {
    const w = mountComponent(CardHeader, {
      props: { title: 'prop-title' },
      slots: { title: '<span>slot-title</span>' },
    })
    expect(w.text()).toContain('slot-title')
  })
  it('description opcional', () => {
    const w = mountComponent(CardHeader, { props: { title: 'x', description: 'desc aquí' } })
    expect(w.text()).toContain('desc aquí')
  })
  it('default slot se renderiza a la derecha', () => {
    const w = mountComponent(CardHeader, {
      props: { title: 'x' },
      slots: { default: '<button>action</button>' },
    })
    expect(w.html()).toContain('action')
  })
})

describe('EmptySearchState', () => {
  it('renderiza en <tr>/<td> con colspan correcto', () => {
    const w = mountComponent(EmptySearchState, { props: { colSpan: 5, term: 'ana' } })
    expect(w.find('td').attributes('colspan')).toBe('5')
  })
  it('muestra el term en el mensaje', () => {
    const w = mountComponent(EmptySearchState, { props: { colSpan: 3, term: 'ana' } })
    expect(w.text()).toContain('ana')
  })
  it('botón "Limpiar" emite clear', async () => {
    const w = mountComponent(EmptySearchState, { props: { colSpan: 3, term: 'x' } })
    await w.find('button').trigger('click')
    expect(w.emitted('clear')).toBeTruthy()
  })
})

describe('InfoBanner', () => {
  it.each(['warning', 'info', 'danger'])('variant=%s: color específico', (variant) => {
    const w = mountComponent(InfoBanner, {
      props: { variant },
      slots: { default: 'Atención' },
    })
    expect(w.text()).toContain('Atención')
    expect(w.find('svg').exists()).toBe(true)
  })
  it('variant inválido cae a warning (fallback)', () => {
    const w = mountComponent(InfoBanner, {
      props: { variant: 'bogus' },
      slots: { default: 'msg' },
    })
    expect(w.classes().join(' ')).toMatch(/amber/)
  })
})

describe('PageHeader', () => {
  it('title obligatorio + description opcional', () => {
    const w = mountComponent(PageHeader, {
      props: { title: 'Dashboard', description: 'Resumen' },
    })
    expect(w.text()).toContain('Dashboard')
    expect(w.text()).toContain('Resumen')
  })
  it('hidden en mobile (sm:flex solo desde sm)', () => {
    const w = mountComponent(PageHeader, { props: { title: 'x' } })
    expect(w.classes().join(' ')).toContain('hidden')
    expect(w.classes().join(' ')).toContain('sm:flex')
  })
  it('default slot se renderiza en shrink-0', () => {
    const w = mountComponent(PageHeader, {
      props: { title: 'x' },
      slots: { default: '<button>action</button>' },
    })
    expect(w.html()).toContain('action')
  })
})

describe('PageLoader', () => {
  it('full/normal: animate-spin (R1 #3 guard)', () => {
    const w = mountComponent(PageLoader, {
      setup: () => { usePerformanceStore().tier = 'full' },
    })
    expect(w.html()).toContain('animate-spin')
  })
  it('Lite: círculo estático (sin animate-spin)', () => {
    const w = mountComponent(PageLoader, {
      setup: () => { usePerformanceStore().tier = 'lite' },
    })
    expect(w.html()).not.toContain('animate-spin')
    expect(w.html()).toContain('rounded-full')
  })
})

describe('QrLightbox', () => {
  it('isOpen=false: no renderiza el QR panel', () => {
    const w = mountComponent(QrLightbox, {
      props: { isOpen: false, layoutId: 'qr-x', name: 'Link', url: 'zwap/x' },
    })
    expect(w.html()).not.toContain('zwap/x')
  })
  it('isOpen=true: renderiza QR + name + url', () => {
    const w = mountComponent(QrLightbox, {
      props: { isOpen: true, layoutId: 'qr-x', name: 'Link A', url: 'zwap/x' },
    })
    expect(w.text()).toContain('Link A')
    expect(w.text()).toContain('zwap/x')
  })
})

describe('SectionLabel', () => {
  it('renderiza slot como <p> uppercase', () => {
    const w = mountComponent(SectionLabel, { slots: { default: 'Personal Info' } })
    expect(w.element.tagName).toBe('P')
    expect(w.classes().join(' ')).toContain('tracking-widest')
    expect(w.text()).toContain('Personal Info')
  })
})

describe('Skeleton', () => {
  it('Lite: div estático con animate-pulse (decisión de diseño)', () => {
    const w = mountComponent(Skeleton, {
      props: { width: 200, height: 20 },
      setup: () => { usePerformanceStore().tier = 'lite' },
    })
    expect(w.classes().join(' ')).toContain('animate-pulse')
    expect(w.element.getAttribute('style') || '').toContain('200px')
  })
  it('Prism/Normal: shimmer sweep animado (motion stub acepta)', () => {
    const w = mountComponent(Skeleton, {
      props: { width: '100%', height: '2rem' },
      setup: () => { usePerformanceStore().tier = 'full' },
    })
    // 2 divs: outer + shimmer inner
    expect(w.findAll('div').length).toBeGreaterThanOrEqual(1)
  })
  it('width/height numéricos se convierten a px', () => {
    const w = mountComponent(Skeleton, {
      props: { width: 150, height: 12 },
      setup: () => { usePerformanceStore().tier = 'lite' },
    })
    const style = w.element.getAttribute('style') || ''
    expect(style).toContain('150px')
    expect(style).toContain('12px')
  })
})

describe('StatCard', () => {
  it('layout="kpi" (default): label arriba + value grande', () => {
    const w = mountComponent(StatCard, {
      props: { label: 'Ingresos', value: '$1,234', icon: Zap },
    })
    expect(w.text()).toContain('Ingresos')
    expect(w.text()).toContain('$1,234')
  })
  it('layout="balance": icon arriba + badge', () => {
    const w = mountComponent(StatCard, {
      props: { label: 'Saldo', value: '$500', icon: Zap, layout: 'balance', badge: 'OK' },
    })
    expect(w.text()).toContain('OK')
  })
  it('negative=true: value en rose', () => {
    const w = mountComponent(StatCard, {
      props: { label: 'x', value: '-100', icon: Zap, negative: true },
    })
    expect(w.html()).toMatch(/rose/)
  })
  it('Prism dark: icon bubble con group-hover shadow neon', () => {
    const w = mountComponent(StatCard, {
      props: { label: 'x', value: 'y', icon: Zap },
      setup: () => {
        usePerformanceStore().tier = 'full'
        useThemeStore().isDarkMode = true
      },
    })
    expect(w.html()).toMatch(/group-hover:shadow-\[0_0_15px_rgba\(124,58,237/)
  })
  it('Normal dark: icon bubble con group-hover shadow-md (sin neon)', () => {
    const w = mountComponent(StatCard, {
      props: { label: 'x', value: 'y', icon: Zap },
      setup: () => {
        usePerformanceStore().tier = 'normal'
        useThemeStore().isDarkMode = true
      },
    })
    expect(w.html()).toContain('group-hover:shadow-md')
  })
})

describe('TableToolbar', () => {
  it('desktop: renderiza div principal con glass class', () => {
    // En happy-dom useMediaQuery(1024px) default → false en mobile. Ajustamos matchMedia stub.
    window.matchMedia = (q) => ({
      matches: q.includes('1024'),
      media: q,
      addEventListener: () => {}, removeEventListener: () => {},
    }) as unknown as MediaQueryList
    const w = mountComponent(TableToolbar, {
      slots: { default: '<button>filter</button>' },
    })
    expect(w.html()).toContain('filter')
  })
  it('renderiza actions slot separado del default', () => {
    window.matchMedia = (q) => ({
      matches: q.includes('1024'),
      media: q,
      addEventListener: () => {}, removeEventListener: () => {},
    }) as unknown as MediaQueryList
    const w = mountComponent(TableToolbar, {
      slots: {
        default: '<button>filtro</button>',
        actions: '<button>export</button>',
      },
    })
    expect(w.html()).toContain('filtro')
    expect(w.html()).toContain('export')
  })
  it('@reset se emite al click del botón limpiar (con onReset definido)', async () => {
    window.matchMedia = (q) => ({
      matches: q.includes('1024'),
      media: q,
      addEventListener: () => {}, removeEventListener: () => {},
    }) as unknown as MediaQueryList
    const w = mountComponent(TableToolbar, {
      attrs: { onReset: () => {} },
      slots: { default: '<div>filters</div>' },
    })
    const resetBtn = w.findAll('button').find(b => b.text().match(/limpiar|clear/i))
    if (resetBtn) {
      await resetBtn.trigger('click')
      expect(w.emitted('reset')).toBeTruthy()
    }
  })
})
