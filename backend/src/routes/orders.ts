import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { db } from '../app'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// GET /api/orders
router.get('/orders', async (req, res) => {
  try {
    const ordersCollection = db.collection('orders')
    const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray()
    
    // Transform to match frontend Order interface
    const transformedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      userId: order.userId, 
      userName: order.customerInfo?.fullName || '',
      userEmail: order.customerInfo?.email || '',
      userPhone: order.customerInfo?.phone || '',
      shippingAddress: order.customerInfo?.address || '',
      items: (order.items || []).map((item: any) => ({
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      })),
      totalAmount: order.totalAmount,
      status: order.status || 'pending',
      paymentMethod: order.paymentMethod,
      note: order.notes,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt
    }))
    
    res.json({ data: transformedOrders })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// POST /api/orders (User create order)
router.post('/orders', async (req, res) => {
  try {
    const { userId, items, customerInfo, totalAmount, paymentMethod, notes } = req.body

    // Validate
    if (!userId || !items || !customerInfo || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Ensure items have productName
    const enrichedItems = items.map((item: any) => ({
      productId: item.id || item.productId,
      productName: item.productName || item.name || 'Unknown Product',
      price: item.price,
      quantity: item.quantity,
      color: item.selectedColor || item.color,
      size: item.selectedSize || item.size
    }))

    const ordersCollection = db.collection('orders')
    const result = await ordersCollection.insertOne({
      userId,
      items: enrichedItems,
      customerInfo: {
        ...customerInfo,
        userId
      },
      totalAmount,
      shippingCost: 0,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending',
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    res.status(201).json({ 
      data: { 
        _id: result.insertedId, 
        userId,
        totalAmount,
        status: 'pending'
      } 
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// GET /api/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const ordersCollection = db.collection('orders')
    const order = await ordersCollection.findOne({ _id: new ObjectId(req.params.id) })
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
    const ordersCollection = db.collection('orders')
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result.value) return res.status(404).json({ error: 'Order not found' })
    res.json({ data: result.value })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

export default router
