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
    Boolean(settings.telegram) ||
    Boolean(settings.snapchat);

  return (
    <footer className="mt-20 border-t bg-surface text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              {settings.footerLogoUrl || settings.logoUrl ? (
                <img
                  src={settings.footerLogoUrl || settings.logoUrl}
                  alt={settings.name}
                  className="h-9 max-w-[150px] object-contain"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-white shadow-sm">
                  {settings.name ? settings.name.charAt(0) : "م"}
                </div>
              )}
              <span className="text-lg font-bold">{settings.name}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              {settings.description}
            </p>

            {hasSocialLinks && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    aria-label="Facebook"
                  >
                    FB
                  </a>
                )}
                {settings.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    aria-label="Instagram"
                  >
                    IG
                  </a>
                )}
                {settings.twitter && (
                  <a
                    href={settings.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    aria-label="Twitter / X"
                  >
                    X
                  </a>
                )}
                {settings.tiktok && (
                  <a
                    href={settings.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    aria-label="TikTok"
                  >
                    TK
                  </a>
                )}
                {settings.youtube && (
                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    aria-label="YouTube"
                  >
                    YT
                  </a>
                )}
                {settings.linkedin && (
                  <a
                    href={settings.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    aria-label="LinkedIn"
                  >
                    IN
                  </a>
                )}
                {settings.telegram && (
                  <a
                    href={settings.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border bg-card p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    aria-label="Telegram"
                  >
                    TG
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleSubscribe} className="mt-4 flex max-w-sm gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="اشترك في النشرة البريدية..."
                className="h-10 flex-1 rounded-xl border border-input bg-background px-3.5 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="h-10 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                اشتراك
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
              روابط سريعة
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  المنتجات
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  الفئات
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  سلة التسوق
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
              حسابي
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/account"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  الملف الشخصي
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  طلباتي
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
              تواصل معنا
            </h3>
            <ul className="space-y-2.5">
              {settings.phone && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span dir="ltr">{settings.phone}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>{settings.email}</span>
                </li>
              )}
              {settings.address && (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground/70">
            {settings.copyright || `© ${new Date().getFullYear()} ${settings.name}. جميع الحقوق محفوظة.`}
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70">
              VISA
            </span>
            <span className="rounded-lg border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70">
              MASTERCARD
            </span>
            <span className="rounded-lg border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70">
              MADA
            </span>
            <span className="rounded-lg border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70">
              APPLE PAY
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
