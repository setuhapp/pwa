import { getViewer } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const { session } = await getViewer();
  if (session?.userType !== "admin") redirect("/login?role=admin");

  const counts = {
    caregivers: await db.caregiver.count(),
    families: await db.member.count(),
    messages: await db.message.count(),
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col p-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-500">Platform overview and management.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Link href="/admin/caregivers" className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-brand-500 hover:ring-1 hover:ring-brand-500 transition-all">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Caregivers</span>
          <span className="mt-2 text-4xl font-extrabold text-gray-900">{counts.caregivers}</span>
          <span className="mt-4 text-sm font-medium text-brand-600">Manage & Verify &rarr;</span>
        </Link>
        <Link href="/admin/families" className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-brand-500 hover:ring-1 hover:ring-brand-500 transition-all">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Families</span>
          <span className="mt-2 text-4xl font-extrabold text-gray-900">{counts.families}</span>
          <span className="mt-4 text-sm font-medium text-brand-600">View Users &rarr;</span>
        </Link>
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Messages Sent</span>
          <span className="mt-2 text-4xl font-extrabold text-gray-900">{counts.messages}</span>
        </div>
      </div>
    </main>
  );
}
