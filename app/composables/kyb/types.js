// Typedefs JSDoc — espejo del OpenAPI del backend (commit 2d829e9 zwap-backend).
// Fuente única de verdad para los composables y forms del módulo KYB. Cuando el backend
// regenere el OpenAPI, ejecutar diff manual contra este archivo y actualizar.
//
// Si en el futuro se migra el módulo a TS (extracción a microservicio frontend), convertir
// todos los `@typedef` a `interface` / `type` y este archivo se vuelve `types.ts`. Los
// consumers no necesitan cambios — el JSDoc ya da type checking en VS Code.
//
// NOTA: NO importar nada de afuera del módulo `composables/kyb/*` acá. Este archivo es la
// raíz de la dependency tree del módulo y debe ser extraíble standalone.

// ── Enums (autoritativos del backend) ────────────────────────────────────────────────────────

/** @typedef {'NATURAL_PERSON' | 'SOLE_PROPRIETOR' | 'SRL' | 'SA' | 'LLC' | 'INC' | 'OTHER'} EntityType */

/** @typedef {'BENEFICIAL_OWNER' | 'LEGAL_REPRESENTATIVE' | 'DIRECTOR' | 'AUTHORIZED_SIGNATORY'} RoleCode */

/** @typedef {'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED'} KybApplicationState */

/** @typedef {'NONE' | 'BASIC' | 'FULL'} ActivationLevel */

/** @typedef {'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED' | 'GRANDFATHERED'} KybMerchantState */

/** @typedef {'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED'} BusinessProfileStatus */

/**
 * Tipos de documento KYC del owner.
 * @typedef {'CI_BO' | 'PASSPORT' | 'DNI' | 'SELFIE' | 'PROOF_OF_ADDRESS' | 'BANK_STATEMENT'} PersonDocumentType
 */

/**
 * Tipos de documento KYB del entity.
 * @typedef {'TAX_REGISTRATION' | 'INCORPORATION_DEED' | 'POWER_OF_ATTORNEY' | 'FUNDEMPRESA_REGISTRATION' | 'EIN_CONFIRMATION_LETTER' | 'BOI_REPORT'} EntityDocumentType
 */

/** @typedef {'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER'} MaritalStatus */

/** @typedef {'BUSINESS_INCOME' | 'EMPLOYMENT' | 'INVESTMENTS' | 'INHERITANCE' | 'SAVINGS' | 'OTHER'} SourceOfFunds */

/** @typedef {'CARD_LOCAL' | 'CARD_INTERNATIONAL' | 'BANK_TRANSFER' | 'WALLET_LOCAL' | 'CASH' | 'CRYPTO'} PaymentMethod */

// ── Address (compartido entre Person, Entity y Branch) ─────────────────────────────────────────

/**
 * @typedef {object} Address
 * @property {string} street          requerido — maxLength 200
 * @property {string} city            requerido — maxLength 120
 * @property {string} country         requerido — ISO 3166 alpha-2 (`[A-Z]{2}`)
 * @property {string} [region]        opcional — maxLength 120
 * @property {string} [postalCode]    opcional — maxLength 20
 */

// ── Wizard KYB anónimo ─────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} KybStartRequest
 * @property {string} [ownerEmail]    opcional — si matchea un user con Person VERIFIED, el response trae personHeritable
 */

/**
 * @typedef {object} PersonPreview
 * @property {string} id              uuid
 * @property {string} givenName
 * @property {string} familyName
 * @property {string} kycVerifiedAt   ISO date-time
 */

/**
 * @typedef {object} KybStartResponse
 * @property {string} applicationId   uuid del draft
 * @property {string} applicationToken raw, único — persistir como cookie + header fallback
 * @property {KybApplicationState} state inicial siempre 'DRAFT'
 * @property {boolean} [personHeritable] true si el caller está logueado y tiene Person VERIFIED
 * @property {PersonPreview} [personPreview]
 */

/**
 * @typedef {object} KybApplicationView
 * @property {string} applicationId
 * @property {KybApplicationState} state
 * @property {string} ownerEmail
 * @property {string} [personId]
 * @property {string} [primaryLegalEntityId]
 * @property {string} [additionalLegalEntityId]
 * @property {string} [primaryCurrency]
 * @property {string} [additionalCurrency]
 * @property {string} [merchantDisplayName]
 * @property {Array<object>} [branchesDeclared]
 * @property {boolean} [requiresEnhancedDueDiligence]
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} expiresAt
 * @property {string} [rejectionReason]
 * @property {object} [moreInfoRequested]
 */

