import { getViewer } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { VerifyButton } from "./VerifyButton";

export default async function AdminCaregiversPage() {
  const { session } = await getViewer();
  if (session?.userType !== "admin") redirect("/login?role=admin");

  const caregivers = await db.caregiver.findMany({
    include: { verifications: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="mx-auto flex max-w-6xl flex-col p-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="text-sm font-semibold text-brand-600 hover:underline">&larr; Back to Dashboard</Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Caregivers</h1>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {caregivers.map((cg) => {
              const isVerified = cg.verifications.length > 0;
              return (
                <tr key={cg.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100 shrink-0">
                        {cg.photoUrl ? (
                          <img src={cg.photoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">👤</div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{cg.name || "Incomplete Profile"}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cg.phone}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cg.city || "-"}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <VerifyButton caregiverId={cg.id} isVerified={isVerified} />
                  </td>
                </tr>
              );
            })}
            {caregivers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No caregivers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
