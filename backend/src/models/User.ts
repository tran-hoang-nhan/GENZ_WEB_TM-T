// MongoDB collection: users
// No longer using Mongoose models - using native MongoDB driver
// Define structure in comments for reference

/*
Collection: users
{
  _id: ObjectId,
  email: string (required, unique),
  password: string (required, hashed),
  name?: string,
  phone?: string,
  address?: string,
  role: 'user' | 'admin' (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
*/
