# Nxt Trendz — Full Stack E-Commerce Application

A full-stack e-commerce web application built with **React.js** (frontend) and **Node.js + Express.js + MongoDB** (backend). Features JWT authentication, role-based access control, persistent cart storage, product filtering, and a complete shopping flow.

---

## Features

- User registration and login with JWT authentication
- Browse 54 products across 5 categories
- Filter products by category, rating, and title search
- Sort products by price (high to low / low to high)
- Prime deals section (role-gated — prime/admin only)
- Full product detail page with similar products
- Persistent cart — survives page refresh, logout, and device switch
- Add to cart, increment/decrement quantity, remove item, remove all
- Cart summary with total price and item count
- Protected routes — redirect to login if not authenticated
- Rate limiting and HTTP security headers on all API routes

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI library |
| React Router DOM | Client-side routing |
| React Context API | Global cart state management |
| js-cookie | JWT cookie storage |
| react-loader-spinner | Loading indicators |
| react-icons | UI icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server and REST API |
| MongoDB + Mongoose | Database and ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT generation and verification |
| express-validator | Input validation |
| helmet | HTTP security headers |
| express-rate-limit | Brute-force protection |
| morgan | Request logging |
| cors | Cross-origin resource sharing |
| dotenv | Environment variable management |

---

## Project Structure

```
nxt-trendz/
│
├── frontend/                          React.js application
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── AllProductsSection/    Product list with filters + sort
│       │   ├── Cart/                  Cart page (class component)
│       │   ├── CartItem/              Individual cart item with quantity controls
│       │   ├── CartListView/          Renders list of CartItems
│       │   ├── CartSummary/           Total price and item count
│       │   ├── EmptyCartView/         Empty cart placeholder
│       │   ├── FiltersGroup/          Search, category, rating filters
│       │   ├── Header/                Nav bar with cart badge count
│       │   ├── Home/                  Home page
│       │   ├── LoginForm/             Login page with register link
│       │   ├── NotFound/              404 page
│       │   ├── PrimeDealsSection/     Prime deals (role-gated)
│       │   ├── ProductCard/           Product card component
│       │   ├── ProductItemDetails/    Full product detail + add to cart
│       │   ├── Products/              Products page layout
│       │   ├── ProductsHeader/        Sort dropdown
│       │   ├── ProtectedRoute/        JWT-guarded route wrapper
│       │   ├── RegisterForm/          Registration page
│       │   └── SimilarProductItem/    Similar product card
│       ├── context/
│       │   └── CartContext.js         Cart context with all cart methods
│       ├── App.js                     Routes + all cart API methods
│       └── App.css
│
└── backend/                           Node.js + Express.js REST API
    ├── config/
    │   └── db.js                      MongoDB connection
    ├── controllers/
    │   ├── authController.js          register, login
    │   ├── productController.js       getProducts, getProductById, getPrimeDeals
    │   └── cartController.js          getCart, addToCart, updateCartItem,
    │                                  removeCartItem, clearCart
    ├── models/
    │   ├── User.js                    username, password (bcrypt), role
    │   ├── Product.js                 title, brand, price, image_url, category,
    │   │                              isPrimeDeal, similar_products
    │   └── Cart.js                    userId (ref), items[], virtuals
    ├── routes/
    │   ├── authRoutes.js              POST /register, POST /login
    │   ├── productRoutes.js           GET /products, GET /products/:id
    │   ├── primeDealsRoutes.js        GET /prime-deals
    │   └── cartRoutes.js              GET|POST|DELETE /cart,
    │                                  PUT|DELETE /cart/:productId
    ├── middleware/
    │   ├── authMiddleware.js          protect, requirePrime, requireAdmin
    │   └── errorHandler.js            notFound, global errorHandler
    ├── utils/
    │   └── seeder.js                  Seed all 54 products + 3 test users
    ├── server.js                      Express app entry point
    ├── package.json
    └── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- MongoDB running locally **or** a MongoDB Atlas connection string

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nxt-trendz.git
cd nxt-trendz
```

---

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/nxt_trendz
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
```

Seed the database with all 54 products and test users:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`
Health check: `http://localhost:5000/health`

---

### 3. Setup the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## Test Credentials

After running `npm run seed` in the backend folder:

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | rahul | rahul@2021 | All routes including prime deals |
| Prime | primeuser | prime@2021 | All routes including prime deals |
| User | user1 | user@2021 | All routes except prime deals |

---

## API Reference

### Base URL
```
http://localhost:5000
```

### Authentication Header
Required on all protected routes:
```
Authorization: Bearer <jwt_token>
```

---

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /register | Public | Create account, returns jwt_token |
| POST | /login | Public | Authenticate user, returns jwt_token |

**Request body:**
```json
{
  "username": "string (3-30 chars)",
  "password": "string (min 6 chars)"
}
```

**Success response:**
```json
{ "jwt_token": "eyJhbGci..." }
```

