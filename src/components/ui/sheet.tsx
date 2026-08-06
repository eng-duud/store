"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "right" | "left" | "bottom";
  children: React.ReactNode;
  title?: string;
}

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  children,
  title,
}: SheetProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses =
    side === "right"
      ? "right-0 inset-y-0 animate-slide-in-right max-w-sm sm:max-w-md h-full w-full"
      : side === "left"
      ? "left-0 inset-y-0 max-w-sm sm:max-w-md h-full w-full"
      : "bottom-0 inset-x-0 mx-auto max-w-lg max-h-[85vh] h-auto rounded-t-3xl border-t border-x shadow-2xl";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <aside
        className={cn(
          "fixed z-10 flex flex-col border-l bg-card p-6 shadow-elevated transition-transform duration-300",
          sideClasses
        )}
      >
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold">{title || "القائمة"}</h2>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="إغلاق"
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">{children}</div>
      </aside>
    </div>
  );
}
