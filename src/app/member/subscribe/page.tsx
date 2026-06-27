import { getViewer } from "@/lib/session";
import { subscribeMember } from "@/app/actions/member";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SubscribePage() {
  const { session, tier } = await getViewer();

  if (!session || session.userType !== "member") redirect("/login?role=member");
  if (tier === "member") redirect("/browse");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-8 ring-brand-50/50">
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Unlock Full Access</h1>
      <p className="mt-3 text-base font-medium text-gray-500">
        Upgrade to a premium membership to view contact details, send in-app messages, and find the perfect caregiver for your family.
      </p>

      <div className="mt-8 w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-brand-500/10">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <span className="text-sm font-bold text-gray-900">Monthly Plan</span>
          <span className="text-lg font-extrabold text-brand-600">₹999<span className="text-sm font-medium text-gray-400">/mo</span></span>
        </div>
        
        <form action={subscribeMember} className="mt-6">
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-transform active:scale-[0.98] hover:bg-brand-700">
            Mock Pay & Subscribe
          </button>
        </form>
        <p className="mt-4 text-xs font-medium text-gray-400">
          * This is a mock payment for testing purposes.
        </p>
      </div>

      <Link href="/browse" className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600">
        Cancel and go back
      </Link>
    </main>
  );
}
