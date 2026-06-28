import { getViewer } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isSubscriptionActive } from "@/lib/subscription";
import { activateSubscriptionAction, deactivateSubscriptionAction } from "@/app/actions/member";

export default async function AdminFamiliesPage() {
  const { session } = await getViewer();
  if (session?.userType !== "admin") redirect("/login?role=admin");

  const families = await db.member.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="mx-auto flex max-w-6xl flex-col p-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="text-sm font-semibold text-brand-600 hover:underline">&larr; Back to Dashboard</Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Families</h1>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {families.map((fam) => {
              const isSubscribed = isSubscriptionActive(fam, new Date());
              return (
                <tr key={fam.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {fam.name || "Unknown"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{fam.phone}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {fam.createdAt.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      isSubscribed 
                        ? "bg-green-100 text-green-800" 
                        : fam.subscriptionStatus === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                    }`}>
                      {isSubscribed ? "Premium" : fam.subscriptionStatus === "pending" ? "Pending Approval" : "Free"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    {fam.subscriptionStatus === "pending" ? (
                      <div className="flex gap-2">
                        <form action={activateSubscriptionAction.bind(null, fam.id)}>
                          <button type="submit" className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 active:scale-95 transition-transform">
                            Approve
                          </button>
                        </form>
                        <form action={deactivateSubscriptionAction.bind(null, fam.id)}>
                          <button type="submit" className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-300 active:scale-95 transition-transform">
                            Reject
                          </button>
                        </form>
                      </div>
                    ) : isSubscribed ? (
                      <form action={deactivateSubscriptionAction.bind(null, fam.id)}>
                        <button type="submit" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 active:scale-95 transition-transform">
                          Revoke Premium
                        </button>
                      </form>
                    ) : (
                      <form action={activateSubscriptionAction.bind(null, fam.id)}>
                        <button type="submit" className="rounded-lg bg-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-dark active:scale-95 transition-transform">
                          Activate Premium
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {families.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No families found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
