import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import { URL } from 'node:url'

const adminSockets = new Set()

// WebSocket สำหรับแจ้งเตือนออเดอร์ใหม่แบบเรียลไทม์ฝั่งแอดมิน (แทน Supabase Realtime เดิม)
export function attachRealtime(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' })

  // ต้องดัก 'error' เสมอ — ถ้า EventEmitter ไม่มีใคร listen 'error' ไว้ Node จะ throw แล้วทำให้ process ตายทั้งตัว
  wss.on('error', (err) => console.error('[realtime] wss error', err))

  wss.on('connection', (ws, req) => {
    ws.on('error', (err) => console.error('[realtime] ws connection error', err))

    const { searchParams } = new URL(req.url, 'http://localhost')
    const token = searchParams.get('token')
    let user = null
    try {
      user = token && jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      // token ผิด/หมดอายุ — ไม่ต้อง subscribe
    }

    if (!user?.isAdmin) {
      ws.close(4001, 'FORBIDDEN')
      return
    }

    adminSockets.add(ws)
    ws.on('close', () => adminSockets.delete(ws))
  })
}

export function broadcastNewOrder(order) {
  const payload = JSON.stringify({ type: 'order:new', order })
  for (const ws of adminSockets) {
    if (ws.readyState === ws.OPEN) ws.send(payload)
  }
}
