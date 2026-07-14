import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, realtimeWsURL } from '../lib/apiClient'
import { useAuth } from './AuthContext'

const StoreContext = createContext(null)

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
const orderFromApi = (o) => ({
  id: o.id,
  createdAt: o.createdAt,
  payment: o.payment,
  items: o.items,
  total: o.total,
  customer: { name: o.customerName, address: o.customerAddress, phone: o.customerPhone, email: o.customerEmail },
})

export function StoreProvider({ children }) {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [unreadOrderCount, setUnreadOrderCount] = useState(0)
  const [productsLoading, setProductsLoading] = useState(true)

  // สินค้า: อ่านได้จากทุกคน
  useEffect(() => {
    api
      .get('/api/products')
      .then(({ products }) => setProducts((products || []).map(productFromApi)))
      .finally(() => setProductsLoading(false))
  }, [])

  // ออเดอร์: อ่านได้เฉพาะแอดมิน — เรียกจาก AdminDashboard ตอนล็อกอินสำเร็จเท่านั้น
  const refetchOrders = async () => {
    const { orders } = await api.get('/api/orders')
    setOrders((orders || []).map(orderFromApi))
  }

  // ฟังออเดอร์ใหม่แบบ Real-time ผ่าน WebSocket ของ nps-store-server — จำเป็นเพราะลูกค้ากับแอดมินแยกเป็นคนละแอปคนละเครื่อง
  // เปิดการเชื่อมต่อเฉพาะตอนล็อกอินเป็นแอดมินแล้วเท่านั้น (ต้องมี JWT ที่ isAdmin=true)
  useEffect(() => {
    if (!isAdmin) return
    const token = getToken()
    if (!token) return

    const ws = new WebSocket(realtimeWsURL(token))
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type !== 'order:new') return
      const order = orderFromApi(msg.order)
      setOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]))
      setUnreadOrderCount((n) => n + 1)
    }
    return () => ws.close()
  }, [isAdmin])

  const addProduct = async (product) => {
    try {
      const { product: created } = await api.post('/api/products', product)
      setProducts((prev) => [productFromApi(created), ...prev])
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }

  const updateProduct = async (product) => {
    try {
      const { product: updated } = await api.put(`/api/products/${product.id}`, product)
      setProducts((prev) => prev.map((p) => (p.id === product.id ? productFromApi(updated) : p)))
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }

  const deleteProduct = async (id) => {
    try {
      await api.del(`/api/products/${id}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }

  // แอดมินเปิดหน้า Order Management แล้ว → เคลียร์ Badge + โหลดออเดอร์ล่าสุดทั้งหมด
  const markOrdersSeen = () => {
    setUnreadOrderCount(0)
    refetchOrders()
  }

  const value = useMemo(
    () => ({
      products,
      orders,
      unreadOrderCount,
      productsLoading,
      addProduct,
      updateProduct,
      deleteProduct,
      markOrdersSeen,
    }),
    [products, orders, unreadOrderCount, productsLoading]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// Hook สำหรับเรียกใช้ข้อมูลร้านจาก Component ใดก็ได้
export const useStore = () => useContext(StoreContext)
