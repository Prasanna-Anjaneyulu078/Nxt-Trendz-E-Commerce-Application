require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const primeDealsRoutes = require('./routes/primeDealsRoutes')
const cartRoutes = require('./routes/cartRoutes')
const {notFound, errorHandler} = require('./middleware/errorHandler')

connectDB()

const app = express()

app.use(helmet())

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {error_msg: 'Too many requests. Please slow down.'},
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(globalLimiter)

// ── CORS — allow multiple origins ─────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,          // production frontend URL from .env
].filter(Boolean)                  // remove undefined if CLIENT_URL not set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error(`CORS blocked: ${origin} not allowed`))
    },
    credentials: true,
  }),
)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/', authRoutes)
app.use('/products', productRoutes)
app.use('/prime-deals', primeDealsRoutes)
app.use('/cart', cartRoutes)

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  console.log(`   Health check → http://localhost:${PORT}/health\n`)
})

module.exports = app