# 🌲 Les Rois des Bois - Phase 1: Admin Dashboard

Complete MERN stack admin dashboard for **Les Rois des Bois** furniture business management system.

## 📋 Project Overview

**Phase 1** delivers a fully functional admin dashboard with:
- Product management (regular + configurable/composite products)
- Inventory tracking with automatic stock deduction
- Order management system
- POS sales backend (frontend in Phase 3)
- User management with role-based access
- PDF generation (invoices, receipts, production sheets)
- Arabic RTL interface with dark/light modes
- Luxury gold-themed UI

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- RESTful API with JWT authentication
- Mongoose ODM for MongoDB
- Role-based access control (Admin, Cashier)
- Automatic inventory tracking
- PDF generation with QRCode support
- Rate limiting and security headers

### Frontend (React + Vite)
- Modern React 18 with hooks
- RTL (Right-to-Left) Arabic support
- TailwindCSS with custom gold theme
- Framer Motion animations
- Recharts for analytics
- React Router for navigation
- Toast notifications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for both backend and frontend)
- MongoDB 6+ (local or cloud)
- npm or yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd ROISDESBOIS
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file (or copy from .env.example)
cp .env.example .env

# Edit .env with your MongoDB connection string

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

Backend runs on: **http://localhost:5000**

### 3. Setup Frontend

```bash
cd frontend
npm install

# Start frontend dev server
npm run dev
```

Frontend runs on: **http://localhost:5173**

### 4. Login

Navigate to http://localhost:5173/login

**Demo Credentials:**
- **Admin**: `admin@lesroisdesbois.com` / `admin123`
- **Cashier**: `cashier@lesroisdesbois.com` / `cashier123`

## 📁 Project Structure

```
ROISDESBOIS/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # Database config
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth, upload, errors
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Helpers (JWT, PDF, seed)
│   │   └── server.js          # Main server file
│   ├── uploads/               # Uploaded files
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Axios client
│   │   ├── components/        # Reusable components
│   │   ├── context/           # Auth & Theme contexts
│   │   ├── layouts/           # Dashboard layout
│   │   ├── pages/             # Page components
│   │   ├── styles/            # Tailwind CSS
│   │   ├── App.jsx            # Main app
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md                   # This file
```

## ✨ Features

### 🔐 Authentication & Security
- JWT access + refresh token system
- HTTP-only cookies
- Password hashing (bcrypt)
- Role-based permissions
- Rate limiting
- CORS protection
- Helmet security headers

### 📦 Product Management
- Regular products (name, price, SKU, stock, category)
- Image uploads
- Stock tracking
- Low stock alerts
- Category management
- Active/inactive status

### 🔧 Configurable Products
- Build products from components (e.g., table = top + legs)
- Auto-calculate price from components
- Component stock validation
- Custom price override option
- Automatic component stock deduction on sale

### 📋 Order Management
- Create orders with customer details
- Multiple items per order
- Tax and discount calculations
- Order status workflow:
  - Pending → Confirmed → In Production → Ready → Delivered
- Payment tracking
- Auto-generate order numbers
- Stock deduction on order creation

### 📊 Inventory Management
- Real-time stock tracking
- Inventory logs with full history
- Manual stock adjustments
- Stock alerts and summaries
- Component tracking for configurable products

### 🧾 PDF Generation
- **Invoices**: Professional Arabic RTL invoices with QR codes
- **Receipts**: Thermal POS receipts (80mm)
- **Production Sheets**: Workshop production documents
- Company branding (logo, info)
- Downloadable PDFs

### 💰 POS Sales
- Backend API ready (frontend in Phase 3)
- Quick sale creation
- Multiple payment methods
- Auto-generated sale numbers
- Stock deduction
- Receipt generation

### 👥 User Management (Admin Only)
- Create users (Admin/Cashier roles)
- Activate/deactivate accounts
- Password reset
- Activity tracking

### ⚙️ Settings
- Company information
- Logo upload
- Tax configuration
- Currency settings
- Invoice customization
- Low stock thresholds

### 📈 Analytics Dashboard
- Total products, orders, sales
- Low stock alerts
- Revenue statistics
- Sales charts (Recharts)
- Recent orders list

## 🎨 UI/UX

### Theme
- **Dark Mode**: Black background + gold accents
- **Light Mode**: White background + gold accents
- Smooth transitions between modes
- Persistent theme preference

