import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  brand?: string;
  images?: string[];
  stock?: number;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  brand: String,
  images: [String],
  stock: { type: Number, default: 0 },
});

export default model<IProduct>('Product', ProductSchema);
