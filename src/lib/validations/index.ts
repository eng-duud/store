import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
});

export const addressSchema = z.object({
  label: z.string().min(1, "اسم العنوان مطلوب"),
  street: z.string().min(3, "الشارع مطلوب"),
  city: z.string().min(2, "المدينة مطلوبة"),
  state: z.string().min(2, "المنطقة مطلوبة"),
  zipCode: z.string().min(3, "الرمز البريدي مطلوب"),
  country: z.string().min(2, "الدولة مطلوبة"),
  isDefault: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(255).optional(),
  sku: z.string().min(1, "رمز المنتج مطلوب"),
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  salePrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0, "الكمية لا يمكن أن تكون سالبة"),
  lowStockThreshold: z.number().int().min(0).default(10),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  brandId: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).min(1, "اختر فئة واحدة على الأقل"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "اسم الفئة مطلوب"),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  sortOrder: z.number().int().min(0).default(0),
});

export const expenseSchema = z.object({
  expenseCategoryId: z.string().min(1, "اختر الفئة"),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().min(1, "الوصف مطلوب"),
  date: z.string().optional(),
});

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "اسم الفئة مطلوب"),
  description: z.string().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
  ]),
  note: z.string().optional(),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "اختر عنوان التوصيل"),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER"]),
  notes: z.string().optional(),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(12),
  sort: z
    .enum(["price_asc", "price_desc", "newest", "name_asc"])
    .optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  category: z.string().optional(),
});
