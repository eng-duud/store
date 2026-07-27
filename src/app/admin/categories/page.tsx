"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SingleImageUpload } from "@/components/shared/single-image-upload";

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  sortOrder: number;
  parentId: string | null;
  imageId: string | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string }[];
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    parentId: "",
    status: "ACTIVE",
    imageId: "",
  });

  function fetchCategories() {
    setIsLoading(true);
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCategories(d.data);
        }
      })
      .catch(() => toast.error("فشل في تحميل الفئات"))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function handleOpenCreate() {
    setEditingCategory(null);
    setForm({ name: "", description: "", parentId: "", status: "ACTIVE", imageId: "" });
    setShowForm(true);
  }

  function handleOpenEdit(cat: AdminCategory) {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      parentId: cat.parentId || "",
      status: cat.status,
      imageId: cat.imageId || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Edit existing
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            parentId: form.parentId || null,
            status: form.status,
            imageId: form.imageId || null,
          }),
        });
        const d = await res.json();
        if (d.success) {
          toast.success("تم تحديث الفئة بنجاح!");
          setShowForm(false);
          fetchCategories();
        } else {
          toast.error(d.error || "حدث خطأ أثناء التحديث");
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description || undefined,
            parentId: form.parentId || undefined,
            status: form.status,
            imageId: form.imageId || undefined,
          }),
        });
        const d = await res.json();
        if (d.success) {
          toast.success("تم إنشاء الفئة بنجاح!");
          setShowForm(false);
          fetchCategories();
        } else {
          toast.error(d.error || "حدث خطأ أثناء الإنشاء");
        }
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    }
  }

  async function handleToggleStatus(cat: AdminCategory) {
    const newStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`تم تغيير حالة الفئة إلى ${newStatus === "ACTIVE" ? "نشط" : "غير نشط"}`);
        fetchCategories();
      }
    } catch {
      toast.error("حدث خطأ أثناء تغيير حالة الفئة");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "فشل في حذف الفئة");
      } else {
        toast.success("تم حذف الفئة بنجاح");
        fetchCategories();
      }
    } catch {
      toast.error("حدث خطأ أثناء حذف الفئة");
    }
  }

  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الفئات ({categories.length})</h1>
          <p className="mt-1 text-sm text-muted-foreground">إنشاء، تعديل، وحذف الفئات وتصنيفات المنتجات</p>
        </div>
        <Button onClick={handleOpenCreate} className="rounded-xl px-5">
          + إضافة فئة جديدة
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-card space-y-4 animate-fade-in">
          <h2 className="text-lg font-bold">
            {editingCategory ? `تعديل الفئة: ${editingCategory.name}` : "إضافة فئة جديدة"}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">اسم الفئة</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">حالة الفئة</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="ACTIVE">نشط (مفعل)</option>
                <option value="INACTIVE">غير نشط (معطل)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">وصف الفئة</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف اختياري للفئة"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">الفئة الأب (اختياري)</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
              >
                <option value="">بدون (فئة رئيسية)</option>
                {categories
                  .filter((cat) => {
                    if (editingCategory) {
                      if (cat.id === editingCategory.id) return false;
                      if (cat.parentId === editingCategory.id) return false;
                    }
                    return true;
                  })
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parent ? `  └ ${cat.name}` : cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">صورة الفئة</label>
              <SingleImageUpload
                value={form.imageId}
                onChange={(url) => setForm({ ...form, imageId: url || "" })}
                entityType="category"
                folder="categories"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="rounded-xl px-6">
              {editingCategory ? "حفظ التعديلات" : "إنشاء الفئة"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
              إلغاء
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-4 h-16 shadow-card" />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
          <p className="text-muted-foreground">لا توجد فئات حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map((cat) => (
            <div key={cat.id} className="rounded-2xl border bg-card shadow-card overflow-hidden transition-all duration-200 hover:shadow-elevated">
              <div className="flex items-center justify-between p-5">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-base">{cat.name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cat.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                      {cat.status === "ACTIVE" ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cat._count.products} منتج
                    {cat.children.length > 0 && ` — ${cat.children.length} فئة فرعية`}
                    {cat.description && ` — ${cat.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(cat)} className="rounded-lg text-xs">
                    {cat.status === "ACTIVE" ? "تعطيل" : "تفعيل"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(cat)} className="rounded-lg text-xs">
                    تعديل
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id)} className="rounded-lg text-xs">
                    حذف
                  </Button>
                </div>
              </div>

              {cat.children.length > 0 && (
                <div className="border-t bg-surface/50 px-8 py-3 space-y-2">
                  {cat.children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between py-1 text-sm">
                      <span className="font-medium">{child.name}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="xs" onClick={() => handleOpenEdit(child as unknown as AdminCategory)}>
                          تعديل
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleDelete(child.id)} className="text-destructive">
                          حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
