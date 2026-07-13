import { useLang } from '../context/LanguageContext'

/** แถบคัดกรองสินค้าด่วน: All / New Releases / Shoes / Clothing */
export default function FilterBar({ filter, setFilter }) {
  const { t } = useLang()

  const FILTERS = [
    { label: t('f_all'), value: 'All' },
    { label: t('f_new'), value: 'New' },
    { label: t('f_shoes'), value: 'Shoes' },
    { label: t('f_clothing'), value: 'Clothing' },
  ]

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
      <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight">{t('shop_heading')}</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
