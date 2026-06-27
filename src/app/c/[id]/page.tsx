import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { parseStringArray } from "@/lib/json";
import type { Caregiver } from "@prisma/client";

import { toPublicCaregiver, toFullCaregiver } from "@/lib/serializers";

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rawCg = await db.caregiver.findUnique({ where: { id } });

  if (!rawCg) notFound();

  if (rawCg.isHidden) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6">
        <p className="text-center text-gray-600">This profile is currently unavailable.</p>
      </main>
    );
  }

  const { tier, session } = await getViewer();
  const canSeeDetails =
    tier === "member" ||
    tier === "admin" ||
    (session?.userType === "caregiver" && session.userId === rawCg.id);

  const cg = canSeeDetails ? toFullCaregiver(rawCg) : toPublicCaregiver(rawCg);

  const skills = parseStringArray(cg.skills);
  const specs = parseStringArray(cg.specialisations);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      {/* Identity section */}
      <section className="relative flex flex-col items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {"name" in cg ? (
          <>
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-brand-50 shadow-inner">
              {(cg as Caregiver).photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(cg as Caregiver).photoUrl!}
                  alt={(cg as Caregiver).name ?? "Caregiver photo"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl text-gray-400">
                  👤
                </div>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{(cg as Caregiver).name}</h1>
              
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-brand-600/20">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-600/20">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Trained
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-0.5 text-sm font-medium text-gray-500">
                {(cg as Caregiver).address && <p>{(cg as Caregiver).address}</p>}
                {cg.city && <p>{cg.city}</p>}
                {(cg as Caregiver).phone && <p className="text-gray-900 mt-1">{(cg as Caregiver).phone}</p>}
              </div>
            </div>
            
            {/* Message CTA */}
            {canSeeDetails && (cg as Caregiver).phone && (
              <div className="mt-2 flex w-full">
                <Link 
                  href={`/messages/${rawCg.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98] hover:bg-brand-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Message in App
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-gray-50 shadow-inner">
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl text-gray-300">
                ?
              </div>
            </div>
            <div className="text-center">
              <span className="inline-block rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 ring-1 ring-orange-600/20">
                Identity hidden
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">Subscribe to view</h1>
              {cg.city && <p className="mt-1 text-sm font-medium text-gray-500">{cg.city}</p>}
            </div>

            <Link href={!session ? "/login?role=member" : "/member/subscribe"} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98] hover:bg-brand-700">
              Subscribe to View & Message
            </Link>
          </>
        )}
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
    </main>
  );
}
