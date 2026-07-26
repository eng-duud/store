import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted/60", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-6 w-1/3 rounded-md" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-5">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/3 rounded-md" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-12 w-1/2 rounded-xl" />
      </div>
    </div>
  );
}
