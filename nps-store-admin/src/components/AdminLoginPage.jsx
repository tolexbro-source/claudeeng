import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'

/**
 * หน้าเข้าสู่ระบบแอดมิน — ใช้บัญชี Username/Password เดียวกับลูกค้า (nps-store-server)
 * แต่ต้องมี isAdmin = true (ตั้งค่าผ่าน nps-store-server/src/setAdmin.js เท่านั้น)
 */
export default function AdminLoginPage() {
  const { customer, isAdmin, profileReady, loginCustomer, logoutCustomer } = useAuth()
  const { t } = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ล็อกอินสำเร็จแต่บัญชีนี้ไม่ใช่แอดมิน → ออกจากระบบทันทีแล้วแจ้งเตือน
  useEffect(() => {
    if (customer && profileReady && !isAdmin) {
      logoutCustomer()
      setError(t('admin_login_error'))
    }
  }, [customer, profileReady, isAdmin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await loginCustomer(username, password)
    setSubmitting(false)
    if (!result.ok) setError(t(`login_error_${result.error}`) || t('admin_login_error'))
  }

  const inputCls =
    'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition'

  return (
    <main className="flex-1 bg-neutral-50 flex items-center justify-center px-4 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-4">
        <div className="text-center mb-2">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-500">NPS-Store</p>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">{t('admin_login_title')}</h1>
        </div>

        <input className={inputCls} type="text" placeholder={t('admin_login_username')} value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus autoCapitalize="off" autoCorrect="off" />
        <input className={inputCls} type="password" placeholder={t('admin_login_password')} value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p className="text-xs text-accent font-bold">{error}</p>}

        <button type="submit" disabled={submitting} className="w-full py-3.5 bg-accent text-primary rounded-full font-bold uppercase text-sm hover:bg-accent-dark disabled:opacity-60 transition cursor-pointer">
          {t('admin_login_submit')}
        </button>
      </form>
    </main>
  )
}
