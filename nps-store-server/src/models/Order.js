import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // สร้างฝั่ง client เช่น "NPS-<timestamp>"
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true },
  payment: { type: String, required: true, enum: ['transfer', 'cod'] },
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } })

export default mongoose.model('Order', orderSchema)
