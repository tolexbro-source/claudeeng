import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { id, username, isAdmin } | null
  const [loading, setLoading] = useState(true) // กำลังตรวจสอบ session ตอนเปิดแอปครั้งแรก

  // ตรวจ token ที่เก็บไว้ตอนเปิดแอป — ถ้ามีและยังใช้ได้ ดึงข้อมูลผู้ใช้กลับมา
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const registerCustomer = async (username, password) => {
    try {
      const { token, user } = await api.post('/api/auth/register', { username, password })
      setToken(token)
      setUser(user)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.code || 'UNKNOWN' }
    }
  }

  const loginCustomer = async (username, password) => {
    try {
      const { token, user } = await api.post('/api/auth/login', { username, password })
      setToken(token)
      setUser(user)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.code || 'UNKNOWN' }
    }
  }

  const logoutCustomer = () => {
    setToken(null)
    setUser(null)
  }

  const customer = user ? { name: user.username } : null
  const userId = user?.id || null
  const profileReady = !loading
  const isAdmin = !!user?.isAdmin

  return (
    <AuthContext.Provider
      value={{
        customer,
        userId,
        loading,
        profileReady,
        isAdmin,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook สำหรับเรียกใช้ข้อมูลล็อกอินจาก Component ใดก็ได้
export const useAuth = () => useContext(AuthContext)
