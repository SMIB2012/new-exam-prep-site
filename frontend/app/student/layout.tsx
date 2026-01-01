import { StudentSidebar } from "@/components/student/Sidebar";
import { requireUser } from "@/lib/server/authGuard";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // Enforce authentication - redirects to /login if not authenticated
  await requireUser();

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
