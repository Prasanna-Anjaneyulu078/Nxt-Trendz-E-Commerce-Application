/**
 * Seeder Script — All 54 real products from CCBP API
 * Usage:
 *   node utils/seeder.js           → Import data
 *   node utils/seeder.js --delete  → Destroy all data
 */

require('dotenv').config()
const bcrypt = require('bcryptjs')
const connectDB = require('../config/db')
const User = require('../models/User')
const Product = require('../models/Product')

// ── Test Users ────────────────────────────────────────────────────────────────
const users = [
  {name: 'Admin User',   username: 'rahul',     password: 'rahul@2021',  role: 'admin'},
  {name: 'Prime Member', username: 'primeuser', password: 'prime@2021',  role: 'prime'},
  {name: 'Regular User', username: 'user1',     password: 'user@2021',   role: 'user'},
]

// ── Helper: detect category from image_url ────────────────────────────────────
const getCategory = image_url => {
  if (image_url.includes('/clothes-') || image_url.includes('/cloths-')) return '1'
  if (image_url.includes('/electronics-'))                                return '2'
  if (image_url.includes('/appliances-'))                                 return '3'
  if (image_url.includes('/grocery-'))                                    return '4'
  if (image_url.includes('/toys-'))                                       return '5'
  return '1'
}

