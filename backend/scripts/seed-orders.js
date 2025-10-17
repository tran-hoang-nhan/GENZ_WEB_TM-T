const mongoose = require('mongoose')
const Order = require('../dist/models/Order').default

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/genz'

async function run() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to Mongo for order seeding')

  const sample = {
    userId: 'user-123',
    userName: 'Khách Hàng Test',
    userEmail: 'khach@test.vn',
    userPhone: '0123456789',
    shippingAddress: '123 Đường Test, Quận 1, TP.HCM',
    note: 'Giao giờ hành chính',
    items: [
      { productName: 'GenZ Classic Helmet', price: 499000, quantity: 1, color: 'Black', size: 'M' },
      { productName: 'GenZ Kids Helmet', price: 399000, quantity: 2, color: 'Red', size: 'S' }
    ],
    totalAmount: 499000 + 2 * 399000,
    paymentMethod: 'cod',
    status: 'pending'
  }

  await Order.create(sample)
  console.log('Inserted sample order')
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
