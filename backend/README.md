# Nxt Trendz — Backend API

Node.js + Express.js + MongoDB backend for the Nxt Trendz e-commerce application.

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                  MongoDB connection
├── controllers/
│   ├── authController.js      register, login
│   ├── productController.js   getProducts, getProductById, getPrimeDeals
│   └── cartController.js      getCart, addToCart, updateCartItem, removeCartItem, clearCart
├── models/
│   ├── User.js                username, password (bcrypt), role
│   ├── Product.js             title, brand, price, category, isPrimeDeal, similar_products
│   └── Cart.js                userId (ref), items[], totalPrice virtual, totalItems virtual
├── routes/
│   ├── authRoutes.js          POST /register, POST /login
│   ├── productRoutes.js       GET /products, GET /products/:id
│   ├── primeDealsRoutes.js    GET /prime-deals (prime role required)
│   └── cartRoutes.js          GET/POST/DELETE /cart, PUT/DELETE /cart/:productId
├── middleware/
│   ├── authMiddleware.js      protect, requirePrime, requireAdmin
│   └── errorHandler.js        notFound, global errorHandler
├── utils/
│   └── seeder.js              Seed / destroy test data
├── server.js                  Express app entry point
├── package.json
├── .env.example
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create .env file

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/nxt_trendz
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
```

### 3. Seed the database

```bash
npm run seed
```

This creates 3 test users and 10 sample products.

**Test credentials:**

| Role  | Username   | Password     |
|-------|------------|--------------|
| Admin | rahul      | rahul@2021   |
| Prime | primeuser  | prime@2021   |
| User  | user1      | user@2021    |

### 4. Start the server

```bash
npm run dev    # development (nodemon, auto-restart)
npm start      # production
```

Server runs at: `http://localhost:5000`
Health check:   `http://localhost:5000/health`

---

## API Endpoints

### Auth (Public)

| Method | Endpoint    | Description                          |
|--------|-------------|--------------------------------------|
| POST   | /register   | Create account, returns jwt_token    |
| POST   | /login      | Authenticate user, returns jwt_token |

**Request body (both):**
```json
{ "username": "string", "password": "string" }
```

**Success response:**
```json
{ "jwt_token": "eyJhbGci..." }
```

---

### Products (JWT required)

Add header: `Authorization: Bearer <jwt_token>`

| Method | Endpoint        | Description                          |
|--------|-----------------|--------------------------------------|
| GET    | /products       | All products with filters + sort     |
| GET    | /products/:id   | Single product + similar products    |
| GET    | /prime-deals    | Prime deals (prime/admin role only)  |

**GET /products query params:**
```
sort_by       PRICE_HIGH | PRICE_LOW   (default: PRICE_HIGH)
category      1 | 2 | 3 | 4 | 5       (empty = all categories)
title_search  string                   (partial match, case-insensitive)
rating        1 | 2 | 3 | 4           (minimum rating)
```

---

### Cart (JWT required)

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| GET    | /cart                | Load user's cart                   |
| POST   | /cart                | Add item to cart                   |
| PUT    | /cart/:productId     | Update item quantity               |
| DELETE | /cart/:productId     | Remove single item                 |
| DELETE | /cart                | Clear entire cart                  |

**POST /cart body:**
```json
{
  "id": "productObjectId",
  "title": "Product Name",
  "brand": "Brand",
  "price": 999,
  "imageUrl": "https://...",
  "quantity": 1
}
```

**All cart responses:**
```json
{
  "cartList": [{ "id", "title", "brand", "price", "imageUrl", "quantity" }],
  "totalPrice": 1998,
  "totalItems": 2
}
```

---

## Environment Variables

| Variable       | Description                          | Example                              |
|----------------|--------------------------------------|--------------------------------------|
| PORT           | Server port                          | 5000                                 |
| NODE_ENV       | Environment                          | development / production             |
| MONGO_URI      | MongoDB connection string            | mongodb://localhost:27017/nxt_trendz |
| JWT_SECRET     | Secret key for signing JWTs          | long_random_string                   |
| JWT_EXPIRES_IN | JWT expiry duration                  | 30d                                  |
| CLIENT_URL     | Frontend origin for CORS             | http://localhost:3000                |

---

## User Roles

| Role  | /products | /prime-deals | /cart |
|-------|-----------|--------------|-------|
| user  | ✅        | ❌           | ✅    |
| prime | ✅        | ✅           | ✅    |
| admin | ✅        | ✅           | ✅    |

To promote a user to prime/admin, update their `role` field directly in MongoDB.

---

## Tech Stack

- **Node.js** + **Express.js** — server and routing
- **MongoDB** + **Mongoose** — database and ODM
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT auth
- **express-validator** — input validation
- **helmet** — HTTP security headers
- **express-rate-limit** — brute-force protection
- **morgan** — request logging (dev only)
- **cors** — cross-origin resource sharing
