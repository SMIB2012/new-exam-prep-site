import { AdminSidebar } from "@/components/admin/Sidebar";
import { requireRole } from "@/lib/server/authGuard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Enforce authentication and ADMIN/REVIEWER role - redirects to /login or /403 if unauthorized
  await requireRole(["ADMIN", "REVIEWER"]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
