const express = require('express')
const { protect, requirePrime } = require('../middleware/authMiddleware')
const { getPrimeDeals } = require('../controllers/productController')

const router = express.Router()

// GET /prime-deals
// Only accessible to users with role 'prime' or 'admin'.
// Regular users receive 401 — frontend shows the register-prime banner.
router.get('/', protect, requirePrime, getPrimeDeals)

module.exports = router
