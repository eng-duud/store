"use client";

import { useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  link: string;
}

const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string }> = {
  PRODUCTS: { label: "المنتجات", icon: "📦", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  CATEGORIES: { label: "الفئات", icon: "📁", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  ORDERS: { label: "الطلبات", icon: "🛒", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  CUSTOMERS: { label: "العملاء", icon: "👤", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  EXPENSES: { label: "المصروفات", icon: "💰", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  AUDIT: { label: "سجل المراجعة", icon: "📋", color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
};

export default function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setIsLoading(true);
    setSearched(true);
    try {
      const resp = await fetch(`/api/admin/global-search?q=${encodeURIComponent(q)}`);
      const json = await resp.json();
      if (json.success) setResults(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">البحث الشامل (Global Search)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ابحث في المنتجات، الفئات، الطلبات، العملاء، المصروفات، وسجلات المراجعة
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          🔍
        </div>
        <input
          type="text"
          placeholder="اكتب كلمة البحث... (منتج، عميل، رقم طلب...)"
          className="w-full h-14 rounded-2xl border bg-card pr-12 pl-4 text-base shadow-card focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          autoFocus
        />
        {isLoading && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {searched && !isLoading && results.length === 0 && (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-card">
          <span className="text-4xl block mb-3">🔎</span>
          <p className="text-sm font-medium text-muted-foreground">
            لم يتم العثور على نتائج لـ &quot;{query}&quot;
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            جرّب كلمات مختلفة أو تحقق من الإملاء
          </p>
        </div>
      )}

      {Object.keys(grouped).length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, items]) => {
            const info = CATEGORY_INFO[cat] || { label: cat, icon: "📄", color: "bg-muted text-foreground" };
            return (
              <div key={cat} className="rounded-2xl border bg-card shadow-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b">
                  <span>{info.icon}</span>
                  <h3 className="font-bold text-sm">{info.label}</h3>
                  <Badge variant="secondary" className="mr-auto">{items.length}</Badge>
                </div>
                <div className="divide-y">
                  {items.map((item) => (
                    <a
                      key={item.id}
                      href={item.link}
                      className="flex items-center justify-between px-4 py-3 hover:bg-accent/40 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                        )}
                      </div>
                      <span className="text-muted-foreground/50 group-hover:text-primary transition-colors text-lg">←</span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
