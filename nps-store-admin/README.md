# NPS-Store Admin 🛠️

แผงควบคุมฝั่งแอดมินของ NPS-Store — แยกเป็นเว็บแอปคนละตัวจากหน้าร้านลูกค้า (`nps-store/`)
รันคนละคำสั่ง คนละ port ไม่ปนกัน แต่ใช้ backend เดียวกัน (`nps-store-server/`, Node/Express + MongoDB)

## วิธีติดตั้งและรัน

ต้องมี `nps-store-server` รันอยู่ก่อน (ดู `../nps-store-server/README.md`)

```bash
cd nps-store-admin
npm install                        # ติดตั้ง dependencies (ครั้งแรกครั้งเดียว)
cp .env.example .env.local         # ใส่ URL ของ nps-store-server (ค่าเริ่มต้น http://localhost:4000 ใช้ได้เลยตอน dev)
npm run dev                        # รันโหมดพัฒนา → เปิด http://localhost:5174
```

Build สำหรับใช้งานจริง:

```bash
npm run build   # ได้ไฟล์พร้อม deploy ในโฟลเดอร์ dist/
npm run preview # ทดลองเปิดไฟล์ที่ build แล้ว
```

**Deploy**: แนะนำให้ deploy แยกโดเมน/ซับโดเมนจากเว็บลูกค้า (เช่น `admin.npsstore.com` แยกจาก `npsstore.com`)
เพื่อไม่ให้ลูกค้าทั่วไปเดาทางเข้าหน้าแอดมินได้ง่าย — ตั้งค่า Environment Variable `VITE_API_URL`
บนแพลตฟอร์มโฮสต์ให้ชี้ไปที่ `nps-store-server` ที่ deploy ไว้

**รันพร้อมกับเว็บลูกค้าได้ไหม?** ได้ — คนละ port (`5173` ลูกค้า / `5174` แอดมิน) แต่ถ้าไม่อยากให้ปนกัน
จะเปิดแค่ทีละแอปก็ได้ตามต้องการ ไม่มีผลกระทบต่อกัน เพราะเป็นคนละโปรเซส คนละ `npm run dev` กันคนละหน้าต่าง

## เข้าสู่ระบบแอดมิน

- ใช้บัญชี Username/Password เดียวกับที่สมัครผ่านเว็บลูกค้า
- บัญชีที่จะเข้าหน้านี้ได้ต้องมี `isAdmin = true` — ตั้งค่าได้ด้วยคำสั่ง
  `node src/setAdmin.js <username>` ในโฟลเดอร์ `nps-store-server/` เท่านั้น (ดู `../nps-store-server/README.md`)
- ถ้าล็อกอินด้วยบัญชีที่ไม่ใช่แอดมิน ระบบจะออกจากระบบให้อัตโนมัติพร้อมแจ้งเตือน
- กด "ออกจากระบบ" มุมขวาบนของหน้า Dashboard เพื่อ Logout

## ฟีเจอร์หลังบ้าน

- **แท็บจัดการสินค้า**: หน้า Product Management แยกเป็น 2 แท็บชัดเจนคือ "รองเท้า" และ "เสื้อผ้า"
  แต่ละแท็บมีฟอร์มและตารางของตัวเอง ไม่ปนกัน
- **ไซซ์ตามหมวดหมู่**: ในฟอร์มเพิ่ม/แก้ไขสินค้า ตัวเลือกไซซ์จะเปลี่ยนอัตโนมัติตามแท็บที่เลือก
  (รองเท้า → 38, 39, 40, 41, 42, 43, 44 / เสื้อผ้า → S, M, L, XL, XXL)
  ต้องการแก้ไขไซซ์ที่มีให้เลือก แก้ไฟล์ `src/data/sizePresets.js` ที่เดียว
- **อัปโหลดรูปสินค้า**: อัปโหลดไปที่ `nps-store-server` (`POST /api/upload`) โดยตรงจากฟอร์ม พร้อมพรีวิว
  — ไฟล์ถูกเก็บไว้ที่ดิสก์ของ backend
