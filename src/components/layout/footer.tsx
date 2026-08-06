"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

export function Footer() {
  const [email, setEmail] = React.useState("");
  const { settings } = useSettings();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    toast.success("تم الاشتراك بنجاح في النشرة البريدية!");
    setEmail("");
  };

  const hasSocialLinks =
    Boolean(settings.facebook) ||
    Boolean(settings.instagram) ||
    Boolean(settings.twitter) ||
    Boolean(settings.tiktok) ||
    Boolean(settings.youtube) ||
    Boolean(settings.linkedin) ||
    Boolean(settings.telegram);

  return (
    <footer className="mt-12 border-t bg-surface text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Compact 2x2 Grid Layout */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {/* Box 1: Store Brand & Newsletter */}
          <div className="space-y-3 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              {settings.footerLogoUrl || settings.logoUrl ? (
                <img
                  src={settings.footerLogoUrl || settings.logoUrl}
                  alt={settings.name}
                  className="h-7 max-w-[120px] object-contain"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary text-xs font-bold text-white">
                  {settings.name ? settings.name.charAt(0) : "م"}
                </div>
              )}
              <span className="text-base font-bold tracking-tight">{settings.name}</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {settings.description}
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-1.5 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني..."
                className="h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 whitespace-nowrap"
              >
                اشتراك
              </button>
            </form>
          </div>

          {/* Box 2: Quick Links */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              روابط سريعة
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/products" className="transition-colors hover:text-foreground">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/categories" className="transition-colors hover:text-foreground">
                  الفئات
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-foreground">
                  سلة التسوق
                </Link>
              </li>
            </ul>
          </div>

          {/* Box 3: My Account */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              حسابي
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/account" className="transition-colors hover:text-foreground">
                  الملف الشخصي
                </Link>
              </li>
              <li>
                <Link href="/orders" className="transition-colors hover:text-foreground">
                  طلباتي
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          {/* Box 4: Contact & Social */}
          <div className="space-y-2 col-span-2 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              تواصل معنا
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {settings.phone && (
                <li className="flex items-center gap-1.5" dir="ltr">
                  <span>{settings.phone}</span>
                  <span>📞</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-1.5 truncate">
                  <span className="truncate">{settings.email}</span>
                  <span>✉️</span>
                </li>
              )}
            </ul>

            {hasSocialLinks && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {settings.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noreferrer" className="rounded-md border bg-card px-2 py-1 text-[10px] hover:bg-accent">
                    FB
                  </a>
                )}
                {settings.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer" className="rounded-md border bg-card px-2 py-1 text-[10px] hover:bg-accent">
                    IG
                  </a>
                )}
                {settings.twitter && (
                  <a href={settings.twitter} target="_blank" rel="noreferrer" className="rounded-md border bg-card px-2 py-1 text-[10px] hover:bg-accent">
                    X
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row text-[11px] text-muted-foreground/70">
          <p>{settings.copyright || `© ${new Date().getFullYear()} ${settings.name}. جميع الحقوق محفوظة.`}</p>
          <div className="flex items-center gap-1.5 font-semibold text-[9px]">
            <span className="rounded border bg-card px-2 py-0.5">VISA</span>
            <span className="rounded border bg-card px-2 py-0.5">MASTERCARD</span>
            <span className="rounded border bg-card px-2 py-0.5">MADA</span>
            <span className="rounded border bg-card px-2 py-0.5">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
