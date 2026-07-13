import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'

const EMPTY_FORM = { name: '', email: '', password: '' }

/** โมดัลเข้าสู่ระบบ/สมัครสมาชิกฝั่งลูกค้า — รองรับ Email+Password (mock) และ Facebook Login */
export default function LoginModal({ open, onClose }) {
  const { loginCustomer, registerCustomer, loginWithFacebook } = useAuth()
  const { t } = useLang()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [fbLoading, setFbLoading] = useState(false)

  if (!open) return null

  const close = () => {
    onClose()
    setForm(EMPTY_FORM)
    setError('')
    setMode('login')
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    const result =
      mode === 'login'
        ? loginCustomer(form.email, form.password)
        : registerCustomer(form.name.trim(), form.email.trim(), form.password)
    if (!result.ok) {
      setError(t(`login_error_${result.error}`))
      return
    }
    close()
  }

  const handleFacebook = async () => {
    setError('')
    setFbLoading(true)
    const result = await loginWithFacebook()
    setFbLoading(false)
    if (!result.ok) {
      setError(t(`login_error_${result.error}`))
      return
    }
    close()
  }

  const inputCls =
    'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={close} className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black uppercase italic">
            {mode === 'login' ? t('login_title') : t('login_register_title')}
          </h2>
          <button onClick={close} className="p-2 rounded-full hover:bg-neutral-100 cursor-pointer" aria-label="Close">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input className={inputCls} placeholder={t('login_name')} value={form.name} onChange={set('name')} required />
          )}
          <input className={inputCls} type="email" placeholder={t('login_email')} value={form.email} onChange={set('email')} required />
          <input className={inputCls} type="password" placeholder={t('login_password')} value={form.password} onChange={set('password')} required minLength={4} />

          {error && <p className="text-xs text-accent font-bold">{error}</p>}

          <button type="submit" className="w-full py-3.5 bg-accent text-primary rounded-full font-bold uppercase text-sm hover:bg-accent-dark transition cursor-pointer">
            {mode === 'login' ? t('login_submit') : t('login_register_submit')}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          className="mt-3 w-full text-center text-xs font-bold text-neutral-500 hover:text-primary underline cursor-pointer"
        >
          {mode === 'login' ? t('login_no_account') : t('login_have_account')}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-[10px] font-bold uppercase text-neutral-400">{t('login_or')}</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* ปุ่ม Facebook Login — คงสีน้ำเงินแบรนด์ Facebook ไว้ (ไม่ผูกกับธีมสีร้าน) เพื่อให้ลูกค้าจำปุ่มได้ทันที */}
        <button
          onClick={handleFacebook}
          disabled={fbLoading}
          className="w-full py-3.5 flex items-center justify-center gap-2 bg-[#1877F2] text-white rounded-full font-bold text-sm hover:bg-[#166FE5] disabled:opacity-60 transition cursor-pointer"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
          </svg>
          {t('login_fb')}
        </button>
      </div>
    </div>
  )
}
