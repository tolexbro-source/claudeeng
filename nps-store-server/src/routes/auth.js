import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

function toUserJSON(user) {
  return { id: user._id, username: user.username, isAdmin: user.isAdmin }
}

router.post('/register', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !USERNAME_RE.test(username.trim())) return res.status(400).json({ error: 'INVALID_USERNAME' })
  if (!password || password.length < 4) return res.status(400).json({ error: 'INVALID_PASSWORD' })

  const normalized = username.trim().toLowerCase()
  const exists = await User.findOne({ username: normalized })
  if (exists) return res.status(409).json({ error: 'USERNAME_EXISTS' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username: normalized, passwordHash })
  res.status(201).json({ token: signToken(user), user: toUserJSON(user) })
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'INVALID_CREDENTIALS' })

  const user = await User.findOne({ username: username.trim().toLowerCase() })
  if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'INVALID_CREDENTIALS' })

  res.json({ token: signToken(user), user: toUserJSON(user) })
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub)
  if (!user) return res.status(404).json({ error: 'NOT_FOUND' })
  res.json({ user: toUserJSON(user) })
}))

export default router
