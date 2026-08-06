import prisma from "@/lib/prisma";
import { getDateRangeBounds, DateRangePreset } from "./reports.service";

export const DEFAULT_EXPENSE_CATEGORIES = [
  "الإيجار (Rent)",
  "الرواتب والأجور (Salaries)",
  "التسويق والإعلانات (Marketing)",
  "المرافق والكهرباء (Utilities)",
  "الصيانة والدعم (Maintenance)",
  "الشحن والنقل (Transportation)",
  "التغليف والمستلزمات (Packaging)",
  "الانترنت والاتصالات (Internet)",
  "مصاريف متنوعة (Miscellaneous)",
];

export async function ensureDefaultExpenseCategories() {
  const count = await prisma.expenseCategory.count();
  if (count === 0) {
    await prisma.expenseCategory.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
        name,
        description: "تصنيف مصاريف افتراضي للمتجر",
      })),
    });
  }
}

export async function getFinancialSummary(preset: DateRangePreset = "month") {
  const { start, end } = getDateRangeBounds(preset);

  const [revenueAggregate, expensesAggregate, expensesList, ordersList, orderItemsList] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ["CANCELLED", "RETURNED"] },
      },
      _sum: { total: true },
    }),
    prisma.expense.aggregate({
      where: {
        date: { gte: start, lte: end },
        deletedAt: null,
      },
      _sum: { amount: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end }, deletedAt: null },
      include: { expenseCategory: true },
      orderBy: { date: "asc" },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ["CANCELLED", "RETURNED"] },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          status: { notIn: ["CANCELLED", "RETURNED"] },
        },
      },
      include: {
        product: { select: { costPrice: true, price: true } },
      },
    }),
  ]);

  const totalRevenue = Number(revenueAggregate._sum.total || 0);
  const totalExpenses = Number(expensesAggregate._sum.amount || 0);

  const cogs = orderItemsList.reduce((sum, item) => {
    const cost = Number(item.product?.costPrice || Number(item.price) * 0.7);
    return sum + cost * item.quantity;
  }, 0);

  const grossProfit = totalRevenue - cogs;
  const netProfit = grossProfit - totalExpenses;
  const profitMarginPercentage = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Financial Trend by date
  const trendMap: Record<string, { revenue: number; expense: number }> = {};

  ordersList.forEach((o) => {
    const d = new Date(o.createdAt).toISOString().split("T")[0];
    if (!trendMap[d]) trendMap[d] = { revenue: 0, expense: 0 };
    trendMap[d].revenue += Number(o.total);
  });

  expensesList.forEach((e) => {
    const d = new Date(e.date).toISOString().split("T")[0];
    if (!trendMap[d]) trendMap[d] = { revenue: 0, expense: 0 };
    trendMap[d].expense += Number(e.amount);
  });

  const financialTrend = Object.entries(trendMap).map(([date, val]) => ({
    date,
    revenue: val.revenue,
    expense: val.expense,
    net: val.revenue - val.expense,
  }));

  // Expenses by Category breakdown
  const categoryExpensesMap: Record<string, number> = {};
  expensesList.forEach((e) => {
    const catName = e.expenseCategory.name;
    categoryExpensesMap[catName] = (categoryExpensesMap[catName] || 0) + Number(e.amount);
  });

  const expensesByCategory = Object.entries(categoryExpensesMap).map(([category, amount]) => ({
    category,
    amount,
  }));

  return {
    totalRevenue,
    cogs,
    grossProfit,
    totalExpenses,
    netProfit,
    profitMarginPercentage,
    cashIn: totalRevenue,
    cashOut: totalExpenses,
    netCashPosition: netProfit,
    financialTrend,
    expensesByCategory,
  };
}

export async function getExpenseCategories() {
  await ensureDefaultExpenseCategories();
  return prisma.expenseCategory.findMany({
    include: { _count: { select: { expenses: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getExpenses(filters?: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;

  const where: any = { deletedAt: null };
  if (filters?.categoryId) where.expenseCategoryId = filters.categoryId;
  if (filters?.search) {
    where.description = { contains: filters.search, mode: "insensitive" };
  }

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { expenseCategory: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export interface CreateExpenseInput {
  expenseCategoryId: string;
  amount: number;
  description: string;
  date?: string;
  receiptUrl?: string;
}

export async function createExpense(data: CreateExpenseInput) {
  return prisma.expense.create({
    data: {
      expenseCategoryId: data.expenseCategoryId,
      amount: data.amount,
      description: data.description,
      date: data.date ? new Date(data.date) : new Date(),
      receiptUrl: data.receiptUrl || null,
    },
    include: { expenseCategory: true },
  });
}

export async function updateExpense(id: string, data: Partial<CreateExpenseInput>) {
  return prisma.expense.update({
    where: { id },
    data: {
      expenseCategoryId: data.expenseCategoryId,
      amount: data.amount !== undefined ? Number(data.amount) : undefined,
      description: data.description,
      date: data.date ? new Date(data.date) : undefined,
      receiptUrl: data.receiptUrl,
    },
    include: { expenseCategory: true },
  });
}

export async function deleteExpense(id: string) {
  return prisma.expense.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function createExpenseCategory(data: { name: string; description?: string }) {
  return prisma.expenseCategory.create({
    data: { name: data.name, description: data.description || null },
  });
}

export async function updateExpenseCategory(id: string, data: { name: string; description?: string }) {
  return prisma.expenseCategory.update({
    where: { id },
    data: { name: data.name, description: data.description || null },
  });
}

export async function deleteExpenseCategory(id: string) {
  const expenseCount = await prisma.expense.count({ where: { expenseCategoryId: id } });
  if (expenseCount > 0) {
    throw new Error("لا يمكن حذف تصنيف يحتوي على مصروفات مسجلة");
  }
  return prisma.expenseCategory.delete({ where: { id } });
}
