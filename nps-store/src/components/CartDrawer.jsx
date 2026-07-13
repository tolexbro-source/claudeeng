import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'

/** ตะกร้าสินค้าแบบ Drawer เลื่อนจากขวา — เพิ่ม/ลด/ลบ และสรุปยอดรวมอัตโนมัติ */
export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, cartTotal, cartCount, updateQty, removeFromCart } = useStore()
  const { t } = useLang()
  const { formatPrice } = useCurrency()

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      {/* ฉากหลังมืด คลิกเพื่อปิด */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* แผง Drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <h2 className="text-xl font-black uppercase italic">{t('bag_title')} ({cartCount})</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 cursor-pointer" aria-label="Close">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* รายการสินค้าในตะกร้า */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {cart.length === 0 && (
            <p className="text-center text-neutral-400 py-16 font-medium">{t('bag_empty')}</p>
          )}
          {cart.map((item) => (
            <div key={item.key} className="flex gap-4">
              <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover bg-neutral-100" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">{item.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Size: {item.size}</p>
                <p className="text-sm font-bold mt-1">{formatPrice(item.price)}</p>

                {/* ปุ่มเพิ่ม/ลดจำนวน + ลบ */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-neutral-300 rounded-full">
                    <button
                      onClick={() => updateQty(item.key, -1)}
                      className="px-3 py-1 font-bold hover:bg-neutral-100 rounded-l-full cursor-pointer"
                    >
                      −
                    </button>
                    <span className="px-2 text-sm font-bold min-w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.key, 1)}
                      className="px-3 py-1 font-bold hover:bg-neutral-100 rounded-r-full cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="text-xs text-neutral-400 hover:text-red-600 underline cursor-pointer"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
              <p className="font-bold text-sm">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
        </div>

        {/* สรุปยอด + ปุ่มชำระเงิน */}
        <div className="border-t border-neutral-200 px-6 py-5 space-y-4">
          <div className="flex justify-between text-lg">
            <span className="font-medium text-neutral-600">{t('subtotal')}</span>
            <span className="font-black">{formatPrice(cartTotal)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-accent text-primary rounded-full font-bold uppercase tracking-wider text-sm hover:bg-accent-dark disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {t('checkout')}
          </button>
        </div>
      </aside>
    </div>
  )
}
