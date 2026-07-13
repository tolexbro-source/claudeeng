import { useRef, useState } from 'react'
import { useLang } from './context/LanguageContext'
import Navbar from './components/Navbar'
import HeroBanner from './components/HeroBanner'
import FilterBar from './components/FilterBar'
import ProductGrid from './components/ProductGrid'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import LoginModal from './components/auth/LoginModal'

/** เว็บหน้าบ้านสำหรับลูกค้า — หน้าแอดมินแยกเป็นแอปคนละตัว (ดูโฟลเดอร์ nps-store-admin) */
export default function App() {
  const { t } = useLang()
  const [filter, setFilter] = useState('All') // All | New | Shoes | Clothing
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const productsRef = useRef(null)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        onCartOpen={() => setCartOpen(true)}
        onLoginOpen={() => setLoginOpen(true)}
      />

      <main className="flex-1">
        <HeroBanner onShopNow={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })} />
        <section ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
          <FilterBar filter={filter} setFilter={setFilter} />
          <ProductGrid filter={filter} search={search} />
        </section>
      </main>

      <footer className="bg-primary border-t border-primary-dark py-8 text-center text-sm text-white/50">
        © 2026 <span className="font-bold text-white">NPS-STORE</span> — {t('footer_rights')}
      </footer>

      {/* Cart Drawer + Checkout Modal ลอยอยู่เหนือทุกหน้า */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* โมดัลเข้าสู่ระบบ/สมัครสมาชิกลูกค้า */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
