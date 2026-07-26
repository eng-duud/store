import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
    </div>
  );
}
