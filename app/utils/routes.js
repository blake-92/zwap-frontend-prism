export const ROUTES = {
  LOGIN: '/login',
  APP: '/app',
  DASHBOARD: '/app/dashboard',
  TRANSACTIONS: '/app/transacciones',
  LINKS: '/app/links',
  SETTLEMENTS: '/app/liquidaciones',
  WALLET: '/app/wallet',
  BRANCHES: '/app/sucursales',
  USERS: '/app/usuarios',
  SETTINGS: '/app/configuracion',
}

// Rechaza URLs absolutas, protocol-relative (`//host`) y backslash-escape (`/\path`). Evita open-redirect.
export const isSafeInternalPath = (p) =>
  typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\')
