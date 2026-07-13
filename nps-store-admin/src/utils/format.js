// Locale สำหรับฟอร์แมตวันที่ตามภาษาที่เลือก
export const LOCALES = { th: 'th-TH', en: 'en-US', lo: 'lo-LA' }

// ฟอร์แมตวันที่แบบสั้น
export const formatDate = (iso, locale = 'th-TH') =>
  new Date(iso).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })
