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
      orderId: order.orderId,
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

    // Get next orderId from counter
    const countersCollection = db.collection('counters')
    const counter = await countersCollection.findOneAndUpdate(
      { _id: 'orderId' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    )
    const orderId = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(counter.value?.seq || 1).padStart(3, '0')}`
    const ordersCollection = db.collection('orders')
    const result = await ordersCollection.insertOne({
      orderId,
      userId,
      items: enrichedItems,
      customerInfo: {
        ...customerInfo,
        userId  // Thêm userId vào customerInfo
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
        orderId, 
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

// POST /api/payments (User create payment)
router.post('/payments', async (req, res) => {
  try {
    const { orderId, userId, amount, method } = req.body

    // Validate
    if (!orderId || !userId || !amount || !method) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get next paymentId from counter
    const countersCollection = db.collection('counters')
    const counter = await countersCollection.findOneAndUpdate(
      { _id: 'paymentId' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    )
    const paymentId = `PAY-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(counter.value?.seq || 1).padStart(3, '0')}`

    const paymentsCollection = db.collection('payments')
    const result = await paymentsCollection.insertOne({
      paymentId,
      orderId,
      userId,
      amount,
      method,
      status: method === 'cod' ? 'pending' : 'completed',
      transactionId: `TXN-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Update order with payment info
    const ordersCollection = db.collection('orders')
    await ordersCollection.updateOne(
      { orderId },
      { $set: { paymentStatus: 'paid', updatedAt: new Date() } }
    )

    res.status(201).json({ 
      data: { 
        paymentId,
        _id: result.insertedId,
        orderId,
        status: method === 'cod' ? 'pending' : 'completed'
      } 
    })
  } catch (err) {
    console.error('Create payment error:', err)
    res.status(500).json({ error: 'Failed to create payment' })
  }
})

export default router
