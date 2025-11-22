import { Document, Types } from 'mongoose';

// ============================================================================
// USER TYPES
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',
  COMMERCIAL = 'commercial',
  STORE = 'store',
  CLIENT = 'client',
  CASHIER = 'cashier'
}

export interface IUserName {
  first: string;
  last?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: IUserName;
  email: string;
  passwordHash: string;
  role: UserRole;
  assignedCommercial?: Types.ObjectId;
  storeId?: Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface ILocalizedString {
  ar: string;
  en?: string;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: ILocalizedString;
  slug: string;
  parentId?: Types.ObjectId;
  icon?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SUBPRODUCT (COMPONENT) TYPES
// ============================================================================

export interface IImage {
  path: string;
  thumbPath: string;
  width?: number;
  height?: number;
  alt?: ILocalizedString;
}

export interface ISubProduct extends Document {
  _id: Types.ObjectId;
  title: ILocalizedString;
  sku?: string;
  images: IImage[];
  extraPrice?: number;
  stock: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface IProductVariant {
  color: ILocalizedString;
  sku: string;
  image?: string;
  stock: number;
}

export interface IBulkPrice {
  minQty: number;
  price: number;
}

export interface IProductPrice {
  retail: number;
  bulkPrices?: IBulkPrice[];
}

export interface IComponentGroup {
  componentKey: string; // e.g., "legs", "top", "handles"
  label: ILocalizedString;
  subProductIds: Types.ObjectId[];
  required: boolean;
}

export interface ICombinationImage {
  mapping: Record<string, string>; // { componentKey: subProductId }
  imagePath: string;
}

export enum CompositeMode {
  AUTO = 'auto',
  MANUAL = 'manual',
  BOTH = 'both'
}

export interface ISpecialConfig {
  components: IComponentGroup[];
  combinationImages?: ICombinationImage[];
  compositeMode: CompositeMode;
}

export enum StockPolicy {
  BY_PRODUCT = 'byProduct',
  BY_VARIANT = 'byVariant',
  BY_COMPONENT = 'byComponent'
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: ILocalizedString;
  description: ILocalizedString;
  sku: string;
  images: IImage[];
  variants?: IProductVariant[];
  price: IProductPrice;
  cost?: number;
  categories: Types.ObjectId[];
  isSpecial: boolean;
  specialConfig?: ISpecialConfig;
  stockPolicy: StockPolicy;
  stock?: number; // Used when stockPolicy is byProduct
  isActive: boolean;
  isFeatured?: boolean;
  meta?: {
    title?: ILocalizedString;
    description?: ILocalizedString;
    keywords?: ILocalizedString;
  };
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface IOrderLine {
  productId: Types.ObjectId;
  productTitle: ILocalizedString;
  variantId?: string;
  componentSelections?: Record<string, Types.ObjectId>; // For special products
  unitPrice: number;
  qty: number;
  lineTotal: number;
  costPerUnit?: number;
}

export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  READY = 'ready',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum OrderSource {
  CATALOG = 'catalog',
  POS = 'pos',
  ADMIN = 'admin'
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  clientId?: Types.ObjectId;
  commercialId?: Types.ObjectId;
  source: OrderSource;
  lines: IOrderLine[];
  subtotal: number;
  remise: number; // discount
  tax: number;
  total: number;
  costTotal?: number;
  netIncome?: number;
  status: OrderStatus;
  invoiceId?: Types.ObjectId;
  shippingDate?: Date;
  productionSheetPath?: string;
  notes?: string;
  statusHistory?: Array<{
    status: OrderStatus;
    changedBy: Types.ObjectId;
    changedAt: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export interface IPayment {
  date: Date;
  amount: number;
  method: string; // 'cash', 'card', 'check', 'transfer'
  note?: string;
  recordedBy?: Types.ObjectId;
}

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string;
  orderId: Types.ObjectId;
  clientId?: Types.ObjectId;
  commercialId?: Types.ObjectId;
  amountDue: number;
  amountPaid: number;
  isPaid: boolean;
  dueDate?: Date;
  payments: IPayment[];
  pdfPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  STATUS_CHANGE = 'status_change',
  PAYMENT = 'payment',
  STOCK_ADJUSTMENT = 'stock_adjustment'
}

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  actionType: AuditAction;
  resourceType: string; // 'user', 'product', 'order', 'invoice', etc.
  resourceId?: Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface ISettings extends Document {
  _id: Types.ObjectId;
  companyName: ILocalizedString;
  logoPath?: string;
  address?: ILocalizedString;
  phone?: string;
  email?: string;
  taxNumber?: string;
  taxPercent: number;
  currency: string;
  invoiceFooter?: ILocalizedString;
  defaultLanguage: string;
  theme?: {
    primaryColor?: string;
    mode?: 'light' | 'dark';
  };
  updatedAt: Date;
}

// ============================================================================
// INVENTORY LOG TYPES
// ============================================================================

export interface IInventoryLog extends Document {
  _id: Types.ObjectId;
  productId?: Types.ObjectId;
  subProductId?: Types.ObjectId;
  variantId?: string;
  adjustmentType: 'manual' | 'sale' | 'return' | 'production';
  quantity: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy?: Types.ObjectId;
  orderId?: Types.ObjectId;
  createdAt: Date;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    _id: string;
    name: IUserName;
    email: string;
    role: UserRole;
  };
}
