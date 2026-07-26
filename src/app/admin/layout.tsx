import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface text-foreground transition-colors duration-300">
      <div className="hidden lg:block lg:w-72 lg:shrink-0">
        <div className="fixed inset-y-0 z-30 w-72">
          <AdminSidebar />
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:ps-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
