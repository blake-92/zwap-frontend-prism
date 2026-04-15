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

// iOS Safari BFCache (Back/Forward Cache) restoration: when Safari restores a frozen
// page from BFCache, the vite:preloadError event won't fire for stale chunks because
// the module graph is already "resolved" (frozen state). Force a hard reload so Safari
// fetches fresh HTML and re-evaluates all chunks.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    window.location.reload()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
