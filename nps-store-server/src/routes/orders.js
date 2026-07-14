import { Router } from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js'
import { broadcastNewOrder } from '../realtime.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// ใครก็สั่งซื้อได้ (รองรับ guest checkout) — ถ้าล็อกอินอยู่จะผูก userId ให้อัตโนมัติ
// total คำนวณใหม่ฝั่ง server จากราคาสินค้าจริงใน DB เสมอ — ไม่เชื่อค่า total ที่ client ส่งมา
// (client ส่ง total มาแค่ไหนก็ได้ ถ้าไม่เช็คฝั่งนี้จะโดนปลอมราคาสั่งซื้อได้)
router.post('/', optionalAuth, asyncHandler(async (req, res) => {
  const { id, customer, payment, items } = req.body || {}
  if (!id || !customer || !payment || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'INVALID_ORDER' })
  }

  const products = await Product.find({ _id: { $in: items.map((item) => item.productId) } })
  const priceById = new Map(products.map((p) => [p._id.toString(), Number(p.salePrice ?? p.price)]))

  let total = 0
  for (const item of items) {
    const unitPrice = priceById.get(String(item.productId))
    if (unitPrice == null || !Number.isFinite(item.qty) || item.qty <= 0) {
      return res.status(400).json({ error: 'INVALID_ORDER' })
    }
    total += unitPrice * item.qty
  }

  const order = await Order.create({
    id,
    customerName: customer.name,
    customerAddress: customer.address,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    payment,
    items,
    total,
    userId: req.user?.sub || null,
  })

  broadcastNewOrder(order)
  res.status(201).json({ order })
}))

// อ่านออเดอร์ได้เฉพาะแอดมิน
router.get('/', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 })
  res.json({ orders })
}))

export default router
