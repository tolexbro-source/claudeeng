# NPS-Store 🏃‍♂️ (เว็บลูกค้า)

เว็บไซต์ E-commerce ขายรองเท้าและเสื้อผ้าแฟชั่น ดีไซน์มินิมอลสไตล์ Nike Web Store
(React + Vite + Tailwind CSS v4 · Backend/Database จริงด้วย Node/Express + MongoDB · รองรับ 3 ภาษา ไทย/อังกฤษ/ลาว)

> โปรเจกต์นี้แยกเป็น **3 โปรเจกต์** ใช้ backend เดียวกัน:
> - **`nps-store/`** (โฟลเดอร์นี้) — เว็บหน้าร้านสำหรับลูกค้า รันที่ port `5173`
> - **`nps-store-admin/`** — แผงควบคุมสำหรับแอดมิน รันแยกที่ port `5174` (ดู `nps-store-admin/README.md`)
> - **`nps-store-server/`** — Backend API (Express + MongoDB) ที่ทั้งสองแอปด้านบนเรียกใช้ (ดู `nps-store-server/README.md`)
>
> ต้องรัน `nps-store-server` ก่อนเสมอ ไม่งั้นล็อกอิน/สินค้า/ออเดอร์จะใช้งานไม่ได้

## วิธีติดตั้งและรัน

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 18 ขึ้นไป และตั้งค่า `nps-store-server` ให้รันอยู่ก่อน
(ดู `nps-store-server/README.md` — ต้องมี MongoDB Atlas connection string)

```bash
cd nps-store
npm install                        # ติดตั้ง dependencies (ครั้งแรกครั้งเดียว)
cp .env.example .env.local         # แล้วใส่ URL ของ nps-store-server (ค่าเริ่มต้น http://localhost:4000 ใช้ได้เลยตอน dev)
npm run dev                        # รันโหมดพัฒนา → เปิด http://localhost:5173
```

Build สำหรับใช้งานจริง:

```bash
npm run build   # ได้ไฟล์พร้อม deploy ในโฟลเดอร์ dist/
npm run preview # ทดลองเปิดไฟล์ที่ build แล้ว
```

**Deploy**: อัปโหลดโฟลเดอร์ `dist/` ไปที่ Vercel / Netlify / Cloudflare Pages หรือโฮสต์ไฟล์ static ใดก็ได้
อย่าลืมตั้งค่า Environment Variable `VITE_API_URL` บนแพลตฟอร์มโฮสต์ให้ชี้ไปที่ URL ของ `nps-store-server`
ที่ deploy ไว้ (ไม่ใช่ `localhost`) ไม่งั้น build จริงจะต่อ backend ไม่ได้

## ระบบหลายภาษา (ไทย / English / ລາວ)

- สลับภาษาได้จาก **ตัวเลือกภาษาบน Navbar** (ไทย / EN / ລາວ) — ระบบจำภาษาที่เลือกไว้ใน LocalStorage
- คำแปลทั้งหมดอยู่ที่ `src/i18n/translations.js` แก้ไข/เพิ่มคำได้ที่ไฟล์เดียว
- **ภาษาลาวใช้ฟอนต์ Phetsalath OT ตัวหนา** ตามลำดับนี้:
  1. ฟอนต์ Phetsalath OT / Phetsarath OT ที่ติดตั้งในเครื่องผู้ใช้ (ถ้ามี)
  2. ไฟล์ `public/fonts/PhetsalathOT.ttf` (ถ้าคุณนำไฟล์ฟอนต์มาวางเอง)
  3. ฟอนต์ **Phetsarath** จาก Google Fonts (โหลดอัตโนมัติ ใช้ได้ทันที)
- ต้องการใช้ไฟล์ฟอนต์ของตัวเอง: วาง `PhetsalathOT.ttf` ในโฟลเดอร์ `public/fonts/` ได้เลย

## วิธีใส่โลโก้ของคุณเอง

1. วางไฟล์โลโก้ชื่อ `logo.png` ทับไฟล์เดิมในโฟลเดอร์ `public/` (ตอนนี้มีไฟล์ตั้งต้นอยู่แล้ว)
2. ระบบแสดงโลโก้อยู่ที่ `src/components/Navbar.jsx` บรรทัด `<img src="/logo.png" ... />` — ไม่ต้องแก้โค้ดเพิ่ม แค่เปลี่ยนไฟล์รูปก็พอ
3. อยากปรับขนาดโลโก้ แก้คลาส `h-9 w-9` ในแท็ก `<img>` นั้นได้เลย

