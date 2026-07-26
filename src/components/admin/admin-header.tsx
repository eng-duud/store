"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Sheet } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

export function AdminHeader() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <>
      <header className="glass-strong shadow-elevated mx-4 mt-4 flex h-16 items-center justify-between rounded-2xl px-4 sm:px-6 lg:mx-6 lg:mt-6 transition-all duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="فتح القائمة الجانبية"
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
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <h1 className="text-base font-bold tracking-tight lg:hidden">لوحة التحكم</h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground sm:flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            المتجر
          </Link>
          <UserMenu />
        </div>
      </header>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen} title="لوحة التحكم">
        <AdminSidebar onCloseMobile={() => setSidebarOpen(false)} />
      </Sheet>
    </>
  );
}
