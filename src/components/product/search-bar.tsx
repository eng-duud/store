"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = "ابحث عن منتجات...",
  defaultValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <svg
        className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-input bg-card pr-11 pl-4 text-sm shadow-card transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:shadow-elevated hover:border-ring/50"
      />
    </form>
  );
}
