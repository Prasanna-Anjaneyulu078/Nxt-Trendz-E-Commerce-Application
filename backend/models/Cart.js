const mongoose = require('mongoose')

/**
 * CartItem sub-schema
 * Snapshots product data at time of adding to cart.
 * This protects cart accuracy if the product is later updated or deleted.
 */
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: true },
)

/**
 * Cart Schema
 * One document per user (enforced by unique index on userId).
 * Uses upsert pattern throughout — cart is created automatically on first add.
 *
 * Virtuals:
 *   totalPrice → sum of (price × quantity) for all items
 *   totalItems → sum of quantities across all items
 */
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0)
})

cartSchema.index({ userId: 1 })

module.exports = mongoose.model('Cart', cartSchema)
