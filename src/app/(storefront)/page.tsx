"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons";
import { useFeaturedProducts, useCategories } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";

import { CategoryNav } from "@/components/product/category-nav";
import { useRouter } from "next/navigation";

import { Hero3DBackground } from "@/components/home/hero-3d-background";

export default function HomePage() {
  const router = useRouter();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();

  const handleSelectCategory = (catSlug?: string, subSlug?: string) => {
    if (!catSlug) {
      router.push("/products");
    } else if (subSlug) {
      router.push(`/categories/${catSlug}?sub=${subSlug}`);
    } else {
      router.push(`/categories/${catSlug}`);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden min-h-[520px] flex items-center justify-center">
        <Hero3DBackground />
        <div className="gradient-surface absolute inset-0 opacity-60 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-card backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              تشكيلة مواسم جـديدة وحصرية
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              عالم التسوق الرقمي
              <span className="bg-gradient-to-l from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent">
                {" "}
                الفاخر
              </span>
            </h1>
            <p className="mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl text-balance max-w-2xl mx-auto">
              تصفح المنتجات الأعلى مبيعاً مع ضمان الجودة وتوصيل آمن وسريع لجميع المدن والمناطق
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto rounded-2xl px-10 shadow-lg">
                  تصفح كافة المنتجات
                </Button>
              </Link>
              <Link href="/categories" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full sm:w-auto rounded-2xl px-8">
                  استكشف الفئات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">الفئات الرئيسية</h2>
            <p className="mt-1 text-sm text-muted-foreground">اختر الفئة للتصفح والفلترة السريعة</p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-primary transition-colors hover:text-primary/80"
          >
            عرض جميع الفئات &rarr;
          </Link>
        </div>
        <CategoryNav onSelectCategory={handleSelectCategory} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">منتجات مميزة المختارة</h2>
            <p className="mt-1 text-sm text-muted-foreground">أفضل المنتجات الأكثر طلبًا وتقييمًا</p>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-primary transition-colors hover:text-primary/80"
          >
            جميع المنتجات &rarr;
          </Link>
        </div>
        {productsLoading ? (
          <ProductGridSkeleton />
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-12 text-center shadow-card">
            <p className="text-muted-foreground">لا توجد منتجات مميزة متوفرة حالياً</p>
          </div>
        )}
      </section>

      <section className="border-t bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-elevated">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-base font-bold">شحن سريع ومجاني</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              توصيل مجاني خلال 2-4 أيام عمل لجميع الطلبات
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-elevated">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-base font-bold">دفع آمن 100%</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              دعم بطاقات مادة، فيزا، ماستركارد والدفع عند الاستلام
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-elevated">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-base font-bold">دعم فني متواصل</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              فريق دعم فني متوفر لخدمتك ومساعدتك طوال أيام الأسبوع
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
