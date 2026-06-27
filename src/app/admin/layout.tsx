import { getViewer } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session } = await getViewer();
  if (session?.userType !== "admin") {
    redirect("/login?role=admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Premium Admin Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  SETUH <span className="text-sm font-semibold text-brand-600">Admin</span>
                </span>
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/admin/caregivers"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  Caregivers
                </Link>
                <Link
                  href="/admin/families"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                >
                  Families
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <form action={logout}>
                <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition-all active:scale-[0.98]">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
