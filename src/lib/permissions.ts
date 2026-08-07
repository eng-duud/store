/**
 * ENTERPRISE RBAC & PERMISSION MATRIX SYSTEM
 */

export type PermissionModule =
  | "PRODUCTS"
  | "CATEGORIES"
  | "ORDERS"
  | "CUSTOMERS"
  | "SUPPLIERS"
  | "INVENTORY"
  | "PURCHASES"
  | "ACCOUNTING"
  | "EXPENSES"
  | "REPORTS"
  | "SETTINGS"
  | "USERS"
  | "ROLES"
  | "APPROVALS"
  | "MEDIA"
  | "AUDIT";

export type PermissionAction =
  | "VIEW"
  | "CREATE"
  | "EDIT"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "EXPORT"
  | "PRINT"
  | "VIEW_COST"
  | "EDIT_COST"
  | "VIEW_PROFIT"
  | "MANAGE";

export interface Permission {
  module: PermissionModule;
  action: PermissionAction;
}

export interface EnterpriseRoleDefinition {
  id: string;
  name: string;
  department: string;
  description: string;
  permissions: Permission[];
}

export const ENTERPRISE_POSITIONS: EnterpriseRoleDefinition[] = [
  {
    id: "SUPER_ADMIN",
    name: "مدير النظام العام (Super Administrator)",
    department: "IT & Executive",
    description: "صلاحيات كاملة وغير محدودة على كل مستويات وإعدادات النظام",
    permissions: [
      { module: "PRODUCTS", action: "MANAGE" },
      { module: "CATEGORIES", action: "MANAGE" },
      { module: "ORDERS", action: "MANAGE" },
      { module: "CUSTOMERS", action: "MANAGE" },
      { module: "SUPPLIERS", action: "MANAGE" },
      { module: "INVENTORY", action: "MANAGE" },
      { module: "PURCHASES", action: "MANAGE" },
      { module: "ACCOUNTING", action: "MANAGE" },
      { module: "EXPENSES", action: "MANAGE" },
      { module: "REPORTS", action: "MANAGE" },
      { module: "SETTINGS", action: "MANAGE" },
      { module: "USERS", action: "MANAGE" },
      { module: "ROLES", action: "MANAGE" },
      { module: "APPROVALS", action: "MANAGE" },
      { module: "AUDIT", action: "MANAGE" },
    ],
  },
  {
    id: "GENERAL_MANAGER",
    name: "المدير العام (General Manager)",
    department: "Executive Management",
    description: "إشراف شامل واعتماد كافة عمليات الشراء والمصروفات والتقارير الاستراتيجية",
    permissions: [
      { module: "PRODUCTS", action: "VIEW" },
      { module: "ORDERS", action: "VIEW" },
      { module: "ACCOUNTING", action: "VIEW" },
      { module: "EXPENSES", action: "APPROVE" },
      { module: "PURCHASES", action: "APPROVE" },
      { module: "APPROVALS", action: "APPROVE" },
      { module: "REPORTS", action: "VIEW_PROFIT" },
      { module: "REPORTS", action: "EXPORT" },
      { module: "AUDIT", action: "VIEW" },
    ],
  },
  {
    id: "FINANCE_MANAGER",
    name: "مدير الشؤون المالية (Finance Manager)",
    department: "Financial Operations",
    description: "إدارة الحسابات العامة والمصروفات والتسويات واعتدادات الشراء",
    permissions: [
      { module: "ACCOUNTING", action: "MANAGE" },
      { module: "EXPENSES", action: "MANAGE" },
      { module: "ORDERS", action: "VIEW_PROFIT" },
      { module: "PRODUCTS", action: "VIEW_COST" },
      { module: "PURCHASES", action: "APPROVE" },
      { module: "APPROVALS", action: "APPROVE" },
      { module: "REPORTS", action: "VIEW_PROFIT" },
      { module: "REPORTS", action: "EXPORT" },
    ],
  },
  {
    id: "CHIEF_ACCOUNTANT",
    name: "رئيس المحاسبين (Chief Accountant)",
    department: "Financial Operations",
    description: "إدخال القيود المحاسبية، فواتير الشراء والمبيعات وسندات الصرف والقبض",
    permissions: [
      { module: "ACCOUNTING", action: "EDIT" },
      { module: "EXPENSES", action: "CREATE" },
      { module: "EXPENSES", action: "EDIT" },
      { module: "ORDERS", action: "VIEW" },
      { module: "PURCHASES", action: "VIEW" },
      { module: "REPORTS", action: "VIEW" },
      { module: "REPORTS", action: "PRINT" },
    ],
  },
  {
    id: "OPERATIONS_MANAGER",
    name: "مدير العمليات والمخازن (Operations Manager)",
    department: "Inventory & Warehouse",
    description: "إدارة حركة المنتجات والمخزون والطلبات والتسويات المخزنية",
    permissions: [
      { module: "PRODUCTS", action: "MANAGE" },
      { module: "CATEGORIES", action: "MANAGE" },
      { module: "INVENTORY", action: "MANAGE" },
      { module: "ORDERS", action: "MANAGE" },
      { module: "APPROVALS", action: "APPROVE" },
      { module: "REPORTS", action: "VIEW" },
    ],
  },
  {
    id: "SALES_MANAGER",
    name: "مدير المبيعات (Sales Manager)",
    department: "Sales & Marketing",
    description: "إدارة العملاء وطلبات المبيعات وعروض الأسعار واعتدادات الخصومات",
    permissions: [
      { module: "ORDERS", action: "MANAGE" },
      { module: "CUSTOMERS", action: "MANAGE" },
      { module: "PRODUCTS", action: "VIEW" },
      { module: "APPROVALS", action: "APPROVE" },
      { module: "REPORTS", action: "VIEW" },
    ],
  },
  {
    id: "STOREKEEPER",
    name: "أمين المخزن (Storekeeper)",
    department: "Inventory & Warehouse",
    description: "فحص وتحديث كميات المخزون وتجهيز الشحنات",
    permissions: [
      { module: "INVENTORY", action: "VIEW" },
      { module: "INVENTORY", action: "EDIT" },
      { module: "PRODUCTS", action: "VIEW" },
      { module: "ORDERS", action: "VIEW" },
      { module: "ORDERS", action: "EDIT text" as any },
    ],
  },
  {
    id: "SALES_EMPLOYEE",
    name: "مبتع المبيعات (Sales Employee)",
    department: "Sales & Marketing",
    description: "إنشاء الطلبات، تصفح المنتجات والعملاء",
    permissions: [
      { module: "ORDERS", action: "CREATE" },
      { module: "ORDERS", action: "VIEW" },
      { module: "CUSTOMERS", action: "VIEW" },
      { module: "CUSTOMERS", action: "CREATE" },
      { module: "PRODUCTS", action: "VIEW" },
    ],
  },
];

/**
 * Check whether a user with assigned permissions or role has access to perform an action on a module
 */
export function hasPermission(
  userPermissions: Permission[] | string,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  if (typeof userPermissions === "string") {
    if (userPermissions === "ADMIN" || userPermissions === "SUPER_ADMIN") return true;
    const roleDef = ENTERPRISE_POSITIONS.find((p) => p.id === userPermissions);
    if (!roleDef) return false;
    userPermissions = roleDef.permissions;
  }

  if (!Array.isArray(userPermissions)) return false;

  return userPermissions.some(
    (p) =>
      p.module === module &&
      (p.action === action || p.action === "MANAGE" || action === "VIEW")
  );
}
