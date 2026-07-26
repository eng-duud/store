import prisma from "@/lib/prisma";
import { getStoreSettings, formatCurrency } from "./settings.service";

export interface GlobalSearchResultItem {
  id: string;
  category: "PRODUCTS" | "CATEGORIES" | "ORDERS" | "CUSTOMERS" | "INVENTORY" | "EXPENSES" | "AUDIT";
  title: string;
  subtitle?: string;
  link: string;
}

export async function globalSearch(query: string): Promise<GlobalSearchResultItem[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const settings = await getStoreSettings();
  const fmt = (n: number) => formatCurrency(n, settings);

  const [products, categories, orders, customers, expenses, auditLogs] = await Promise.all([
    prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, sku: true, price: true },
      take: 5,
    }),
    prisma.category.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, slug: true },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { user: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: { id: true, orderNumber: true, total: true, status: true },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 5,
    }),
    prisma.expense.findMany({
      where: {
        deletedAt: null,
        description: { contains: q, mode: "insensitive" },
      },
      select: { id: true, description: true, amount: true },
      take: 5,
    }),
    prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: q, mode: "insensitive" } },
          { notes: { contains: q, mode: "insensitive" } },
          { userName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, action: true, userName: true, createdAt: true },
      take: 5,
    }),
  ]);

  const results: GlobalSearchResultItem[] = [];

  products.forEach((p) => {
    results.push({
      id: p.id,
      category: "PRODUCTS",
      title: p.name,
      subtitle: `رمز: ${p.sku} | السعر: ${fmt(Number(p.price))}`,
      link: `/admin/products?q=${encodeURIComponent(p.sku)}`,
    });
  });

  categories.forEach((c) => {
    results.push({
      id: c.id,
      category: "CATEGORIES",
      title: c.name,
      subtitle: `مسار: ${c.slug}`,
      link: `/admin/categories`,
    });
  });

  orders.forEach((o) => {
    results.push({
      id: o.id,
      category: "ORDERS",
      title: `طلب #${o.orderNumber}`,
      subtitle: `حالة: ${o.status} | إجمالي: ${fmt(Number(o.total))}`,
      link: `/admin/orders?q=${encodeURIComponent(o.orderNumber)}`,
    });
  });

  customers.forEach((c) => {
    results.push({
      id: c.id,
      category: "CUSTOMERS",
      title: c.name,
      subtitle: c.email,
      link: `/admin/customers?q=${encodeURIComponent(c.email)}`,
    });
  });

  expenses.forEach((e) => {
    results.push({
      id: e.id,
      category: "EXPENSES",
      title: e.description,
      subtitle: `مصروف بمبلغ: ${fmt(Number(e.amount))}`,
      link: `/admin/accounting`,
    });
  });

  auditLogs.forEach((a) => {
    results.push({
      id: a.id,
      category: "AUDIT",
      title: a.action,
      subtitle: `منفذ: ${a.userName || "النظام"} | ${new Date(a.createdAt).toLocaleDateString("ar-SA")}`,
      link: `/admin/audit-logs`,
    });
  });

  return results;
}
