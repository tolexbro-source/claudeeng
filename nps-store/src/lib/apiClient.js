const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  console.warn('[API] ยังไม่ได้ตั้งค่า VITE_API_URL ใน .env.local — ระบบล็อกอิน/สินค้า/ออเดอร์จะยังใช้งานไม่ได้ (ดู README)')
}

const TOKEN_KEY = 'nps-store-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => (token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY))

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL || ''}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    const error = new Error(data?.error || 'REQUEST_FAILED')
    error.code = data?.error || 'UNKNOWN'
    throw error
  }
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}
