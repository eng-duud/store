"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <p className="text-muted-foreground">يجب تسجيل الدخول أولاً</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary/80">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="mb-10 text-3xl font-bold tracking-tight">حسابي</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Link
          href="/account/profile"
          className="group rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3 className="font-bold">الملف الشخصي</h3>
          <p className="mt-1 text-sm text-muted-foreground">تعديل بياناتك الشخصية</p>
        </Link>

        <Link
          href="/account/addresses"
          className="group rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <h3 className="font-bold">عناويني</h3>
          <p className="mt-1 text-sm text-muted-foreground">إدارة عناوين التوصيل</p>
        </Link>

        <Link
          href="/orders"
          className="group rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <h3 className="font-bold">طلباتي</h3>
          <p className="mt-1 text-sm text-muted-foreground">عرض وتتبع طلباتك</p>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="mb-5 text-base font-bold">معلومات الحساب</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">الاسم</dt>
            <dd className="mt-1 font-semibold">{session.user?.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">البريد الإلكتروني</dt>
            <dd className="mt-1 font-semibold">{session.user?.email}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
