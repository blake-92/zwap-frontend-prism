import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup para tests Vitest (Node fetch intercept). Importar desde helpers/setup.ts
// solo cuando un spec necesite MSW — no queremos overhead global.
export const server = setupServer(...handlers)
