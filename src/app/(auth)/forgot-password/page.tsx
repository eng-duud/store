"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      alert("حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border bg-card p-8 shadow-card text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold">تم الإرسال</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          إذا كان البريد الإلكتروني مسجلاً، ستتلقى رابطاً لإعادة تعيين كلمة المرور.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-card">
      <h1 className="mb-8 text-center text-2xl font-bold tracking-tight">نسيت كلمة المرور</h1>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            required
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 hover:border-ring/50"
            placeholder="email@example.com"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-40"
        >
          {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
        </button>
      </form>
    </div>
  );
}