(ใส่แบนเนอร์ Hero ของตัวเองได้เช่นกัน — ดูคอมเมนต์ใน `src/components/HeroBanner.jsx`)

## วิธีเปลี่ยนสีธีมให้เข้ากับโลโก้ (Theme Colors)

สีหลักของทั้งเว็บถูกรวมไว้ที่จุดเดียว: เปิดไฟล์ `src/index.css` มองหาบล็อกคอมเมนต์
`🎨 THEME COLORS` ด้านในสุดของ `@theme { ... }` แล้วแก้ค่าตัวแปรเหล่านี้:

```css
--color-primary: #111111;        /* สีหลักของแบรนด์ — ปุ่ม CTA, active state, โลโก้ตัวอักษร */
--color-primary-dark: #000000;   /* สีหลักตอน hover/active (เข้มขึ้นจาก primary) */
--color-secondary: #6b6b6b;      /* สีรอง — ข้อความ/ไอคอนรองที่ต้องการเน้นน้อยกว่า primary */
--color-accent: #dc2626;         /* สีเน้น — ป้าย Sale, ราคาลด, แจ้งเตือนออเดอร์ใหม่ */
```

แก้ค่า Hex ตรงนี้แล้ว **สีจะเปลี่ยนทั้งเว็บทันทีทุกจุด** (ปุ่ม Add to Cart, ปุ่ม Checkout,
ป้าย New/Sale ฯลฯ) เพราะทุกคอมโพเนนต์เรียกใช้ผ่านคลาส Tailwind
`bg-primary` / `text-primary` / `border-primary` / `bg-primary-dark` / `text-accent` / `bg-accent`
ไม่มีสีเขียนตรงๆ (hardcode) กระจายอยู่ในไฟล์คอมโพเนนต์แล้ว
(สีแดง/เขียวของปุ่ม "ลบ" และ "เพิ่มสำเร็จ" ยังคงเป็นสีบอกสถานะปกติ ไม่ผูกกับธีมแบรนด์)
ไฟล์ `src/index.css` ของแอปแอดมิน (`nps-store-admin/`) ใช้ธีมสีชุดเดียวกัน — แก้ 2 ที่ให้ตรงกันถ้าเปลี่ยนสี

## วิธีใส่ QR Code รับโอนเงินของร้าน

1. วางไฟล์รูป QR ชื่อ `payment-qr.png` ในโฟลเดอร์ `public/` (ดู `public/README-payment-qr.txt`)
2. รูปจะแสดงอัตโนมัติที่หน้า Checkout ขั้นตอนเลือกช่องทางชำระเงิน เมื่อลูกค้าเลือก "โอนเงิน / QR Code"
   — ถ้ายังไม่วางไฟล์ ระบบจะโชว์กล่องเตือนแทนรูปที่หายไป ไม่ใช่ไอคอนรูปพังๆ
3. ต้องการแก้ชื่อธนาคาร/เลขบัญชี/ชื่อบัญชีที่แสดงคู่กับ QR เปิดไฟล์ `src/components/CheckoutModal.jsx`
   มองหาคอมเมนต์ `🏦 ข้อมูลบัญชี/QR` ที่ด้านบนไฟล์ (ตัวแปร `BANK_INFO`) แล้วแก้ค่าตรงนั้น

## ระบบเข้าสู่ระบบลูกค้า (Username/Password)

- กดปุ่ม **"เข้าสู่ระบบ"** ที่ Navbar เพื่อเปิดโมดัลล็อกอิน/สมัครสมาชิก
- ลูกค้าสมัคร/ล็อกอินด้วย **ชื่อผู้ใช้ + รหัสผ่าน** เท่านั้น — รหัสผ่านถูก hash ด้วย bcrypt ที่ฝั่ง
  `nps-store-server` และแลกเป็น JWT เก็บไว้ใน LocalStorage ของเบราว์เซอร์ (ดู `src/context/AuthContext.jsx`)
- ล็อกอินอยู่แล้ว → ชื่อจะถูกเติมในฟอร์ม Checkout ให้อัตโนมัติ (อีเมลสำหรับจัดส่ง/ติดต่อยังต้องกรอกเองที่หน้า Checkout)

บัญชีเดียวกันนี้ใช้ล็อกอินฝั่งแอดมินได้ด้วย (ต้องตั้งเป็นแอดมินก่อน — ดู `nps-store-server/README.md`)

## โครงสร้างโปรเจกต์

