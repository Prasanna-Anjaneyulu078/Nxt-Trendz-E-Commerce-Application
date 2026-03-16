const express = require('express')
const { body } = require('express-validator')
const rateLimit = require('express-rate-limit')
const { register, login } = require('../controllers/authController')

const router = express.Router()

// 10 attempts per IP per 15 minutes — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error_msg: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .isLength({ max: 30 }).withMessage('Username cannot exceed 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 50 }).withMessage('Password cannot exceed 50 characters'),
]

router.post('/register', authLimiter, authValidation, register)
router.post('/login', authLimiter, authValidation, login)

module.exports = router
