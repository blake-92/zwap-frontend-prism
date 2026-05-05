import { describe, it, expect } from 'vitest'
import Step3RolesForm from '~/components/features/kyb/steps/Step3RolesForm.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'

describe('Step3RolesForm — validaciones de roles', () => {
  function mount(initial = {}, entityType = 'SRL') {
    return mountComponent(Step3RolesForm, { props: { initial, entityType } })
  }

  it('default: 1 LEGAL_REPRESENTATIVE pre-cargado', () => {
    const w = mount()
    expect(w.html()).toContain('Representante Legal')
  })

  it('submit sin LEGAL_REPRESENTATIVE: error global', async () => {
    const w = mount({
      roles: [{
        role: 'BENEFICIAL_OWNER',
        givenName: 'Ana', familyName: 'Lopez', dateOfBirth: '1990-05-12', nationality: 'BO',
        ownershipPercentage: '100',
      }],
    })
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('al menos un representante legal')
  })

  it('ownership > 100%: error global', async () => {
    const w = mount({
      roles: [
        { role: 'LEGAL_REPRESENTATIVE', givenName: 'Ana', familyName: 'Lopez', dateOfBirth: '1990-05-12', nationality: 'BO' },
        { role: 'BENEFICIAL_OWNER', givenName: 'Bob', familyName: 'Smith', dateOfBirth: '1985-01-01', nationality: 'US', ownershipPercentage: '60' },
        { role: 'BENEFICIAL_OWNER', givenName: 'Eve', familyName: 'Jones', dateOfBirth: '1985-01-01', nationality: 'US', ownershipPercentage: '50' },
      ],
    }, 'SRL')
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('no puede superar 100%')
  })

  it('BO entityType=SRL: ownership debe ser ≥25% (threshold no-natural)', async () => {
    const w = mount({
      roles: [
        { role: 'LEGAL_REPRESENTATIVE', givenName: 'Ana', familyName: 'Lopez', dateOfBirth: '1990-05-12', nationality: 'BO' },
        { role: 'BENEFICIAL_OWNER', givenName: 'Bob', familyName: 'Smith', dateOfBirth: '1985-01-01', nationality: 'US', ownershipPercentage: '15' },
      ],
    }, 'SRL')
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
    expect(w.html()).toContain('≥10% para BOs')
  })

  it('BO entityType=NATURAL_PERSON: ownership debe ser ≥10%', async () => {
    const w = mount({
      roles: [
        { role: 'LEGAL_REPRESENTATIVE', givenName: 'Ana', familyName: 'Lopez', dateOfBirth: '1990-05-12', nationality: 'BO' },
        { role: 'BENEFICIAL_OWNER', givenName: 'Bob', familyName: 'Smith', dateOfBirth: '1985-01-01', nationality: 'US', ownershipPercentage: '5' },
      ],
    }, 'NATURAL_PERSON')
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')).toBeUndefined()
  })

  it('payload válido: 1 BO 100% + 1 LEGAL_REP → emite submit', async () => {
    const w = mount({
      roles: [
        { role: 'LEGAL_REPRESENTATIVE', givenName: 'Ana', familyName: 'Lopez', dateOfBirth: '1990-05-12', nationality: 'BO' },
        { role: 'BENEFICIAL_OWNER', givenName: 'Ana', familyName: 'Lopez', dateOfBirth: '1990-05-12', nationality: 'BO', ownershipPercentage: '100' },
      ],
    }, 'SRL')
    await w.find('form').trigger('submit')
    const emitted = w.emitted('submit')
    expect(emitted).toBeDefined()
    expect(emitted![0][0].roles).toHaveLength(2)
    expect(emitted![0][0].roles[1].ownershipPercentage).toBe(100)
  })
})
