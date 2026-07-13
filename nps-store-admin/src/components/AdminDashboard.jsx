import { useEffect, useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import MetricsCards from './MetricsCards'
import ProductForm from './ProductForm'
import ProductTable from './ProductTable'
import OrderTable from './OrderTable'
import AdminLoginPage from './AdminLoginPage'

const CATEGORIES = ['Shoes', 'Clothing']

/** หน้าหลังบ้าน: ต้องล็อกอินก่อน (ดู AdminLoginPage) จากนั้นสรุปข้อมูล + จัดการสินค้าแยกแท็บตามหมวดหมู่ + จัดการออเดอร์ */
export default function AdminDashboard() {
  const { markOrdersSeen } = useStore()
  const { t } = useLang()
  const { isAdmin, logoutCustomer, loading, profileReady } = useAuth()
  const [activeCat, setActiveCat] = useState('Shoes') // แท็บหมวดหมู่ที่กำลังจัดการ: Shoes | Clothing
  const [editing, setEditing] = useState(null) // สินค้าที่กำลังแก้ไข (null = โหมดเพิ่มใหม่)

  // เข้าหน้า Admin แล้ว = ถือว่าเห็นออเดอร์ใหม่ทั้งหมดแล้ว → เคลียร์ Badge แจ้งเตือน + โหลดออเดอร์ล่าสุด
  useEffect(() => {
    if (isAdmin) markOrdersSeen()
  }, [isAdmin])

  if (loading || !profileReady) return <main className="flex-1 bg-neutral-50" />
  if (!isAdmin) return <AdminLoginPage />

  const switchTab = (cat) => {
    setActiveCat(cat)
    setEditing(null) // เปลี่ยนแท็บแล้วเคลียร์ฟอร์มที่กำลังแก้ไขของแท็บเดิม
  }

  return (
    <main className="flex-1 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-500">NPS-Store</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight">{t('ad_title')}</h1>
          </div>
          <button onClick={logoutCustomer} className="px-4 py-2 rounded-full text-sm font-bold uppercase border-2 border-neutral-300 hover:border-primary transition cursor-pointer">
            {t('admin_logout')}
          </button>
        </div>

        {/* การ์ดสรุปข้อมูลสำคัญ */}
        <MetricsCards />

        {/* จัดการสินค้า: แยกแท็บ รองเท้า / เสื้อผ้า ชัดเจน ไม่ปนกัน */}
        <section>
          <h2 className="text-xl font-black uppercase italic mb-4">{t('pm_title')}</h2>

          <div className="flex gap-2 mb-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => switchTab(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition cursor-pointer ${
                  activeCat === cat
                    ? 'bg-primary text-white'
                    : 'bg-white text-neutral-600 border border-neutral-300 hover:border-primary'
                }`}
              >
                {t(cat === 'Shoes' ? 'f_shoes' : 'f_clothing')}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <ProductForm category={activeCat} editing={editing} onDone={() => setEditing(null)} />
            <div className="lg:col-span-2">
              <ProductTable category={activeCat} onEdit={setEditing} />
            </div>
          </div>
        </section>

        {/* จัดการออเดอร์ */}
        <section id="order-management">
          <h2 className="text-xl font-black uppercase italic mb-4">{t('om_title')}</h2>
          <OrderTable />
        </section>
      </div>
    </main>
  )
}
