import 'dotenv/config'
import { connectDB } from './db.js'
import Product from './models/Product.js'
import mongoose from 'mongoose'

const sample = [
  { name: 'NPS Air Runner 01', category: 'Shoes', sizes: ['39', '40', '41', '42'], price: 4200, salePrice: 3290, image: 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Air+Runner+01', isNewArrival: true },
  { name: 'NPS Court Classic', category: 'Shoes', sizes: ['38', '39', '40', '41'], price: 2900, salePrice: null, image: 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Court+Classic', isNewArrival: false },
  { name: 'NPS Speed Knit', category: 'Shoes', sizes: ['40', '41', '42'], price: 3600, salePrice: 2990, image: 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Speed+Knit', isNewArrival: false },
  { name: 'NPS Trail X', category: 'Shoes', sizes: ['41', '42', '43', '44'], price: 4800, salePrice: null, image: 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Trail+X', isNewArrival: true },
  { name: 'NPS Essential Tee', category: 'Clothing', sizes: ['S', 'M', 'L', 'XL'], price: 890, salePrice: null, image: 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Essential+Tee', isNewArrival: false },
  { name: 'NPS Tech Hoodie', category: 'Clothing', sizes: ['S', 'M', 'L', 'XL'], price: 2200, salePrice: 1790, image: 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Tech+Hoodie', isNewArrival: true },
  { name: 'NPS Running Shorts', category: 'Clothing', sizes: ['S', 'M', 'L'], price: 1100, salePrice: null, image: 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Running+Shorts', isNewArrival: false },
  { name: 'NPS Windbreaker', category: 'Clothing', sizes: ['M', 'L', 'XL'], price: 2600, salePrice: null, image: 'https://placehold.co/700x700/ececec/171717.png?text=NPS+Windbreaker', isNewArrival: true },
]

await connectDB()
const count = await Product.countDocuments()
if (count > 0) {
  console.log(`[seed] products already has ${count} rows — skipping (ลบข้อมูลเดิมก่อนถ้าอยากรันซ้ำ)`)
} else {
  await Product.insertMany(sample)
  console.log(`[seed] inserted ${sample.length} sample products`)
}
await mongoose.disconnect()
