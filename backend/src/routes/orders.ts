import { Router } from 'express'
import Order from '../models/Order'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// GET /api/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean()
    res.json({ data: orders })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// POST /api/orders (for testing / create order)
router.post('/orders', requireAdmin, async (req, res) => {
  try {
    const data = req.body
    const order = await Order.create(data)
    res.json({ data: order })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// GET /api/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ data: order })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// PATCH /api/orders/:id/status
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean()
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ data: order })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

export default router
