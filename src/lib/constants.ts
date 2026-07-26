export const SITE_CONFIG = {
  name: "المتجر",
  nameEn: "The Store",
  description: "متجر إلكتروني احترافي",
  descriptionEn: "Professional E-Commerce Store",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "ar",
  locales: ["ar", "en"] as const,
  defaultLocale: "ar" as const,
} as const;

export const API_RESPONSES = {
  SUCCESS: { success: true },
  BAD_REQUEST: { success: false, error: "Bad request" },
  UNAUTHORIZED: { success: false, error: "Unauthorized" },
  FORBIDDEN: { success: false, error: "Forbidden" },
  NOT_FOUND: { success: false, error: "Not found" },
  INTERNAL_ERROR: { success: false, error: "Internal server error" },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export const ORDER_STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: "قيد الانتظار", en: "Pending" },
  CONFIRMED: { ar: "تم التأكيد", en: "Confirmed" },
  PREPARING: { ar: "قيد التجهيز", en: "Preparing" },
  SHIPPED: { ar: "تم الشحن", en: "Shipped" },
  DELIVERED: { ar: "تم التوصيل", en: "Delivered" },
  CANCELLED: { ar: "ملغي", en: "Cancelled" },
  RETURNED: { ar: "مرتجع", en: "Returned" },
};

export const PAYMENT_METHODS = [
  "CASH_ON_DELIVERY",
  "BANK_TRANSFER",
] as const;

export const PAYMENT_METHOD_LABELS: Record<string, { ar: string; en: string }> = {
  CASH_ON_DELIVERY: { ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
  BANK_TRANSFER: { ar: "تحويل بنكي", en: "Bank Transfer" },
};

export const ROLES = {
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
  CUSTOMER: "CUSTOMER",
} as const;

export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export const CATEGORY_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export const INVENTORY_TRANSACTION_TYPES = [
  "PURCHASE",
  "SALE",
  "ADJUSTMENT",
  "RETURN",
  "CANCELLATION",
] as const;

export const CLOUDINARY_FOLDER = "store";

export const CACHE_TAGS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  PRODUCT: "product",
  CATEGORY: "category",
} as const;