```
nps-store/
├── index.html                  # หน้า HTML หลัก + โหลดฟอนต์ (รวมฟอนต์ลาว)
├── vite.config.js              # ตั้งค่า Vite + Tailwind
├── .env.example                 # ตัวอย่างค่า Environment Variables (คัดลอกเป็น .env.local)
├── public/
│   └── fonts/                  # วาง PhetsalathOT.ttf ที่นี่ (ถ้าต้องการ)
└── src/
    ├── main.jsx                # จุดเริ่มต้นแอป (Language + Currency + Auth + Store Provider)
    ├── App.jsx                 # Layout หลักของเว็บลูกค้า (Navbar + Hero + Product Grid + Footer)
    ├── index.css               # ธีม Tailwind + @font-face ฟอนต์ลาว
    ├── lib/
    │   └── apiClient.js        # fetch wrapper เรียก nps-store-server + จัดการ JWT token
    ├── i18n/
    │   └── translations.js     # คลังคำแปล 3 ภาษา (th / en / lo)
    ├── context/
    │   ├── StoreContext.jsx    # สินค้า (อ่านจาก backend API) + ตะกร้า + สั่งซื้อ (client-side)
    │   ├── LanguageContext.jsx # ระบบเปลี่ยนภาษา + hook useLang()
    │   ├── CurrencyContext.jsx # ระบบเปลี่ยนสกุลเงิน บาท/กีบ + hook useCurrency()
    │   └── AuthContext.jsx     # ล็อกอิน/สมัครสมาชิกลูกค้า (Username/Password ผ่าน backend API)
    └── components/
        ├── Navbar.jsx          # Header: โลโก้ เมนู ค้นหา ภาษา สกุลเงิน ล็อกอิน ตะกร้า
        ├── HeroBanner.jsx      # แบนเนอร์ใหญ่ + ปุ่ม Shop Now
        ├── FilterBar.jsx       # ปุ่มกรอง All / New / Shoes / Clothing
        ├── ProductGrid.jsx     # Grid สินค้า (กรอง+ค้นหา)
        ├── ProductCard.jsx     # การ์ดสินค้า + เลือกไซซ์ + Add to Cart
        ├── CartDrawer.jsx      # ตะกร้าสินค้า (เพิ่ม/ลด/ลบ/ยอดรวม)
        ├── CheckoutModal.jsx   # ชำระเงิน 3 ขั้นตอน + ยืนยันออเดอร์ + QR รับโอนเงิน
        └── auth/
            └── LoginModal.jsx  # โมดัลล็อกอิน/สมัครสมาชิกลูกค้า (Username/Password)
```

หน้าหลังบ้าน/แอดมิน (จัดการสินค้าแยกแท็บ, จัดการออเดอร์, แจ้งเตือนออเดอร์ใหม่แบบ Real-time)
อยู่คนละแอปที่ `nps-store-admin/` — ดูรายละเอียดที่ `nps-store-admin/README.md`

## การเก็บข้อมูล

| ข้อมูล | เก็บที่ | หมายเหตุ |
|---|---|---|
| สินค้า (`products`) | MongoDB | ทุกคนอ่านได้ แก้ไข/ลบได้เฉพาะแอดมิน |
| คำสั่งซื้อ (`orders`) | MongoDB | ใครก็สั่งซื้อได้ (Guest checkout), อ่านได้เฉพาะแอดมิน |
| บัญชีผู้ใช้ + สิทธิ์แอดมิน (`users`) | MongoDB | รหัสผ่าน hash ด้วย bcrypt, session เป็น JWT |
| รูปสินค้า | ดิสก์ของ `nps-store-server` (โฟลเดอร์ `uploads/`) | อัปโหลดจากฟอร์มเพิ่มสินค้าโดยตรง |
| ตะกร้าสินค้า | LocalStorage เครื่องลูกค้า (คีย์ `nps-store-cart-v1`) | ชั่วคราวก่อนสั่งซื้อ ไม่จำเป็นต้องอยู่ใน Database |
| ภาษา / สกุลเงินที่เลือก | LocalStorage (`nps-store-lang` / `nps-store-currency`) | ค่ากำหนดส่วนตัวของเบราว์เซอร์นั้นๆ |

เนื่องจากข้อมูลหลัก (สินค้า/ออเดอร์/บัญชี) อยู่บน MongoDB ผ่าน `nps-store-server` แล้ว
**ทุกคนที่เข้าเว็บจะเห็นข้อมูลชุดเดียวกัน** ไม่ผูกกับเครื่อง/เบราว์เซอร์ — ล้างข้อมูลสินค้า/ออเดอร์ทำได้ที่
MongoDB Atlas > Browse Collections โดยตรง
