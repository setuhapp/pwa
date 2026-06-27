import Link from "next/link";
import type { Caregiver } from "@prisma/client";
import { type PublicCaregiver } from "@/lib/serializers";
import { parseStringArray } from "@/lib/json";

interface CaregiverProfilePreviewProps {
  caregiver: Caregiver | PublicCaregiver;
  canSeeDetails: boolean;
  isOwnProfile?: boolean;
  isLoggedIn?: boolean;
  isVerified?: boolean;
}

export function CaregiverProfilePreview({
  caregiver,
  canSeeDetails,
  isOwnProfile = false,
  isLoggedIn = false,
  isVerified = false,
}: CaregiverProfilePreviewProps) {
  const cg = caregiver;
  const skills = parseStringArray(cg.skills);
  const specs = parseStringArray(cg.specialisations);

  // Read only values that are exposed
  const phone = "phone" in cg ? cg.phone : null;
  const name = "name" in cg ? cg.name : null;
  const photoUrl = "photoUrl" in cg ? cg.photoUrl : null;
  const address = "address" in cg ? cg.address : null;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. IDENTITY & BIO HEADER */}
      <section className="relative flex flex-col items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        {canSeeDetails ? (
          <>
            {/* Photo Avatar */}
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-brand-50 shadow-inner">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name ?? "Caregiver photo"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl text-gray-400">
                  👤
                </div>
              )}
            </div>
            {/* Identity details */}
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{name || "Incomplete Profile"}</h1>
              
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${isVerified ? "bg-brand-100 text-brand-700 ring-1 ring-brand-500/20" : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"}`}>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {isVerified ? "Verified" : "Pending Verification"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-600/20">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.708.523L4.547 7.05h1.996a.75.75 0 000-1.5H5.856l.72-2.16 2.062 6.184a.75.75 0 001.424 0l1.458-4.375 1.458 4.375a.75.75 0 001.424 0l2.062-6.184.72 2.16h-.687a.75.75 0 000 1.5h1.996l-1.012-3.072a.75.75 0 00-.708-.523h-1.996a.75.75 0 00-.708.523l-.75 2.25L12.75 4.547a.75.75 0 00-.708-.523H9.957a.75.75 0 00-.708.523l-.75 2.25-.75-2.25a.75.75 0 00-.708-.523H6.267z" />
                  </svg>
                  Trained
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-0.5 text-sm font-medium text-gray-500">
                {address && (
                  <p className="flex items-center justify-center gap-1">
                    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {address}
                  </p>
                )}
                {cg.city && (
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{cg.city}</p>
                )}
                {phone && (
                  <p className="flex items-center justify-center gap-1.5 font-bold text-gray-900 mt-2">
                    <svg className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {phone}
                  </p>
                )}
              </div>
            </div>
            
            {/* CTA action for other users viewing profile */}
            {!isOwnProfile && (
              <div className="mt-2 flex w-full">
                <Link 
                  href={`/messages/${cg.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98] hover:bg-brand-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message in App
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Hidden Identity Avatar */}
            <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-gray-50 shadow-inner bg-gray-100 flex items-center justify-center">
              <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="inline-block rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-700 ring-1 ring-orange-600/20">
                Identity Protected
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">Premium Profile</h2>
              {cg.city && <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-gray-400">{cg.city}</p>}
            </div>

            {/* Subscribe Prompt CTA */}
            <Link 
              href={!isLoggedIn ? "/login?role=member" : "/member/subscribe"} 
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98] hover:bg-brand-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m-2 2a2 2 0 012-2m-2-2a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2m-2-2H6" />
              </svg>
              Subscribe to View & Message
            </Link>
          </>
        )}
      </section>

      {/* 2. PROFESSIONAL DETAILS - ICON GRID */}
      <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Professional Profile</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Qualifications Row */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50/50 p-4 border border-slate-100/50">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Qualifications</span>
              <span className="truncate block text-sm font-extrabold text-gray-800" title={cg.qualifications || "Not specified"}>
                {cg.qualifications || "-"}
              </span>
            </div>
          </div>

          {/* Experience Years Row */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50/50 p-4 border border-slate-100/50">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Experience</span>
              <span className="truncate block text-sm font-extrabold text-gray-800">
                {cg.experienceYears != null ? `${cg.experienceYears} Years` : "-"}
              </span>
            </div>
          </div>

          {/* Prior Families Row */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50/50 p-4 border border-slate-100/50">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Families Served</span>
              <span className="truncate block text-sm font-extrabold text-gray-800" title={cg.priorFamilies || "Not specified"}>
                {cg.priorFamilies || "-"}
              </span>
            </div>
          </div>

          {/* Availability Row */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50/50 p-4 border border-slate-100/50">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Availability</span>
              <span className="truncate block text-sm font-extrabold text-gray-800 capitalize" title={cg.availability || "Not specified"}>
                {cg.availability || "-"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SKILLS & SPECIALISATIONS */}
      <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Skills &amp; Expertise</h2>
        
        {skills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400/80 mb-2">Core Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-700 border border-brand-100/30">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {specs.length > 0 && (
          <div className={`${skills.length > 0 ? "mt-2 pt-2 border-t border-gray-50" : ""}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400/80 mb-2">Specialisations</h3>
            <div className="flex flex-wrap gap-2">
              {specs.map((s) => (
                <span key={s} className="rounded-full bg-purple-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-purple-700 border border-purple-100/30">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {skills.length === 0 && specs.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-2">No skills or specialisations specified yet.</p>
        )}
      </section>

      {/* 4. RATE CARD */}
      <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Expected Pricing</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {cg.dailyRate != null ? (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/10 p-4 border border-emerald-100/20">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">Daily Rate</span>
                <span className="block text-base font-extrabold text-gray-900">₹{cg.dailyRate}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50/50 p-4 text-center border border-gray-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Daily Rate</span>
              <span className="mt-1 block text-sm font-semibold text-gray-400">Not specified</span>
            </div>
          )}

          {cg.monthlyRate != null ? (
            <div className="flex items-center gap-3 rounded-2xl bg-blue-50/10 p-4 border border-blue-100/20">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600/70">Monthly Rate</span>
                <span className="block text-base font-extrabold text-gray-900">₹{cg.monthlyRate}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50/50 p-4 text-center border border-gray-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Monthly Rate</span>
              <span className="mt-1 block text-sm font-semibold text-gray-400">Not specified</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
