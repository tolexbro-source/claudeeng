import { useEffect, useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = { name: '', address: '', phone: '', email: '', payment: 'transfer' }

// ===== 🏦 ข้อมูลบัญชี/QR สำหรับรับโอนเงิน — แก้ตรงนี้ที่เดียว =====
// วางไฟล์รูป QR ของร้านชื่อ "payment-qr.png" ในโฟลเดอร์ public/ (ดู public/README-payment-qr.txt)
// แล้วแก้ชื่อธนาคาร/เลขบัญชี/ชื่อบัญชีด้านล่างให้ตรงกับของจริง
const BANK_INFO = {
  qrImage: '/payment-qr.png',
  bankName: 'BCEL ONE',
  accountNumber: '',
  accountName: 'Por Natphasouk',
}

/** หน้าชำระเงินแบบ Step-by-step: ข้อมูลจัดส่ง → ช่องทางชำระเงิน → ตรวจสอบ+ยืนยัน */
export default function CheckoutModal({ open, onClose }) {
  const { cart, cartTotal, placeOrder } = useStore()
  const { t } = useLang()
  const { formatPrice } = useCurrency()
  const { customer, userId } = useAuth()
  const [step, setStep] = useState(0) // 0..2 และ 'success' เมื่อสั่งซื้อสำเร็จ
  const [form, setForm] = useState(EMPTY_FORM)
  const [orderId, setOrderId] = useState('')
  const [qrMissing, setQrMissing] = useState(false) // true = ยังไม่ได้วางไฟล์ payment-qr.png
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState(false)

  // ล็อกอินอยู่แล้ว → เติมชื่อ/อีเมลให้อัตโนมัติตอนเปิด Checkout ครั้งแรก
  useEffect(() => {
    if (open && customer) {
      setForm((f) => (f.name || f.email ? f : { ...f, name: customer.name, email: customer.email }))
    }
  }, [open, customer])

  if (!open) return null

  const STEPS = [t('st_shipping'), t('st_payment'), t('st_review')]
  const PAYMENTS = [
    { value: 'transfer', label: t('pay_transfer'), desc: t('pay_transfer_desc') },
    { value: 'cod', label: t('pay_cod'), desc: t('pay_cod_desc') },
  ]

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  // ตรวจข้อมูลจัดส่งครบก่อนไปขั้นถัดไป
  const shippingValid =
    form.name.trim() && form.address.trim() && form.phone.trim() && /\S+@\S+\.\S+/.test(form.email)

  const close = () => {
    onClose()
    setStep(0)
    setForm(EMPTY_FORM)
  }

  // ยืนยันคำสั่งซื้อ → บันทึกลง Supabase (ตาราง orders) และล้างตะกร้า
  const confirmOrder = async () => {
    const id = 'NPS-' + Date.now()
    setPlacing(true)
    setPlaceError(false)
    const result = await placeOrder({
      id,
      createdAt: new Date().toISOString(),
      customer: { name: form.name, address: form.address, phone: form.phone, email: form.email },
      payment: form.payment,
      items: cart.map(({ name, size, qty, price }) => ({ name, size, qty, price })),
      total: cartTotal,
      userId,
    })
    setPlacing(false)
    if (!result.ok) {
      setPlaceError(true)
      return
    }
    setOrderId(id)
    setStep('success')
  }

  const inputCls =
    'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={close} className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* หัว Modal */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase italic">{t('checkout')}</h2>
            <button onClick={close} className="p-2 rounded-full hover:bg-neutral-100 cursor-pointer" aria-label="Close">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* แถบแสดงขั้นตอน */}
          {step !== 'success' && (
            <div className="mt-4 flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i <= step ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-xs font-bold uppercase hidden sm:block ${i <= step ? 'text-primary' : 'text-neutral-400'}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <div className="h-px flex-1 bg-neutral-200" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {/* STEP 1: ข้อมูลจัดส่ง */}
          {step === 0 && (
            <div className="space-y-4">
              <input className={inputCls} placeholder={t('ph_name')} value={form.name} onChange={set('name')} />
              <textarea
                className={inputCls}
                rows="3"
                placeholder={t('ph_address')}
                value={form.address}
                onChange={set('address')}
              />
              <input className={inputCls} type="tel" placeholder={t('ph_phone')} value={form.phone} onChange={set('phone')} />
              <input className={inputCls} type="email" placeholder={t('ph_email')} value={form.email} onChange={set('email')} />
              <button
                onClick={() => setStep(1)}
                disabled={!shippingValid}
                className="w-full py-4 bg-accent text-primary rounded-full font-bold uppercase tracking-wider text-sm hover:bg-accent-dark disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {t('continue_payment')}
              </button>
            </div>
          )}

          {/* STEP 2: ช่องทางชำระเงิน (จำลอง) */}
          {step === 1 && (
            <div className="space-y-3">
              {PAYMENTS.map((p) => (
                <div key={p.value}>
                  <label
                    className={`flex items-center gap-4 border-2 rounded-2xl px-5 py-4 cursor-pointer transition ${
                      form.payment === p.value ? 'border-primary bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'
                    } ${form.payment === p.value && p.value === 'transfer' ? 'rounded-b-none border-b-0' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={p.value}
                      checked={form.payment === p.value}
                      onChange={set('payment')}
                      className="accent-primary h-4 w-4"
                    />
                    <div>
                      <p className="font-bold text-sm">{p.label}</p>
                      <p className="text-xs text-neutral-500">{p.desc}</p>
                    </div>
                  </label>

                  {/* QR Code รับโอนเงิน — แสดงเมื่อเลือกช่องทาง "โอนเงิน / QR Code" */}
                  {p.value === 'transfer' && form.payment === 'transfer' && (
                    <div className="border-2 border-t-0 border-primary rounded-b-2xl px-5 py-4 flex items-center gap-4 bg-neutral-50">
                      {qrMissing ? (
                        <div className="h-28 w-28 shrink-0 flex items-center justify-center text-center text-[10px] leading-tight text-neutral-400 border-2 border-dashed border-neutral-300 rounded-xl p-2 bg-white">
                          วางไฟล์ payment-qr.png ใน public/
                        </div>
                      ) : (
                        <img
                          src={BANK_INFO.qrImage}
                          alt="QR Code ชำระเงิน"
                          onError={() => setQrMissing(true)}
                          className="h-28 w-28 object-contain bg-white border border-neutral-200 rounded-xl p-1.5 shrink-0"
                        />
                      )}
                      <div className="text-xs text-neutral-600 space-y-0.5">
                        <p className="font-bold text-sm text-neutral-900">{t('pay_qr_label')}</p>
                        <p>{BANK_INFO.bankName}</p>
                        <p className="font-bold tracking-wide">{BANK_INFO.accountNumber}</p>
                        <p>{BANK_INFO.accountName}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="flex-1 py-4 border-2 border-neutral-300 rounded-full font-bold uppercase text-sm hover:border-primary transition cursor-pointer">
                  {t('back')}
                </button>
                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-accent text-primary rounded-full font-bold uppercase text-sm hover:bg-accent-dark transition cursor-pointer">
                  {t('review_order')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ตรวจสอบและยืนยัน */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-neutral-50 rounded-2xl p-5 space-y-1 text-sm">
                <p className="font-black uppercase text-xs tracking-wider text-neutral-500 mb-2">{t('ship_to')}</p>
                <p className="font-bold">{form.name}</p>
                <p className="text-neutral-600 whitespace-pre-line">{form.address}</p>
                <p className="text-neutral-600">{form.phone} · {form.email}</p>
                <p className="pt-2 font-bold">
                  {t('pay_label')}: <span className="font-medium">{form.payment === 'transfer' ? t('pay_transfer') : t('pay_cod')}</span>
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {cart.map((i) => (
                  <div key={i.key} className="flex justify-between">
                    <span className="text-neutral-600">{i.name} ({i.size}) × {i.qty}</span>
                    <span className="font-bold">{formatPrice(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-neutral-200 text-base">
                  <span className="font-bold">{t('order_total')}</span>
                  <span className="font-black">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {placeError && <p className="text-xs text-accent font-bold">{t('place_order_error')}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-neutral-300 rounded-full font-bold uppercase text-sm hover:border-primary transition cursor-pointer">
                  {t('back')}
                </button>
                <button onClick={confirmOrder} disabled={placing} className="flex-1 py-4 bg-accent text-primary rounded-full font-bold uppercase text-sm hover:bg-accent-dark disabled:opacity-60 transition cursor-pointer">
                  {t('place_order')}
                </button>
              </div>
            </div>
          )}

          {/* สั่งซื้อสำเร็จ */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 bg-accent text-primary rounded-full flex items-center justify-center">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-black uppercase italic">{t('success_title')}</h3>
              <p className="mt-2 text-neutral-600 text-sm">
                {t('success_msg')}
                <br />
                <span className="font-bold text-primary">{orderId}</span>
              </p>
              <button onClick={close} className="mt-6 px-10 py-3.5 bg-accent text-primary rounded-full font-bold uppercase text-sm hover:bg-accent-dark transition cursor-pointer">
                {t('continue_shopping')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
