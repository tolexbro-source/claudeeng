import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import ProductCard from './ProductCard'

/** Grid แสดงสินค้า — กรองตามหมวดหมู่ + คำค้นหา */
export default function ProductGrid({ filter, search }) {
  const { products } = useStore()
  const { t } = useLang()

  const q = search.trim().toLowerCase()
  const filtered = products.filter((p) => {
    const matchFilter =
      filter === 'All' ? true : filter === 'New' ? p.isNew : p.category === filter
    const matchSearch =
      !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  if (filtered.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl font-black uppercase italic text-neutral-300">{t('no_results')}</p>
        <p className="mt-2 text-neutral-500">{t('no_results_sub')}</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-neutral-500 mb-4">{t('items_count', { n: filtered.length })}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}
