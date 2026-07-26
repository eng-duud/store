"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import type { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
        window.location.href = "/login";
      } else {
        const result = await response.json();
        toast.error(result.error || "حدث خطأ أثناء إنشاء الحساب");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-card max-w-md mx-auto my-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">إنشاء حساب جديد</h1>
        <p className="mt-1.5 text-xs text-muted-foreground">أدخل بياناتك للانضمام إلى متجرنا</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="mb-1.5 block text-sm font-semibold">
            الاسم الكامل
          </label>
          <input
            id="reg-name"
            type="text"
            {...register("name")}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-ring/50"
            placeholder="محمد أحمد"
            autoComplete="name"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs font-medium text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-semibold">
            البريد الإلكتروني
          </label>
          <input
            id="reg-email"
            type="email"
            {...register("email")}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-ring/50"
            placeholder="email@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-semibold">
            كلمة المرور
          </label>
          <input
            id="reg-password"
            type="password"
            {...register("password")}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-ring/50"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-confirm-password" className="mb-1.5 block text-sm font-semibold">
            تأكيد كلمة المرور
          </label>
          <input
            id="reg-confirm-password"
            type="password"
            {...register("confirmPassword")}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-ring/50"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs font-medium text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full text-base mt-2"
        >
          إنشاء حساب
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
