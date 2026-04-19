import { faker } from '@faker-js/faker'

// Builders determinísticos por default (seed fijado en setup E2E para reproducibilidad).
// Overrideable via parcial: `buildTransaction({ status: 'refunded' })`.

type TransactionStatus = 'successful' | 'pending' | 'refunded'

export function buildTransaction(overrides: Partial<{
  id: string
  client: string
  email: string
  amount: string
  status: TransactionStatus
  date: string
}> = {}) {
  return {
    id: overrides.id ?? `TRX-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`,
    client: overrides.client ?? faker.person.fullName(),
    email: overrides.email ?? faker.internet.email(),
    amount: overrides.amount ?? faker.finance.amount({ min: 10, max: 5000, dec: 2 }),
    status: overrides.status ?? faker.helpers.arrayElement<TransactionStatus>(['successful', 'pending', 'refunded']),
    date: overrides.date ?? faker.date.recent({ days: 30 }).toISOString().slice(0, 10),
    ...overrides,
  }
}

export function buildUser(overrides: Partial<{
  id: string
  name: string
  email: string
  role: 'Administrador' | 'Contador' | 'Recepcionista'
  active: boolean
}> = {}) {
  return {
    id: overrides.id ?? faker.string.uuid(),
    name: overrides.name ?? faker.person.fullName(),
    email: overrides.email ?? faker.internet.email(),
    role: overrides.role ?? faker.helpers.arrayElement(['Administrador', 'Contador', 'Recepcionista'] as const),
    active: overrides.active ?? true,
    branches: [],
    ...overrides,
  }
}

export function buildLink(overrides: Partial<{
  id: string
  client: string
  amount: string
  status: 'active' | 'paid' | 'expired'
  items: number
}> = {}) {
  return {
    id: overrides.id ?? `LNK-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
    client: overrides.client ?? faker.person.fullName(),
    amount: overrides.amount ?? faker.finance.amount({ min: 50, max: 2000, dec: 2 }),
    status: overrides.status ?? 'active',
    items: overrides.items ?? faker.number.int({ min: 1, max: 5 }),
    ...overrides,
  }
}

export function buildPayout(overrides: Partial<{
  id: string
  type: 'settlement' | 'debt'
  amount: string
  status: 'pending' | 'completed' | 'failed'
  closeDate: string
}> = {}) {
  return {
    id: overrides.id ?? `PO-${faker.string.alphanumeric({ length: 6, casing: 'upper' })}`,
    type: overrides.type ?? 'settlement',
    amount: overrides.amount ?? faker.finance.amount({ min: 100, max: 10000, dec: 2 }),
    status: overrides.status ?? 'pending',
    closeDate: overrides.closeDate ?? faker.date.recent({ days: 14 }).toISOString().slice(0, 10),
    ...overrides,
  }
}

/** Seed determinística para tests reproducibles. Llamar en beforeAll. */
export function seedFaker(seed = 42) {
  faker.seed(seed)
}
