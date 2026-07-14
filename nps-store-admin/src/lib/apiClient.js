const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  console.warn('[API] ยังไม่ได้ตั้งค่า VITE_API_URL ใน .env.local — ระบบล็อกอิน/สินค้า/ออเดอร์จะยังใช้งานไม่ได้ (ดู README)')
}

const TOKEN_KEY = 'nps-store-admin-token'

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

// อัปโหลดรูปสินค้า — multipart/form-data แยกจาก request() ที่ส่ง JSON
export async function uploadImage(file, category) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('category', category)
  const token = getToken()

  const res = await fetch(`${API_URL || ''}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'UPLOAD_FAILED')
  return data // { url }
}

// URL ของ WebSocket แจ้งเตือนออเดอร์ใหม่แบบเรียลไทม์ (ต้องมี token แอดมิน)
export function realtimeWsURL(token) {
  const url = new URL(API_URL || window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = '/ws'
  url.search = `?token=${encodeURIComponent(token)}`
  return url.toString()
}
