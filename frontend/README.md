# Les Rois des Bois - Admin Dashboard Frontend

Admin dashboard frontend application for Les Rois des Bois, built with React, TypeScript, and TailwindCSS.

## Features

- **Full RTL Support**: Complete Arabic UI with right-to-left layout
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first design that works on all devices
- **Authentication**: Secure login with JWT token management
- **User Management**: Create, edit, and manage users (admins, commercials, clients)
- **Category Management**: Organize products with hierarchical categories
- **Component Management**: Manage sub-products/components for special products
- **Product Management**: Full CRUD for products with special product configuration
- **Order Management**: Track and manage customer orders with status updates
- **Invoice Management**: Generate and manage invoices with payment tracking
- **Analytics Dashboard**: Sales analytics, charts, and KPIs
- **Settings**: Configure company info, tax, and invoice settings
- **Audit Logs**: Track all system activities

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework with RTL support
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form** - Form handling and validation
- **Headless UI** - Unstyled accessible UI components
- **Heroicons** - Icon library
- **Recharts** - Charts and data visualization
- **React Dropzone** - File upload
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client
- **date-fns** - Date formatting

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # React components
│   │   ├── common/      # Reusable UI components
│   │   └── layout/      # Layout components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   │   ├── Auth/        # Login page
│   │   ├── Dashboard/   # Dashboard home
│   │   ├── Users/       # User management
│   │   ├── Categories/  # Category management
│   │   ├── SubProducts/ # Component management
│   │   ├── Products/    # Product management
│   │   ├── Orders/      # Order management
│   │   ├── Invoices/    # Invoice management
│   │   ├── Analytics/   # Analytics and reports
│   │   ├── Settings/    # Settings page
│   │   └── AuditLogs/   # Audit logs
│   ├── services/        # API services
│   │   └── queries/     # React Query hooks
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables
├── index.html           # HTML template
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Key Components

### Common Components

- **Button** - Styled button with variants and loading states
- **Input** - Text input with label, error, and RTL support
- **Select** - Dropdown select with search
- **MultiSelect** - Multi-select dropdown with chips
- **Modal** - Dialog/modal component
- **Card** - Container card with header/footer
- **Badge** - Status badge with color variants
- **DataTable** - Reusable table with pagination
- **FileUpload** - Drag-and-drop file upload with preview
- **Spinner** - Loading spinner
- **EmptyState** - Empty state placeholder

### Layout Components

- **AdminLayout** - Main admin layout wrapper
- **Sidebar** - Right-side navigation sidebar (RTL)
- **Topbar** - Top navigation bar
- **PrivateRoute** - Protected route wrapper

## State Management

### Zustand Stores

- **authStore** - User authentication state
- **uiStore** - UI preferences (theme, sidebar, locale)

### React Query

All data fetching is handled by React Query hooks located in `src/services/queries/`:

- `authQueries.ts` - Authentication
- `userQueries.ts` - User management
- `categoryQueries.ts` - Category management
- `subProductQueries.ts` - Component management
- `productQueries.ts` - Product management
- `orderQueries.ts` - Order management
- `invoiceQueries.ts` - Invoice management
- `analyticsQueries.ts` - Analytics data
- `settingsQueries.ts` - Settings
- `auditLogQueries.ts` - Audit logs

## Styling

### TailwindCSS with RTL

The project uses TailwindCSS with the `tailwindcss-rtl` plugin for RTL support.

### Theme Colors

- **Primary (Gold)**: `#D4AF37`
- **Secondary (Charcoal)**: `#0E0E0E`

### Dark Mode

Dark mode is implemented using Tailwind's `dark:` variant and controlled by the `uiStore`.

## API Integration

API calls are made using Axios with interceptors for:

- JWT token injection
- Token refresh on 401
- Error handling
- Loading states

See `src/services/api.ts` for configuration.

## Form Handling

Forms use React Hook Form for:

- Form state management
- Validation
- Error handling
- Arabic error messages

## Routing

Routes are defined in `src/App.tsx`:

- `/login` - Login page
- `/admin` - Dashboard home
- `/admin/users` - User management
- `/admin/categories` - Category management
- `/admin/components` - Component management
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/orders/:id` - Order detail
- `/admin/invoices` - Invoice management
- `/admin/analytics` - Analytics
- `/admin/settings` - Settings
- `/admin/audit` - Audit logs

## Development

### Code Style

- Use TypeScript for type safety
- Follow React hooks best practices
- Use functional components
- Prefer composition over inheritance
- Keep components small and focused

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:5000/api)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Issues

- None at this time

## TODOs

- [ ] Add comprehensive product form with special product configuration
- [ ] Implement composite image generation UI with job status polling
- [ ] Add invoice detail page with PDF preview
- [ ] Implement advanced filtering and search
- [ ] Add export to Excel/PDF functionality
- [ ] Implement real-time notifications with WebSockets
- [ ] Add unit and integration tests

## License

Proprietary - Les Rois des Bois

## Support

For support, contact the development team.
