import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'
import { formatDate, LOCALES } from '../utils/format'

/** ตารางคำสั่งซื้อจากลูกค้า: ชื่อ ที่อยู่ เบอร์โทร รายการสินค้า ยอดรวม ช่องทางชำระเงิน */
export default function OrderTable() {
  const { orders } = useStore()
  const { lang, t } = useLang()
  const { formatPrice } = useCurrency()

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wider text-neutral-500">
              <th className="px-5 py-3.5 font-bold">{t('ot_order')}</th>
              <th className="px-5 py-3.5 font-bold">{t('ot_customer')}</th>
              <th className="px-5 py-3.5 font-bold">{t('ot_items')}</th>
              <th className="px-5 py-3.5 font-bold text-right">{t('ot_total')}</th>
              <th className="px-5 py-3.5 font-bold">{t('ot_payment')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-10 text-center text-neutral-400">
                  {t('ot_empty')}
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 align-top">
                <td className="px-5 py-4 whitespace-nowrap">
                  <p className="font-bold">{o.id}</p>
                  <p className="text-xs text-neutral-400">{formatDate(o.createdAt, LOCALES[lang])}</p>
                </td>
                <td className="px-5 py-4 max-w-60">
                  <p className="font-bold">{o.customer.name}</p>
                  <p className="text-xs text-neutral-500 whitespace-pre-line">{o.customer.address}</p>
                  <p className="text-xs text-neutral-500 mt-1">📞 {o.customer.phone}</p>
                  <p className="text-xs text-neutral-500">✉️ {o.customer.email}</p>
                </td>
                <td className="px-5 py-4">
                  <ul className="space-y-1">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="text-neutral-700">
                        {i.name} <span className="text-neutral-400">({i.size})</span> × {i.qty}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-5 py-4 text-right font-black whitespace-nowrap">{formatPrice(o.total)}</td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      o.payment === 'transfer' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {o.payment === 'transfer' ? t('pay_transfer') : t('pay_cod')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
