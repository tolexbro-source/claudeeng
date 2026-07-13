import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite + React + Tailwind CSS v4 — Admin Panel (รันคนละพอร์ตจากเว็บลูกค้า ไม่ให้ชนกัน)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
  preview: { port: 5174 },
})
