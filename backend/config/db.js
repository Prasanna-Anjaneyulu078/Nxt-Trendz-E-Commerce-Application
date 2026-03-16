const mongoose = require('mongoose')

/**
 * connectDB
 * Connects to MongoDB using MONGO_URI from .env
 * Exits the process on failure — no point running with no DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
