// MongoDB collection: orders
// No longer using Mongoose models - using native MongoDB driver
// Define structure in comments for reference

/*
Collection: orders
{
  _id: ObjectId,
  userId: string (required),
  userName?: string,
  userEmail?: string,
  userPhone?: string,
  shippingAddress?: string,
  note?: string,
  items: [
    {
      productId: ObjectId,
      productName?: string,
      price: number,
      quantity: number,
      color?: string,
      size?: string
    }
  ],
  totalAmount: number,
  paymentMethod: 'cod' | 'bank' (default: 'cod'),
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' (default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
*/
