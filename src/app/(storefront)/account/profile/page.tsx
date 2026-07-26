"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { session, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">الملف الشخصي</h1>
        <p className="mt-1 text-sm text-muted-foreground">تفاصيل حسابك الشخصي والبريد الإلكتروني</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase">الاسم الكامل</label>
            <p className="mt-1 font-bold text-base">{user.name}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase">البريد الإلكتروني</label>
            <p className="mt-1 font-bold text-base">{user.email}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase">نوع الحساب</label>
            <p className="mt-1 font-bold text-base">
              {user.role === "ADMIN" ? "مدير نظام" : user.role === "EMPLOYEE" ? "موظف" : "عميل مميز"}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Link href="/account">
            <Button variant="outline">العودة لحسابي</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
