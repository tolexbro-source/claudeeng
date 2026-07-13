import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const StoreContext = createContext(null)
const LS_CART_KEY = 'nps-store-cart-v1' // ตะกร้าเป็นสถานะชั่วคราวฝั่ง client เท่านั้น ไม่ต้องเก็บใน Database

export const effectivePrice = (p) => Number(p.salePrice || p.price)

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(LS_CART_KEY)) || []
  } catch {
    return []
  }
}

// ===== แปลงข้อมูลจากตาราง Supabase (snake_case) เป็นรูปแบบที่ใช้ในแอป (camelCase) =====
const productFromRow = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  sizes: r.sizes,
  price: r.price,
  salePrice: r.sale_price,
  image: r.image,
  isNew: r.is_new,
})

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(loadCart)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem(LS_CART_KEY, JSON.stringify(cart))
  }, [cart])

  // สินค้าอ่านได้จากทุกคน (ดู RLS policy "products_public_read" ใน supabase/schema.sql)
  // การเพิ่ม/แก้ไข/ลบสินค้าทำได้เฉพาะฝั่ง Admin (ดูแอปแยกที่ nps-store-admin)
  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts((data || []).map(productFromRow))
        setProductsLoading(false)
      })
  }, [])

  const addToCart = (product, size) => {
    const key = `${product.id}__${size}` // สินค้าเดียวกันแต่คนละไซซ์ = คนละรายการ
    setCart((prev) => {
      const found = prev.find((i) => i.key === key)
      if (found) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
      return [
        ...prev,
        { key, productId: product.id, name: product.name, image: product.image, size, price: effectivePrice(product), qty: 1 },
      ]
    })
  }

  const updateQty = (key, delta) =>
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0))

  const removeFromCart = (key) => setCart((prev) => prev.filter((i) => i.key !== key))

  // บันทึกออเดอร์ใหม่ลง Supabase — เปิดให้ทุกคนสั่งซื้อได้แม้ไม่ได้ล็อกอิน (ดู policy "orders_anyone_insert")
  const placeOrder = async (order) => {
    const row = {
      id: order.id,
      customer_name: order.customer.name,
      customer_address: order.customer.address,
      customer_phone: order.customer.phone,
      customer_email: order.customer.email,
      payment: order.payment,
      items: order.items,
      total: order.total,
      user_id: order.userId || null,
    }
    const { error } = await supabase.from('orders').insert(row)
    if (!error) setCart([])
    return { ok: !error }
  }

  const value = useMemo(
    () => ({
      products,
      cart,
      productsLoading,
      addToCart,
      updateQty,
      removeFromCart,
      placeOrder,
      cartCount: cart.reduce((s, i) => s + i.qty, 0),
      cartTotal: cart.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    [products, cart, productsLoading]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// Hook สำหรับเรียกใช้ข้อมูลร้านจาก Component ใดก็ได้
export const useStore = () => useContext(StoreContext)