/**
 * @typedef {object} Step1PersonRequest
 * @property {string} givenName       requerido
 * @property {string} familyName      requerido
 * @property {string} [middleName]
 * @property {string} dateOfBirth     requerido — ISO date YYYY-MM-DD; edad ≥ 18
 * @property {string} nationality     requerido — ISO 3166 alpha-2
 * @property {string} [email]
 * @property {string} [phone]
 * @property {boolean} isPep          requerido
 * @property {boolean} isPepRelated   requerido
 */

/**
 * @typedef {object} Step2EntityRequest
 * @property {EntityType} entityType  requerido
 * @property {string} legalName       requerido
 * @property {string} [tradingName]
 * @property {string} [dbaName]
 * @property {string} [taxId]         pattern por jurisdicción (BO/US/AR/MX)
 * @property {string} jurisdiction    requerido — ISO 3166 alpha-2
 * @property {string} [economicActivityCode]
 * @property {string} [economicActivityDescription]
 * @property {string} [incorporationDate] ISO date
 */

/**
 * @typedef {object} RoleEntry
 * @property {RoleCode} role          requerido
 * @property {string} [personId]      uuid (si reusa Person verificada)
 * @property {string} [givenName]     maxLength 100
 * @property {string} [familyName]    maxLength 100
 * @property {string} [middleName]    maxLength 100
 * @property {string} [dateOfBirth]   ISO date
 * @property {string} [nationality]   ISO 3166 alpha-2
 * @property {string} [email]
 * @property {string} [phone]         pattern `\+?[0-9]{7,20}`
 * @property {number} [ownershipPercentage] 0.01 — 100.00
 */

/**
 * @typedef {object} Step3RolesRequest
 * @property {RoleEntry[]} roles      requerido — minItems 1; al menos 1 LEGAL_REPRESENTATIVE
 */

/**
 * @typedef {object} Step4AdditionalEntityRequest
 * @property {EntityType} entityType  requerido
 * @property {string} legalName       requerido
 * @property {string} [tradingName]
 * @property {string} [dbaName]
 * @property {string} [taxId]
 * @property {string} jurisdiction    requerido
 * @property {string} [economicActivityCode]
 * @property {string} [economicActivityDescription]
 * @property {string} [incorporationDate]
 * @property {string} currency        requerido — ISO 4217
 */

/**
 * @typedef {object} BranchDeclaration
 * @property {string} [name]          maxLength 120
 * @property {Address} address        requerido
 */

/**
 * @typedef {object} Step5MerchantRequest
 * @property {string} displayName     requerido — maxLength 200
 * @property {BranchDeclaration[]} branches requerido — minItems 1
 */

// ── Documents ──────────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} DocumentUploadResponse
 * @property {string} documentId      uuid
 * @property {string} documentType
 * @property {string} [storageKey]
 * @property {string} uploadedAt
 */

/**
 * @typedef {object} DocumentInfo
 * @property {string} id              uuid
 * @property {string} documentType
 * @property {string} [documentCountry]
 * @property {string} [documentNumber]
 * @property {string} [documentExpiry] ISO date
 * @property {string} uploadedAt
 * @property {string} [verifiedAt]
 * @property {string} [rejectedAt]
 * @property {string} [rejectedReason]
 */

// ── Profile FULL (autenticado) ─────────────────────────────────────────────────────────────────

/**
 * @typedef {object} PepDetails
 * Forma libre — JSONB en el backend. Frontend valida que tenga al menos una key cuando isPep=true.
 */

/**
 * @typedef {object} ProfilePersonFullRequest
 * @property {MaritalStatus} [maritalStatus]
 * @property {string} [occupation]
 * @property {Address} residentialAddress requerido
 * @property {SourceOfFunds} [sourceOfFunds]
 * @property {string} [sourceOfFundsDetails]
 * @property {PepDetails} [pepDetails]
 * @property {PepDetails} [pepRelationDetails]
 * @property {boolean} [usPerson]
 * @property {string} [usTaxId]       requerido si usPerson=true
 */

/**
 * @typedef {object} RegisteredAgent
 * Forma libre — typeof "agent of record" para entities US.
 * @property {string} [name]
 * @property {Address} [address]
 */

/**
 * @typedef {object} ProfileEntityFullRequest
 * @property {Address} registeredAddress requerido
 * @property {number} [shareCapital]  va junto con shareCapitalCurrency (ambos o ninguno)
 * @property {string} [shareCapitalCurrency] ISO 4217
 * @property {string} [registeredState] solo si jurisdiction='US'
 * @property {RegisteredAgent} [registeredAgent] solo si jurisdiction='US'
 */

