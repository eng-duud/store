"use client";

import Link from "next/link";
import { useSettings } from "@/hooks/use-settings";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="mx-auto mb-4 h-12 max-w-[180px] object-contain"
              />
            ) : (
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-lg font-bold text-white shadow-md shadow-primary/20">
                {settings.name ? settings.name.charAt(0) : "م"}
              </div>
            )}
            <span className="text-2xl font-bold tracking-tight">{settings.name}</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
