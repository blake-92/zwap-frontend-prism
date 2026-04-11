import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './routes'
import { PageLoader } from '@/shared/ui'
import AuthGuard    from './guards/AuthGuard'
import AppShell     from '@/shared/layout/AppShell'
import GlassBackground from '@/shared/layout/GlassBackground'

/* ─── Lazy-loaded feature views ─────────────────────────────
   Cada feature se carga solo cuando el usuario navega a ella.
   El bundle principal queda < 50 KB; el resto llega on-demand.
──────────────────────────────────────────────────────────── */
const LoginView         = lazy(() => import('@/features/auth/components/LoginView'))
const DashboardView     = lazy(() => import('@/features/dashboard/components/DashboardView'))
const TransaccionesView = lazy(() => import('@/features/transactions/components/TransaccionesView'))
const LinksView         = lazy(() => import('@/features/links/components/LinksView'))
const LiquidacionesView = lazy(() => import('@/features/settlements/components/LiquidacionesView'))
const WalletView        = lazy(() => import('@/features/wallet/components/WalletView'))
const SucursalesView    = lazy(() => import('@/features/branches/components/SucursalesView'))
const UsuariosView      = lazy(() => import('@/features/users/components/UsuariosView'))
const SettingsView      = lazy(() => import('@/features/settings/components/SettingsView'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <GlassBackground />
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={
          <Suspense fallback={<PageLoader />}>
            <LoginView />
          </Suspense>
        } />
        <Route path="/legal/:doc" element={
          <div className="relative z-10 p-8 font-sans text-[#111113] dark:text-white">Legal — próximamente</div>
        } />

        {/* Protected — layout wrapper con Outlet */}
        <Route
          path={ROUTES.APP}
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD}    element={<DashboardView />} />
          <Route path={ROUTES.TRANSACTIONS} element={<TransaccionesView />} />
          <Route path={ROUTES.LINKS}        element={<LinksView />} />
          <Route path={ROUTES.SETTLEMENTS}  element={<LiquidacionesView />} />
          <Route path={ROUTES.WALLET}       element={<WalletView />} />
          <Route path={ROUTES.BRANCHES}     element={<SucursalesView />} />
          <Route path={ROUTES.USERS}        element={<UsuariosView />} />
          <Route path={ROUTES.SETTINGS}     element={<SettingsView />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
