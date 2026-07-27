import { prisma } from "@/lib/prisma";

export interface StoreSettingsData {
  // General
  name: string;
  nameEn: string;
  subtitle: string;
  description: string;
  slogan: string;
  about: string;

  // Branding
  logoUrl: string;
  darkLogoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;

  // Contact
  phone: string;
  whatsapp: string;
  email: string;
  secondaryEmail: string;
  address: string;
  googleMapsUrl: string;
  businessHours: string;

  // Social
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  telegram: string;
  snapchat: string;

  // Business
  currency: string;
  currencySymbol: string;
  currencyPosition: "left" | "right";
  taxPercentage: string;
  taxNumber: string;
  commercialRegister: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;

  // Commercial / Legal / Print
  footerText: string;
  copyright: string;
  invoiceInformation: string;
  receiptInformation: string;
  companyInformation: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;

  // Theme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: string;
  defaultTheme: "light" | "dark" | "system";
}

export const DEFAULT_STORE_SETTINGS: StoreSettingsData = {
  // General
  name: "المتجر الإلكتروني",
  nameEn: "The E-Commerce Store",
  subtitle: "وجهتك الأولى للتسوق الرقمي الفاخر",
  description: "متجر إلكتروني متكامل يضم أرقى المنتجات مع ضمان الجودة والتوصيل السريع لجميع المناطق.",
  slogan: "تسوق بكل ثقة وسهولة",
  about: "متجرنا يوفر لك أفضل تجربة تسوق إلكتروني مع خدمة عملاء على مدار الساعة وخيارات دفع متعددة وأمنة.",

  // Branding
  logoUrl: "",
  darkLogoUrl: "",
  footerLogoUrl: "",
  faviconUrl: "/favicon.ico",

  // Contact
  phone: "+966 50 000 0000",
  whatsapp: "+966 50 000 0000",
  email: "info@store.com",
  secondaryEmail: "support@store.com",
  address: "الرياض، المملكة العربية السعودية",
  googleMapsUrl: "",
  businessHours: "الأحد - الخميس: 9:00 ص - 10:00 م | الجمعة - السبت: 4:00 م - 11:00 م",

  // Social
  facebook: "",
  instagram: "",
  twitter: "",
  tiktok: "",
  youtube: "",
  linkedin: "",
  telegram: "",
  snapchat: "",

  // Business
  currency: "SAR",
  currencySymbol: "ر.س",
  currencyPosition: "right",
  taxPercentage: "15",
  taxNumber: "300000000000003",
  commercialRegister: "1010000000",
  defaultLanguage: "ar",
  timezone: "Asia/Riyadh",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "12h",

  // Commercial / Legal / Print
  footerText: "جميع الحقوق محفوظة للمتجر الإلكتروني. نمتلك أفضل التشكيلات بضمان الجودة.",
  copyright: "© 2026 جميع الحقوق محفوظة",
  invoiceInformation: "الرقم الضريبي: 300000000000003 | السجل التجاري: 1010000000",
  receiptInformation: "شكراً لتسوقكم معنا. في حال وجود استفسار يرجى التواصل مع الدعم الفني.",
  companyInformation: "شركة التجارة الإلكترونية المحدودة - الرياض، المملكة العربية السعودية",

  // SEO
  metaTitle: "المتجر الإلكتروني - تجربة تسوق مميزة",
  metaDescription: "تصفح أحدث التشكيلات والمنتجات الفاخرة بأسعار تنافسية وشحن سريع لجميع المدن.",
  keywords: "تسوق, متجر, ملابس, إلكترونيات, عروض, تجارة إلكترونية",
  ogImageUrl: "",

  // Theme
  primaryColor: "#2563eb",
  secondaryColor: "#475569",
  accentColor: "#f59e0b",
  borderRadius: "0.75rem",
  defaultTheme: "system",
};

export function formatCurrency(amount: number | string, settings?: Partial<StoreSettingsData>): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const symbol = settings?.currencySymbol || DEFAULT_STORE_SETTINGS.currencySymbol;
  const position = settings?.currencyPosition || DEFAULT_STORE_SETTINGS.currencyPosition;
  const formatted = num.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return position === "left" ? `${symbol} ${formatted}` : `${formatted} ${symbol}`;
}

export async function getStoreSettings(): Promise<StoreSettingsData> {
  try {
    const rows = await prisma.storeSetting.findMany();
    if (!rows || rows.length === 0) {
      return DEFAULT_STORE_SETTINGS;
    }

    const settingsMap: Record<string, string> = {};
    rows.forEach((row) => {
      settingsMap[row.key] = row.value;
    });

    return {
      ...DEFAULT_STORE_SETTINGS,
      ...settingsMap,
    };
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function updateStoreSettings(
  data: Partial<StoreSettingsData>
): Promise<StoreSettingsData> {
  const entries = Object.entries(data);

  const groupMap: Record<string, string> = {
    name: "general",
    nameEn: "general",
    subtitle: "general",
    description: "general",
    slogan: "general",
    about: "general",
    logoUrl: "branding",
    darkLogoUrl: "branding",
    footerLogoUrl: "branding",
    faviconUrl: "branding",
    phone: "contact",
    whatsapp: "contact",
    email: "contact",
    secondaryEmail: "contact",
    address: "contact",
    googleMapsUrl: "contact",
    businessHours: "contact",
    facebook: "social",
    instagram: "social",
    twitter: "social",
    tiktok: "social",
    youtube: "social",
    linkedin: "social",
    telegram: "social",
    snapchat: "social",
    currency: "business",
    currencySymbol: "business",
    currencyPosition: "business",
    taxPercentage: "business",
    taxNumber: "business",
    commercialRegister: "business",
    defaultLanguage: "business",
    timezone: "business",
    dateFormat: "business",
    timeFormat: "business",
    footerText: "legal",
    copyright: "legal",
    invoiceInformation: "legal",
    receiptInformation: "legal",
    companyInformation: "legal",
    metaTitle: "seo",
    metaDescription: "seo",
    keywords: "seo",
    ogImageUrl: "seo",
    primaryColor: "theme",
    secondaryColor: "theme",
    accentColor: "theme",
    borderRadius: "theme",
    defaultTheme: "theme",
  };

  const upsertPromises = entries.map(([key, value]) => {
    const strValue = value !== undefined && value !== null ? String(value) : "";
    const group = groupMap[key] || "general";

    return prisma.storeSetting.upsert({
      where: { key },
      update: { value: strValue, group },
      create: { key, value: strValue, group },
    });
  });

  await Promise.all(upsertPromises);

  return getStoreSettings();
}
