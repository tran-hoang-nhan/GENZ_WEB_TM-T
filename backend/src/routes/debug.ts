import { Router } from 'express'
import User from '../models/User'

const router = Router()

// POST /api/debug/promote { email }
router.post('/debug/promote', async (req, res) => {
  const key = req.headers['x-debug-key'] || req.body.debugKey
  if (!key || key !== process.env.DEBUG_KEY) return res.status(403).json({ error: 'Forbidden' })
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Missing email' })
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.role = 'admin'
    await user.save()
    res.json({ ok: true, email: user.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed' })
  }
})

export default router
