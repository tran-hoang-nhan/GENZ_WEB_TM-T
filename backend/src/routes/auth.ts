import { Router } from 'express'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../app'

const router = Router()

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const usersCollection = db.collection('users')
    const existing = await usersCollection.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already used' })

    const hashed = await bcrypt.hash(password, 10)
    const result = await usersCollection.insertOne({ 
      email, 
      password: hashed, 
      name, 
      phone,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const token = jwt.sign({ sub: result.insertedId.toString(), role: 'user' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
    res.status(201).json({ 
      token, 
      user: { 
        id: result.insertedId.toString(),
        email, 
        name, 
        phone: phone || '',
        role: 'user',
        createdAt: new Date().toISOString()
      } 
    })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
    res.json({ 
      token, 
      user: { 
        id: user._id.toString(),
        email: user.email, 
        name: user.name, 
        phone: user.phone || '',
        role: user.role,
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()
      } 
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// PUT /api/auth/profile - Cập nhật thông tin user
router.put('/auth/profile', async (req, res) => {
  try {
    const { id, name, phone, address } = req.body

    if (!id) {
      return res.status(400).json({ error: 'id is required' })
    }

    const usersCollection = db.collection('users')
    const updateData: any = { updatedAt: new Date() }
    
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (address) updateData.address = address

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ 
      user: { 
        id: result.value._id.toString(),
        email: result.value.email, 
        name: result.value.name, 
        phone: result.value.phone || '',
        address: result.value.address || '',
        role: result.value.role,
        createdAt: result.value.createdAt.toISOString(),
        updatedAt: result.value.updatedAt.toISOString()
      } 
    })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Update failed' })
  }
})

export default router
