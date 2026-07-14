import { Router } from 'express'
import Product from '../models/Product.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// isNewArrival (ชื่อฟิลด์ใน DB) ↔ isNew (ชื่อฟิลด์ใน API/JSON ที่ frontend ใช้)
const toPublic = (p) => ({
  _id: p._id,
  name: p.name,
  category: p.category,
  sizes: p.sizes,
  price: p.price,
  salePrice: p.salePrice,
  image: p.image,
  isNew: p.isNewArrival,
  createdAt: p.createdAt,
})

router.get('/', asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 })
  res.json({ products: products.map(toPublic) })
}))

router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { name, category, sizes, price, salePrice, image, isNew } = req.body || {}
  const product = await Product.create({ name, category, sizes, price, salePrice: salePrice ?? null, image, isNewArrival: !!isNew })
  res.status(201).json({ product: toPublic(product) })
}))

router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { name, category, sizes, price, salePrice, image, isNew } = req.body || {}
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, category, sizes, price, salePrice: salePrice ?? null, image, isNewArrival: !!isNew },
    { new: true, runValidators: true }
  )
  if (!product) return res.status(404).json({ error: 'NOT_FOUND' })
  res.json({ product: toPublic(product) })
}))

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).json({ error: 'NOT_FOUND' })
  res.status(204).end()
}))

export default router
