const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

/**
 * User Schema
 * Passwords are hashed via pre-save hook — never stored as plain text.
 * Password field is hidden by default (select: false) —
 * must be explicitly requested with .select('+password').
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    // user → standard access
    // prime → can access /prime-deals
    // admin → full access
    role: {
      type: String,
      enum: ['user', 'prime', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true },
)

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// ── Compare plain-text password with stored hash ──────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