---

### Products

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /products | JWT | All products with filters + sort |
| GET | /products/:id | JWT | Single product + similar products |
| GET | /prime-deals | JWT + Prime role | Prime exclusive products |

**GET /products query params:**

| Param | Values | Description |
|---|---|---|
| sort_by | PRICE_HIGH \| PRICE_LOW | Sort order (default: PRICE_HIGH) |
| category | 1 \| 2 \| 3 \| 4 \| 5 | 1=Clothing, 2=Electronics, 3=Appliances, 4=Grocery, 5=Toys |
| title_search | any string | Partial title match, case-insensitive |
| rating | 1 \| 2 \| 3 \| 4 | Minimum rating filter |

---

### Cart

All cart endpoints require JWT. Every operation is scoped to the authenticated user only.

| Method | Endpoint | Description |
|---|---|---|
| GET | /cart | Load user's cart on page mount |
| POST | /cart | Add item (increments qty if already exists) |
| PUT | /cart/:productId | Update item quantity (0 = removes item) |
| DELETE | /cart/:productId | Remove single item |
| DELETE | /cart | Clear entire cart |

**All cart responses return:**
```json
{
  "cartList": [
    {
      "id": "64f1a...",
      "title": "Product Name",
      "brand": "Brand",
      "price": 499,
      "imageUrl": "https://...",
      "quantity": 2
    }
  ],
  "totalPrice": 998,
  "totalItems": 2
}
```

---

## User Roles

| Role | /products | /prime-deals | /cart |
|---|---|---|---|
| user | Yes | No (401) | Yes |
| prime | Yes | Yes | Yes |
| admin | Yes | Yes | Yes |

To promote a user to prime, update their `role` field directly in MongoDB:

```js
db.users.updateOne(
  { username: "user1" },
  { $set: { role: "prime" } }
)
```

---

## Product Categories

All 54 products are seeded from the original CCBP API response:

| ID | Category | Products |
|---|---|---|
| 1 | Clothing | 16 |
| 2 | Electronics | 11 |
| 3 | Appliances | 8 |
| 4 | Grocery | 10 |
| 5 | Toys | 9 |

---

## Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs, salt rounds = 10 |
| JWT signing | HS256, 30-day expiry |
| Auth rate limiting | 10 requests per IP per 15 minutes |
| Global rate limiting | 200 requests per IP per 15 minutes |
| HTTP security headers | helmet.js |
| CORS | Restricted to CLIENT_URL in .env |
| Input validation | express-validator on all POST/PUT bodies |
| Cart isolation | All queries filtered by req.user._id |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| PORT | No | 5000 | Server port |
| NODE_ENV | Yes | — | development or production |
| MONGO_URI | Yes | — | MongoDB connection string |
| JWT_SECRET | Yes | — | Secret key for signing JWTs |
| JWT_EXPIRES_IN | No | 30d | Token expiry duration |
| CLIENT_URL | Yes | — | Frontend origin for CORS |

---

## Available Scripts

### Backend

```bash
npm run dev          # Start with nodemon (auto-restart on file changes)
npm start            # Start without nodemon (production)
npm run seed         # Seed 54 products + 3 test users into MongoDB
npm run seed:delete  # Delete all seeded data from MongoDB
```

### Frontend

```bash
npm start            # Start development server at localhost:3000
npm run build        # Create optimised production build
```

---

## Frontend → Backend Integration Map

| Frontend File | API Call |
|---|---|
| `LoginForm/index.js` | POST /login |
| `RegisterForm/index.js` | POST /register |
| `AllProductsSection/index.js` | GET /products |
| `ProductItemDetails/index.js` | GET /products/:id |
| `PrimeDealsSection/index.js` | GET /prime-deals |
| `App.js` | GET /cart, POST /cart, PUT /cart/:id, DELETE /cart/:id, DELETE /cart |
| `Cart/index.js` | GET /cart (via loadCart in componentDidMount) |

---

## Troubleshooting

**401 after page refresh or seeder re-run**

Your JWT cookie references an old user ObjectId that was deleted by the seeder.

```js
// Run this in your browser console to clear the stale cookie
document.cookie = "jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
```

Then log in again at `/login`.

---

**Cart page blank or not rendering**

Make sure `Cart/index.js` is a **class component** using `Cart.contextType = CartContext`. Never use `useEffect` inside a `CartContext.Consumer` render prop — it violates React's rules of hooks and crashes the component silently.

```js
// Correct pattern
class Cart extends Component {
  componentDidMount() {
    const {loadCart} = this.context
    loadCart()
  }
}
Cart.contextType = CartContext
```

---

**MongoDB connection error**

- Local MongoDB: make sure `mongod` is running
- Atlas: verify your connection string in `.env` includes your IP in the Atlas network access list

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

- Product data and images from [CCBP](https://ccbp.in)
- Built as part of the NxtWave full-stack development curriculum
