// Color constants
export const COLORS = {
  primary: '#D4AF37', // Gold
  secondary: '#0E0E0E', // Charcoal
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

// Role labels in Arabic
export const ROLE_LABELS: Record<string, string> = {
  admin: 'مدير',
  commercial: 'تجاري',
  client: 'عميل',
};

// Order status labels in Arabic
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  in_production: 'قيد الإنتاج',
  ready: 'جاهز',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

// Order status colors
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  in_production: 'primary',
  ready: 'success',
  delivered: 'success',
  cancelled: 'danger',
};

// Payment method labels in Arabic
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'نقد',
  card: 'بطاقة',
  check: 'شيك',
  transfer: 'تحويل بنكي',
};

// Stock policy labels in Arabic
export const STOCK_POLICY_LABELS: Record<string, string> = {
  track: 'تتبع المخزون',
  unlimited: 'غير محدود',
  backorder: 'طلب مسبق',
};

// Action type labels in Arabic
export const ACTION_TYPE_LABELS: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
  generate_invoice: 'توليد فاتورة',
  generate_composite: 'توليد صورة مركبة',
  other: 'أخرى',
};

// Resource type labels in Arabic
export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  user: 'مستخدم',
  category: 'فئة',
  subproduct: 'مكون',
  product: 'منتج',
  order: 'طلب',
  invoice: 'فاتورة',
  settings: 'إعدادات',
  other: 'أخرى',
};

// Navigation items
export const NAV_ITEMS = [
  { name: 'لوحة التحكم', path: '/admin', icon: 'HomeIcon' },
  { name: 'المستخدمون', path: '/admin/users', icon: 'UsersIcon' },
  { name: 'الفئات', path: '/admin/categories', icon: 'FolderIcon' },
  { name: 'المكونات', path: '/admin/components', icon: 'CubeIcon' },
  { name: 'المنتجات', path: '/admin/products', icon: 'ShoppingBagIcon' },
  { name: 'الطلبات', path: '/admin/orders', icon: 'ShoppingCartIcon' },
  { name: 'الفواتير', path: '/admin/invoices', icon: 'DocumentTextIcon' },
  { name: 'التحليلات', path: '/admin/analytics', icon: 'ChartBarIcon' },
  { name: 'الإعدادات', path: '/admin/settings', icon: 'CogIcon' },
  { name: 'سجل المراجعة', path: '/admin/audit', icon: 'ClipboardDocumentListIcon' },
];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Toast duration
export const TOAST_DURATION = 4000; // 4 seconds

// API retry config
export const API_RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Chart colors
export const CHART_COLORS = [
  '#D4AF37', // Gold
  '#0E0E0E', // Charcoal
  '#10b981', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

// Date format patterns
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx',
};

// Low stock threshold
export const LOW_STOCK_THRESHOLD = 10;
