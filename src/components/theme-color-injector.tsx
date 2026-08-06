"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";

export function ThemeColorInjector() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    const primary = settings.primaryColor || "#2563eb";
    const secondary = settings.secondaryColor || "#475569";
    const accent = settings.accentColor || "#f59e0b";
    const radius = settings.borderRadius || "0.75rem";

    // Inject CSS Variable Tokens onto <html>
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--color-primary", primary);
    root.style.setProperty("--secondary", secondary);
    root.style.setProperty("--color-secondary", secondary);
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--color-accent", accent);
    root.style.setProperty("--ring", primary);
    root.style.setProperty("--radius", radius);
    root.style.setProperty(
      "--gradient-primary",
      `linear-gradient(135deg, ${primary}, ${secondary})`
    );
  }, [settings]);

  return null;
}
