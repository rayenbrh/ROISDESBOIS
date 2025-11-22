# Les Rois des Bois - Frontend

React + Vite frontend for Les Rois des Bois Admin Dashboard with Arabic RTL support and luxury gold theme.

## 🎨 Features

- **RTL Support**: Full Arabic right-to-left layout
- **Dark/Light Mode**: Toggle between themes with gold accents
- **Responsive Design**: Mobile, tablet, and desktop support
- **Modern UI**: Framer Motion animations, Tailwind CSS styling
- **Analytics Dashboard**: Charts and statistics using Recharts
- **Form Validation**: React Hook Form integration
- **Toast Notifications**: React Hot Toast for user feedback
- **Protected Routes**: Authentication-based access control

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running on http://localhost:5000

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Frontend runs on: http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API client (axios)
│   ├── assets/           # Static assets
│   ├── components/       # Reusable components
│   ├── context/          # React contexts (Auth, Theme)
│   ├── hooks/            # Custom hooks
│   ├── layouts/          # Layout components
│   ├── pages/            # Page components
│   ├── router/           # Routing configuration
│   ├── styles/           # Global styles & Tailwind
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Theme & Styling

### Color Scheme

**Light Mode**:
- Background: White (#ffffff)
- Text: Gray-900
- Accent: Gold-500 (#f59e0b)

**Dark Mode**:
- Background: Dark-50 (#18181b)
- Text: Gray-100
- Accent: Gold-500 (#f59e0b)

### Typography

- Font Family: Cairo, Tajawal (Google Fonts)
- RTL-optimized for Arabic text

### Components

Pre-built component classes:
- `.card` - Card container
- `.btn-primary` - Primary button (gold)
- `.btn-secondary` - Secondary button
- `.btn-danger` - Delete/cancel button
- `.input` - Form input
- `.badge-*` - Status badges

## 📄 Pages

### Completed Pages

1. **Login** (`/login`)
   - Email/password authentication
   - Demo credentials display
   - Animated card design

2. **Dashboard** (`/`)
   - Statistics cards
   - Sales chart
   - Recent orders list
   - Low stock alerts

3. **Products** (`/products`)
   - Product list with search
   - Add/Edit/Delete operations
   - Stock status indicators
   - Pagination

4. **Product Form** (`/products/new`, `/products/edit/:id`)
   - Create/update products
   - Form validation
   - Multi-field input

### Placeholder Pages (For Expansion)

- Configurable Products
- Orders & Order Details
- Inventory Management
- Users Management
- Settings
- POS Interface (Phase 3)

## 🔐 Authentication

Authentication is managed via `AuthContext`:

```jsx
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
  // ...
}
```

## 🌙 Theme Management

Theme is managed via `ThemeContext`:

```jsx
import { useTheme } from '@/context/ThemeContext';

function Component() {
  const { isDark, toggleTheme } = useTheme();
  // ...
}
```

## 🌐 API Integration

All API calls use the configured axios instance:

```jsx
import api from '@/api/axios';

const fetchData = async () => {
  const { data } = await api.get('/products');
  return data;
};
```

API automatically handles:
- Token management
- Token refresh
- Error handling
- Redirects on auth failure

## 🎯 Available Routes

| Route | Component | Auth | Admin Only |
|-------|-----------|------|------------|
| `/login` | Login | Public | No |
| `/` | Dashboard | Yes | No |
| `/products` | Products | Yes | No |
| `/products/new` | ProductForm | Yes | Yes |
| `/products/edit/:id` | ProductForm | Yes | Yes |
| `/configurable-products` | ConfigurableProducts | Yes | No |
| `/orders` | Orders | Yes | No |
| `/orders/:id` | OrderDetails | Yes | No |
| `/inventory` | Inventory | Yes | No |
| `/users` | Users | Yes | Yes |
| `/settings` | Settings | Yes | Yes |
| `/pos` | POSPlaceholder | Yes | No |

## 🛠️ Key Dependencies

- **React 18.2** - UI library
- **React Router DOM 6** - Routing
- **Axios** - HTTP client
- **Tailwind CSS 3** - Styling
- **Framer Motion 10** - Animations
- **Recharts 2** - Charts
- **React Hook Form 7** - Forms
- **React Hot Toast 2** - Notifications
- **React Icons 5** - Icon library

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

All pages are fully responsive with mobile-first design.

## 🔧 Development Tips

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `DashboardLayout.jsx`

### Custom API Calls

```jsx
// GET request
const { data } = await api.get('/endpoint');

// POST request
const { data } = await api.post('/endpoint', payload);

// PUT request
const { data } = await api.put('/endpoint/:id', payload);

// DELETE request
const { data } = await api.delete('/endpoint/:id');
```

### Displaying Toasts

```jsx
import toast from 'react-hot-toast';

toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...');
```

## 🌍 Internationalization

Currently supports Arabic (RTL). To add more languages:

1. Update `html` lang attribute in `index.html`
2. Add translation strings
3. Implement i18n library (e.g., react-i18next)

## 🚧 Future Enhancements

**Phase 2 (Customer Catalog)**:
- Public product catalog
- Shopping cart
- Checkout process
- Customer dashboard

**Phase 3 (POS)**:
- Full POS interface
- Barcode scanning
- Quick product search
- Receipt printing

**Phase 4 (Analytics)**:
- Advanced reports
- Export functionality
- Data visualization

## 🐛 Troubleshooting

**API connection issues**:
- Ensure backend is running on http://localhost:5000
- Check proxy configuration in `vite.config.js`

**Build errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors**:
- Backend CORS is configured for http://localhost:5173
- Update backend `.env` FRONTEND_URL if needed

## 📄 License

MIT License - Les Rois des Bois © 2025
