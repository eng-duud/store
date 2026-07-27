export type Locale = "ar" | "en";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MediaAsset {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  folder: string;
  entityType: string;
  entityId: string | null;
  altText: string | null;
  fileName: string | null;
  mimeType: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  version: number | null;
  isPrimary: boolean;
  sortOrder: number;
  tags: string | null;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isFeatured: boolean;
  brandId: string | null;
  brand?: Brand;
  images: ProductImage[];
  categories: ProductCategory[];
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  publicId: string | null;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  stockQuantity: number;
  attributes: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageId: string | null;
  imageUrl?: string | null;
  imageMediaId: string | null;
  parentId: string | null;
  parent?: Category;
  children?: Category[];
  status: CategoryStatus;
  sortOrder: number;
  _count?: { products: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  productId: string;
  categoryId: string;
  category: Category;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoId: string | null;
  logoMediaId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  emailVerified: Date | null;
  image: string | null;
  avatarMediaId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: AddressSnapshot;
  billingAddress: AddressSnapshot | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes: string | null;
  items: OrderItem[];
  timeline: OrderTimeline[];
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  quantity: number;
  product?: Product;
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
}

export interface AddressSnapshot {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Expense {
  id: string;
  expenseCategoryId: string;
  amount: number;
  description: string;
  date: Date;
  receiptUrl: string | null;
  expenseCategory?: ExpenseCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  _count?: { expenses: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference: string | null;
  orderId: string | null;
  expenseId: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
  revenueChartData: { month: string; revenue: number }[];
  ordersChartData: { month: string; orders: number }[];
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type CategoryStatus = "ACTIVE" | "INACTIVE";
export type UserRole = "ADMIN" | "EMPLOYEE" | "CUSTOMER";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";
export type PaymentMethod = "CASH_ON_DELIVERY" | "BANK_TRANSFER";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type TransactionType = "INCOME" | "EXPENSE";

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "name_asc";
  page?: number;
  limit?: number;
}
