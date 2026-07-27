"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  link: string;
}

const CATEGORY_INFO: Record<string, { label: string; icon: string }> = {
  PRODUCTS: { label: "المنتجات", icon: "📦" },
  CATEGORIES: { label: "الفئات", icon: "📁" },
  ORDERS: { label: "الطلبات", icon: "🛒" },
  CUSTOMERS: { label: "العملاء", icon: "👤" },
  EXPENSES: { label: "المصروفات", icon: "💰" },
  AUDIT: { label: "سجل المراجعة", icon: "📋" },
};

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  function handleResultClick(link: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(link);
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-xl border bg-background px-3 text-xs text-muted-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:text-foreground hover:shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>بحث...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60 sm:inline-flex">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[340px] lg:w-[420px] rounded-2xl border bg-card shadow-elevated overflow-hidden animate-slide-up">
          <div className="relative border-b">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              placeholder="بحث في المنتجات، الطلبات، العملاء..."
              className="w-full h-12 bg-transparent pr-10 pl-4 text-sm focus:outline-none"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              autoFocus
            />
            {isLoading && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {query.trim().length < 2 && (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground">اكتب حرفين على الأقل للبحث</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">⌘K للبحث السريع</p>
              </div>
            )}

            {query.trim().length >= 2 && !isLoading && results.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground">لا توجد نتائج لـ &quot;{query}&quot;</p>
              </div>
            )}

            {Object.keys(grouped).length > 0 && (
              <div className="py-2">
                {Object.entries(grouped).map(([cat, items]) => {
                  const info = CATEGORY_INFO[cat] || { label: cat, icon: "📄" };
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-2 px-4 py-1.5">
                        <span className="text-xs">{info.icon}</span>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{info.label}</span>
                        <Badge variant="secondary" className="mr-auto text-[10px] h-5">{items.length}</Badge>
                      </div>
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick(item.link)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-start hover:bg-accent/40 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                            )}
                          </div>
                          <span className="text-muted-foreground/40 group-hover:text-primary transition-colors text-xs shrink-0">↵</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
