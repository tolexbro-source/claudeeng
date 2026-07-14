// ห่อ async route handler ให้ error ที่ throw/reject ไปเข้า error middleware ของ Express แทนที่จะ
// กลายเป็น unhandled promise rejection ซึ่งทำให้ทั้ง process ตาย (Express 4 ไม่ดักให้อัตโนมัติ)
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
