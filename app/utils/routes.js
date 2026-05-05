export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  ONBOARDING_START: '/onboarding/start',
  ONBOARDING_REVIEW: '/onboarding/review',
  // Builder helper para steps dinámicos del wizard. Ej: ONBOARDING_STEP(2) → '/onboarding/step-2'.
  ONBOARDING_STEP: (n) => `/onboarding/step-${n}`,
  APP: '/app',
  DASHBOARD: '/app/dashboard',
  TRANSACTIONS: '/app/transacciones',
  LINKS: '/app/links',
  SETTLEMENTS: '/app/liquidaciones',
  WALLET: '/app/wallet',
  BRANCHES: '/app/sucursales',
  USERS: '/app/usuarios',
  SETTINGS: '/app/configuracion',
  PROFILE_FULL: '/app/profile-full',
}

// Rechaza URLs absolutas, protocol-relative (`//host`) y backslash-escape (`/\path`). Evita open-redirect.
export const isSafeInternalPath = (p) =>
  typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/\\')
