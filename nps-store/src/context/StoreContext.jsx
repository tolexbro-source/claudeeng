import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/apiClient'

const StoreContext = createContext(null)
const LS_CART_KEY = 'nps-store-cart-v1' // ตะกร้าเป็นสถานะชั่วคราวฝั่ง client เท่านั้น ไม่ต้องเก็บใน Database

export const effectivePrice = (p) => Number(p.salePrice ?? p.price)

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(LS_CART_KEY)) || []
  } catch {
    return []
  }
}

// ===== แปลงข้อมูลจาก API (Mongo _id) เป็นรูปแบบที่ใช้ในแอป =====
const productFromApi = (p) => ({
  id: p._id,
  name: p.name,
  category: p.category,
  sizes: p.sizes,
  price: p.price,
  salePrice: p.salePrice,
  image: p.image,
  isNew: p.isNew,
})

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(loadCart)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem(LS_CART_KEY, JSON.stringify(cart))
  }, [cart])

  // สินค้าอ่านได้จากทุกคน — การเพิ่ม/แก้ไข/ลบสินค้าทำได้เฉพาะฝั่ง Admin (ดูแอปแยกที่ nps-store-admin)
  useEffect(() => {
    api
      .get('/api/products')
      .then(({ products }) => setProducts((products || []).map(productFromApi)))
      .finally(() => setProductsLoading(false))
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

  // บันทึกออเดอร์ใหม่ผ่าน backend API — เปิดให้ทุกคนสั่งซื้อได้แม้ไม่ได้ล็อกอิน
  const placeOrder = async (order) => {
    try {
      await api.post('/api/orders', {
        id: order.id,
        customer: order.customer,
        payment: order.payment,
        items: order.items,
        total: order.total,
      })
      setCart([])
      return { ok: true }
    } catch {
      return { ok: false }
    }
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
