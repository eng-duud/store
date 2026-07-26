"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="التنقل بين الصفحات">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="rounded-xl border bg-card px-4 py-2 text-sm font-medium shadow-card transition-all duration-200 hover:shadow-sm hover:bg-accent"
        >
          السابق
        </Link>
      )}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-sm text-muted-foreground/50">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              currentPage === page
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border bg-card shadow-card hover:shadow-sm hover:bg-accent"
            }`}
          >
            {page}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="rounded-xl border bg-card px-4 py-2 text-sm font-medium shadow-card transition-all duration-200 hover:shadow-sm hover:bg-accent"
        >
          التالي
        </Link>
      )}
    </nav>
  );
}
