# 🪵 Les Rois des Bois - Admin Dashboard

> **Phase 1**: Complete admin dashboard for managing furniture products, orders, invoices, and analytics.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Seeding the Database](#seeding-the-database)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

**Les Rois des Bois** is a comprehensive admin dashboard system for managing a furniture business. This Phase 1 implementation includes:

- **User Management**: Admins, Commercials, Store staff, and Clients
- **Product Catalog**: Standard and configurable (component-based) products
- **Inventory**: Multi-level stock tracking (product/variant/component)
- **Order Processing**: Full workflow with status management
- **Invoicing**: PDF generation, payment tracking, Arabic RTL support
- **Analytics**: Sales stats, top products, low stock alerts
- **Settings**: Company configuration and theme customization

The system is **fully bilingual** with **Arabic RTL** as the primary language.

---

## ✨ Features

### Core Functionality
- ✅ **Authentication & Authorization** - JWT-based with role management
- ✅ **User Management** - CRUD operations for all user types
- ✅ **Category Management** - Hierarchical categories with parent/child relationships
- ✅ **SubProducts (Components)** - Building blocks for configurable products
- ✅ **Product Management** - Both standard and special configurable products
- ✅ **Order Management** - Complete workflow from creation to delivery
- ✅ **Invoice Management** - PDF generation with payment tracking
- ✅ **Analytics Dashboard** - Real-time KPIs and charts
- ✅ **Settings** - Company info, tax rates, invoice customization
- ✅ **Audit Logging** - Complete activity trail

### Special Features
- 🎨 **Configurable Products** - Build custom furniture from components
- 🖼️ **Composite Image Generation** - Auto-generate product images from component combinations
- 📄 **PDF Generation** - Arabic RTL invoices and production sheets (Puppeteer)
- 📸 **Image Processing** - Sharp integration for optimization and thumbnails
- ⚡ **Job Queue** - Bull + Redis for async tasks (image composition, PDFs)
- 🌙 **Dark Mode** - Full theme switching support
- 📱 **Responsive Design** - Mobile-first approach
- 🔍 **Advanced Filtering** - Search and filter across all entities

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB 7.0 + Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Sharp (image processing)
- **PDF Generation**: Puppeteer (Arabic RTL support)
- **Queue**: Bull + Redis
- **Validation**: Joi
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + RTL support
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Charts**: Recharts
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for frontend)
- **Process Manager**: PM2 (optional)

---

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 7.0 (or Docker)
- **Redis** >= 7.0 (optional, for job queue)
- **Git**

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ROISDESBOIS
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Build TypeScript
npm run build
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
nano .env
```

### 4. Start MongoDB

Option A: Using Docker
```bash
docker run -d \
  --name roisdesbois-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=roisdesbois \
  mongo:7.0
```

Option B: Local MongoDB
```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/data
```

### 5. Seed the Database

```bash
cd backend
npm run seed
```

**Demo Credentials:**
```
Admin:
  Email: admin@roisdesbois.tn
  Password: Admin123!

Commercial:
  Email: commercial@roisdesbois.tn
  Password: Commercial123!

Store:
  Email: store@roisdesbois.tn
  Password: Store123!

Client:
  Email: client@example.tn
  Password: Client123!
```

### 6. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Docs**: http://localhost:5000/api/docs

---

## 📁 Project Structure

```
ROISDESBOIS/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (PDF, image, queue)
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── config/          # Database, Redis, logger config
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Helper functions
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Server entry point
│   ├── scripts/
│   │   └── seed.ts          # Database seeding script
│   ├── uploads/             # Uploaded files (images, PDFs)
│   ├── logs/                # Application logs
│   ├── tests/               # Backend tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Buttons, Inputs, Modals, etc.
│   │   │   └── layout/      # AdminLayout, Sidebar, Topbar
│   │   ├── pages/           # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users/
│   │   │   ├── Products/
│   │   │   ├── Orders/
│   │   │   └── ...
│   │   ├── services/        # API client + React Query hooks
│   │   ├── store/           # Zustand stores (auth, ui)
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Helper functions (format, validation)
│   │   ├── App.tsx          # Main app component with routing
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
├── docker-compose.yml       # Multi-container Docker setup
└── README.md                # This file
```

---

## ⚙️ Configuration

### Backend Environment Variables

See `backend/.env.example`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/roisdesbois

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis (for queue)
REDIS_HOST=localhost
REDIS_PORT=6379
USE_QUEUE=true

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
USE_S3=false            # Set to true to use AWS S3

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173

# Company Defaults
DEFAULT_CURRENCY=TND
DEFAULT_TAX_PERCENT=19
DEFAULT_LANGUAGE=ar
```

