import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { profileCompleteness } from "@/lib/completeness";
import { CompletenessBar } from "@/components/CompletenessBar";
import { toggleHidden } from "@/app/actions/caregiver";
import { logout } from "@/app/actions/auth";
import { CaregiverProfilePreview } from "@/components/CaregiverProfilePreview";
import { cookies } from "next/headers";
import { getTranslations } from "@/lib/translations";

export default async function CaregiverDashboard() {
  const { session } = await getViewer();
  if (session?.userType !== "caregiver") redirect("/login?role=caregiver");

  const cg = await db.caregiver.findUnique({
    where: { id: session.userId },
    include: { verifications: true },
  });
  if (!cg) redirect("/login?role=caregiver");

  const percent = profileCompleteness(cg);
  const isVerified = cg.verifications.length > 0;
  const lang = (await cookies()).get("lang")?.value || "en";
  const t = getTranslations(lang);

  return (
    <main className="mx-auto flex max-w-md w-full flex-col gap-6 p-6 pb-24">
      {/* Account Dashboard Summary */}
      <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-gray-900">Your Account</h1>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${cg.isHidden ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
            {cg.isHidden ? "Hidden" : "Visible"}
          </span>
        </div>

        <CompletenessBar percent={percent} />

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Link href="/caregiver/onboarding/1" className="flex items-center justify-center rounded-2xl bg-brand-50 px-4 py-3 text-center text-sm font-bold text-brand-700 shadow-sm transition-transform active:scale-[0.98] hover:bg-brand-100">
            Edit Profile
          </Link>
          <Link href="/caregiver/qr" className="flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-3 text-center text-sm font-bold text-gray-700 shadow-sm transition-transform active:scale-[0.98] hover:bg-gray-50">
            My QR Code
          </Link>
        </div>

        <form action={toggleHidden} className="w-full">
          <button className={`w-full rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition-transform active:scale-[0.98] ${cg.isHidden ? "border-brand-200 bg-brand-50/50 text-brand-700 hover:bg-brand-50" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
            {cg.isHidden ? "Publish Profile (Make Visible)" : "Temporarily Hide Profile"}
          </button>
        </form>
      </section>

      

      {/* Separator / Preview Header */}
      <div className="flex items-center gap-3 py-2">
        <div className="h-[1px] flex-1 bg-gray-200" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Profile Preview</span>
        <div className="h-[1px] flex-1 bg-gray-200" />
      </div>

      {/* Public Profile View Preview */}
      <CaregiverProfilePreview
        caregiver={cg}
        canSeeDetails={true}
        isOwnProfile={true}
        isLoggedIn={true}
        isVerified={isVerified}
        lang={lang}
      />

      {/* Logout Action */}
      <div className="mt-2">
        <form action={logout}>
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/50 px-4 py-4 text-base font-bold text-red-600 shadow-sm transition-transform active:scale-[0.98] hover:bg-red-50 hover:text-red-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t.logout || "Log Out"}
          </button>
        </form>
      </div>
    </main>
  );
}
