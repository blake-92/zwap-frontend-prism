import { describe, it, expect } from 'vitest'
import SegmentControl from '~/components/ui/SegmentControl.vue'
import { mountComponent } from '../../unit/helpers/mountComponent'
import { usePerformanceStore } from '~/stores/performance'

const options = [
  { value: 'a', label: 'Alfa' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
]

describe('SegmentControl', () => {
  it('renderiza un botón por option con role="tab"', () => {
    const w = mountComponent(SegmentControl, {
      props: { modelValue: 'a', options },
    })
    expect(w.findAll('[role="tab"]')).toHaveLength(3)
  })

  it('wrapper con role="tablist"', () => {
    const w = mountComponent(SegmentControl, {
      props: { modelValue: 'a', options },
    })
    expect(w.find('[role="tablist"]').exists()).toBe(true)
  })

  it('aria-selected="true" solo en la option activa', () => {
    const w = mountComponent(SegmentControl, {
      props: { modelValue: 'b', options },
    })
    const tabs = w.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(tabs[2].attributes('aria-selected')).toBe('false')
  })

  it('click emite update:modelValue con el nuevo value', async () => {
    const w = mountComponent(SegmentControl, {
      props: { modelValue: 'a', options },
    })
    await w.findAll('[role="tab"]')[2].trigger('click')
    expect(w.emitted('update:modelValue')![0]).toEqual(['c'])
  })

  it('renderiza labels', () => {
    const w = mountComponent(SegmentControl, {
      props: { modelValue: 'a', options },
    })
    expect(w.text()).toContain('Alfa')
    expect(w.text()).toContain('Beta')
    expect(w.text()).toContain('Gamma')
  })

  it('Lite: useNavMorphs=false → layoutId undefined (pill instant)', () => {
    // Validación indirecta: el componente no crashea en Lite + active halo queda OFF
    const w = mountComponent(SegmentControl, {
      props: { modelValue: 'a', options },
      setup: () => { usePerformanceStore().tier = 'lite' },
    })
    // useActiveHalo=false en Lite, no renderiza el halo blur-lg
    const halos = w.findAll('div').filter(d => d.classes().join(' ').includes('blur-lg'))
    expect(halos.length).toBe(0)
  })
})
