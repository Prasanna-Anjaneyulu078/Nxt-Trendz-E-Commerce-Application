const { validationResult } = require('express-validator')
const Cart = require('../models/Cart')

// ── Shape cart document into frontend-expected response ───────────────────────
const formatCart = cart => ({
  cartList: cart.items.map(item => ({
    id: item.productId,
    title: item.title,
    brand: item.brand,
    price: item.price,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
  })),
  totalPrice: cart.totalPrice,
  totalItems: cart.totalItems,
})

// ─────────────────────────────────────────────────────────────────────────────
// GET CART
// GET /cart
// Called on Cart page mount — seeds cartList from DB.
// Returns empty cart (not 404) if user has no cart yet.
// ─────────────────────────────────────────────────────────────────────────────
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
    if (!cart) {
      return res.status(200).json({ cartList: [], totalPrice: 0, totalItems: 0 })
    }
    res.status(200).json(formatCart(cart))
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD TO CART
// POST /cart
// Body: { id, title, brand, price, imageUrl, quantity }
// If product already in cart → increments quantity.
// If not in cart → pushes as new item.
// Cart document is created on first add (upsert).
// ─────────────────────────────────────────────────────────────────────────────
const addToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error_msg: errors.array()[0].msg })
    }

    const { id, title, brand, price, imageUrl, quantity = 1 } = req.body

    let cart = await Cart.findOne({ userId: req.user._id })
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] })
    }

    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === id.toString(),
    )

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity
    } else {
      cart.items.push({ productId: id, title, brand, price, imageUrl, quantity })
    }

    await cart.save()
    res.status(200).json(formatCart(cart))
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE CART ITEM QUANTITY
// PUT /cart/:productId
// Body: { quantity }
// quantity = 0 → item is removed automatically (matches frontend decrement logic)
// ─────────────────────────────────────────────────────────────────────────────
const updateCartItem = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error_msg: errors.array()[0].msg })
    }

    const { productId } = req.params
    const { quantity } = req.body

    const cart = await Cart.findOne({ userId: req.user._id })
    if (!cart) {
      return res.status(404).json({ error_msg: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString(),
    )
    if (itemIndex < 0) {
      return res.status(404).json({ error_msg: 'Item not found in cart' })
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }

    await cart.save()
    res.status(200).json(formatCart(cart))
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REMOVE SINGLE ITEM
// DELETE /cart/:productId
// Triggered by "Remove" button and close icon on CartItem.
// ─────────────────────────────────────────────────────────────────────────────
const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params

    const cart = await Cart.findOne({ userId: req.user._id })
    if (!cart) {
      return res.status(404).json({ error_msg: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString(),
    )
    if (itemIndex < 0) {
      return res.status(404).json({ error_msg: 'Item not found in cart' })
    }

    cart.items.splice(itemIndex, 1)
    await cart.save()
    res.status(200).json(formatCart(cart))
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEAR ENTIRE CART
// DELETE /cart
// Triggered by "Remove All" button on Cart page.
// ONLY clears the cart of req.user._id — other users are never affected.
// ─────────────────────────────────────────────────────────────────────────────
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } },
      { new: true },
    )
    if (!cart) {
      return res.status(200).json({ cartList: [], totalPrice: 0, totalItems: 0 })
    }
    res.status(200).json(formatCart(cart))
  } catch (error) {
    next(error)
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart }
