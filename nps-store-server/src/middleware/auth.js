import jwt from 'jsonwebtoken'

function readToken(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

// ต้องล็อกอิน — ไม่มี/token ผิด → 401
export function requireAuth(req, res, next) {
  const token = readToken(req)
  if (!token) return res.status(401).json({ error: 'UNAUTHENTICATED' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'UNAUTHENTICATED' })
  }
}

// ล็อกอินหรือไม่ก็ได้ (guest checkout) — ถ้ามี token ที่ใช้ได้จะแนบ req.user ให้
export function optionalAuth(req, _res, next) {
  const token = readToken(req)
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      // token ผิด/หมดอายุ — ปล่อยผ่านเป็น guest แทนที่จะ error
    }
  }
  next()
}

// ต้องเป็นแอดมิน — ใช้ต่อจาก requireAuth เสมอ
export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'FORBIDDEN' })
  next()
}
