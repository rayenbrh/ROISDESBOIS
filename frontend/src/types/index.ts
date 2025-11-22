// Core Types for Les Rois des Bois Admin Dashboard

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'commercial' | 'client';
  assignedCommercial?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: string | Category;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubProduct {
  _id: string;
  title: string;
  SKU: string;
  extraPrice: number;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComponentGroup {
  componentKey: string;
  label: string;
  subProducts: string[] | SubProduct[];
  required: boolean;
}

export interface CombinationImage {
  combination: Record<string, string>;
  imageUrl: string;
}

export interface BulkPrice {
  minQty: number;
  price: number;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  SKU: string;
  retailPrice: number;
  costPrice: number;
  bulkPrices: BulkPrice[];
  stock: number;
  stockPolicy: 'track' | 'unlimited' | 'backorder';
  categories: string[] | Category[];
  images: string[];
  isSpecial: boolean;
  componentGroups?: ComponentGroup[];
  combinationImages?: CombinationImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  variantKey?: string;
  components?: Record<string, string>;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  client: string | User;
  commercial: string | User;
  items: OrderItem[];
  subtotal: number;
  remise: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled';
  statusHistory: Array<{
    status: string;
    timestamp: string;
    changedBy: string;
  }>;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  amount: number;
  date: string;
  method: 'cash' | 'card' | 'check' | 'transfer';
  note?: string;
  recordedBy: string | User;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  order: string | Order;
  client: string | User;
  amountDue: number;
  amountPaid: number;
  isPaid: boolean;
  payments: Payment[];
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  companyName: string;
  phone: string;
  address: string;
  taxNumber: string;
  taxPercent: number;
  currency: string;
  logo?: string;
  invoiceFooter?: string;
  primaryColor?: string;
  defaultTheme?: 'light' | 'dark';
}

export interface AuditLog {
  _id: string;
  user: string | User;
  actionType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'generate_invoice' | 'generate_composite' | 'other';
  resourceType: 'user' | 'category' | 'subproduct' | 'product' | 'order' | 'invoice' | 'settings' | 'other';
  resourceId?: string;
  details?: any;
  timestamp: string;
}

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  netIncome: number;
  lowStockCount: number;
  salesTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface TopProduct {
  product: Product;
  totalSold: number;
  revenue: number;
}

export interface TopClient {
  client: User;
  totalOrders: number;
  totalSpent: number;
}

export interface CategoryStats {
  category: Category;
  revenue: number;
  percentage: number;
}

export interface CompositeJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'admin' | 'commercial' | 'client';
  assignedCommercial?: string;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  parentCategory?: string;
  icon?: File;
}

export interface SubProductFormData {
  title: string;
  SKU: string;
  extraPrice: number;
  stock: number;
  images: File[];
}

export interface ProductFormData {
  title: string;
  description: string;
  SKU: string;
  retailPrice: number;
  costPrice: number;
  bulkPrices: BulkPrice[];
  stock: number;
  stockPolicy: 'track' | 'unlimited' | 'backorder';
  categories: string[];
  images: File[];
  isSpecial: boolean;
  componentGroups?: ComponentGroup[];
  combinationImages?: CombinationImage[];
  isActive: boolean;
}

export interface PaymentFormData {
  amount: number;
  date: string;
  method: 'cash' | 'card' | 'check' | 'transfer';
  note?: string;
}

export interface SettingsFormData {
  companyName: string;
  phone: string;
  address: string;
  taxNumber: string;
  taxPercent: number;
  currency: string;
  logo?: File;
  invoiceFooter?: string;
  primaryColor?: string;
  defaultTheme?: 'light' | 'dark';
}

// Filter Types
export interface UserFilters {
  role?: string;
  search?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  categories?: string[];
  isSpecial?: boolean;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  search?: string;
}

export interface OrderFilters {
  status?: string;
  client?: string;
  commercial?: string;
  startDate?: string;
  endDate?: string;
}

export interface InvoiceFilters {
  isPaid?: boolean;
  client?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogFilters {
  user?: string;
  actionType?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}
