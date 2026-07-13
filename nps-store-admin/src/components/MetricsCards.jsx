import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'

/** การ์ดสรุป: ยอดขายรวม / จำนวนคำสั่งซื้อ / จำนวนสินค้าในคลัง */
export default function MetricsCards() {
  const { orders, products } = useStore()
  const { t } = useLang()
  const { formatPrice } = useCurrency()
  const totalSales = orders.reduce((s, o) => s + o.total, 0)

  const cards = [
    { label: t('m_sales'), value: formatPrice(totalSales), sub: t('m_sales_sub') },
    { label: t('m_orders'), value: orders.length, sub: t('m_orders_sub') },
    { label: t('m_stock'), value: products.length, sub: t('m_stock_sub') },
  ]

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{c.label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{c.value}</p>
          <p className="mt-1 text-xs text-neutral-400">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
