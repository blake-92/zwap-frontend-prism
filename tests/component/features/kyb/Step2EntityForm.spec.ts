import { describe, it, expect, vi } from 'vitest'
import Step2EntityForm from '~/components/features/kyb/steps/Step2EntityForm.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'

// EconomicActivitySearch hace fetch al mount → stub api.searchEconomicActivities.
vi.mock('~/composables/kyb/useKybApi', () => ({
  useKybApi: () => ({
    searchEconomicActivities: vi.fn().mockResolvedValue([]),
  }),
}))

describe('Step2EntityForm — validaciones por jurisdicción', () => {
  function mount(initial = {}) {
    return mountComponent(Step2EntityForm, { props: { initial } })
  }

  it('submit con campos requeridos vacíos: NO emite', async () => {
    const w = mount()
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
  })

  it('payload mínimo válido emite submit', async () => {
    const w = mount()
    await w.find('#step2-entityType').setValue('SRL')
    await w.find('#step2-legalName').setValue('Hotel SRL')
    await w.find('#step2-jurisdiction').setValue('BO')
    await w.find('form').trigger('submit')

    const emitted = w.emitted('submit')
    expect(emitted).toBeDefined()
    expect(emitted![0][0]).toMatchObject({
      entityType: 'SRL',
      legalName: 'Hotel SRL',
      jurisdiction: 'BO',
    })
  })

  it('taxId BO inválido (no son 7-10 dígitos): rechaza con mensaje', async () => {
    const w = mount()
    await w.find('#step2-entityType').setValue('SRL')
    await w.find('#step2-legalName').setValue('Hotel SRL')
    await w.find('#step2-jurisdiction').setValue('BO')
    await w.find('#step2-taxId').setValue('abc') // no es solo dígitos
    await w.find('form').trigger('submit')

    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('ID tributario')
  })

  it('taxId BO válido (7 dígitos) emite OK', async () => {
    const w = mount()
    await w.find('#step2-entityType').setValue('SRL')
    await w.find('#step2-legalName').setValue('Hotel SRL')
    await w.find('#step2-jurisdiction').setValue('BO')
    await w.find('#step2-taxId').setValue('1234567')
    await w.find('form').trigger('submit')

    expect(w.emitted('submit')).toBeDefined()
  })

  it('taxId US válido (EIN NN-NNNNNNN)', async () => {
    const w = mount()
    await w.find('#step2-entityType').setValue('LLC')
    await w.find('#step2-legalName').setValue('Hotel LLC')
    await w.find('#step2-jurisdiction').setValue('US')
    await w.find('#step2-taxId').setValue('12-3456789')
    await w.find('form').trigger('submit')

    expect(w.emitted('submit')).toBeDefined()
  })

  it('jurisdicción no validada: NO valida formato (taxId pasa libre)', async () => {
    const w = mount()
    await w.find('#step2-entityType').setValue('OTHER')
    await w.find('#step2-legalName').setValue('Other Co')
    await w.find('#step2-jurisdiction').setValue('CL') // Chile no está en TAX_ID_PATTERNS
    await w.find('#step2-taxId').setValue('cualquier-cosa-rara')
    await w.find('form').trigger('submit')

    // No emite porque CL no está pero entityType+legalName+jurisdiction sí — el form pasa
    expect(w.emitted('submit')).toBeDefined()
  })
})
