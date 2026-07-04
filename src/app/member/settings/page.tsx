import { getViewer } from "@/lib/session";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { db } from "@/lib/db";

export default async function MemberSettingsPage() {
  const { session, tier } = await getViewer();
  if (session?.userType !== "member") {
    redirect("/login?role=member");
  }

  const member = await db.member.findUnique({
    where: { id: session.userId },
  });

  if (!member) {
    redirect("/login?role=member");
  }

  const isSubscribed = tier === "member";

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm font-medium text-gray-500">Manage your family account</p>
      </div>

      {/* Account Profile Details */}
      <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Account Details</h2>
        <div className="flex flex-col gap-3">
          <div>
            <span className="block text-xs font-semibold text-gray-400">Phone Number</span>
            <span className="text-sm font-bold text-gray-900">{member.phone}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400">Account Type</span>
            <span className="text-sm font-bold text-gray-900">Family Member</span>
          </div>
        </div>
      </section>

      {/* Subscription Status Card */}
      <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-sm font-bold text-gray-900">
              {isSubscribed ? "Premium Plan" : "Free Plan"}
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              {isSubscribed 
                ? "Full access to browse and contact all caregivers" 
                : "Upgrade to contact verified caregivers in app"}
            </span>
          </div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${isSubscribed ? "bg-brand-100 text-brand-800" : "bg-gray-100 text-gray-800"}`}>
            {isSubscribed ? "Active" : "Free"}
          </span>
        </div>
      </section>

      {/* Logout Action */}
      <div className="mt-8 flex justify-center">
        <form action={logout}>
          <button className="text-[10px] font-medium text-gray-300 hover:text-gray-500 hover:underline active:scale-[0.98] transition-all">
            Log Out
          </button>
        </form>
      </div>
    </main>
  );
}
