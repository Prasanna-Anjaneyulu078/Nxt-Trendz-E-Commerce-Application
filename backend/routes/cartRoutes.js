const express = require('express')
const { body, param } = require('express-validator')
const { protect } = require('../middleware/authMiddleware')
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController')

const router = express.Router()

const addToCartValidation = [
  body('id').notEmpty().withMessage('Product ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('price').isNumeric().withMessage('Price must be a number')
    .custom(v => v >= 0).withMessage('Price cannot be negative'),
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
]

const updateQuantityValidation = [
  param('productId').notEmpty().withMessage('Product ID param is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or more'),
]

// GET    /cart    → load user's cart
// POST   /cart    → add item to cart
// DELETE /cart    → clear entire cart ("Remove All" button)
router.route('/')
  .get(protect, getCart)
  .post(protect, addToCartValidation, addToCart)
  .delete(protect, clearCart)

// PUT    /cart/:productId  → update quantity (+ / - buttons)
// DELETE /cart/:productId  → remove single item ("Remove" button)
router.route('/:productId')
  .put(protect, updateQuantityValidation, updateCartItem)
  .delete(protect, removeCartItem)

module.exports = router
