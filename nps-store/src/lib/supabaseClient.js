import { createClient } from '@supabase/supabase-js'

// ===== 🗄️ Supabase — ใส่ค่าโปรเจกต์ของคุณใน .env.local (ดู .env.example + README หัวข้อ "ขึ้นระบบจริง") =====
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] ยังไม่ได้ตั้งค่า VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ใน .env.local — ระบบล็อกอิน/สินค้า/ออเดอร์จะยังใช้งานไม่ได้ (ดู README)'
  )
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key')