/**
 * @typedef {object} BusinessProfileRequest
 * @property {string} [websiteUrl]    websiteUrl O noWebsiteReason — uno requerido
 * @property {string} [noWebsiteReason]
 * @property {string} productsDescription requerido — minLength 10
 * @property {string} [mccCode]       4 dígitos
 * @property {number} [expectedMonthlyVolumeCents]
 * @property {number} [expectedAvgTransactionCents] ≤ expectedMaxTransactionCents
 * @property {number} [expectedMaxTransactionCents]
 * @property {string[]} [expectedPayerCountries] ISO 3166 alpha-2[]
 * @property {PaymentMethod[]} [expectedPaymentMethods]
 * @property {string} [refundPolicy]  URL
 * @property {string} [termsAndConditions] URL
 * @property {string} [privacyPolicy] URL
 */

/**
 * @typedef {object} MoreInfoRequested
 * @property {string[]} [fields]      claves a re-completar del person/entity/business profile
 * @property {string[]} [documents]   tipos de doc a re-subir (de PersonDocumentType + EntityDocumentType)
 * @property {string} [note]          texto del back-office
 * @property {string} [requestedBy]   uuid del admin
 * @property {string} [requestedAt]   ISO date-time
 */

/**
 * @typedef {object} BusinessProfileResponse
 * @property {string} merchantId
 * @property {string} [websiteUrl]
 * @property {string} [noWebsiteReason]
 * @property {string} [productsDescription]
 * @property {string} [mccCode]
 * @property {number} [expectedMonthlyVolumeCents]
 * @property {number} [expectedAvgTransactionCents]
 * @property {number} [expectedMaxTransactionCents]
 * @property {string[]} [expectedPayerCountries]
 * @property {PaymentMethod[]} [expectedPaymentMethods]
 * @property {string} [refundPolicy]
 * @property {string} [termsAndConditions]
 * @property {string} [privacyPolicy]
 * @property {BusinessProfileStatus} profileStatus
 * @property {string} [submittedAt]
 * @property {string} [approvedAt]
 * @property {string} [approvedBy]
 * @property {string} [rejectionReason]
 * @property {MoreInfoRequested} [moreInfoRequested]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {object} PersonProfile
 * @property {string} id
 * @property {string} givenName
 * @property {string} familyName
 * @property {string} [middleName]
 * @property {string} [dateOfBirth]
 * @property {string} [nationality]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {boolean} [isPep]
 * @property {boolean} [isPepRelated]
 * @property {MaritalStatus} [maritalStatus]
 * @property {string} [occupation]
 * @property {Address} [residentialAddress]
 * @property {SourceOfFunds} [sourceOfFunds]
 * @property {string} [sourceOfFundsDetails]
 * @property {PepDetails} [pepDetails]
 * @property {PepDetails} [pepRelationDetails]
 * @property {boolean} [usPerson]
 * @property {string} [usTaxId]
 * @property {string} [kycCompleteness]
 * @property {string} [kycStatus]
 * @property {string} [kycVerifiedAt]
 * @property {DocumentInfo[]} [documents]
 */

/**
 * @typedef {object} LegalEntityProfile
 * @property {string} id
 * @property {boolean} primary
 * @property {string} [currency]
 * @property {EntityType} entityType
 * @property {string} legalName
 * @property {string} [tradingName]
 * @property {string} [dbaName]
 * @property {string} [taxId]
 * @property {string} jurisdiction
 * @property {string} [economicActivityCode]
 * @property {string} [economicActivityDescription]
 * @property {string} [incorporationDate]
 * @property {Address} [registeredAddress]
 * @property {number} [shareCapital]
 * @property {string} [shareCapitalCurrency]
 * @property {string} [registeredState]
 * @property {RegisteredAgent} [registeredAgent]
 * @property {string} [kybCompleteness]
 * @property {string} [kybStatus]
 * @property {string} [kybVerifiedAt]
 * @property {DocumentInfo[]} [documents]
 */

/**
 * @typedef {object} ProfileResponse
 * @property {PersonProfile} person
 * @property {LegalEntityProfile[]} legalEntities
 */

// ── Economic activities (autocomplete) ─────────────────────────────────────────────────────────

/**
 * @typedef {object} EconomicActivityResult
 * @property {string} code            CAEB (BO) / NAICS (US)
 * @property {string} description
 */

// JSDoc-only file — sin runtime exports. El `export {}` mantiene esto como módulo ES para que
// los imports `import './types'` no fallen, sin contaminar el namespace global con identifiers.
export {}
