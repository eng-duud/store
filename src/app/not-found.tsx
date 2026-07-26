import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-6xl font-bold">404</h1>
      <p className="mb-6 text-lg text-muted-foreground">
        الصفحة التي تبحث عنها غير موجودة
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
