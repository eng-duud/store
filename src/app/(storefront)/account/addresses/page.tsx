"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    label: "المنزل",
    street: "",
    city: "الرياض",
    state: "الرياض",
    zipCode: "12345",
    country: "SA",
    isDefault: true,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } catch {
      toast.error("فشل في تحميل العناوين");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAddresses();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street || !formData.city) {
      toast.error("يرجى إدخال اسم الشارع والمدينة");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("تمت إضافة العنوان بنجاح!");
        setIsDialogOpen(false);
        setFormData({
          label: "المنزل",
          street: "",
          city: "الرياض",
          state: "الرياض",
          zipCode: "12345",
          country: "SA",
          isDefault: false,
        });
        fetchAddresses();
      } else {
        toast.error(data.error || "حدث خطأ أثناء إضافة العنوان");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <p className="text-muted-foreground">يجب تسجيل الدخول أولاً</p>
        <Link href="/login" className="mt-4 inline-block font-semibold text-primary">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">عناويني والتوصيل</h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة عناوينك المحفوظة للتسوق السريع</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl">
          + إضافة عنوان جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-32 rounded-2xl bg-muted animate-pulse" />
          <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-card">
          <p className="text-muted-foreground mb-4">لم تقم بإضافة أي عنوان بعد</p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            إضافة أول عنوان
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl border bg-card p-5 shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">{addr.label}</h3>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                    افتراضي
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {addr.street}، {addr.city}، {addr.state} ({addr.country})
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogHeader>
          <DialogTitle>إضافة عنوان توصيل جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">تسمية العنوان</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="مثلاً: المنزل، العمل"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">اسم الشارع/العمارة</label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="شارع الملك فهد، مبنى 12"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المدينة</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المنطقة/الولاية</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="accent-primary h-4 w-4"
            />
            <label htmlFor="isDefault" className="text-xs font-semibold cursor-pointer">
              تعيين كعنوان افتراضي
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              حفظ العنوان
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
