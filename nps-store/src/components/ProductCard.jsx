import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { catLabel } from '../i18n/translations'
import { useCurrency } from '../context/CurrencyContext'

/** การ์ดสินค้า: รูปใหญ่เด่น + ชื่อรุ่น/หมวดหมู่/ราคา ด้านล่าง สไตล์ Nike */
export default function ProductCard({ product }) {
  const { addToCart: addToCartStore } = useStore()
  const { t } = useLang()
  const { formatPrice } = useCurrency()
  const [size, setSize] = useState(product.sizes[0] || '')
  const [added, setAdded] = useState(false)
  const onSale = product.salePrice != null && product.salePrice !== ''

  const addToCart = () => {
    addToCartStore(product, size)
    setAdded(true) // แสดง feedback "Added" ชั่วครู่
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group flex flex-col">
      {/* รูปสินค้า */}
      <div className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden shadow-sm">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
            New
          </span>
        )}
        {onSale && (
          <span className="absolute top-3 right-3 bg-accent text-primary text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
            Sale
          </span>
        )}
      </div>

      {/* ข้อมูลสินค้า */}
      <div className="mt-4 flex-1">
        <h3 className="font-bold text-sm md:text-base leading-tight">{product.name}</h3>
        <p className="text-sm text-neutral-500">{catLabel(t, product.category)}</p>
        <div className="mt-1 flex items-baseline gap-2">
          {onSale ? (
            <>
              <span className="font-bold text-accent">{formatPrice(product.salePrice)}</span>
              <span className="text-sm text-neutral-400 line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="font-bold">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>

      {/* เลือกไซซ์ + เพิ่มลงตะกร้า */}
      <div className="mt-3 flex gap-2">
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="flex-1 min-w-0 border border-neutral-300 rounded-full px-3 py-2 text-sm font-medium bg-white outline-none focus:border-primary cursor-pointer"
          aria-label={t('size_aria')}
        >
          {product.sizes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={addToCart}
          className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition cursor-pointer ${
            added ? 'bg-green-600 text-white' : 'bg-accent text-primary hover:bg-accent-dark active:scale-95'
          }`}
        >
          {added ? t('added') : t('add')}
        </button>
      </div>
    </div>
  )
}
