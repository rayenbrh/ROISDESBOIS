# Les Rois des Bois - Backend API

Backend server for Les Rois des Bois Admin Dashboard (Phase 1).

## 🚀 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **File Upload**: Multer
- **PDF Generation**: PDFKit + QRCode
- **Security**: Helmet, CORS, Rate Limiting, bcrypt

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth, error handling, upload, rate limiting
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── utils/          # Helpers (JWT, PDF generation, seed)
│   └── server.js       # Main server file
├── uploads/            # Uploaded files (images, PDFs)
├── .env                # Environment variables
└── package.json
```

## 🔧 Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/les-rois-des-bois
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# Using mongod
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

This creates:
- Admin user: `admin@lesroisdesbois.com` / `admin123`
- Cashier user: `cashier@lesroisdesbois.com` / `cashier123`
- Sample products
- Default settings

### 5. Start Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/change-password` | Change password | Private |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| PUT | `/api/users/:id/reset-password` | Reset user password |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |
| POST | `/api/products/:id/images` | Upload images (Admin) |
| DELETE | `/api/products/:id/images/:imageId` | Delete image (Admin) |
| GET | `/api/products/categories/list` | Get categories |
| GET | `/api/products/low-stock/alert` | Get low stock products |

### Configurable Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/configurable-products` | Get all configurable products |
| GET | `/api/configurable-products/:id` | Get configurable product by ID |
| POST | `/api/configurable-products` | Create configurable product (Admin) |
| PUT | `/api/configurable-products/:id` | Update configurable product (Admin) |
| DELETE | `/api/configurable-products/:id` | Delete configurable product (Admin) |
| GET | `/api/configurable-products/:id/check-stock` | Check component stock |
| POST | `/api/configurable-products/recalculate-prices` | Recalculate all prices (Admin) |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders (with filters) |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Cancel order (Admin) |
| GET | `/api/orders/stats/summary` | Get order statistics |

### POS Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pos-sales` | Get all POS sales |
| GET | `/api/pos-sales/:id` | Get POS sale by ID |
| POST | `/api/pos-sales` | Create POS sale |
| GET | `/api/pos-sales/stats/summary` | Get POS statistics |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/logs` | Get inventory logs |
| GET | `/api/inventory/logs/product/:id` | Get logs for specific product |
| POST | `/api/inventory/adjust` | Manually adjust stock (Admin) |
| GET | `/api/inventory/summary` | Get inventory summary |
| GET | `/api/inventory/alerts` | Get stock alerts |

### Settings (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/settings/logo` | Upload logo |
| DELETE | `/api/settings/logo` | Delete logo |

### PDF Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pdf/invoice/:orderId` | Download invoice PDF |
| GET | `/api/pdf/receipt/:saleId` | Download receipt PDF |
| GET | `/api/pdf/production-sheet/:orderId` | Download production sheet PDF |

## 🗄️ Database Models

### User
- name, email, password (hashed)
- role (admin, cashier)
- isActive, lastLogin

### Product
- name, description, category
- price, cost, SKU, unit
- stock, lowStockThreshold
- images, isActive
- slug, keywords (SEO)

### ConfigurableProduct
- name, description, category
- components (array of {product, quantityRequired})
- totalPrice, totalCost, margin (auto-calculated)
- customPrice (optional override)
- images, productionNotes

### Order
- orderNumber (auto-generated)
- customer {name, email, phone, address}
- items (array)
- subtotal, tax, discount, total
- paymentStatus, paymentMethod, amountPaid
- status (pending → confirmed → in_production → ready → delivered)
- dates, notes

### POSSale
- saleNumber (auto-generated)
- items (array)
- totals, payment info
- cashier, customerName (optional)

### InventoryLog
- product, action, quantityChange
- previousStock, newStock
- reference, notes, performedBy

### Settings
- Company info, logo
- Tax rate, currency
- Invoice settings
- Alerts, working hours

## 🔒 Authentication Flow

1. **Login**: POST `/api/auth/login`
   - Returns access token (24h) and refresh token (7d)
   - Tokens set as httpOnly cookies

2. **API Requests**: Include access token
   - Cookie: `accessToken`
   - OR Header: `Authorization: Bearer <token>`

3. **Refresh**: POST `/api/auth/refresh`
   - Uses refresh token to get new access token

4. **Logout**: POST `/api/auth/logout`
   - Clears tokens from cookies and database

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Password hashing (bcrypt)
- Role-based access control
- Rate limiting (100 req/15min general, 5 req/15min auth)
- HTTP-only cookies
- Helmet security headers
- CORS configuration
- Input validation

## 📦 Key Features

### Inventory Management
- Automatic stock deduction on sales/orders
- Component stock tracking for configurable products
- Inventory logs with full history
- Low stock alerts

### Configurable Products
- Build products from components (e.g., table = top + legs)
- Auto-calculate total price from components
- Stock validation for all components
- Component breakdown in orders

### PDF Generation
- Arabic RTL support
- QR codes
- Professional invoices
- Thermal POS receipts (80mm)
- Production worksheets

## 🧪 Testing

```bash
# Test database connection
node -e "require('./src/config/db.js')"

# Test seed script
npm run seed

# Make API requests (example)
curl http://localhost:5000/health
```

## 🚧 Future Phases

This backend is designed to support:
- **Phase 2**: Customer catalog website, configurable product builder, cart, checkout
- **Phase 3**: Full POS frontend interface
- **Phase 4**: Advanced analytics and reporting

Code is modular and scalable for easy expansion.

## 📝 Notes

- All API responses follow format: `{ success, data/message }`
- Dates are in ISO 8601 format
- Pagination: `?page=1&limit=10`
- Sorting: `?sortBy=createdAt&order=desc`
- Search/filters available on most list endpoints

## 🐛 Troubleshooting

**MongoDB connection error:**
```bash
# Check if MongoDB is running
mongosh
# Or start it
mongod
```

**Port already in use:**
```bash
# Change PORT in .env file
PORT=5001
```

**JWT errors:**
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set in .env
- Check token expiration times

## 📄 License

MIT License - Les Rois des Bois © 2025
