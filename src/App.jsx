import { ThemeProvider } from '@/shared/context/ThemeContext'
import AppRouter from '@/router'

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}
