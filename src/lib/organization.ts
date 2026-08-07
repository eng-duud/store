import prisma from "@/lib/prisma";

/**
 * ENTERPRISE ORGANIZATIONAL HIERARCHY ENGINE
 */

export interface DepartmentNode {
  id: string;
  name: string;
  code: string;
  headPositionId: string;
  description: string;
  subDepartments?: DepartmentNode[];
}

export const ENTERPRISE_DEPARTMENTS: DepartmentNode[] = [
  {
    id: "DEP_EXEC",
    name: "الإدارة العليا والتنفيذية (Executive Management)",
    code: "EXEC",
    headPositionId: "GENERAL_MANAGER",
    description: "إدارة الاستراتيجيات والتخطيط الكلي واعتدادات القرارات والسياسات",
  },
  {
    id: "DEP_FIN",
    name: "الشؤون المالية والمحاسبة (Financial Operations)",
    code: "FIN",
    headPositionId: "FINANCE_MANAGER",
    description: "إدارة الحسابات العامة، القيود، المصروفات، المقبوضات والتقارير المالية",
    subDepartments: [
      {
        id: "DEP_ACC",
        name: "قسم المحاسبة العامة (General Accounting)",
        code: "ACC",
        headPositionId: "CHIEF_ACCOUNTANT",
        description: "متابعة القيود والتسويات البنكية وسندات الصرف والقبض",
      },
    ],
  },
  {
    id: "DEP_SALES",
    name: "المبيعات والتسويق (Sales & Marketing)",
    code: "SALES",
    headPositionId: "SALES_MANAGER",
    description: "متابعة طلبات المبيعات، عروض الأسعار، العلاقات مع العملاء والحملات",
  },
  {
    id: "DEP_INV",
    name: "المخازن وإدارة السلسلة (Inventory & Logistics)",
    code: "INV",
    headPositionId: "OPERATIONS_MANAGER",
    description: "الرقابة على المخزون، الشحنات، التوريد، التسويات الجسدية للمستودعات",
  },
  {
    id: "DEP_PROC",
    name: "المشتريات والتوريد (Procurement)",
    code: "PROC",
    headPositionId: "PURCHASE_MANAGER",
    description: "إدارة طلبات الشراء، العلاقات مع الموردين والتفاوض",
  },
  {
    id: "DEP_IT",
    name: "تقنية المعلومات والأمن (IT & Infrastructure)",
    code: "IT",
    headPositionId: "SUPER_ADMIN",
    description: "إدارة النظام الرقمي، الصلاحيات، الأمن والحماية، وسجلات التدقيق",
  },
];

export interface EmployeeReportingChainNode {
  positionId: string;
  positionName: string;
  reportsToPositionId?: string;
}

export const REPORTING_HIERARCHY: EmployeeReportingChainNode[] = [
  { positionId: "SUPER_ADMIN", positionName: "مدير النظام العام" },
  { positionId: "GENERAL_MANAGER", positionName: "المدير العام", reportsToPositionId: "SUPER_ADMIN" },
  { positionId: "FINANCE_MANAGER", positionName: "مدير الشؤون المالية", reportsToPositionId: "GENERAL_MANAGER" },
  { positionId: "CHIEF_ACCOUNTANT", positionName: "رئيس المحاسبين", reportsToPositionId: "FINANCE_MANAGER" },
  { positionId: "OPERATIONS_MANAGER", positionName: "مدير العمليات", reportsToPositionId: "GENERAL_MANAGER" },
  { positionId: "SALES_MANAGER", positionName: "مدير المبيعات", reportsToPositionId: "GENERAL_MANAGER" },
  { positionId: "PURCHASE_MANAGER", positionName: "مدير المشتريات", reportsToPositionId: "GENERAL_MANAGER" },
  { positionId: "STOREKEEPER", positionName: "أمين المخزن", reportsToPositionId: "OPERATIONS_MANAGER" },
  { positionId: "SALES_EMPLOYEE", positionName: "ممثل المبيعات", reportsToPositionId: "SALES_MANAGER" },
];

export function getSuperiorPosition(positionId: string): string | undefined {
  const node = REPORTING_HIERARCHY.find((n) => n.positionId === positionId);
  return node?.reportsToPositionId;
}

/**
 * Get dynamic manager chain from database starting from given position code
 */
export async function getDynamicApprovalChain(startPositionCode: string): Promise<{ positionCode: string; title: string }[]> {
  try {
    const chain: { positionCode: string; title: string }[] = [];
    let currentCode: string | null = startPositionCode;

    while (currentCode) {
      const targetCode: string = currentCode;
      const foundPos: { code: string; title: string; reportsToCode: string | null } | null = await prisma.position.findUnique({
        where: { code: targetCode },
        select: { code: true, title: true, reportsToCode: true },
      });
      if (!foundPos) break;
      chain.push({ positionCode: foundPos.code, title: foundPos.title });
      currentCode = foundPos.reportsToCode;
    }

    return chain;
  } catch {
    const chain: { positionCode: string; title: string }[] = [];
    let curr: string | undefined = startPositionCode;
    while (curr) {
      const node = REPORTING_HIERARCHY.find((n) => n.positionId === curr);
      if (!node) break;
      chain.push({ positionCode: node.positionId, title: node.positionName });
      curr = node.reportsToPositionId;
    }
    return chain;
  }
}

