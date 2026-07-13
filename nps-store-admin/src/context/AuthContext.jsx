import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

// แปลง error ของ Supabase Auth ให้ตรงกับคีย์คำแปลใน translations.js (login_error_*)
function mapAuthError(error) {
  const msg = error?.message || ''
  if (msg.includes('already registered') || msg.includes('already exists')) return 'EMAIL_EXISTS'
  if (msg.includes('Invalid login credentials')) return 'INVALID_CREDENTIALS'
  return 'UNKNOWN'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true) // กำลังตรวจสอบ session ตอนเปิดแอปครั้งแรก
  // profile: undefined = ยังไม่โหลด, null = โหลดแล้วแต่ไม่พบแถว, object = โหลดสำเร็จ { name, is_admin }
  const [profile, setProfile] = useState(undefined)

  // ตรวจ session ปัจจุบันตอนเปิดแอป + ฟังการเปลี่ยนแปลง (ล็อกอิน/ล็อกเอาต์/กลับจาก Facebook OAuth)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // โหลดโปรไฟล์ (ชื่อ + สิทธิ์แอดมิน) ทุกครั้งที่ผู้ใช้ล็อกอินเปลี่ยน
  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    setProfile(undefined)
    supabase
      .from('profiles')
      .select('name, is_admin')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data ?? null))
  }, [session])

  const registerCustomer = async (name, email, password) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    if (error) return { ok: false, error: mapAuthError(error) }
    return { ok: true }
  }

  const loginCustomer = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: mapAuthError(error) }
    return { ok: true }
  }

  // เข้าสู่ระบบด้วย Facebook — Supabase จัดการ OAuth ฝั่ง Server ให้ทั้งหมด
  // ต้องเปิดใช้ Facebook provider ที่ Supabase Dashboard > Authentication > Providers ก่อน (ดู README)
  const loginWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin },
    })
    // สำเร็จ = เบราว์เซอร์จะพาออกจากหน้านี้ไป Facebook ทันที แล้วเด้งกลับมาเองพร้อม session
    if (error) return { ok: false, error: 'FB_NOT_CONFIGURED' }
    return { ok: true }
  }

  const logoutCustomer = () => supabase.auth.signOut()

  const customer = session?.user
    ? { name: profile?.name || session.user.email, email: session.user.email }
    : null
  const userId = session?.user?.id || null

  const profileReady = profile !== undefined
  const isAdmin = profileReady && !!profile?.is_admin

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
        loginWithFacebook,
        logoutCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
