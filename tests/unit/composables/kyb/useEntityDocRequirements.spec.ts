import { describe, it, expect } from 'vitest'
import {
  useEntityDocRequirements,
  countRequirements,
  IDENTITY_DOCUMENT_OPTIONS,
} from '~/composables/kyb/useEntityDocRequirements'

// Tabla espejo de la del backend doc §2 — duplicada acá adrede para que cualquier cambio
// silencioso en el composable rompa los specs.
const EXPECTED = {
  NATURAL_PERSON: {
    personDocs: ['IDENTITY', 'SELFIE'],
    entityDocs: [],
  },
  SOLE_PROPRIETOR: {
    personDocs: ['IDENTITY', 'SELFIE'],
    entityDocs: ['TAX_REGISTRATION'],
  },
  SRL: {
    personDocs: ['IDENTITY', 'SELFIE'],
    entityDocs: ['TAX_REGISTRATION', 'INCORPORATION_DEED', 'POWER_OF_ATTORNEY', 'FUNDEMPRESA_REGISTRATION'],
  },
  SA: {
    personDocs: ['IDENTITY', 'SELFIE'],
    entityDocs: ['TAX_REGISTRATION', 'INCORPORATION_DEED', 'POWER_OF_ATTORNEY', 'FUNDEMPRESA_REGISTRATION'],
  },
  LLC: {
    personDocs: ['IDENTITY', 'SELFIE'],
    entityDocs: ['TAX_REGISTRATION', 'INCORPORATION_DEED', 'EIN_CONFIRMATION_LETTER', 'BOI_REPORT'],
  },
  INC: {
    personDocs: ['IDENTITY', 'SELFIE'],
    entityDocs: ['TAX_REGISTRATION', 'INCORPORATION_DEED', 'EIN_CONFIRMATION_LETTER', 'BOI_REPORT'],
  },
  OTHER: {
    personDocs: ['IDENTITY', 'SELFIE'],
    entityDocs: ['TAX_REGISTRATION', 'INCORPORATION_DEED'],
  },
}

describe('useEntityDocRequirements — tabla §2 (todos los entityType)', () => {
  for (const [entityType, expected] of Object.entries(EXPECTED)) {
    it(`${entityType}: docs requeridos correctos`, () => {
      const result = useEntityDocRequirements(entityType)
      expect([...result.personDocs]).toEqual(expected.personDocs)
      expect([...result.entityDocs]).toEqual(expected.entityDocs)
      expect([...result.identityOptions]).toEqual(['CI_BO', 'PASSPORT', 'DNI'])
    })
  }

  it('IDENTITY_DOCUMENT_OPTIONS exporta los 3 tipos válidos', () => {
    expect([...IDENTITY_DOCUMENT_OPTIONS]).toEqual(['CI_BO', 'PASSPORT', 'DNI'])
  })

  it('throw con entityType desconocido — fail fast', () => {
    expect(() => useEntityDocRequirements('FOO_BAR')).toThrowError(/entityType desconocido "FOO_BAR"/)
  })

  it('arrays son frozen — no se pueden mutar accidentalmente', () => {
    const { personDocs, entityDocs } = useEntityDocRequirements('SRL')
    expect(Object.isFrozen(personDocs)).toBe(true)
    expect(Object.isFrozen(entityDocs)).toBe(true)
  })
})

describe('countRequirements', () => {
  it('NATURAL_PERSON: 2 person + 0 entity = 2 total', () => {
    expect(countRequirements('NATURAL_PERSON')).toEqual({ totalPerson: 2, totalEntity: 0, total: 2 })
  })

  it('SRL: 2 person + 4 entity = 6 total', () => {
    expect(countRequirements('SRL')).toEqual({ totalPerson: 2, totalEntity: 4, total: 6 })
  })

  it('LLC: 2 person + 4 entity = 6 total', () => {
    expect(countRequirements('LLC')).toEqual({ totalPerson: 2, totalEntity: 4, total: 6 })
  })

  it('throw con entityType desconocido', () => {
    expect(() => countRequirements('NOT_REAL')).toThrow()
  })
})
