/**
 * ENTERPRISE DOUBLE-ENTRY ACCOUNTING & FINANCIAL ENGINE
 */

export type AccountCategory = "ASSETS" | "LIABILITIES" | "EQUITY" | "REVENUE" | "EXPENSES";

export interface AccountNode {
  code: string;
  name: string;
  category: AccountCategory;
  type: "DEBIT" | "CREDIT"; // Normal Balance
  balance: number;
  description: string;
}

export interface JournalLineItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntryRecord {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  sourceModule: "SALES" | "PURCHASES" | "INVENTORY" | "EXPENSES" | "MANUAL";
  lines: JournalLineItem[];
  totalDebit: number;
  totalCredit: number;
  status: "POSTED" | "DRAFT" | "REVERSED";
  createdByUserName: string;
  createdAt: string;
}

// ─── Chart of Accounts (COA) Single Source of Truth ─────────────────────────
export const CHART_OF_ACCOUNTS: AccountNode[] = [
  // 1000 - ASSETS
  { code: "1010", name: "الصندوق والسيادة النقدية (Cash on Hand)", category: "ASSETS", type: "DEBIT", balance: 45000, description: "النقد الخزينة والمبيعات المباشرة" },
  { code: "1020", name: "حسابات البنوك المصرفية (Bank Accounts)", category: "ASSETS", type: "DEBIT", balance: 125000, description: "الأرصدة المصرفية والتحويلات المباشرة" },
  { code: "1030", name: "الذمم المدينة وحسابات العملاء (Accounts Receivable)", category: "ASSETS", type: "DEBIT", balance: 28400, description: "مستحقات المبيعات لدى العملاء" },
  { code: "1040", name: "قيمة المخزون السلعي (Inventory Asset)", category: "ASSETS", type: "DEBIT", balance: 89000, description: "الأصول المخزنية في المستودعات" },
  
  // 2000 - LIABILITIES
  { code: "2010", name: "الذمم الدائنة وحسابات الموردين (Accounts Payable)", category: "LIABILITIES", type: "CREDIT", balance: 18500, description: "المستحقات المالية للموردين" },
  { code: "2020", name: "ضريبة القيمة المضافة المستحقة (VAT Payable)", category: "LIABILITIES", type: "CREDIT", balance: 6400, description: "التزامات ضريبة القيمة المضافة لهيئة الزكاة والضريبة" },

  // 3000 - EQUITY
  { code: "3010", name: "رأس المال المستثمر (Owner Capital)", category: "EQUITY", type: "CREDIT", balance: 200000, description: "رأس المال الابتدائي للمؤسسة" },
  { code: "3020", name: "الأرباح المدورة (Retained Earnings)", category: "EQUITY", type: "CREDIT", balance: 37500, description: "صافي أرباح الفترات السابقة" },

  // 4000 - REVENUE
  { code: "4010", name: "إيرادات مبيعات المنتجات (Sales Revenue)", category: "REVENUE", type: "CREDIT", balance: 145000, description: "مبيعات البضائع والخدمات" },
  { code: "4020", name: "إيرادات الخدمات والشحن (Shipping Revenue)", category: "REVENUE", type: "CREDIT", balance: 3200, description: "رسوم التوصيل والخدمات اللوجستية" },

  // 5000 - EXPENSES
  { code: "5010", name: "تكلفة البضاعة المباعة (Cost of Goods Sold - COGS)", category: "EXPENSES", type: "DEBIT", balance: 82000, description: "التكلفة التوريدية المباشرة للبضائع" },
  { code: "5020", name: "مصاريف الإيجار والمقرات (Rent Expense)", category: "EXPENSES", type: "DEBIT", balance: 12000, description: "إيجار المستودعات والمكاتب" },
  { code: "5030", name: "الرواتب والأجور (Salaries Expense)", category: "EXPENSES", type: "DEBIT", balance: 24000, description: "مستحقات ورواتب الموظفين" },
  { code: "5040", name: "المصروفات التشغيلية والتسويق (Operating & Marketing)", category: "EXPENSES", type: "DEBIT", balance: 8200, description: "الإعلانات والمرافق وتكاليف التغليف" },
];

