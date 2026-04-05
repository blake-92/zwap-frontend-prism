import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import GlassBackground  from './components/layout/GlassBackground'
import LoginView        from './components/views/LoginView'
import AppShell         from './components/layout/AppShell'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <GlassBackground />
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginView />} />

          {/* Legal — placeholder */}
          <Route path="/legal/:doc" element={
            <div className="relative z-10 text-white p-8 font-sans">Legal — próximamente</div>
          } />

          {/* App */}
          <Route path="/app/*" element={<AppShell />} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
