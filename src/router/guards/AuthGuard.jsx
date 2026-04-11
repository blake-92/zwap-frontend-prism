import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/router/routes'

/**
 * AuthGuard — protege rutas que requieren sesión activa.
 * Actualmente usa localStorage como señal de autenticación.
 * Cuando llegue el backend, reemplazar con validación real de token/sesión.
 */
export default function AuthGuard({ children }) {
  const isAuthenticated = !!localStorage.getItem('zwap_token')
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  return children
}
