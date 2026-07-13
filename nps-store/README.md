# NPS-Store 🏃‍♂️ (เว็บลูกค้า)

เว็บไซต์ E-commerce ขายรองเท้าและเสื้อผ้าแฟชั่น ดีไซน์มินิมอลสไตล์ Nike Web Store
(React + Vite + Tailwind CSS v4 · Backend/Database จริงด้วย [Supabase](https://supabase.com) · รองรับ 3 ภาษา ไทย/อังกฤษ/ลาว)

> โปรเจกต์นี้แยกเป็น **2 เว็บแอปคนละตัว** ใช้ Supabase backend ร่วมกัน:
> - **`nps-store/`** (โฟลเดอร์นี้) — เว็บหน้าร้านสำหรับลูกค้า รันที่ port `5173`
> - **`nps-store-admin/`** — แผงควบคุมสำหรับแอดมิน รันแยกที่ port `5174` (ดู `nps-store-admin/README.md`)
>
> รันได้ทีละแอปหรือพร้อมกันก็ได้ (คนละ port ไม่ชนกัน) แต่ละแอปมี `npm install` / `npm run dev` ของตัวเอง

## วิธีติดตั้งและรัน

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 18 ขึ้นไป และโปรเจกต์ Supabase (ดูหัวข้อ
**"ตั้งค่า Supabase"** ด้านล่าง — ต้องทำก่อน ไม่งั้นล็อกอิน/สินค้า/ออเดอร์จะใช้งานไม่ได้
**ทำแค่ครั้งเดียว ใช้ร่วมกันทั้ง 2 แอป ไม่ต้องตั้งซ้ำที่ nps-store-admin**)

```bash
cd nps-store
npm install                        # ติดตั้ง dependencies (ครั้งแรกครั้งเดียว)
cp .env.example .env.local         # แล้วใส่ค่า Supabase URL/Key ของคุณในไฟล์นี้
npm run dev                        # รันโหมดพัฒนา → เปิด http://localhost:5173
```

Build สำหรับใช้งานจริง:

```bash
npm run build   # ได้ไฟล์พร้อม deploy ในโฟลเดอร์ dist/
npm run preview # ทดลองเปิดไฟล์ที่ build แล้ว
```

**Deploy**: อัปโหลดโฟลเดอร์ `dist/` ไปที่ Vercel / Netlify / Cloudflare Pages หรือโฮสต์ไฟล์ static ใดก็ได้
อย่าลืมตั้งค่า Environment Variables `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` บนแพลตฟอร์มโฮสต์ด้วย
(ค่าเดียวกับใน `.env.local`) ไม่งั้น build จริงจะต่อฐานข้อมูลไม่ได้

## ตั้งค่า Supabase (Backend/Database จริง)

โปรเจกต์นี้ใช้ [Supabase](https://supabase.com) เป็น Backend: Postgres Database + Auth (Email/Password และ
Facebook Login) + File Storage สำหรับรูปสินค้า — ทำตามขั้นตอนนี้ครั้งเดียวตอนตั้งระบบ:

1. **สร้างโปรเจกต์**: สมัคร/ล็อกอินที่ [supabase.com](https://supabase.com) → New Project (เลือก Region ใกล้ลูกค้าคุณที่สุด เช่น Singapore)
2. **เอา URL/Key มาใส่**: ไปที่ Project Settings > API คัดลอก **Project URL** และ **anon public key**
   มาใส่ในไฟล์ `.env.local` (คัดลอกจาก `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. **สร้างตาราง + สิทธิ์การเข้าถึง**: เปิด Supabase Dashboard > SQL Editor > New query
   วางไฟล์ `supabase/schema.sql` ทั้งหมดแล้วกด Run (สร้างตาราง `products` / `orders` / `profiles`
   พร้อม Row Level Security ให้อัตโนมัติ — ดูรายละเอียดสิทธิ์การเข้าถึงในคอมเมนต์ของไฟล์)
4. **(ไม่บังคับ) ใส่สินค้าตัวอย่าง**: รันไฟล์ `supabase/seed.sql` ต่อใน SQL Editor ถ้าอยากมีสินค้าให้ทดสอบทันที
5. **สร้างที่เก็บรูปสินค้า**: Dashboard > Storage > New bucket > ตั้งชื่อ `product-images` > เปิด **Public bucket**
   (Policy สำหรับ bucket นี้ถูกสร้างไว้แล้วในขั้นตอนที่ 3)
6. **ตั้งบัญชีแรกให้เป็นแอดมิน**:
   - สมัครสมาชิกตามปกติที่หน้าเว็บลูกค้านี้ (ปุ่ม "เข้าสู่ระบบ" > "สมัครสมาชิก")
   - ไปที่ Dashboard > Table Editor > ตาราง `profiles` > หาแถวที่อีเมลตรงกับบัญชีที่สมัคร
   - แก้คอลัมน์ `is_admin` เป็น `true` แล้ว Save
   - เปิดแอป `nps-store-admin` (คนละ port) แล้วล็อกอินด้วยบัญชีเดียวกันนี้ จะเข้าหน้า Admin Dashboard ได้ทันที
7. **(ไม่บังคับ) เปิดใช้ Facebook Login จริง**:
   - สร้างแอปที่ [developers.facebook.com/apps](https://developers.facebook.com/apps) → เพิ่ม Product "Facebook Login"
   - ตั้งค่า Valid OAuth Redirect URI เป็น `https://xxxxxxxx.supabase.co/auth/v1/callback` (Project Ref เดียวกับข้อ 1)
   - เอา App ID + App Secret มาใส่ที่ Supabase Dashboard > Authentication > Providers > Facebook แล้วเปิดใช้งาน
   - ไม่ต้องแก้โค้ดฝั่ง React เลย — ปุ่ม "เข้าสู่ระบบด้วย Facebook" จะทำงานทันทีที่ตั้งค่านี้เสร็จ

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

## ระบบเข้าสู่ระบบลูกค้า (Email/Password + Facebook)

- กดปุ่ม **"เข้าสู่ระบบ"** ที่ Navbar เพื่อเปิดโมดัลล็อกอิน/สมัครสมาชิก
- Email/Password ใช้ Supabase Auth จริง (เข้ารหัสรหัสผ่านให้อัตโนมัติ มี Session/JWT จริง)
- ปุ่ม **"เข้าสู่ระบบด้วย Facebook"** ใช้งานได้ทันทีหลังตั้งค่า Facebook Provider ในขั้นตอนที่ 7 ของหัวข้อ
  "ตั้งค่า Supabase" ด้านบน — กดแล้วเบราว์เซอร์จะพาไปหน้า Facebook แล้วเด้งกลับมาพร้อมล็อกอินสำเร็จ
  (ถ้ายังไม่ตั้งค่า ระบบจะแจ้งเตือนว่ายังไม่พร้อมใช้งาน ไม่ error/พัง)
- ล็อกอินอยู่แล้ว → ชื่อ/อีเมลจะถูกเติมในฟอร์ม Checkout ให้อัตโนมัติ

บัญชีเดียวกันนี้ใช้ล็อกอินฝั่งแอดมินได้ด้วย (ต้องมี `is_admin = true` — ดู `nps-store-admin/README.md`)

## โครงสร้างโปรเจกต์

```
nps-store/
├── index.html                  # หน้า HTML หลัก + โหลดฟอนต์ (รวมฟอนต์ลาว)
├── vite.config.js              # ตั้งค่า Vite + Tailwind
├── .env.example                 # ตัวอย่างค่า Environment Variables (คัดลอกเป็น .env.local)
├── supabase/
│   ├── schema.sql               # ตาราง + Row Level Security — รันใน Supabase SQL Editor
│   └── seed.sql                 # สินค้าตัวอย่าง (ไม่บังคับ)
├── public/
│   └── fonts/                  # วาง PhetsalathOT.ttf ที่นี่ (ถ้าต้องการ)
└── src/
    ├── main.jsx                # จุดเริ่มต้นแอป (Language + Currency + Auth + Store Provider)
    ├── App.jsx                 # Layout หลักของเว็บลูกค้า (Navbar + Hero + Product Grid + Footer)
    ├── index.css               # ธีม Tailwind + @font-face ฟอนต์ลาว
    ├── lib/
    │   └── supabaseClient.js   # สร้าง Supabase client จาก .env.local
    ├── i18n/
    │   └── translations.js     # คลังคำแปล 3 ภาษา (th / en / lo)
    ├── context/
    │   ├── StoreContext.jsx    # สินค้า (อ่านจาก Supabase) + ตะกร้า + สั่งซื้อ (client-side)
    │   ├── LanguageContext.jsx # ระบบเปลี่ยนภาษา + hook useLang()
    │   ├── CurrencyContext.jsx # ระบบเปลี่ยนสกุลเงิน บาท/กีบ + hook useCurrency()
    │   └── AuthContext.jsx     # Supabase Auth: ล็อกอิน/สมัครสมาชิกลูกค้า (Email/Password + Facebook)
    └── components/
        ├── Navbar.jsx          # Header: โลโก้ เมนู ค้นหา ภาษา สกุลเงิน ล็อกอิน ตะกร้า
        ├── HeroBanner.jsx      # แบนเนอร์ใหญ่ + ปุ่ม Shop Now
        ├── FilterBar.jsx       # ปุ่มกรอง All / New / Shoes / Clothing
        ├── ProductGrid.jsx     # Grid สินค้า (กรอง+ค้นหา)
        ├── ProductCard.jsx     # การ์ดสินค้า + เลือกไซซ์ + Add to Cart
        ├── CartDrawer.jsx      # ตะกร้าสินค้า (เพิ่ม/ลด/ลบ/ยอดรวม)
        ├── CheckoutModal.jsx   # ชำระเงิน 3 ขั้นตอน + ยืนยันออเดอร์ + QR รับโอนเงิน
        └── auth/
            └── LoginModal.jsx  # โมดัลล็อกอิน/สมัครสมาชิกลูกค้า (Email/Password + Facebook)
```

หน้าหลังบ้าน/แอดมิน (จัดการสินค้าแยกแท็บ, จัดการออเดอร์, แจ้งเตือนออเดอร์ใหม่แบบ Real-time)
อยู่คนละแอปที่ `nps-store-admin/` — ดูรายละเอียดที่ `nps-store-admin/README.md`

## การเก็บข้อมูล

| ข้อมูล | เก็บที่ | หมายเหตุ |
|---|---|---|
| สินค้า (`products`) | Supabase (Postgres) | ทุกคนอ่านได้ แก้ไข/ลบได้เฉพาะแอดมิน |
| คำสั่งซื้อ (`orders`) | Supabase (Postgres) | ใครก็สั่งซื้อได้ (Guest checkout), อ่านได้เฉพาะแอดมิน |
| บัญชีผู้ใช้ + สิทธิ์แอดมิน (`profiles`) | Supabase Auth + Postgres | จัดการรหัสผ่าน/Session ให้อัตโนมัติ |
| รูปสินค้า | Supabase Storage (bucket `product-images`) | อัปโหลดจากฟอร์มเพิ่มสินค้าโดยตรง |
| ตะกร้าสินค้า | LocalStorage เครื่องลูกค้า (คีย์ `nps-store-cart-v1`) | ชั่วคราวก่อนสั่งซื้อ ไม่จำเป็นต้องอยู่ใน Database |
| ภาษา / สกุลเงินที่เลือก | LocalStorage (`nps-store-lang` / `nps-store-currency`) | ค่ากำหนดส่วนตัวของเบราว์เซอร์นั้นๆ |

เนื่องจากข้อมูลหลัก (สินค้า/ออเดอร์/บัญชี) อยู่บน Supabase แล้ว **ทุกคนที่เข้าเว็บจะเห็นข้อมูลชุดเดียวกัน**
ไม่ผูกกับเครื่อง/เบราว์เซอร์เหมือนเวอร์ชันก่อนหน้า — ล้างข้อมูลสินค้า/ออเดอร์ทำได้ที่ Supabase Dashboard
> Table Editor โดยตรง (ลบแถวหรือรัน SQL `delete from products;` / `delete from orders;`)
