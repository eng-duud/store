"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";


export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 mx-4 mt-4 md:mx-8 lg:mx-auto lg:max-w-7xl lg:px-8">
      <div className="glass-strong shadow-elevated flex h-16 items-center justify-between rounded-2xl px-4 sm:px-6 lg:h-18 transition-all duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="فتح القائمة"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="h-9 max-w-[140px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                {settings.name ? settings.name.charAt(0) : "م"}
              </div>
            )}
            <span className="text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
              {settings.name}
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/products"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
          >
            المنتجات
          </Link>
          <Link
            href="/categories"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
          >
            الفئات
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-xl p-2.5 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            aria-label="سلة التسوق"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm px-1.5 animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          <UserMenu />
        </div>
      </div>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </header>
  );
}
