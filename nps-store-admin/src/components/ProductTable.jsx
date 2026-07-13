import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'

/** ตารางสินค้าเฉพาะหมวดหมู่ที่เลือกในแท็บ (category) พร้อมปุ่ม Edit / Delete */
export default function ProductTable({ category, onEdit }) {
  const { products, deleteProduct } = useStore()
  const { t } = useLang()
  const { formatPrice } = useCurrency()
  const items = products.filter((p) => p.category === category)

  const handleDelete = (p) => {
    // ยืนยันก่อนลบ ป้องกันกดพลาด
    if (window.confirm(t('confirm_delete', { name: p.name }))) {
      deleteProduct(p.id)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wider text-neutral-500">
              <th className="px-5 py-3.5 font-bold">{t('pt_product')}</th>
              <th className="px-5 py-3.5 font-bold">{t('pt_sizes')}</th>
              <th className="px-5 py-3.5 font-bold text-right">{t('pt_price')}</th>
              <th className="px-5 py-3.5 font-bold text-right">{t('pt_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan="4" className="px-5 py-10 text-center text-neutral-400">{t('pt_empty')}</td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="h-11 w-11 rounded-lg object-cover bg-neutral-100" />
                    <div>
                      <p className="font-bold">{p.name}</p>
                      {p.isNew && <span className="text-[10px] font-bold uppercase bg-primary text-white px-1.5 py-0.5 rounded">New</span>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-neutral-600 whitespace-nowrap">{p.sizes.join(', ')}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  {p.salePrice ? (
                    <>
                      <span className="font-bold text-accent">{formatPrice(p.salePrice)}</span>{' '}
                      <span className="text-xs text-neutral-400 line-through">{formatPrice(p.price)}</span>
                    </>
                  ) : (
                    <span className="font-bold">{formatPrice(p.price)}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border border-neutral-300 hover:border-primary transition cursor-pointer"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition cursor-pointer"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
