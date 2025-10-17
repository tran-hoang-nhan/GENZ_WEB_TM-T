export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
    color: string
    size: string
  }[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  paymentMethod: 'cod' | 'banking'
  shippingAddress: string
  note?: string
  createdAt: string
}
