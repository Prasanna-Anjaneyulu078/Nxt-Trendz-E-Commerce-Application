const Product = require('../models/Product')

// ── Build Mongoose sort object from frontend sortby option ────────────────────
const getSortObject = optionId => {
  switch (optionId) {
    case 'PRICE_HIGH': return { price: -1 }
    case 'PRICE_LOW':  return { price: 1 }
    default:           return { price: -1 }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL PRODUCTS
// GET /products?sort_by=&category=&title_search=&rating=
// ─────────────────────────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const {
      sort_by = 'PRICE_HIGH',
      category = '',
      title_search = '',
      rating = '',
    } = req.query

    const filter = {}

    if (category)     filter.category = category
    if (rating)       filter.rating   = { $gte: Number(rating) }
    if (title_search) filter.title    = { $regex: title_search, $options: 'i' }

    const products = await Product.find(filter)
      .sort(getSortObject(sort_by))
      .select('_id title brand price image_url rating')
      .lean()

    const responseProducts = products.map(p => ({
      id: p._id,
      title: p.title,
      brand: p.brand,
      price: p.price,
      image_url: p.image_url,
      rating: p.rating,
    }))

    res.status(200).json({ products: responseProducts })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET PRIME DEALS
// GET /prime-deals  (role: prime | admin only)
// ─────────────────────────────────────────────────────────────────────────────
const getPrimeDeals = async (req, res, next) => {
  try {
    const primeDeals = await Product.find({ isPrimeDeal: true })
      .select('_id title brand price image_url rating')
      .lean()

    const formatted = primeDeals.map(p => ({
      id: p._id,
      title: p.title,
      brand: p.brand,
      price: p.price,
      image_url: p.image_url,
      rating: p.rating,
    }))

    res.status(200).json({ prime_deals: formatted })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET PRODUCT BY ID
// GET /products/:id
// Returns full detail + similar_products array
// ─────────────────────────────────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean()

    if (!product) {
      res.status(404)
      return next(new Error('Product not found'))
    }

    const response = {
      id: product._id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image_url: product.image_url,
      rating: product.rating,
      description: product.description,
      availability: product.availability,
      total_reviews: product.total_reviews,
      similar_products: (product.similar_products || []).map(sp => ({
        id: sp._id,
        title: sp.title,
        brand: sp.brand,
        price: sp.price,
        image_url: sp.image_url,
        rating: sp.rating,
        description: sp.description || '',
        availability: sp.availability || 'In Stock',
        total_reviews: sp.total_reviews || 0,
      })),
    }

    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
}

module.exports = { getProducts, getPrimeDeals, getProductById }
