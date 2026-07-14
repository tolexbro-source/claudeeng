import { useLang, LANGS } from './context/LanguageContext'
import { useCurrency, CURRENCIES } from './context/CurrencyContext'
import AdminDashboard from './components/AdminDashboard'
import OrderToast from './components/OrderToast'

/** แอปแอดมินแยกต่างหากจากเว็บลูกค้า — รันคนละพอร์ต/คนละคำสั่ง ไม่ปนกัน (ดู README.md) */
export default function App() {
  const { lang, setLang } = useLang()
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="NPS-Store logo" className="h-9 w-9 object-contain" />
            <span className="text-white font-black uppercase tracking-wide text-sm hidden sm:block">Admin</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
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

            {/* ตัวเลือกสกุลเงิน บาท (THB) / ກີບ (LAK) */}
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
          </div>
        </div>
      </header>

      <AdminDashboard />

      {/* Toast แจ้งเตือนออเดอร์ใหม่แบบ Real-time (WebSocket ผ่าน nps-store-server) */}
      <OrderToast />
    </div>
  )
}