- **แจ้งเตือนออเดอร์ใหม่แบบ Real-time**: เชื่อมต่อ WebSocket ไปที่ `nps-store-server` (`/ws`) — ลูกค้าสั่งซื้อ
  จากเว็บลูกค้า (คนละเครื่อง/คนละเบราว์เซอร์ก็ได้) แอดมินจะเห็น Toast แจ้งเตือนมุมขวาบนทันทีโดยไม่ต้องรีเฟรชหน้า

## โครงสร้างโปรเจกต์

```
nps-store-admin/
├── index.html                  # หน้า HTML หลัก (title: NPS-Store | Admin)
├── vite.config.js              # ตั้งค่า Vite + Tailwind — รันที่ port 5174
├── .env.example                # ตัวอย่างค่า Environment Variables (คัดลอกเป็น .env.local)
├── public/
│   └── logo.png                # โลโก้ร้าน (ไฟล์เดียวกับเว็บลูกค้า)
└── src/
    ├── main.jsx                # จุดเริ่มต้นแอป (Language + Currency + Auth + Store Provider)
    ├── App.jsx                 # Layout หลัก: Header เล็ก (โลโก้ + ภาษา + สกุลเงิน) + AdminDashboard
    ├── index.css                # ธีมสีเดียวกับเว็บลูกค้า (แก้ให้ตรงกันถ้าเปลี่ยนสีแบรนด์)
    ├── lib/
    │   └── apiClient.js        # fetch wrapper เรียก nps-store-server + upload รูป + WebSocket URL
    ├── i18n/
    │   └── translations.js     # คลังคำแปล 3 ภาษา (ใช้ไฟล์เดียวกับเว็บลูกค้า)
    ├── context/
    │   ├── StoreContext.jsx    # สินค้า (CRUD) + ออเดอร์ + WebSocket แจ้งเตือนออเดอร์ใหม่
    │   ├── LanguageContext.jsx
    │   ├── CurrencyContext.jsx
    │   └── AuthContext.jsx     # ล็อกอินแอดมิน (บัญชีเดียวกับลูกค้า ผ่าน nps-store-server)
    ├── data/
    │   └── sizePresets.js      # ไซซ์มาตรฐานต่อหมวดหมู่
    ├── utils/
    │   └── format.js           # ฟอร์แมตวันที่ตาม locale (ใช้ในตารางออเดอร์)
    └── components/
        ├── AdminDashboard.jsx  # หน้าหลังบ้าน (ต้องล็อกอินก่อน) + แท็บจัดการสินค้าแยกรองเท้า/เสื้อผ้า
        ├── AdminLoginPage.jsx  # หน้าเข้าสู่ระบบแอดมิน
        ├── MetricsCards.jsx    # ยอดขาย/ออเดอร์/สินค้าในคลัง
        ├── ProductForm.jsx     # เพิ่ม/แก้ไขสินค้า + อัปโหลดรูปไปที่ nps-store-server
        ├── ProductTable.jsx    # ตารางสินค้าเฉพาะหมวดหมู่ที่เลือก + Edit/Delete
        ├── OrderTable.jsx      # ตารางคำสั่งซื้อจากลูกค้า
        └── OrderToast.jsx      # Toast แจ้งเตือน Real-time เมื่อมีออเดอร์ใหม่ (ผ่าน WebSocket)
```

## หมายเหตุเรื่องโค้ดที่ใช้ร่วมกับเว็บลูกค้า

ไฟล์ `context/{LanguageContext,CurrencyContext}.jsx`, `i18n/translations.js` มีโครงเดียวกับใน `nps-store/`
(คัดลอกไว้คนละโฟลเดอร์ ไม่ได้ import ข้ามกัน เพื่อให้แต่ละแอป build/deploy แยกจากกันได้อิสระ)
— ถ้าแก้คำแปลต้องแก้ทั้ง 2 โฟลเดอร์ให้ตรงกัน `AuthContext.jsx`/`StoreContext.jsx`/`apiClient.js`
ของแอดมินมีขอบเขตต่างจากฝั่งลูกค้า (เช่น ไม่มีสมัครสมาชิก, มี CRUD สินค้า + WebSocket) จึงไม่เหมือนกันทุกตัวอักษร
