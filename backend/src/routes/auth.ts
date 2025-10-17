import { Router } from 'express'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already used' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ email, password: hashed, name })

    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
