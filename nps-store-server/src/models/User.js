import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } })

export default mongoose.model('User', userSchema)
