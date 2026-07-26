"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import type { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى");
      } else {
        toast.success("تم تسجيل الدخول بنجاح!");
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        window.location.href = callbackUrl;
      }
    } catch {
      toast.error("حدث خطأ غير متوقع أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-card max-w-md mx-auto my-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">تسجيل الدخول</h1>
        <p className="mt-1.5 text-xs text-muted-foreground">أدخل بيانات حسابك للمتابعة</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-semibold">
            البريد الإلكتروني
          </label>
          <input
            id="login-email"
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
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="login-password font-semibold text-sm" className="text-sm font-semibold">
              كلمة المرور
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            {...register("password")}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-ring/50"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full text-base"
        >
          تسجيل الدخول
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </div>
  );
}
