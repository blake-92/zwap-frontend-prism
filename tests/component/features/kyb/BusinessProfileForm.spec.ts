import { describe, it, expect } from 'vitest'
import BusinessProfileForm from '~/components/features/kyb/ProfileFullSteps/BusinessProfileForm.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'

const validBase = async (w: ReturnType<typeof mountComponent>) => {
  await w.find('#bp-websiteUrl').setValue('https://acme.example')
  await w.find('#bp-productsDescription').setValue('Vendemos cursos online de programación.')
  await w.find('#bp-mccCode').setValue('5045')
  await w.find('#bp-expectedAvgTransactionCents').setValue('1000')
  await w.find('#bp-expectedMaxTransactionCents').setValue('5000')
  await w.find('#bp-expectedPayerCountries').setValue('BO, AR')
  // marcar al menos un payment method (CARD_LOCAL es la primera)
  await w.findAll('input[type="checkbox"]')[0].setValue(true)
}

describe('BusinessProfileForm — validaciones Stripe-style + emits', () => {
  it('submit vacío: rechaza con websiteOrReasonRequired + productsDescriptionShort + paymentMethodsRequired', async () => {
    const w = mountComponent(BusinessProfileForm)
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    const html = w.html()
    expect(html).toContain('URL del sitio O motivo de no tener')
    expect(html).toContain('Mínimo 10 caracteres')
    expect(html).toContain('Seleccioná al menos un método')
  })

  it('toggle noWebsite: cambia campo a noWebsiteReason; vacío rechaza con error', async () => {
    const w = mountComponent(BusinessProfileForm)
    // Click en el primer label-toggle (no website)
    const toggleLabel = w.find('label.flex.items-center.justify-between')
    await toggleLabel.trigger('click')

    expect(w.find('#bp-noWebsiteReason').exists()).toBe(true)
    expect(w.find('#bp-websiteUrl').exists()).toBe(false)

    await w.find('form').trigger('submit')
    expect(w.html()).toContain('Indicá el motivo si no tenés sitio')
  })

  it('mccCode con 5 dígitos: rechaza con mccInvalid', async () => {
    const w = mountComponent(BusinessProfileForm)
    await validBase(w)
    await w.find('#bp-mccCode').setValue('12345')
    await w.find('form').trigger('submit')
    expect(w.html()).toContain('MCC debe ser 4 dígitos')
    expect(w.emitted('submit')).toBeUndefined()
  })

  it('avg > max: rechaza con amountsInverted', async () => {
    const w = mountComponent(BusinessProfileForm)
    await validBase(w)
    await w.find('#bp-expectedAvgTransactionCents').setValue('9999')
    await w.find('#bp-expectedMaxTransactionCents').setValue('1000')
    await w.find('form').trigger('submit')
    expect(w.html()).toContain('Promedio mayor que máximo')
    expect(w.emitted('submit')).toBeUndefined()
  })

  it('países con código inválido (BOL): rechaza con countriesInvalid', async () => {
    const w = mountComponent(BusinessProfileForm)
    await validBase(w)
    await w.find('#bp-expectedPayerCountries').setValue('BOL, AR')
    await w.find('form').trigger('submit')
    expect(w.html()).toContain('Códigos de país inválidos')
    expect(w.emitted('submit')).toBeUndefined()
  })

  it('refundPolicy con URL inválida (no http): rechaza con policyUrlInvalid', async () => {
    const w = mountComponent(BusinessProfileForm)
    await validBase(w)
    await w.find('#bp-refundPolicy').setValue('not-a-url')
    await w.find('form').trigger('submit')
    expect(w.html()).toContain('URL inválida')
    expect(w.emitted('submit')).toBeUndefined()
  })

  it('payload válido emite submit con shape BusinessProfileRequest', async () => {
    const w = mountComponent(BusinessProfileForm)
    await validBase(w)
    await w.find('#bp-expectedMonthlyVolumeCents').setValue('500000')
    await w.find('#bp-refundPolicy').setValue('https://acme.example/refund')
    await w.find('form').trigger('submit')

    const emitted = w.emitted('submit')
    expect(emitted).toBeDefined()
    const payload = emitted![0][0] as Record<string, unknown>
    expect(payload).toMatchObject({
      websiteUrl: 'https://acme.example',
      productsDescription: 'Vendemos cursos online de programación.',
      mccCode: '5045',
      expectedMonthlyVolumeCents: 500000,
      expectedAvgTransactionCents: 1000,
      expectedMaxTransactionCents: 5000,
      refundPolicy: 'https://acme.example/refund',
    })
    expect(payload.expectedPayerCountries).toEqual(['BO', 'AR'])
    expect(Array.isArray(payload.expectedPaymentMethods)).toBe(true)
    expect((payload.expectedPaymentMethods as string[]).length).toBeGreaterThan(0)
    expect(payload.noWebsiteReason).toBeUndefined()
  })

  it('initial.expectedPaymentMethods hidrata checkboxes', () => {
    const w = mountComponent(BusinessProfileForm, {
      props: {
        initial: {
          expectedPaymentMethods: ['CARD_LOCAL', 'BANK_TRANSFER'],
          expectedPayerCountries: ['BO'],
          websiteUrl: 'https://x.example',
        },
      },
    })
    const checked = w.findAll('input[type="checkbox"]').filter((c) => (c.element as HTMLInputElement).checked)
    expect(checked.length).toBe(2)
    expect((w.find('#bp-expectedPayerCountries').element as HTMLInputElement).value).toBe('BO')
  })

  it('readonly=true: deshabilita textarea + selects', () => {
    const w = mountComponent(BusinessProfileForm, { props: { readonly: true } })
    expect((w.find('#bp-productsDescription').element as HTMLTextAreaElement).disabled).toBe(true)
    expect((w.find('#bp-websiteUrl').element as HTMLInputElement).disabled).toBe(true)
  })
})
