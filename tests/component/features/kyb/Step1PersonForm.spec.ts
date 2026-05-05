import { describe, it, expect, vi } from 'vitest'
import Step1PersonForm from '~/components/features/kyb/steps/Step1PersonForm.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'

describe('Step1PersonForm — validaciones + emits', () => {
  function mount(initial = {}) {
    return mountComponent(Step1PersonForm, { props: { initial } })
  }

  it('submit con campos requeridos vacíos: NO emite, popula errores aria', async () => {
    const w = mount()
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()

    // Cada error debería renderizarse con role=alert
    const alerts = w.findAll('[role="alert"]')
    expect(alerts.length).toBeGreaterThanOrEqual(3) // givenName + familyName + dateOfBirth + nationality
  })

  it('payload válido emite submit con shape correcto', async () => {
    const w = mount()
    await w.find('#step1-givenName').setValue('Ana')
    await w.find('#step1-familyName').setValue('Lopez')
    await w.find('#step1-dateOfBirth').setValue('1990-05-12')
    await w.find('#step1-nationality').setValue('BO')
    await w.find('form').trigger('submit')

    const emitted = w.emitted('submit')
    expect(emitted).toBeDefined()
    expect(emitted![0][0]).toMatchObject({
      givenName: 'Ana',
      familyName: 'Lopez',
      dateOfBirth: '1990-05-12',
      nationality: 'BO',
      isPep: false,
      isPepRelated: false,
    })
  })

  it('edad < 18: rechaza con error específico', async () => {
    const w = mount()
    await w.find('#step1-givenName').setValue('Ana')
    await w.find('#step1-familyName').setValue('Lopez')
    // 5 años atrás — definitivamente menor de 18
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    await w.find('#step1-dateOfBirth').setValue(fiveYearsAgo.toISOString().slice(0, 10))
    await w.find('#step1-nationality').setValue('BO')
    await w.find('form').trigger('submit')

    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('mayor de 18') // i18n key kyb.step1.errors.dateOfBirthUnderage
  })

  it('email inválido: rechaza', async () => {
    const w = mount()
    await w.find('#step1-givenName').setValue('Ana')
    await w.find('#step1-familyName').setValue('Lopez')
    await w.find('#step1-dateOfBirth').setValue('1990-05-12')
    await w.find('#step1-nationality').setValue('BO')
    await w.find('#step1-email').setValue('not-an-email')
    await w.find('form').trigger('submit')

    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('Email inválido')
  })

  it('initial hidrata el form', async () => {
    const w = mount({
      givenName: 'Pre', familyName: 'Filled', dateOfBirth: '1985-01-01', nationality: 'AR', isPep: true,
    })
    expect((w.find('#step1-givenName').element as HTMLInputElement).value).toBe('Pre')
    expect((w.find('#step1-familyName').element as HTMLInputElement).value).toBe('Filled')
    expect((w.find('#step1-dateOfBirth').element as HTMLInputElement).value).toBe('1985-01-01')
    expect((w.find('#step1-nationality').element as HTMLSelectElement).value).toBe('AR')
  })

  it('change emit dispara en cada input — útil para autosave futuro', async () => {
    const w = mount()
    await w.find('#step1-givenName').setValue('A')
    expect(w.emitted('change')).toBeDefined()
    expect(w.emitted('change')!.length).toBeGreaterThan(0)
  })

  it('a11y: aria-required + aria-invalid en campos required', async () => {
    const w = mount()
    const required = ['#step1-givenName', '#step1-familyName', '#step1-dateOfBirth', '#step1-nationality']
    for (const sel of required) {
      const el = w.find(sel)
      expect(el.attributes('aria-required')).toBe('true')
    }
    // Trigger submit para popular errors
    await w.find('form').trigger('submit')
    expect(w.find('#step1-givenName').attributes('aria-invalid')).toBe('true')
  })
})
