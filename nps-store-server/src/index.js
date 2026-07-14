import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'node:http'
import { connectDB } from './db.js'
import { attachRealtime } from './realtime.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import uploadRoutes from './routes/upload.js'

const app = express()
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)

app.use(cors({ origin: corsOrigins.length ? corsOrigins : true }))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'SERVER_ERROR' })
})

const server = http.createServer(app)
attachRealtime(server)

const port = process.env.PORT || 4000
connectDB().then(() => {
  server.listen(port, () => console.log(`[nps-store-server] listening on http://localhost:${port}`))
})
