import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { db } from '../app'

const router = Router()

// POST /api/debug/promote { email }
router.post('/debug/promote', async (req, res) => {
  const key = req.headers['x-debug-key'] || req.body.debugKey
  if (!key || key !== process.env.DEBUG_KEY) return res.status(403).json({ error: 'Forbidden' })
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Missing email' })
  try {
    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({ email })
    if (!user) return res.status(404).json({ error: 'User not found' })
    
    const result = await usersCollection.findOneAndUpdate(
      { email },
      { $set: { role: 'admin', updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    res.json({ ok: true, email: result.value?.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed' })
  }
})

export default router
