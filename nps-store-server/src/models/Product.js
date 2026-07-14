import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Shoes', 'Clothing'] },
  sizes: { type: [String], default: [] },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  image: { type: String, default: null },
  isNewArrival: { type: Boolean, default: false }, // ตั้งชื่อเลี่ยง "isNew" เพราะเป็นชื่อที่ Mongoose ใช้ภายในอยู่แล้ว (ดู mongoose warning)
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } })

export default mongoose.model('Product', productSchema)
