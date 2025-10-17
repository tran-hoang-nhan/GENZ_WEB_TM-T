import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name?: string
  role?: string
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, default: 'user' }
})

export default model<IUser>('User', UserSchema)
