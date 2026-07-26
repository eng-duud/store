"use client";

import { useEffect, useState, useCallback } from "react";
import { DEFAULT_STORE_SETTINGS, StoreSettingsData, formatCurrency as formatCurrencyRaw } from "@/services/settings.service";

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettingsData>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(() => {
    setIsLoading(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setSettings(resData.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load store settings in client:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const formatCurrency = useCallback(
    (amount: number | string) => formatCurrencyRaw(amount, settings),
    [settings]
  );

  return { settings, isLoading, refreshSettings: fetchSettings, formatCurrency };
}
