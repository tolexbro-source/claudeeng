import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
const UPLOAD_ROOT = path.resolve('uploads')

// ใช้ memoryStorage เพราะ multer เติม req.body ให้ครบตอนพาร์สฟิลด์ไฟล์เสร็จเท่านั้น —
// ถ้าใช้ diskStorage แล้วอ่าน req.body.category ใน destination() อาจได้ค่า undefined
// เมื่อฟิลด์ category มาทีหลังฟิลด์ไฟล์ใน multipart stream (ขึ้นอยู่กับลำดับที่ client ส่ง)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/', requireAuth, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'NO_FILE' })

  const category = /^[a-zA-Z0-9_-]+$/.test(req.body.category || '') ? req.body.category : 'misc'
  const dir = path.join(UPLOAD_ROOT, category)
  fs.mkdirSync(dir, { recursive: true })

  const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
  fs.writeFileSync(path.join(dir, filename), req.file.buffer)

  const url = `${req.protocol}://${req.get('host')}/uploads/${category}/${filename}`
  res.status(201).json({ url })
})

export default router
