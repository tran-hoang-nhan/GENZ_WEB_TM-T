import mongoose from 'mongoose'

const ItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  price: Number,
  quantity: Number,
  color: String,
  size: String
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: String,
  userEmail: String,
  userPhone: String,
  shippingAddress: String,
  note: String,
  items: [ItemSchema],
  totalAmount: Number,
  paymentMethod: { type: String, enum: ['cod', 'bank'], default: 'cod' },
  status: { type: String, enum: ['pending','confirmed','shipping','delivered','cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

const Order = mongoose.model('Order', OrderSchema)
export default Order
