import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'

const EMPTY_FORM = { username: '', password: '', confirmPassword: '' }

/** โมดัลเข้าสู่ระบบ/สมัครสมาชิกฝั่งลูกค้า — Username+Password */
export default function LoginModal({ open, onClose }) {
  const { loginCustomer, registerCustomer } = useAuth()
  const { t } = useLang()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const close = () => {
    onClose()
    setForm(EMPTY_FORM)
    setError('')
    setMode('login')
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError(t('login_error_PASSWORD_MISMATCH'))
      return
    }

    setSubmitting(true)
    const result =
      mode === 'login'
        ? await loginCustomer(form.username.trim(), form.password)
        : await registerCustomer(form.username.trim(), form.password)
    setSubmitting(false)
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
          <input
            className={inputCls}
            placeholder={t('login_username')}
            value={form.username}
            onChange={set('username')}
            required
            pattern="[a-zA-Z0-9_.\-]{3,20}"
            title={t('login_username_hint')}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <input className={inputCls} type="password" placeholder={t('login_password')} value={form.password} onChange={set('password')} required minLength={4} />
          {mode === 'register' && (
            <input
              className={inputCls}
              type="password"
              placeholder={t('login_confirm_password')}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              required
              minLength={4}
            />
          )}

          {error && <p className="text-xs text-accent font-bold">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full py-3.5 bg-accent text-primary rounded-full font-bold uppercase text-sm hover:bg-accent-dark disabled:opacity-60 transition cursor-pointer">
            {mode === 'login' ? t('login_submit') : t('login_register_submit')}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          className="mt-3 w-full text-center text-xs font-bold text-neutral-500 hover:text-primary underline cursor-pointer"
        >
          {mode === 'login' ? t('login_no_account') : t('login_have_account')}
        </button>
      </div>
    </div>
  )
}
