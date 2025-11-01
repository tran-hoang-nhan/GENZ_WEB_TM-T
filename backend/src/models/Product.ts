// MongoDB collection: products
// No longer using Mongoose models - using native MongoDB driver
// Define structure in comments for reference

/*
Collection: products
{
  _id: ObjectId,
  name: string (required),
  description?: string,
  price: number (required),
  brand?: string,
  image?: string,
  images?: string[],
  category?: string,
  rating?: number,
  features?: string[],
  color?: string[],
  size?: string[],
  stock?: number (default: 0),
  weight?: string,
  certification?: string[],
  createdAt: Date,
  updatedAt: Date
}
*/
