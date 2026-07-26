import prisma from "@/lib/prisma";
import { createAuditLog } from "./audit.service";
import { getStoreSettings, formatCurrency } from "./settings.service";

export interface RecycleBinItem {
  id: string;
  type: "PRODUCT" | "CATEGORY" | "EXPENSE";
  title: string;
  subtitle?: string;
  deletedAt: Date;
}

export async function getRecycleBinItems(): Promise<RecycleBinItem[]> {
  const settings = await getStoreSettings();
  const [products, categories, expenses] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, name: true, sku: true, deletedAt: true },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.category.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, name: true, slug: true, deletedAt: true },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.expense.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, description: true, amount: true, deletedAt: true },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  const items: RecycleBinItem[] = [];

  products.forEach((p) => {
    if (p.deletedAt) {
      items.push({
        id: p.id,
        type: "PRODUCT",
        title: p.name,
        subtitle: `رمز: ${p.sku}`,
        deletedAt: p.deletedAt,
      });
    }
  });

  categories.forEach((c) => {
    if (c.deletedAt) {
      items.push({
        id: c.id,
        type: "CATEGORY",
        title: c.name,
        subtitle: `مسار: ${c.slug}`,
        deletedAt: c.deletedAt,
      });
    }
  });

  expenses.forEach((e) => {
    if (e.deletedAt) {
      items.push({
        id: e.id,
        type: "EXPENSE",
        title: e.description,
        subtitle: `مبلغ: ${formatCurrency(Number(e.amount), settings)}`,
        deletedAt: e.deletedAt,
      });
    }
  });

  items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  return items;
}

export async function restoreRecycleBinItem(type: "PRODUCT" | "CATEGORY" | "EXPENSE", id: string, userId?: string, userName?: string) {
  if (type === "PRODUCT") {
    await prisma.product.update({ where: { id }, data: { deletedAt: null } });
  } else if (type === "CATEGORY") {
    await prisma.category.update({ where: { id }, data: { deletedAt: null } });
  } else if (type === "EXPENSE") {
    await prisma.expense.update({ where: { id }, data: { deletedAt: null } });
  }

  await createAuditLog({
    action: `استعادة عنصر من سلة المحذوفات (${type})`,
    module: type === "PRODUCT" ? "PRODUCTS" : type === "CATEGORY" ? "CATEGORIES" : "ACCOUNTING",
    entity: type,
    entityId: id,
    userId,
    userName,
    notes: `تمت استعادة عنصر من سلة المحذوفات بنجاح`,
  });
}

export async function permanentlyDeleteRecycleBinItem(type: "PRODUCT" | "CATEGORY" | "EXPENSE", id: string, userId?: string, userName?: string) {
  if (type === "PRODUCT") {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productCategory.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  } else if (type === "CATEGORY") {
    await prisma.category.delete({ where: { id } });
  } else if (type === "EXPENSE") {
    await prisma.expense.delete({ where: { id } });
  }

  await createAuditLog({
    action: `حذف نهائي من سلة المحذوفات (${type})`,
    module: type === "PRODUCT" ? "PRODUCTS" : type === "CATEGORY" ? "CATEGORIES" : "ACCOUNTING",
    entity: type,
    entityId: id,
    userId,
    userName,
    notes: `تم حذف عنصر بشكل نهائي من قاعدة البيانات`,
  });
}