### RTL Support
- Full Arabic right-to-left layout
- Arabic fonts (Cairo, Tajawal)
- Mirrored navigation and components

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Collapsible sidebar
- Touch-friendly controls

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/images` - Upload images

### Configurable Products
- `GET /api/configurable-products` - List
- `POST /api/configurable-products` - Create
- `PUT /api/configurable-products/:id` - Update
- `GET /api/configurable-products/:id/check-stock` - Check stock

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `GET /api/orders/stats/summary` - Statistics

### Inventory
- `GET /api/inventory/logs` - Inventory logs
- `POST /api/inventory/adjust` - Manual adjustment
- `GET /api/inventory/summary` - Summary
- `GET /api/inventory/alerts` - Stock alerts

### POS Sales
- `GET /api/pos-sales` - List sales
- `POST /api/pos-sales` - Create sale
- `GET /api/pos-sales/stats/summary` - Statistics

### PDF
- `GET /api/pdf/invoice/:orderId` - Download invoice
- `GET /api/pdf/receipt/:saleId` - Download receipt
- `GET /api/pdf/production-sheet/:orderId` - Production sheet

### Users (Admin Only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Settings (Admin Only)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/logo` - Upload logo

## 🗄️ Database Models

### User
- name, email, password (hashed)
- role (admin, cashier)
- isActive, lastLogin

### Product
- name, description, category
- price, cost, SKU, unit
- stock, lowStockThreshold
- images, SEO fields

### ConfigurableProduct
- name, components[]
- Auto-calculated price, cost, margin
- Custom price override
- Production notes

### Order
- Auto-generated orderNumber
- customer {name, phone, email, address}
- items[], totals
- paymentStatus, status workflow
- Timestamps, notes

### POSSale
- Auto-generated saleNumber
- items[], payment info
- cashier reference

### InventoryLog
- product, action, quantities
- Reference tracking
- Performed by user

### Settings
- Company info, logo
- Tax, currency
- Invoice settings

## 🚧 Future Phases

### Phase 2: Customer Catalog Website
- Public product browsing
- Configurable product builder (customer-facing)
- Shopping cart
- Checkout process
- Customer accounts
- Order tracking

### Phase 3: Full POS Interface
- Touch-optimized UI
- Barcode scanning
- Quick product search
- Split payments
- Cash drawer integration
- Receipt printing

### Phase 4: Advanced Analytics
- Detailed reports
- Profit analysis
- Inventory forecasting
- Export to Excel/PDF
- Email notifications

## 🛠️ Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Seed database
npm run seed

# Production mode
npm start
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Build if needed: `npm run build` (if using TypeScript)
3. Start server: `npm start`

Recommended platforms:
- Heroku
- Railway
- Render
- DigitalOcean App Platform

### Frontend Deployment

1. Build: `npm run build`
2. Deploy `dist/` folder

Recommended platforms:
- Vercel
- Netlify
- Cloudflare Pages
- Firebase Hosting

### Database

- MongoDB Atlas (cloud)
- MongoDB self-hosted
- DigitalOcean Managed MongoDB

## 🔒 Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend

No environment variables needed (uses proxy in development, relative paths in production)

## 📝 Testing

### Backend

```bash
# Test database connection
node -e "require('./src/config/db.js')"

# Test API endpoints
curl http://localhost:5000/health
```

### Frontend

```bash
# Lint
npm run lint

# Build test
npm run build
```

## 🐛 Troubleshooting

**MongoDB connection failed:**
- Check MongoDB is running: `mongosh`
- Verify `MONGODB_URI` in `.env`

**CORS errors:**
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check backend CORS configuration

**Port already in use:**
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.js`

**JWT errors:**
- Verify `JWT_SECRET` is set in backend `.env`
- Clear browser cookies and localStorage

## 📚 Documentation

- [Backend README](backend/README.md) - Detailed backend documentation
- [Frontend README](frontend/README.md) - Detailed frontend documentation

## 🤝 Contributing

This is a custom project for Les Rois des Bois. For modifications:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit for review

## 📄 License

MIT License - Les Rois des Bois © 2025

## 📞 Support

For issues or questions about this project, please contact the development team.

---

**Built with ❤️ for Les Rois des Bois**

*"ملوك الخشب - الجودة والفخامة في كل قطعة"*
