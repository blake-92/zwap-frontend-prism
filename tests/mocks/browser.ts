// Setup MSW para Playwright (ServiceWorker). Se inyecta en la page via `addInitScript`
// en el fixture. Requiere `npx msw init public/` para copiar mockServiceWorker.js a public/.
// Ver: https://mswjs.io/docs/integrations/browser
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
