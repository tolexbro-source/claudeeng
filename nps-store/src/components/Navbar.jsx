import { useStore } from '../context/StoreContext'
import { useLang, LANGS } from '../context/LanguageContext'
import { useCurrency, CURRENCIES } from '../context/CurrencyContext'
import { useAuth } from '../context/AuthContext'

/**
 * Header หลักของเว็บ: โลโก้ (ซ้าย) / เมนู (กลาง) / ค้นหา+ภาษา+สกุลเงิน+ล็อกอิน+ตะกร้า (ขวา)
 */
export default function Navbar({ filter, setFilter, search, setSearch, onCartOpen, onLoginOpen }) {
  const { cartCount } = useStore()
  const { lang, setLang, t } = useLang()
  const { currency, setCurrency } = useCurrency()
  const { customer, logoutCustomer } = useAuth()

  const menu = [
    { label: t('nav_new'), value: 'New' },
    { label: t('nav_shoes'), value: 'Shoes' },
    { label: t('nav_clothing'), value: 'Clothing' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <button onClick={() => setFilter('All')} className="flex items-center gap-2 shrink-0 cursor-pointer" aria-label="NPS-Store">
          <img src="/logo.png" alt="NPS-Store logo" className="h-9 w-9 object-contain" />
        </button>

        {/* เมนูกลาง (ซ่อนบนจอเล็ก) */}
        <nav className="hidden md:flex flex-1 justify-center gap-8">
          {menu.map((m) => (
            <button
              key={m.value}
              onClick={() => setFilter(m.value)}
              className={`text-sm font-bold uppercase tracking-wide pb-0.5 border-b-2 transition-colors cursor-pointer ${
                filter === m.value
                  ? 'border-accent text-accent'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>

        {/* ฝั่งขวา: ค้นหา / ภาษา / สกุลเงิน / ล็อกอิน / ตะกร้า */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="w-36 lg:w-52 bg-white rounded-full pl-9 pr-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-accent transition"
            />
          </div>

          {/* ตัวเลือกภาษา ไทย / EN / ລາວ */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border border-neutral-300 rounded-full px-2.5 py-1.5 text-sm font-bold bg-white outline-none focus:border-primary cursor-pointer"
            aria-label="Language"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>

          {/* ตัวเลือกสกุลเงิน บาท (THB) / ກີບ (LAK) — ราคาทั้งเว็บแปลงตามตัวนี้ทันที */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border border-neutral-300 rounded-full px-2.5 py-1.5 text-sm font-bold bg-white outline-none focus:border-primary cursor-pointer"
            aria-label="Currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>

          {/* เข้าสู่ระบบลูกค้า / ชื่อ+ออกจากระบบ (ถ้าล็อกอินแล้ว) */}
          {customer ? (
            <div className="hidden sm:flex items-center gap-2 pl-1">
              <span className="text-xs font-bold text-white/80 max-w-24 truncate" title={customer.name}>
                {t('login_hello', { name: customer.name })}
              </span>
              <button onClick={logoutCustomer} className="text-xs font-bold text-white/50 hover:text-white underline cursor-pointer">
                {t('logout')}
              </button>
            </div>
          ) : (
            <button onClick={onLoginOpen} className="px-3 py-2 rounded-full text-sm font-bold text-white hover:bg-white/10 transition cursor-pointer">
              {t('login_nav_button')}
            </button>
          )}

          {/* ไอคอนตะกร้า + จำนวนชิ้น */}
          <button onClick={onCartOpen} className="relative p-2 rounded-full text-white hover:bg-white/10 transition cursor-pointer" aria-label="Cart">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 bg-accent text-primary text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-primary">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* เมนูบนจอเล็ก: แถบเลื่อนแนวนอน */}
      <nav className="md:hidden flex gap-5 px-4 pb-3 overflow-x-auto no-scrollbar">
        {menu.map((m) => (
          <button
            key={m.value}
            onClick={() => setFilter(m.value)}
            className={`text-sm font-bold uppercase whitespace-nowrap cursor-pointer ${
              filter === m.value ? 'text-accent underline underline-offset-4' : 'text-white/50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
