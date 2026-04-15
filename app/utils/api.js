// HTTP client wrapper. Currently unused (mockData in place);
// swap-in when backend is ready without touching views.

function authHeaders() {
  if (typeof document === 'undefined') return {}
  const match = document.cookie.match(/(?:^|;\s*)zwap_token=([^;]+)/)
  const token = match ? decodeURIComponent(match[1]) : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body) {
  const { public: { apiUrl } } = useRuntimeConfig()
  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`)
  return res.json()
}

export const get = (path) => request('GET', path)
export const post = (path, body) => request('POST', path, body)
export const put = (path, body) => request('PUT', path, body)
export const del = (path) => request('DELETE', path)
