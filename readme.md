markdown

🛍️ E-Commerce Backend API 🚀
This is a fully functional E-Commerce backend API built using Node.js, designed to handle a range of features such as user authentication, role-based access, product management, and order processing with cash and Stripe payment integration.

# ✨ Features

## 🔐 User Authentication & Authorization

- User registration with email verification
- JWT-based authentication
- Secure password hashing with bcrypt
- Password reset via verification code sent via email
- Role-based access control (Admin, Manager, Customer)

## 🛍️ Product & Category

- Browse products and categories without authentication
- Public: search, filter, sort, and pagination
- Support for sub-categories
- Admin: Create, update, and delete products

## 🛒 Shopping Cart

- Add products to the cart (registered users)
- Update item quantity
- Remove items or clear cart
- Auto-calculation of cart total

## 🚚 Shipping & Orders

- Dynamic shipping price fetched from DB
- Create and manage orders
- Support for discount coupons

## 💳 Payment Integration

- Cash payments
- Stripe integration for card payments

## 👑 Admin Features

- Manage users, products, categories, and orders
- Upload and manage product images

## 🔎 Search & Filtering

- Advanced search functionality
- Filtering, sorting, pagination, and field limiting

## 🛡️ Security

- Helmet → sets secure HTTP headers
- express-mongo-sanitize → prevents MongoDB operator injection
- hpp → prevents HTTP parameter pollution
- express-rate-limit → limits repeated requests (brute-force/DDoS)
- CORS → safely configures cross-origin requests
- bcrypt → password hashing

## ⚡ Performance Optimization

- Supports compression

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Jamesab07/ecommerce-api.git

2.Navigate to project

cd ecommerce-api

3.Install dependencies

npm install

4.Create a .env file in the root directory with the following:

# Server configuration
PORT=3100
NODE_ENV=development
BASE_URL=http://localhost:3100/api/v1

# MongoDB

DATABASE=
DATABASE_PASSWORD=

# Email

EMAIL_USERNAME=your_email_address
EMAIL_PASSWORD=your_email_password
EMAIL_SERVICE=gmail

# JWT

JWT_SECRET_KEY=
JWT_EXPIRE_TIME=30d

# Stripe

STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

4.Start the server:
use script from package.json file
run: npm start

📌 API Highlights
Auth

     POST /api/v1/auth/singUp → Register new user + send verification email
     GET /api/v1/auth/verify-email/:token → Verify email
     POST /api/v1/auth/login → Login user

   Products

     GET /api/v1/products → Fetch all products
     GET /api//v1/products/:id → Fetch single product
     POST /api/v1/products → Add product (admin only)

   Cart
     POST /api/v1/cart → Add product to cart
     DELETE /api/v1/cart/:id → Remove from cart

   Wishlist

     POST /api/v1/wishlist → Add product to wishlist
     DELETE /api/v1/wishlist/:id → Remove product from wishlist

   Orders / Shipping
     POST /api/v1/orders/checkout-session/:cartId → Checkout with Stripe (dynamic shipping from DB)

## 📂 Project Structure

📦 ecommerce-backend
┣ 📂 controllers # Business logic for routes
┣ 📂 dev-data # Seed data for testing
┣ 📂 middleware # image helper,API features, error handling
┣ 📂 models # Mongoose schemas (User, Product, Cart, Order, Shipping, etc.)
┣ 📂 routes # API route definitions
┣ 📂 uploads # Uploaded images
┃ ┣ 📂 brands # Brand images
┃ ┣ 📂 category # Category images
┃ ┣ 📂 products # Product images
┃ ┗ 📂 users # User profile images
┣ 📂 utils # Utility functions
┣ 📜 app.js # Express app configuration
┣ 📜 server.js # Application entry point
┣ 📜 package.json # Dependencies and scripts
┣ 📜 .env.example # Example environment variables
┗ 📜 readme.md # Project documentation

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
```
