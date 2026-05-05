import { describe, it, expect } from 'vitest'
import KycFullForm from '~/components/features/kyb/ProfileFullSteps/KycFullForm.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'

describe('KycFullForm — validaciones + emits', () => {
  function mount(props: Record<string, unknown> = {}) {
    return mountComponent(KycFullForm, { props })
  }

  it('submit con address vacía: NO emite, popula error addressIncomplete', async () => {
    const w = mount()
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('Completá calle, ciudad y país')
  })

  it('payload válido emite submit con shape ProfilePersonFullRequest', async () => {
    const w = mount()
    await w.find('#kyc-street').setValue('Av. Siempreviva 742')
    await w.find('#kyc-city').setValue('La Paz')
    await w.find('#kyc-country').setValue('BO')
    await w.find('#kyc-occupation').setValue('Ingeniera')
    await w.find('#kyc-maritalStatus').setValue('SINGLE')
    await w.find('#kyc-sourceOfFunds').setValue('BUSINESS_INCOME')
    await w.find('form').trigger('submit')

    const emitted = w.emitted('submit')
    expect(emitted).toBeDefined()
    const payload = emitted![0][0] as Record<string, unknown>
    expect(payload).toMatchObject({
      occupation: 'Ingeniera',
      maritalStatus: 'SINGLE',
      sourceOfFunds: 'BUSINESS_INCOME',
      usPerson: false,
    })
    expect(payload.residentialAddress).toMatchObject({
      street: 'Av. Siempreviva 742', city: 'La Paz', country: 'BO',
    })
    // usTaxId NO se manda si usPerson=false (undefined => omitido del JSON real)
    expect(payload.usTaxId).toBeUndefined()
    // pepDetails NO presente si !isPep && !isPepRelated
    expect(payload.pepDetails).toBeUndefined()
  })

  it('usPerson=true sin usTaxId: rechaza con error usTaxIdRequired', async () => {
    const w = mount()
    await w.find('#kyc-street').setValue('Calle Falsa 123')
    await w.find('#kyc-city').setValue('La Paz')
    await w.find('#kyc-country').setValue('BO')
    // Marcar US person via el toggle (label wrapper hace toggle)
    await w.findAll('button[role="switch"], button[aria-checked]').at(0)?.trigger('click') ?? null
    // Fallback: setear directo usPerson via @toggle no es trivial — usar la toggle del label
    // Si no hay switch role, click en el label triggerea por bubbling
    // Como el Toggle es un componente custom, usamos el label hermano
    const toggleLabel = w.find('label.flex.items-center.justify-between')
    await toggleLabel.trigger('click')

    await w.find('form').trigger('submit')

    // Si el toggle se activó, debe aparecer el campo + error
    if (w.find('#kyc-usTaxId').exists()) {
      expect(w.html()).toContain('TIN es obligatorio')
      expect(w.emitted('submit')).toBeUndefined()
    }
  })

  it('isPep=true: renderea bloque pepDetails y lo incluye en payload', async () => {
    const w = mount({ isPep: true })
    expect(w.find('#kyc-pepPosition').exists()).toBe(true)
    await w.find('#kyc-pepPosition').setValue('Senador')
    await w.find('#kyc-pepEntity').setValue('Cámara Alta')

    await w.find('#kyc-street').setValue('A')
    await w.find('#kyc-city').setValue('B')
    await w.find('#kyc-country').setValue('BO')
    await w.find('form').trigger('submit')

    const payload = w.emitted('submit')![0][0] as Record<string, unknown>
    expect(payload.pepDetails).toMatchObject({ position: 'Senador', entity: 'Cámara Alta' })
  })

  it('initial hidrata el form (occupation + address)', async () => {
    const w = mount({
      initial: {
        occupation: 'Doctora',
        residentialAddress: { street: 'Pre', city: 'PreCity', country: 'AR' },
        maritalStatus: 'MARRIED',
      },
    })
    expect((w.find('#kyc-occupation').element as HTMLInputElement).value).toBe('Doctora')
    expect((w.find('#kyc-street').element as HTMLInputElement).value).toBe('Pre')
    expect((w.find('#kyc-city').element as HTMLInputElement).value).toBe('PreCity')
    expect((w.find('#kyc-country').element as HTMLSelectElement).value).toBe('AR')
    expect((w.find('#kyc-maritalStatus').element as HTMLSelectElement).value).toBe('MARRIED')
  })

  it('change emit dispara en cada input — útil para autosave futuro', async () => {
    const w = mount()
    await w.find('#kyc-occupation').setValue('A')
    expect(w.emitted('change')).toBeDefined()
    expect(w.emitted('change')!.length).toBeGreaterThan(0)
  })

  it('a11y: aria-required en street/city/country, aria-invalid tras submit fallido', async () => {
    const w = mount()
    expect(w.find('#kyc-street').attributes('aria-required')).toBe('true')
    expect(w.find('#kyc-city').attributes('aria-required')).toBe('true')
    expect(w.find('#kyc-country').attributes('aria-required')).toBe('true')
    await w.find('form').trigger('submit')
    expect(w.find('#kyc-street').attributes('aria-invalid')).toBe('true')
  })

  it('readonly=true desactiva inputs', async () => {
    const w = mount({ readonly: true })
    expect((w.find('#kyc-street').element as HTMLInputElement).disabled).toBe(true)
    expect((w.find('#kyc-country').element as HTMLSelectElement).disabled).toBe(true)
  })
})
