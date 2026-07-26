"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

interface CategoryOption {
  id: string;
  name: string;
}

interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured: boolean;
  description: string | null;
  shortDescription: string | null;
  createdAt: string;
  images: { id: string; url: string }[];
  categories: { category: { id: string; name: string } }[];
  brand: { name: string } | null;
  _count: { orderItems: number };
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  ACTIVE: "نشط",
  ARCHIVED: "مؤرشف",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { formatCurrency, settings } = useSettings();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    salePrice: "",
    stockQuantity: "10",
    status: "ACTIVE" as "DRAFT" | "ACTIVE" | "ARCHIVED",
    isFeatured: false,
    description: "",
    shortDescription: "",
    categoryIds: [] as string[],
    imageUrl: "",
  });

  function fetchProducts(q?: string, status?: string) {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);

    fetch(`/api/admin/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProducts(d.data.items);
          setTotal(d.data.total);
        }
      })
      .finally(() => setIsLoading(false));
  }

  function fetchCategories() {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data);
      });
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  function handleOpenCreate() {
    setEditingProduct(null);
    setForm({
      name: "",
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      price: "100",
      salePrice: "",
      stockQuantity: "10",
      status: "ACTIVE",
      isFeatured: false,
      description: "",
      shortDescription: "",
      categoryIds: [],
      imageUrl: "",
    });
    setShowForm(true);
  }

  function handleOpenEdit(product: AdminProduct) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      stockQuantity: String(product.stockQuantity),
      status: product.status,
      isFeatured: product.isFeatured,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      categoryIds: product.categories.map((c) => c.category.id),
      imageUrl: product.images[0]?.url || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stockQuantity: Number(form.stockQuantity),
        status: form.status,
        isFeatured: form.isFeatured,
        description: form.description || null,
        shortDescription: form.shortDescription || null,
        categoryIds: form.categoryIds,
        imageUrls: form.imageUrl ? [form.imageUrl] : [],
      };

      if (editingProduct) {
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.success) {
          toast.success("تم تعديل المنتج بنجاح!");
          setShowForm(false);
          fetchProducts(search, statusFilter);
        } else {
          toast.error(d.error || "حدث خطأ أثناء تعديل المنتج");
        }
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (d.success) {
          toast.success("تم إضافة المنتج بنجاح!");
          setShowForm(false);
          fetchProducts(search, statusFilter);
        } else {
          toast.error(d.error || "حدث خطأ أثناء إضافة المنتج");
        }
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" });
      const d = await res.json();
      if (d.success) {
        toast.success("تم نسخ المنتج بنجاح!");
        fetchProducts(search, statusFilter);
      } else {
        toast.error(d.error || "فشل تكرار المنتج");
      }
    } catch {
      toast.error("حدث خطأ أثناء تكرار المنتج");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        toast.success("تم حذف المنتج بنجاح!");
        fetchProducts(search, statusFilter);
      } else {
        toast.error(d.error || "فشل حذف المنتج");
      }
    } catch {
      toast.error("حدث خطأ أثناء حذف المنتج");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة المنتجات ({total})</h1>
          <p className="mt-1 text-sm text-muted-foreground">إضافة، تعديل، نسخ، وحذف المنتجات في المتجر</p>
        </div>
        <Button onClick={handleOpenCreate} className="rounded-xl px-5">
          + إضافة منتج جديد
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-card space-y-5 animate-fade-in">
          <h2 className="text-lg font-bold">
            {editingProduct ? `تعديل المنتج: ${editingProduct.name}` : "إضافة منتج جديد"}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold">اسم المنتج *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">رمز SKU *</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">الحالة</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "DRAFT" | "ACTIVE" | "ARCHIVED" })}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="ACTIVE">نشط (ظاهر بالمتجر)</option>
                <option value="DRAFT">مسودة (مخفي)</option>
                <option value="ARCHIVED">مؤرشف</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">السعر الاصلي ({settings.currencySymbol}) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">سعر التخفيض (اختياري)</label>
              <input
                type="number"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                placeholder="اتركه فارغاً إن لم يوجد تخفيض"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">كمية المخزون *</label>
              <input
                type="number"
                required
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">رابط الصورة الرئيسية</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/product-image.jpg"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-3">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-5 w-5 rounded border-input accent-primary"
                />
                <span className="text-sm font-semibold">عرض كمنتج مميز بالصفحة الرئيسية</span>
              </label>
            </div>

            <div className="sm:col-span-3">
              <label className="mb-2 block text-sm font-semibold">الوصف الشامل للمنتج</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="submit" className="rounded-xl px-6">
              {editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
              إلغاء
            </Button>
          </div>
        </form>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الرمز..."
          className="h-11 flex-1 rounded-xl border border-input bg-card px-4 text-sm shadow-card"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchProducts(search, e.target.value);
          }}
          className="h-11 rounded-xl border border-input bg-card px-3 text-sm shadow-card"
        >
          <option value="">جميع الحالات</option>
          <option value="ACTIVE">نشط</option>
          <option value="DRAFT">مسودة</option>
          <option value="ARCHIVED">مؤرشف</option>
        </select>
        <Button onClick={() => fetchProducts(search, statusFilter)} className="rounded-xl px-6">
          بحث
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-4 h-16 shadow-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
          <p className="text-muted-foreground">لا توجد منتجات مطابقة للبحث</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-x-auto shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface">
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">المنتج</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">الرمز</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">السعر</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">المخزون</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">الحالة</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">الطلبات</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-accent/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        {product.images[0]?.url && (
                          <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{product.name}</p>
                          {product.isFeatured && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md">
                              مميز
                            </span>
                          )}
                        </div>
                        {product.brand && <p className="text-xs text-muted-foreground/60">{product.brand.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground/70 font-mono text-xs">{product.sku}</td>
                  <td className="px-5 py-3.5">
                    {product.salePrice ? (
                      <div>
                        <span className="font-semibold">{formatCurrency(Number(product.salePrice))}</span>
                        <span className="mr-1.5 text-xs text-muted-foreground/50 line-through">{formatCurrency(Number(product.price))}</span>
                      </div>
                    ) : (
                      <span className="font-semibold">{formatCurrency(Number(product.price))}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={product.stockQuantity <= 10 ? "text-yellow-600 dark:text-yellow-400 font-semibold" : "font-medium"}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {STATUS_LABELS[product.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground/70 font-medium">{product._count.orderItems}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="xs" onClick={() => handleOpenEdit(product)}>
                        تعديل
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleDuplicate(product.id)}>
                        نسخ
                      </Button>
                      <Button variant="ghost" size="xs" onClick={() => handleDelete(product.id)} className="text-destructive">
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
