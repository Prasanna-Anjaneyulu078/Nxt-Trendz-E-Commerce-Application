const mongoose = require('mongoose')

const similarProductSchema = new mongoose.Schema(
  {
    title:         {type: String, required: true},
    brand:         {type: String, required: true},
    price:         {type: Number, required: true},
    image_url:     {type: String, required: true},
    rating:        {type: Number, required: true, min: 0, max: 5},
    availability:  {type: String, default: 'In Stock'},
    description:   {type: String, default: ''},
    total_reviews: {type: Number, default: 0},
  },
  {_id: true},
)

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image_url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 0,
      max: 5,
    },
    total_reviews: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    availability: {
      type: String,
      enum: ['In Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    category: {
      type: String,
      enum: ['1', '2', '3', '4', '5'],
      required: [true, 'Category is required'],
    },
    isPrimeDeal: {
      type: Boolean,
      default: false,
    },
    // Original CCBP numeric id — preserved for reference
    ccbpId: {
      type: Number,
      default: null,
    },
    similar_products: [similarProductSchema],
  },
  {timestamps: true},
)

productSchema.index({title: 'text'})
productSchema.index({category: 1, rating: 1, price: 1})
productSchema.index({isPrimeDeal: 1})

module.exports = mongoose.model('Product', productSchema)