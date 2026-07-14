# nps-store-server

Backend API (Node/Express + MongoDB) สำหรับ `nps-store` (ลูกค้า) และ `nps-store-admin` (แอดมิน) —
แทนที่ Supabase เดิม เพราะ MongoDB เชื่อมตรงจาก browser ไม่ได้อย่างปลอดภัย

## ติดตั้ง

```bash
npm install
cp .env.example .env
```

แก้ไฟล์ `.env`:
- `MONGODB_URI` — connection string จาก MongoDB Atlas (Connect > Drivers)
- `JWT_SECRET` — ข้อความสุ่มยาวๆ อะไรก็ได้
- `CORS_ORIGINS` — โดเมน/port ของ `nps-store` และ `nps-store-admin` (ค่าเริ่มต้นรองรับ `vite dev` ทั้งสองแอปพร้อมกันแล้ว)

## รัน

```bash
npm run seed   # (ไม่บังคับ) ใส่สินค้าตัวอย่าง
npm run dev    # http://localhost:4000
```

## ตั้งบัญชีแรกให้เป็นแอดมิน

1. สมัครสมาชิกตามปกติผ่านหน้าเว็บ `nps-store` (ปุ่ม "เข้าสู่ระบบ" > "สมัครสมาชิก")
2. รันคำสั่งนี้ในโฟลเดอร์นี้ (ต้องรันตอน `.env` ชี้ไปที่ฐานข้อมูลเดียวกับที่แอปใช้):
   ```bash
   node src/setAdmin.js <username>
   ```
3. ล็อกอินใหม่ที่แอป `nps-store-admin` ด้วยบัญชีเดียวกัน จะเข้าหน้า Admin Dashboard ได้ทันที

## API

- `POST /api/auth/register` `{ username, password }` → `{ token, user }`
- `POST /api/auth/login` `{ username, password }` → `{ token, user }`
- `GET /api/auth/me` (ต้องล็อกอิน) → `{ user }`
- `GET /api/products` (public) → `{ products }`
- `POST/PUT/DELETE /api/products` (แอดมินเท่านั้น)
- `POST /api/orders` (public, แนบ token ได้ถ้าล็อกอินอยู่) → บันทึกออเดอร์ + ยิง realtime แจ้งแอดมิน
- `GET /api/orders` (แอดมินเท่านั้น)
- `POST /api/upload` (แอดมินเท่านั้น, multipart `image` + `category`) → `{ url }` รูปถูกเสิร์ฟที่ `/uploads/...`
- `WS /ws?token=<jwt>` — แจ้งเตือนออเดอร์ใหม่แบบเรียลไทม์ (เฉพาะแอดมิน) ส่ง `{ type: 'order:new', order }`

## หมายเหตุ Production

รูปสินค้าถูกเก็บไว้ที่ดิสก์ของเซิร์ฟเวอร์ (`uploads/`) — ถ้า deploy บน host ที่ดิสก์ไม่ persistent
(เช่น serverless) ต้องเปลี่ยนไปใช้ cloud storage (S3/Cloudinary) แทน
