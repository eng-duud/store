import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import FloatingCart from "@/components/cart/floating-cart";
import CartSidebar from "@/components/cart/cart-sidebar";

export const dynamic = "force-dynamic";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingCart />
      <CartSidebar />
    </div>
  );
}
