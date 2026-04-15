import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-day-picker/style.css'
import './styles/globals.css'
import App from './App.jsx'

// When Cloudflare Pages deploys a new version, lazy-loaded chunk hashes change.
// Old cached HTML trying to import stale chunk URLs will fail silently (blank screen).
// Reload automatically so the fresh HTML and new chunks are fetched.
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
