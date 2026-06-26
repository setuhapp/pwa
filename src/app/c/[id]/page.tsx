import { notFound } from "next/navigation";
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
            
            {/* WhatsApp CTA */}
            {canSeeDetails && (cg as Caregiver).phone && (
              <a 
                href={`https://wa.me/91${(cg as Caregiver).phone}?text=Hi, I found your profile on SETUH and would like to discuss a care requirement.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] transition-transform active:scale-[0.98] hover:bg-[#20bd5a]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.648.85 5.148 2.398 7.215L.823 24l4.908-1.545c2.015 1.455 4.416 2.227 6.953 2.227 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 22.511c-2.226 0-4.417-.597-6.326-1.728l-.454-.27-3.649 1.15.975-3.553-.296-.47C1.107 15.655.453 13.865.453 12.031c0-6.398 5.203-11.601 11.578-11.601 6.375 0 11.601 5.203 11.601 11.601 0 6.398-5.226 11.601-11.601 11.601zM18.4 15.95c-.328-.164-1.922-.953-2.227-1.055-.305-.101-.527-.164-.738.164-.223.328-.856 1.055-1.043 1.277-.188.223-.387.246-.715.082-.328-.164-1.375-.508-2.613-1.617-.961-.867-1.605-1.93-1.793-2.258-.188-.328-.02-.504.145-.668.148-.148.328-.387.492-.574.164-.199.223-.328.328-.551.101-.223.05-.422-.03-.586-.082-.164-.738-1.781-1.008-2.438-.27-.644-.54-.55-.738-.562-.188-.012-.41-.012-.633-.012-.223 0-.586.082-.89.41-.305.328-1.16 1.137-1.16 2.766 0 1.629 1.183 3.211 1.352 3.434.164.223 2.344 3.578 5.672 5.016 3.328 1.437 3.328.961 3.926.89.586-.07 1.922-.785 2.191-1.547.27-.762.27-1.418.188-1.547-.082-.13-.305-.203-.633-.367z"/></svg>
                Message on WhatsApp
              </a>
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

            <a href="/login?role=member" className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98] hover:bg-brand-700">
              Subscribe to View & Message
            </a>
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
