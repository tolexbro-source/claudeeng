import { createContext, useContext, useEffect, useState } from 'react'

const CurrencyContext = createContext(null)
const LS_CURRENCY = 'nps-store-currency' // จำสกุลเงินที่เลือกไว้ใน LocalStorage

// ราคาสินค้าทั้งหมดในระบบเก็บเป็น "บาท (THB)" เสมอ — ตัวเลข rate ใช้แปลงตอนแสดงผลเท่านั้น
// ต้องการปรับอัตราแลกเปลี่ยน แก้ค่า rate ที่นี่ที่เดียว
export const CURRENCIES = [
  { code: 'THB', label: '฿ บาท', symbol: '฿', rate: 1, locale: 'th-TH' },
  { code: 'LAK', label: '₭ กีบ', symbol: '₭', rate: 616, locale: 'lo-LA' },
]

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem(LS_CURRENCY) || 'THB')

  useEffect(() => {
    localStorage.setItem(LS_CURRENCY, currency)
  }, [currency])

  const info = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]

  // แปลงราคาจากบาท (หน่วยเก็บจริง) → สกุลเงินที่เลือก แล้วฟอร์แมตเป็นข้อความพร้อมสัญลักษณ์
  const formatPrice = (thbAmount) => {
    const converted = Math.round(Number(thbAmount || 0) * info.rate)
    return info.symbol + converted.toLocaleString(info.locale)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
