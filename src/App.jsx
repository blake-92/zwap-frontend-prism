import { ThemeProvider } from '@/shared/context/ThemeContext'
import { ToastProvider } from '@/shared/context/ToastContext'
import AppRouter from '@/router'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  )
}