const MOCK_JOURNALS: JournalEntryRecord[] = [
  {
    id: "JRN-1",
    entryNumber: "JV-2026-0001",
    date: new Date().toISOString(),
    description: "قيد إثبات مبيعات يومية - طلب رقم ORD-2026-001",
    sourceModule: "SALES",
    status: "POSTED",
    totalDebit: 1500,
    totalCredit: 1500,
    lines: [
      { accountCode: "1010", accountName: "الصندوق والسيادة النقدية", debit: 1500, credit: 0 },
      { accountCode: "4010", accountName: "إيرادات مبيعات المنتجات", debit: 0, credit: 1500 },
    ],
    createdByUserName: "نظام المبيعات التلقائي",
    createdAt: new Date().toISOString(),
  },
];

/**
 * Validate Double Entry Rule: Sum(Debit) === Sum(Credit)
 */
export function validateJournalBalance(lines: JournalLineItem[]): boolean {
  const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  return Math.abs(totalDebit - totalCredit) < 0.001;
}

/**
 * Generate Double Entry Journal Entry
 */
export function postJournalEntry(data: {
  description: string;
  sourceModule: "SALES" | "PURCHASES" | "INVENTORY" | "EXPENSES" | "MANUAL";
  lines: JournalLineItem[];
  reference?: string;
  userName?: string;
}): JournalEntryRecord {
  if (!validateJournalBalance(data.lines)) {
    throw new Error("خطأ محاسبي: القيد غير متوازن، يجب أن يتساوى مجموع الجانب المدين مع الجانب الدائن");
  }

  const totalDebit = data.lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = data.lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  const entryNumber = `JV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  const newJournal: JournalEntryRecord = {
    id: `JRN-${Date.now()}`,
    entryNumber,
    date: new Date().toISOString(),
    description: data.description,
    reference: data.reference,
    sourceModule: data.sourceModule,
    lines: data.lines,
    totalDebit,
    totalCredit,
    status: "POSTED",
    createdByUserName: data.userName || "النظام المحاسبي التلقائي",
    createdAt: new Date().toISOString(),
  };

  MOCK_JOURNALS.unshift(newJournal);

  // Update Account Balances
  data.lines.forEach((line) => {
    const acc = CHART_OF_ACCOUNTS.find((a) => a.code === line.accountCode);
    if (acc) {
      if (acc.type === "DEBIT") {
        acc.balance += line.debit - line.credit;
      } else {
        acc.balance += line.credit - line.debit;
      }
    }
  });

  return newJournal;
}

/**
 * Calculate IFRS Compliant Financial Statements (Trial Balance, Income Statement, Balance Sheet)
 */
export function generateFinancialStatements() {
  const totalAssets = CHART_OF_ACCOUNTS.filter((a) => a.category === "ASSETS").reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = CHART_OF_ACCOUNTS.filter((a) => a.category === "LIABILITIES").reduce((s, a) => s + a.balance, 0);
  const totalEquity = CHART_OF_ACCOUNTS.filter((a) => a.category === "EQUITY").reduce((s, a) => s + a.balance, 0);

  const totalRevenue = CHART_OF_ACCOUNTS.filter((a) => a.category === "REVENUE").reduce((s, a) => s + a.balance, 0);
  const totalExpenses = CHART_OF_ACCOUNTS.filter((a) => a.category === "EXPENSES").reduce((s, a) => s + a.balance, 0);

  const cogs = CHART_OF_ACCOUNTS.find((a) => a.code === "5010")?.balance || 0;
  const grossProfit = totalRevenue - cogs;
  const netProfit = totalRevenue - totalExpenses;

  const trialBalanceDebits = CHART_OF_ACCOUNTS.filter((a) => a.type === "DEBIT").reduce((s, a) => s + a.balance, 0);
  const trialBalanceCredits = CHART_OF_ACCOUNTS.filter((a) => a.type === "CREDIT").reduce((s, a) => s + a.balance, 0);

  return {
    chartOfAccounts: CHART_OF_ACCOUNTS,
    journals: MOCK_JOURNALS,
    trialBalance: {
      totalDebits: trialBalanceDebits,
      totalCredits: trialBalanceCredits,
      isBalanced: Math.abs(trialBalanceDebits - trialBalanceCredits) < 1,
    },
    incomeStatement: {
      totalRevenue,
      cogs,
      grossProfit,
      totalExpenses,
      netProfit,
      grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    },
    balanceSheet: {
      totalAssets,
      totalLiabilities,
      totalEquity: totalEquity + netProfit,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity + netProfit)) < 1,
    },
  };
}
