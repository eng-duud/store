"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="h-9 w-20 rounded-xl bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground sm:block"
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          إنشاء حساب
        </Link>
      </div>
    );
  }

  const user = session.user;
  const isAdmin = user.role === "ADMIN" || user.role === "EMPLOYEE";
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="قائمة المستخدم"
        aria-expanded={isOpen}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm shadow-sm">
          {initial}
        </div>
        <span className="hidden md:block text-sm font-semibold max-w-[120px] truncate">
          {user.name}
        </span>
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
          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 origin-top-left rounded-2xl border bg-card p-2 shadow-elevated z-50 animate-slide-up">
          <div className="border-b px-3 py-2.5 mb-1">
            <p className="text-sm font-bold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {isAdmin && (
              <div className="mt-1.5">
                <Badge variant="success">لوحة الإدارة</Badge>
              </div>
            )}
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              لوحة التحكم
            </Link>
          )}

          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            الملف الشخصي
          </Link>

          <Link
            href="/orders"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            طلباتي
          </Link>

          <div className="border-t pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
