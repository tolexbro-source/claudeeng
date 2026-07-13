import { useLang } from '../context/LanguageContext'

/**
 * Hero Banner ขนาดใหญ่สไตล์ Nike — ตัวอักษรหนา เอียง เด่นชัด บนพื้นเทาอ่อน
 * TODO: ถ้าต้องการใช้ "รูปแบนเนอร์ของตัวเอง" ให้วางไฟล์ใน public/ เช่น banner.jpg
 * แล้วเพิ่ม <img src="/banner.jpg" ... /> โดยใช้ CSS background ตามต้องการ
 */
export default function HeroBanner({ onShopNow }) {
  const { t } = useLang()
  return (
    <section className="bg-primary border-b border-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
        <p className="text-xs md:text-sm font-bold tracking-[0.35em] uppercase text-white/50">
          {t('hero_kicker')}
        </p>
        <h1 className="mt-5 text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.95] text-white">
          {t('hero_1')}
          <br />
          {t('hero_2')}
        </h1>
        <p className="mt-6 text-base md:text-lg text-white/70 max-w-xl mx-auto">
          {t('hero_sub')}
        </p>
        <button
          onClick={onShopNow}
          className="mt-9 px-10 py-4 bg-accent text-primary rounded-full font-bold uppercase tracking-wider text-sm hover:bg-accent-dark active:scale-95 transition cursor-pointer"
        >
          {t('shop_now')}
        </button>
      </div>
    </section>
  )
}
