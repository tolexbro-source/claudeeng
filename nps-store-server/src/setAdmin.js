// วิธีใช้: node src/setAdmin.js <username>
import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import User from './models/User.js'

const username = process.argv[2]?.trim().toLowerCase()
if (!username) {
  console.error('วิธีใช้: node src/setAdmin.js <username>')
  process.exit(1)
}

await connectDB()
const user = await User.findOneAndUpdate({ username }, { isAdmin: true }, { new: true })
if (!user) {
  console.error(`ไม่พบผู้ใช้ชื่อ "${username}" — ต้องสมัครสมาชิกที่หน้าเว็บก่อน`)
} else {
  console.log(`ตั้ง "${username}" เป็นแอดมินแล้ว — ล็อกอินใหม่ที่แอป nps-store-admin ได้เลย`)
}
await mongoose.disconnect()
