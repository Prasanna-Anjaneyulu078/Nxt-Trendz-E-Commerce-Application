const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User')

/**
 * generateToken
 * Signs a JWT with the user's MongoDB _id.
 * Expiry is driven by JWT_EXPIRES_IN env variable (default 30d).
 */
const generateToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  })

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// POST /register
// Body:    { username, password }
// Returns: { jwt_token }   ← auto-login on successful registration
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error_msg: errors.array()[0].msg })
    }

    const { username, password } = req.body

    // Check username availability
    const existingUser = await User.findOne({
      username: username.toLowerCase().trim(),
    })
    if (existingUser) {
      return res.status(400).json({ error_msg: 'Username already exists' })
    }

    // Create user — password hashed via pre-save hook in User model
    const user = await User.create({
      username: username.toLowerCase().trim(),
      password,
      name: username,
      role: 'user',
    })

    const token = generateToken(user._id)
    res.status(201).json({ jwt_token: token })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// POST /login
// Body:    { username, password }
// Returns: { jwt_token }
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error_msg: errors.array()[0].msg })
    }

    const { username, password } = req.body

    // select('+password') is required — password has select:false in schema
    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    }).select('+password')

    if (!user) {
      return res.status(400).json({ error_msg: 'Invalid username' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(400).json({ error_msg: 'Invalid password' })
    }

    const token = generateToken(user._id)
    res.status(200).json({ jwt_token: token })
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login }
