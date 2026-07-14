import { useEffect, useRef, useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'

/**
 * Toast แจ้งเตือนแบบ Real-time เมื่อมีออเดอร์ใหม่เข้ามา — เด้งขึ้นมุมขวาบนทันทีที่ลูกค้ากด Place Order
 * ข้อมูลมาจาก WebSocket subscription ใน StoreContext.jsx (ทำงานได้แม้ลูกค้าอยู่คนละเครื่อง/คนละเว็บแอปกับแอดมิน)
 */
export default function OrderToast() {
  const { orders } = useStore()
  const { t } = useLang()
  const { formatPrice } = useCurrency()
  const [queue, setQueue] = useState([])
  const seenIds = useRef(new Set())
  const isFirstRun = useRef(true)

  // ตรวจจับออเดอร์ใหม่ที่เพิ่งเข้ามา (เทียบกับ id ที่เคยเห็นแล้ว)
  useEffect(() => {
    if (isFirstRun.current) {
      // ครั้งแรกที่โหลดแอป (ออเดอร์เดิมที่ดึงมาตอนล็อกอิน) ไม่ต้องเด้งแจ้งเตือนซ้ำ
      orders.forEach((o) => seenIds.current.add(o.id))
      isFirstRun.current = false
      return
    }
    const freshOnes = orders.filter((o) => !seenIds.current.has(o.id))
    if (freshOnes.length > 0) {
      freshOnes.forEach((o) => seenIds.current.add(o.id))
      setQueue((q) => [...q, ...freshOnes])
    }
  }, [orders])

  // ปิด Toast อัตโนมัติทีละใบหลังจากแสดง 6 วินาที
  useEffect(() => {
    if (queue.length === 0) return
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), 6000)
    return () => clearTimeout(timer)
  }, [queue])

  if (queue.length === 0) return null
  const order = queue[0]
  const dismiss = () => setQueue((q) => q.slice(1))
  const viewOrder = () => {
    document.getElementById('order-management')?.scrollIntoView({ behavior: 'smooth' })
    dismiss()
  }

  return (
    <div className="fixed top-20 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm" style={{ animation: 'toast-in 0.3s ease-out' }}>
      <div className="bg-white border border-neutral-200 shadow-2xl rounded-2xl p-4 flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-accent text-primary flex items-center justify-center font-black text-lg">
          !
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black uppercase text-sm">{t('notif_new_order')}</p>
          <p className="text-sm text-neutral-600 mt-0.5 truncate">
            {order.customer.name} · <span className="font-bold text-neutral-900">{formatPrice(order.total)}</span>
          </p>
          <div className="mt-2 flex gap-4">
            <button onClick={viewOrder} className="text-xs font-bold uppercase text-primary underline cursor-pointer">
              {t('notif_view')}
            </button>
            <button onClick={dismiss} className="text-xs font-bold uppercase text-neutral-400 cursor-pointer">
              {t('notif_dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
