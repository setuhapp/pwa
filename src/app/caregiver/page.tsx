import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { profileCompleteness } from "@/lib/completeness";
import { CompletenessBar } from "@/components/CompletenessBar";
import { toggleHidden } from "@/app/actions/caregiver";
import { parseStringArray } from "@/lib/json";

export default async function CaregiverDashboard() {
  const { session } = await getViewer();
  if (session?.userType !== "caregiver") redirect("/login?role=caregiver");

  const cg = await db.caregiver.findUnique({
    where: { id: session.userId },
    include: { verifications: true },
  });
  if (!cg) redirect("/login?role=caregiver");

  const percent = profileCompleteness(cg);
  const skills = parseStringArray(cg.skills);
  const specs = parseStringArray(cg.specialisations);
  const isVerified = cg.verifications.length > 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
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

      {/* Public Profile View (Reused from c/[id]/page.tsx) */}
      <div className="flex flex-col gap-6">
        {/* Identity section */}
        <section className="relative flex flex-col items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-brand-50 shadow-inner">
            {cg.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cg.photoUrl}
                alt={cg.name ?? "Caregiver photo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl text-gray-400">
                👤
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{cg.name || "Incomplete Profile"}</h2>
            
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${isVerified ? "bg-brand-50 text-brand-700 ring-1 ring-brand-600/20" : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"}`}>
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {isVerified ? "Verified" : "Pending Verification"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-600/20">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Trained
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-0.5 text-sm font-medium text-gray-500">
              {cg.address && <p>{cg.address}</p>}
              {cg.city && <p>{cg.city}</p>}
              {cg.phone && <p className="text-gray-900 mt-1">{cg.phone}</p>}
            </div>
          </div>
        </section>

        {/* Skills & qualifications */}
        <section className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Skills &amp; Qualifications</h2>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-700">
                  {s}
                </span>
              ))}
            </div>
          )}
          {cg.qualifications && (
            <p className="text-sm font-medium text-gray-700">
              <span className="font-semibold text-gray-900 block mb-1">Qualifications:</span> {cg.qualifications}
            </p>
          )}
          {skills.length === 0 && !cg.qualifications && (
            <p className="text-sm text-gray-400">Not yet specified.</p>
          )}
        </section>

        {/* Experience */}
        <section className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Experience</h2>
          {cg.experienceYears != null && (
            <p className="text-sm font-medium text-gray-700">
              <span className="font-semibold text-gray-900 block mb-1">Years of experience:</span> {cg.experienceYears}
            </p>
          )}
          {cg.priorFamilies && (
            <p className="text-sm font-medium text-gray-700">
              <span className="font-semibold text-gray-900 block mb-1">Prior families:</span> {cg.priorFamilies}
            </p>
          )}
          {specs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specs.map((s) => (
                <span key={s} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold tracking-wide text-purple-700">
                  {s}
                </span>
              ))}
            </div>
          )}
          {cg.availability && (
            <p className="text-sm font-medium text-gray-700">
              <span className="font-semibold text-gray-900 block mb-1">Availability:</span> {cg.availability}
            </p>
          )}
          {cg.experienceYears == null && !cg.priorFamilies && specs.length === 0 && !cg.availability && (
            <p className="text-sm text-gray-400">Not yet specified.</p>
          )}
        </section>

        {/* Rate */}
        <section className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Rate</h2>
          <div className="grid grid-cols-2 gap-4">
            {cg.dailyRate != null && (
              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Daily</span>
                <span className="mt-1 block text-lg font-extrabold text-gray-900">₹{cg.dailyRate}</span>
              </div>
            )}
            {cg.monthlyRate != null && (
              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Monthly</span>
                <span className="mt-1 block text-lg font-extrabold text-gray-900">₹{cg.monthlyRate}</span>
              </div>
            )}
          </div>
          {cg.dailyRate == null && cg.monthlyRate == null && (
            <p className="text-sm text-gray-400">Not yet specified.</p>
          )}
        </section>
      </div>
    </main>
  );
}
