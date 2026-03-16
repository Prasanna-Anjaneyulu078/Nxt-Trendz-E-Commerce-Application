const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { getProducts, getProductById } = require('../controllers/productController')

const router = express.Router()

// GET /products         → all products with filters + sort
router.get('/', protect, getProducts)

// GET /products/:id     → single product + similar_products array
router.get('/:id', protect, getProductById)

module.exports = router
