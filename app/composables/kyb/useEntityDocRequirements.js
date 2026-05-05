import './types' // JSDoc-only side-effect import

/**
 * Mapa entityType → docs requeridos en submit. Espejo de la tabla del doc backend §2:
 *
 * | entityType        | docs person                              | docs entity                                                                       |
 * |-------------------|------------------------------------------|-----------------------------------------------------------------------------------|
 * | NATURAL_PERSON    | identidad (CI_BO/PASSPORT/DNI) + SELFIE  | (ninguno)                                                                          |
 * | SOLE_PROPRIETOR   | identidad + SELFIE                       | TAX_REGISTRATION                                                                   |
 * | SRL / SA (BO)     | identidad + SELFIE                       | TAX_REGISTRATION + INCORPORATION_DEED + POWER_OF_ATTORNEY + FUNDEMPRESA_REGISTRATION |
 * | LLC / INC (US)    | identidad + SELFIE                       | TAX_REGISTRATION + INCORPORATION_DEED + EIN_CONFIRMATION_LETTER + BOI_REPORT       |
 * | OTHER             | identidad + SELFIE                       | TAX_REGISTRATION + INCORPORATION_DEED                                              |
 *
 * "identidad" significa exactly UNO de los 3 tipos del set: el user elige según el país.
 *
 * El backend valida los docs en `POST /submit` y devuelve 409 `kyb_invalid_data` si falta
 * alguno. La UI consume este mapa para decidir qué uploaders renderear y mostrar progress
 * (ej. "2 de 4 docs requeridos subidos").
 *
 * Función pura, sin estado, SSR-safe. NO usa composables de Vue — exporta como composable
 * por convención del repo (los `useXxx` agrupan funciones relacionadas a una feature aunque
 * no consuman reactivity).
 */

/**
 * Set de tipos que cumplen el requisito "identidad". El user elige uno.
 * @type {readonly import('./types').PersonDocumentType[]}
 */
export const IDENTITY_DOCUMENT_OPTIONS = Object.freeze(['CI_BO', 'PASSPORT', 'DNI'])

/**
 * Tabla autoritativa. Frozen para evitar mutación accidental por un consumer.
 * @type {Readonly<Record<import('./types').EntityType, {
 *   personDocs: ReadonlyArray<'IDENTITY' | import('./types').PersonDocumentType>,
 *   entityDocs: ReadonlyArray<import('./types').EntityDocumentType>,
 * }>>}
 */
const REQUIREMENTS_BY_ENTITY = Object.freeze({
  NATURAL_PERSON: Object.freeze({
    personDocs: Object.freeze(['IDENTITY', 'SELFIE']),
    entityDocs: Object.freeze([]),
  }),
  SOLE_PROPRIETOR: Object.freeze({
    personDocs: Object.freeze(['IDENTITY', 'SELFIE']),
    entityDocs: Object.freeze(['TAX_REGISTRATION']),
  }),
  SRL: Object.freeze({
    personDocs: Object.freeze(['IDENTITY', 'SELFIE']),
    entityDocs: Object.freeze(['TAX_REGISTRATION', 'INCORPORATION_DEED', 'POWER_OF_ATTORNEY', 'FUNDEMPRESA_REGISTRATION']),
  }),
  SA: Object.freeze({
    personDocs: Object.freeze(['IDENTITY', 'SELFIE']),
    entityDocs: Object.freeze(['TAX_REGISTRATION', 'INCORPORATION_DEED', 'POWER_OF_ATTORNEY', 'FUNDEMPRESA_REGISTRATION']),
  }),
  LLC: Object.freeze({
    personDocs: Object.freeze(['IDENTITY', 'SELFIE']),
    entityDocs: Object.freeze(['TAX_REGISTRATION', 'INCORPORATION_DEED', 'EIN_CONFIRMATION_LETTER', 'BOI_REPORT']),
  }),
  INC: Object.freeze({
    personDocs: Object.freeze(['IDENTITY', 'SELFIE']),
    entityDocs: Object.freeze(['TAX_REGISTRATION', 'INCORPORATION_DEED', 'EIN_CONFIRMATION_LETTER', 'BOI_REPORT']),
  }),
  OTHER: Object.freeze({
    personDocs: Object.freeze(['IDENTITY', 'SELFIE']),
    entityDocs: Object.freeze(['TAX_REGISTRATION', 'INCORPORATION_DEED']),
  }),
})

/**
 * @param {import('./types').EntityType} entityType
 * @returns {{
 *   personDocs: ReadonlyArray<'IDENTITY' | import('./types').PersonDocumentType>,
 *   entityDocs: ReadonlyArray<import('./types').EntityDocumentType>,
 *   identityOptions: readonly import('./types').PersonDocumentType[],
 * }}
 *
 * `personDocs` puede contener el placeholder `'IDENTITY'` que el caller resuelve a uno de
 * `identityOptions` (CI_BO / PASSPORT / DNI) según preferencia del user.
 *
 * Throw si entityType no es un valor del enum — fail fast.
 */
export function useEntityDocRequirements(entityType) {
  const config = REQUIREMENTS_BY_ENTITY[entityType]
  if (!config) {
    throw new Error(`useEntityDocRequirements: entityType desconocido "${entityType}". Esperado uno de: ${Object.keys(REQUIREMENTS_BY_ENTITY).join(', ')}`)
  }
  return {
    personDocs: config.personDocs,
    entityDocs: config.entityDocs,
    identityOptions: IDENTITY_DOCUMENT_OPTIONS,
  }
}

/**
 * Helper que cuenta cuántos docs requeridos tiene el caller — útil para progress UI.
 * @param {import('./types').EntityType} entityType
 * @returns {{ totalPerson: number, totalEntity: number, total: number }}
 */
export function countRequirements(entityType) {
  const { personDocs, entityDocs } = useEntityDocRequirements(entityType)
  return {
    totalPerson: personDocs.length,
    totalEntity: entityDocs.length,
    total: personDocs.length + entityDocs.length,
  }
}