### Frontend Environment Variables

See `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=لوحة تحكم Les Rois des Bois
VITE_DEFAULT_LANGUAGE=ar
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview  # Preview production build locally
```

### Running with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start dist/server.js --name roisdesbois-api

# Check status
pm2 status
pm2 logs roisdesbois-api
```

---

## 🌱 Seeding the Database

The seed script creates demo data including users, categories, products, and orders.

```bash
cd backend
npm run seed
```

**What gets seeded:**
- 4 Users (Admin, Commercial, Store, Client)
- 4 Categories (Furniture tree)
- 6 SubProducts (Components for configurable products)
- 4 Products (2 standard, 2 configurable)
- 2 Sample Orders
- 1 Settings document (company info)

---

## 📚 API Documentation

### Swagger/OpenAPI

Once the backend is running, visit:

**http://localhost:5000/api/docs**

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

#### Users (Admin only)
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `GET /api/admin/users/:id` - Get user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

#### Products
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `GET /api/admin/products/:id` - Get product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/products/:id/generate-composite` - Generate composite image

#### Orders
- `GET /api/admin/orders` - List orders
- `POST /api/admin/orders` - Create order
- `GET /api/admin/orders/:id` - Get order
- `PUT /api/admin/orders/:id/status` - Update order status
- `POST /api/admin/orders/:id/generate-invoice` - Generate invoice PDF
- `POST /api/admin/orders/:id/generate-production-sheet` - Generate production sheet

#### Analytics
- `GET /api/admin/analytics/sales` - Sales statistics
- `GET /api/admin/analytics/top-products` - Top products
- `GET /api/admin/analytics/low-stock` - Low stock items

_See Swagger docs for complete API reference._

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean start)
docker-compose down -v
```

**Services:**
- **mongodb**: MongoDB database (port 27017)
- **redis**: Redis cache (port 6379)
- **backend**: Node.js API (port 5000)
- **frontend**: Nginx serving React app (port 80)

**Access:**
- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- API Docs: http://localhost:5000/api/docs

### Individual Docker Builds

**Backend:**
```bash
cd backend
docker build -t roisdesbois-backend .
docker run -p 5000:5000 --env-file .env roisdesbois-backend
```

**Frontend:**
```bash
cd frontend
docker build -t roisdesbois-frontend .
docker run -p 80:80 roisdesbois-frontend
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test
```

_Note: Tests are provided as examples. Expand coverage as needed._

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Start MongoDB
sudo systemctl start mongod

# Or with Docker
docker start roisdesbois-mongodb
```

### Puppeteer/Chromium Issues in Docker

If PDF generation fails:

```dockerfile
# Ensure Chromium is installed in Dockerfile
RUN apk add --no-cache chromium nss freetype harfbuzz

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Image Upload Failures

Ensure upload directories exist:

```bash
mkdir -p backend/uploads/{products,subproducts,composites,logos,pdfs}
chmod -R 755 backend/uploads
```

### CORS Issues

Update `backend/.env`:

```env
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

---

## 📸 Screenshots

> _Add screenshots of your admin dashboard here_

---

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- Admin Dashboard
- User, Category, Product, Order, Invoice management
- Analytics & Reporting
- PDF Generation
- Configurable Products

### Phase 2 (Future)
- Customer-facing catalog website
- Point of Sale (POS) system
- Advanced inventory management
- Multi-warehouse support

### Phase 3 (Future)
- Mobile apps (React Native)
- Advanced reporting
- Integration with accounting software
- Email notifications
- Real-time WebSocket updates

---

## 👥 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software for **Les Rois des Bois**.

---

## 🙏 Acknowledgments

- **React** community for excellent tooling
- **TailwindCSS** for the RTL support
- **MongoDB** team for robust database
- **Puppeteer** for Arabic PDF generation

---

## 📞 Support

For support, contact:
- **Email**: contact@roisdesbois.tn
- **Website**: [https://roisdesbois.tn](https://roisdesbois.tn)

---

## ⚡ Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
npm run seed         # Seed database
npm test             # Run tests

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Docker
docker-compose up --build     # Build and start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
```

---

**Built with ❤️ for Les Rois des Bois**

---

_Last Updated: November 2024_
