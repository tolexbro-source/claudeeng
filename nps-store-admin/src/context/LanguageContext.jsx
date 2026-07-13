import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)
const LS_LANG = 'nps-store-lang' // จำภาษาที่เลือกไว้ใน LocalStorage

export const LANGS = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'EN' },
  { code: 'lo', label: 'ລາວ' },
]

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LS_LANG) || 'th')

  useEffect(() => {
    localStorage.setItem(LS_LANG, lang)
    document.documentElement.lang = lang
    // ภาษาลาว → เปิดคลาส lang-lo เพื่อใช้ฟอนต์ Phetsalath OT ตัวหนา (ดู index.css)
    document.documentElement.classList.toggle('lang-lo', lang === 'lo')
  }, [lang])

  // t('key') คืนคำแปลตามภาษาปัจจุบัน — รองรับตัวแปร เช่น t('items_count', { n: 5 })
  const t = (key, vars) => {
    let s = translations[lang]?.[key] ?? translations.en[key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v)
    return s
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export const useLang = () => useContext(LanguageContext)
