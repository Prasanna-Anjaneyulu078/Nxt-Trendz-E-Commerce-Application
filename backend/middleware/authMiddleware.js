const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * protect
 * Verifies the JWT in the Authorization header.
 * Attaches decoded user to req.user for downstream use.
 *
 * Expected header: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ error_msg: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({ error_msg: 'User not found' })
    }

    next()
  } catch (error) {
    return res.status(401).json({ error_msg: 'Not authorized, token failed' })
  }
}

/**
 * requirePrime
 * Restricts access to users with role 'prime' or 'admin'.
 * Must be used AFTER protect middleware.
 */
const requirePrime = (req, res, next) => {
  if (req.user && (req.user.role === 'prime' || req.user.role === 'admin')) {
    return next()
  }
  return res.status(401).json({
    error_msg: 'Access denied. Prime membership required.',
  })
}

/**
 * requireAdmin
 * Restricts access to admin-only routes.
 * Must be used AFTER protect middleware.
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  return res.status(403).json({ error_msg: 'Access denied. Admins only.' })
}

module.exports = { protect, requirePrime, requireAdmin }