// ── All 54 CCBP products (exact data from API response) ──────────────────────
const rawProducts = [
  // ── Clothing (ids: 1–16) ──────────────────────────────────────────────────
  {title: 'Wide Bowknot Hat',           brand: 'MAJIK',            price: 288,   id: 1,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-cap.png',              rating: '3.6'},
  {title: 'Plain Round Neck T-shirt',   brand: 'Huetrap',          price: 395,   id: 2,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-fit-t-shirt.png',      rating: '4.1'},
  {title: 'Cotton Hoodie',              brand: 'Scott International', price: 498, id: 3,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-hoodie.png',           rating: '3.8'},
  {title: "Men's Waistcoat",            brand: 'LEVIS',            price: 2500,  id: 4,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-jacket.png',           rating: '4.3'},
  {title: 'Slim Fit Jeans',             brand: 'LEVIS',            price: 1469,  id: 5,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-jeans-pants.png',      rating: '3.1'},
  {title: 'Miss Chase Bodycon Dress',   brand: 'LEVIS',            price: 974,   id: 6,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-modren-net.png',       rating: '3.8'},
  {title: 'Zari Design Kurta',          brand: 'Libas',            price: 1869,  id: 7,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-punjabi.png',          rating: '4.4'},
  {title: 'Slim Fit Blazer',            brand: 'LEVIS',            price: 2599,  id: 8,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-purple-jacket.png',    rating: '4.2'},
  {title: 'Animal Printed Shirt',       brand: 'Mufti',            price: 1017,  id: 9,  image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-short-sleeves-shirt.png', rating: '4'},
  {title: 'Polyester Saree',            brand: 'Ahalyaa',          price: 419,   id: 10, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-side-sareee.png',      rating: '3.8'},
  {title: 'Warm Up Jacket',             brand: 'Monte Carlo',      price: 2796,  id: 11, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-sim-jacket.png',       rating: '4.4'},
  {title: 'Wrap Dress',                 brand: 'Vero Moda',        price: 3039,  id: 12, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-simple-formal.png',    rating: '3.2'},
  {title: 'Knit Cream Sweater',         brand: 'MansiCollections', price: 996,   id: 13, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-stylish-sweater.png',  rating: '3.2'},
  {title: 'Sheer Anarkali',             brand: 'Saadgi',           price: 2172,  id: 14, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/clothes-white-punjabi.png',    rating: '3.2'},
  {title: 'Embellished Maxi Dress',     brand: 'STREET 9',         price: 1799,  id: 15, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/cloths-blue-fork.png',         rating: '3.2'},
  {title: 'Embroidered Net Gown',       brand: 'Manyavar',         price: 62990, id: 16, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/cloths-long-fork.png',         rating: '3.2'},

  // ── Appliances (ids: 17–24) ───────────────────────────────────────────────
  {title: 'Handheld Full Body Massager', brand: 'AGARO REGAL',     price: 1299,  id: 17, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/appliances-body-massager.png',       rating: '4.3'},
  {title: 'True Wireless Earbuds',       brand: 'LG',              price: 13499, id: 18, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/appliances-ear-buds.png',            rating: '4.4'},
  {title: 'Mixer Grinder',               brand: 'Lifelong',        price: 1699,  id: 19, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/appliances-mixer-grinder.png',       rating: '3.9'},
  {title: 'SilverBullet Mixer Grinder',  brand: 'COOKWELL',        price: 1899,  id: 20, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/appliances-mixer-grinder-white.png', rating: '4.1'},
  {title: 'PS5 Controller Charger',      brand: 'New World',       price: 1749,  id: 21, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/appliances-ps5-controller.png',      rating: '3.3'},
  {title: 'Podcast Microphone',          brand: 'MAONO',           price: 5555,  id: 22, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/appliances-singing-mike.png',        rating: '4.4'},
  {title: 'Dynamic Microphone',          brand: 'JTS Store',       price: 1699,  id: 23, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/appliances-solo-mike.png',           rating: '3.9'},
  {title: 'Front Load Machine',          brand: 'Samsung',         price: 22490, id: 24, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/appliances-washing-machine.png',     rating: '4.5'},

  // ── Electronics (ids: 25–35) ──────────────────────────────────────────────
  {title: "Analog Men's Watch",              brand: 'Fastrack',      price: 1850,  id: 25, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-casual-watch.png',     rating: '4.2'},
  {title: 'Tea Kettle Pot',                  brand: 'Indian Art Villa', price: 1685, id: 26, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-copper-kettle.png',  rating: '3.8'},
  {title: 'Aluminium 4 Cup Tea Kettle',      brand: 'Kitchen Expert', price: 399,  id: 27, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-kettle.png',           rating: '4.3'},
  {title: 'Tripod Stand',                    brand: 'Sketchfab',     price: 390,   id: 28, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-medium-tripod.png',    rating: '4.2'},
  {title: 'Beard Trimmer',                   brand: 'Nova',          price: 398,   id: 29, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-nova-trimmer.png',     rating: '4.5'},
  {title: 'Nova SuperGroom Multi-kit',       brand: 'Nova',          price: 1199,  id: 30, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-nover-v2-trimmer.png', rating: '4.4'},
  {title: 'Privateer Quartz Watch',          brand: 'Fossil',        price: 8122,  id: 31, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-royal-black-watch.png',rating: '4.4'},
  {title: 'Chronograph black Watch',         brand: 'Fossil',        price: 6395,  id: 32, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-royal-watch.png',      rating: '3.8'},
  {title: "Collider Black Dial Men's Watch", brand: 'Fossil',        price: 14995, id: 33, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-simple-belt-watch.png',rating: '4.3'},
  {title: "Neutra Analog Men's Watch",       brand: 'Fossil',        price: 10995, id: 34, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-simple-watch.png',     rating: '4.1'},
  {title: "Maritime Men's Watch",            brand: 'Titan',         price: 11999, id: 35, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/electronics-tatar-watch.png',       rating: '4.3'},

  // ── Grocery (ids: 36–45) ──────────────────────────────────────────────────
  {title: 'Eggs',                       brand: 'Naturoz',    price: 60,    id: 36, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery-eggs.png',          rating: '3.6'},
  {title: 'Chilli Extract Sauce',       brand: 'Everin',     price: 788,   id: 37, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery-extract.png',       rating: '4.1'},
  {title: 'Flour Unbleached',           brand: 'TWF Store',  price: 200,   id: 38, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery--flour.png',        rating: '4.3'},
  {title: 'Fresh Produce Green Chilli', brand: 'Amazon',     price: 30,    id: 39, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery-green-chilli.png',  rating: '4.2'},
  {title: 'Maroon Kumkum',              brand: 'Amazon',     price: 200,   id: 40, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery--kumkum.png',       rating: '3.9'},
  {title: 'Fresh Lemon, 100g',          brand: 'Amazon',     price: 50,    id: 41, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery-lemons.png',        rating: '4.5'},
  {title: 'Virgin Avocado Oil',         brand: 'ProV',       price: 4144,  id: 42, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery-oil.png',           rating: '4.4'},
  {title: 'Basmati Rice',               brand: 'Fortune',    price: 244,   id: 43, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery-rice.png',          rating: '3.6'},
  {title: 'Crystal Sugar',              brand: 'NatureVit',  price: 278,   id: 44, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery-sugar-cubes.png',   rating: '3.6'},
  {title: 'Turmeric Powder',            brand: 'Patanjali',  price: 1234,  id: 45, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/grocery-turmeric.png',      rating: '2.8'},

  // ── Toys (ids: 46–54) ─────────────────────────────────────────────────────
  {title: 'Batman Batmobile',     brand: 'Funskool',    price: 745,   id: 46, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-batman-toy.png',         rating: '4.7'},
  {title: 'Panda Baby Product',   brand: 'Panda',       price: 1399,  id: 47, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-big-two-wheeler.png',    rating: '4.3'},
  {title: 'Monsters Charm Toy',   brand: 'Trendytap',   price: 8600,  id: 48, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-minnos.png',             rating: '4.2'},
  {title: 'Knitted Rabbit',       brand: 'Ira',         price: 620,   id: 49, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-orange-rabbit.png',      rating: '4.4'},
  {title: 'Bot Robot Toy',        brand: 'WireScorts',  price: 355,   id: 50, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-orange-robot.png',       rating: '3.8'},
  {title: 'Kids Toy Train',       brand: 'FIONA',       price: 599,   id: 51, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-red-train.png',          rating: '4.1'},
  {title: 'Non-Toxic Robot Toys', brand: 'FunBlast',    price: 1545,  id: 52, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-short-green-robot.png',  rating: '3.3'},
  {title: 'Honey Teddy Bear',     brand: 'Honey',       price: 599,   id: 53, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-simple-teddy.png',       rating: '4.3'},
  {title: 'Nexa Yellow Car',      brand: 'Quinergys',   price: 490,   id: 54, image_url: 'https://assets.ccbp.in/frontend/react-js/ecommerce/toys-yellow-car.png',         rating: '4.1'},
]

// ── Prime deal IDs ────────────────────────────────────────────────────────────
const primeIds = [4, 8, 11, 18, 22, 24, 31, 33, 35, 42, 46, 48]

// ── Descriptions per category ─────────────────────────────────────────────────
const descriptions = {
  '1': 'High quality clothing item. Premium fabric, comfortable fit, perfect for all occasions.',
  '2': 'Top-grade electronics product. Reliable performance and durable build quality.',
  '3': 'Premium home appliance. Energy efficient and built to last for years of daily use.',
  '4': 'Fresh and high quality grocery product. Sourced directly from trusted suppliers.',
  '5': 'Fun and safe toy for children. Made with child-safe materials and tested for durability.',
}

// ── Build full product documents ──────────────────────────────────────────────
const products = rawProducts.map(p => {
  const category = getCategory(p.image_url)
  return {
    title:           p.title,
    brand:           p.brand,
    price:           p.price,
    image_url:       p.image_url,
    rating:          Number(p.rating),
    total_reviews:   Math.floor(Math.random() * 12000) + 300,
    description:     `${p.title} by ${p.brand}. ${descriptions[category]}`,
    availability:    'In Stock',
    category,
    isPrimeDeal:     primeIds.includes(p.id),
    ccbpId:          p.id,
    similar_products: [],
  }
})

// ── Import ─────────────────────────────────────────────────────────────────────
const importData = async () => {
  try {
    await connectDB()
    await User.deleteMany()
    await Product.deleteMany()

    const hashedUsers = await Promise.all(
      users.map(async u => {
        const salt = await bcrypt.genSalt(10)
        return {...u, password: await bcrypt.hash(u.password, salt)}
      }),
    )

    await User.insertMany(hashedUsers)
    await Product.insertMany(products)

    const byCategory = {
      '1': products.filter(p => p.category === '1').length,
      '2': products.filter(p => p.category === '2').length,
      '3': products.filter(p => p.category === '3').length,
      '4': products.filter(p => p.category === '4').length,
      '5': products.filter(p => p.category === '5').length,
    }

    console.log('\n✅ Data imported successfully!')
    console.log(`\n   Total products : ${products.length}`)
    console.log(`   Clothing        : ${byCategory['1']}`)
    console.log(`   Electronics     : ${byCategory['2']}`)
    console.log(`   Appliances      : ${byCategory['3']}`)
    console.log(`   Grocery         : ${byCategory['4']}`)
    console.log(`   Toys            : ${byCategory['5']}`)
    console.log(`   Prime deals     : ${products.filter(p => p.isPrimeDeal).length}`)
    console.log('\n── Test Credentials ───────────────────────────────────')
    console.log('Admin  │ username: rahul     │ password: rahul@2021')
    console.log('Prime  │ username: primeuser │ password: prime@2021')
    console.log('User   │ username: user1     │ password: user@2021')
    console.log('───────────────────────────────────────────────────────\n')
    process.exit(0)
  } catch (error) {
    console.error(`❌ Seeding error: ${error.message}`)
    process.exit(1)
  }
}

// ── Destroy ───────────────────────────────────────────────────────────────────
const destroyData = async () => {
  try {
    await connectDB()
    await User.deleteMany()
    await Product.deleteMany()
    console.log('✅ All data destroyed!')
    process.exit(0)
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

process.argv[2] === '--delete' ? destroyData() : importData()