import { describe, it, expect } from 'vitest'
import Step5MerchantForm from '~/components/features/kyb/steps/Step5MerchantForm.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'

describe('Step5MerchantForm — merchant + branches', () => {
  function mount(initial = {}) {
    return mountComponent(Step5MerchantForm, { props: { initial } })
  }

  it('default: 1 branch vacía pre-cargada', () => {
    const w = mount()
    expect(w.findAll('article').length).toBe(1)
  })

  it('submit sin displayName: error', async () => {
    const w = mount()
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('nombre comercial')
  })

  it('submit sin address completa: error per-branch', async () => {
    const w = mount()
    await w.find('#step5-displayName').setValue('Hotel Smoke')
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('Completá calle')
  })

  it('payload válido emite submit con shape correcto', async () => {
    const w = mount({
      displayName: 'Hotel Smoke',
      branches: [
        { name: 'Sucursal Centro', address: { street: 'Av. Sol 123', city: 'La Paz', country: 'BO' } },
      ],
    })
    await w.find('form').trigger('submit')
    const emitted = w.emitted('submit')
    expect(emitted).toBeDefined()
    expect(emitted![0][0]).toMatchObject({
      displayName: 'Hotel Smoke',
      branches: [{
        name: 'Sucursal Centro',
        address: { street: 'Av. Sol 123', city: 'La Paz', country: 'BO' },
      }],
    })
  })

  it('region y postalCode opcionales: omitidos en payload si vacíos', async () => {
    const w = mount({
      displayName: 'X',
      branches: [{ address: { street: 'A', city: 'B', country: 'BO' } }],
    })
    await w.find('form').trigger('submit')
    const payload = w.emitted('submit')![0][0] as { branches: Array<{ address: { region?: string; postalCode?: string } }> }
    expect(payload.branches[0].address.region).toBeUndefined()
    expect(payload.branches[0].address.postalCode).toBeUndefined()
  })
})
