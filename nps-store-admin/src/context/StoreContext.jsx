import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const StoreContext = createContext(null)

// ===== แปลงข้อมูลระหว่างรูปแบบที่ใช้ในแอป (camelCase) กับตาราง Supabase (snake_case) =====
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
const productToRow = (p) => ({
  name: p.name,
  category: p.category,
  sizes: p.sizes,
  price: p.price,
  sale_price: p.salePrice,
  image: p.image,
  is_new: p.isNew,
})
const orderFromRow = (r) => ({
  id: r.id,
  createdAt: r.created_at,
  payment: r.payment,
  items: r.items,
  total: r.total,
  customer: { name: r.customer_name, address: r.customer_address, phone: r.customer_phone, email: r.customer_email },
})

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [unreadOrderCount, setUnreadOrderCount] = useState(0)
  const [productsLoading, setProductsLoading] = useState(true)

  // สินค้า: อ่านได้จากทุกคน (ดู RLS policy "products_public_read" ใน supabase/schema.sql)
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

  // ออเดอร์: อ่านได้เฉพาะแอดมิน (RLS จำกัดไว้) — เรียกจาก AdminDashboard ตอนล็อกอินสำเร็จเท่านั้น
  const refetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders((data || []).map(orderFromRow))
  }

  // ฟังออเดอร์ใหม่แบบ Real-time ผ่าน Supabase Realtime — จำเป็นเพราะตอนนี้ลูกค้ากับแอดมินแยกเป็นคนละแอปคนละเครื่องแล้ว
  // (สั่งซื้อจากเว็บลูกค้า จะไม่มีการอัปเดต state ในแอปนี้ตรงๆ เหมือนตอนอยู่แอปเดียวกัน)
  // ต้องเปิด Realtime ให้ตาราง orders ก่อน (ดูคำสั่ง alter publication ใน supabase/schema.sql)
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => (prev.some((o) => o.id === payload.new.id) ? prev : [orderFromRow(payload.new), ...prev]))
        setUnreadOrderCount((n) => n + 1)
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const addProduct = async (product) => {
    const { data, error } = await supabase.from('products').insert(productToRow(product)).select().single()
    if (!error) setProducts((prev) => [productFromRow(data), ...prev])
    return { ok: !error }
  }

  const updateProduct = async (product) => {
    const { data, error } = await supabase
      .from('products')
      .update(productToRow(product))
      .eq('id', product.id)
      .select()
      .single()
    if (!error) setProducts((prev) => prev.map((p) => (p.id === product.id ? productFromRow(data) : p)))
    return { ok: !error }
  }

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== id))
    return { ok: !error }
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
