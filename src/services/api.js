/**
 * api.js — cliente base HTTP.
 *
 * Actualmente los datos vienen de mocks (src/services/mocks/mockData.js).
 * Cuando el backend esté listo, los services importarán de aquí en vez
 * de los mocks, sin tocar ninguna vista ni componente.
 *
 * Uso futuro:
 *   import { get, post } from '@/services/api'
 *   const transactions = await get('/transactions')
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

function authHeaders() {
  const token = localStorage.getItem('zwap_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`)
  return res.json()
}

export const get    = (path)         => request('GET',    path)
export const post   = (path, body)   => request('POST',   path, body)
export const put    = (path, body)   => request('PUT',    path, body)
export const del    = (path)         => request('DELETE', path)
