"use client";

import * as React from "react";
import Link from "next/link";
import { Sheet } from "@/components/ui/sheet";
import { useSettings } from "@/hooks/use-settings";
import { ThemeToggle } from "./theme-toggle";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { settings } = useSettings();

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={settings.name}>
      <div className="flex flex-col space-y-6 pt-2">
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-sm font-semibold text-muted-foreground">المظهر</span>
          <ThemeToggle />
        </div>

        <nav className="flex flex-col space-y-2">
          <Link
            href="/"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all hover:bg-accent hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            الرئيسية
          </Link>
          <Link
            href="/products"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all hover:bg-accent hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            المنتجات
          </Link>
          <Link
            href="/categories"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all hover:bg-accent hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10h10V2Z"/><path d="M12 12H2v10h10V12Z"/><path d="M22 2h-6v6h6V2Z"/><path d="M22 12h-6v6h6v-6Z"/></svg>
            الفئات
          </Link>
          <Link
            href="/cart"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all hover:bg-accent hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            سلة التسوق
          </Link>
          <Link
            href="/orders"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all hover:bg-accent hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="16" y1="10" y2="10"/><line x1="8" x2="12" y1="14" y2="14"/></svg>
            طلباتي
          </Link>
        </nav>
      </div>
    </Sheet>
  );
}
