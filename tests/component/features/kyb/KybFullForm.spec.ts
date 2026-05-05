import { describe, it, expect } from 'vitest'
import KybFullForm from '~/components/features/kyb/ProfileFullSteps/KybFullForm.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'

const baseEntity = (overrides: Record<string, unknown> = {}) => ({
  id: 'ent-1',
  legalName: 'Acme SRL',
  jurisdiction: 'BO',
  ...overrides,
})

describe('KybFullForm — validaciones + emits per-entity', () => {
  it('submit con address vacía: NO emite, popula error addressIncomplete', async () => {
    const w = mountComponent(KybFullForm, { props: { entity: baseEntity() } })
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('Completá calle, ciudad y país')
  })

  it('shareCapital sin currency: rechaza con shareCapitalNeedsCurrency', async () => {
    const w = mountComponent(KybFullForm, { props: { entity: baseEntity() } })
    await w.find('#kyb-ent-1-street').setValue('Av X')
    await w.find('#kyb-ent-1-city').setValue('La Paz')
    await w.find('#kyb-ent-1-country').setValue('BO')
    await w.find('#kyb-ent-1-shareCapital').setValue('1000')
    // currency vacía
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('Cargá moneda y monto juntos')
  })

  it('shareCapital + currency juntos: payload incluye ambos como números', async () => {
    const w = mountComponent(KybFullForm, { props: { entity: baseEntity() } })
    await w.find('#kyb-ent-1-street').setValue('Av X')
    await w.find('#kyb-ent-1-city').setValue('La Paz')
    await w.find('#kyb-ent-1-country').setValue('BO')
    await w.find('#kyb-ent-1-shareCapital').setValue('25000')
    await w.find('#kyb-ent-1-shareCapitalCurrency').setValue('USD')
    await w.find('form').trigger('submit')

    const emitted = w.emitted('submit')
    expect(emitted).toBeDefined()
    const evt = emitted![0][0] as { entityId: string; payload: Record<string, unknown> }
    expect(evt.entityId).toBe('ent-1')
    expect(evt.payload).toMatchObject({
      shareCapital: 25000,
      shareCapitalCurrency: 'USD',
    })
    expect(evt.payload.registeredAddress).toMatchObject({ street: 'Av X', city: 'La Paz', country: 'BO' })
  })

  it('jurisdiction !== US: NO renderea registeredState ni agent', () => {
    const w = mountComponent(KybFullForm, { props: { entity: baseEntity({ jurisdiction: 'BO' }) } })
    expect(w.find('#kyb-ent-1-registeredState').exists()).toBe(false)
    expect(w.find('#kyb-ent-1-agentName').exists()).toBe(false)
  })

  it('jurisdiction === US: renderea registeredState + agent y los incluye en payload', async () => {
    const w = mountComponent(KybFullForm, { props: { entity: baseEntity({ id: 'us-1', jurisdiction: 'US' }) } })
    expect(w.find('#kyb-us-1-registeredState').exists()).toBe(true)
    await w.find('#kyb-us-1-street').setValue('1 Main St')
    await w.find('#kyb-us-1-city').setValue('Wilmington')
    await w.find('#kyb-us-1-country').setValue('US')
    await w.find('#kyb-us-1-registeredState').setValue('DE')
    await w.find('#kyb-us-1-agentName').setValue('Corporation Service Co')
    await w.find('#kyb-us-1-agentAddress').setValue('251 Little Falls Dr')
    await w.find('form').trigger('submit')

    const evt = w.emitted('submit')![0][0] as { payload: Record<string, unknown> }
    expect(evt.payload.registeredState).toBe('DE')
    expect(evt.payload.registeredAgent).toMatchObject({
      name: 'Corporation Service Co',
      address: '251 Little Falls Dr',
    })
  })

  it('initial hidrata desde entity.registeredAddress + shareCapital', async () => {
    const w = mountComponent(KybFullForm, {
      props: {
        entity: baseEntity({
          id: 'pre',
          registeredAddress: { street: 'Pre', city: 'PreCity', country: 'AR' },
          shareCapital: 5000,
          shareCapitalCurrency: 'ARS',
        }),
      },
    })
    expect((w.find('#kyb-pre-street').element as HTMLInputElement).value).toBe('Pre')
    expect((w.find('#kyb-pre-shareCapital').element as HTMLInputElement).value).toBe('5000')
    expect((w.find('#kyb-pre-shareCapitalCurrency').element as HTMLSelectElement).value).toBe('ARS')
  })

  it('a11y: aria-required + entitySelector visible en header', async () => {
    const w = mountComponent(KybFullForm, { props: { entity: baseEntity() } })
    expect(w.find('#kyb-ent-1-street').attributes('aria-required')).toBe('true')
    expect(w.html()).toContain('Acme SRL')
  })
})
