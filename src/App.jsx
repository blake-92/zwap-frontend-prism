import '@/i18n'
import { ThemeProvider } from '@/shared/context/ThemeContext'
import { ToastProvider } from '@/shared/context/ToastContext'
import { ViewSearchProvider } from '@/shared/context/ViewSearchContext'
import AppRouter from '@/router'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ViewSearchProvider>
          <AppRouter />
        </ViewSearchProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
