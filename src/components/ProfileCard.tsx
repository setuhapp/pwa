import Link from "next/link";
import { type PublicCaregiver } from "@/lib/serializers";
import type { Caregiver } from "@prisma/client";
import { TiltCard } from "@/components/TiltCard";
import { translateCity, translateSpecialty } from "@/lib/translations";

export function ProfileCard({ caregiver, lang = "en" }: { caregiver: PublicCaregiver | Caregiver; lang?: string }) {
  const isPublic = !("name" in caregiver);
  const hasImage = !isPublic && !!(caregiver as Caregiver).photoUrl;
  
  const rawSkills = caregiver.skills ? JSON.parse(caregiver.skills) : [];
  const skillsToDisplay = rawSkills.length > 0 
    ? rawSkills.slice(0, 2).map((s: string) => translateSpecialty(s, lang)).join(", ") + (rawSkills.length > 2 ? "..." : "")
    : "—";

  return (
    <TiltCard maxRotation={5} scale={1.01} className="w-full">
      <div className="group relative h-full overflow-hidden rounded-[2rem] border border-white bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-slate-300/60 active:scale-[0.98]">
        <div className="flex gap-4">
          {/* Avatar Area */}
          <div className={`relative flex-shrink-0 overflow-hidden shadow-inner ring-1 ring-black/5 ${hasImage ? "h-20 w-20 rounded-2xl" : "h-14 w-14 rounded-full"}`}>
            {hasImage ? (
              <img src={(caregiver as Caregiver).photoUrl!} alt="Profile" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
            ) : (
              <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-950 via-slate-800 to-slate-900">
                <div className="absolute inset-0 bg-gray-200 opacity-20 mix-blend-normal"></div>
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white/80 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Header Area */}
          <div className="flex-1 py-1">
            {isPublic ? (
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-[10px] font-bold tracking-widest text-brand-700 ring-1 ring-brand-500/20">
                <svg className="h-3 w-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                {lang === "ta" ? "சுயவிவரம் பாதுகாக்கப்பட்டது" : "HIDDEN PROFILE"}
              </div>
            ) : (
              <h3 className="text-xl font-extrabold tracking-tight text-blue-950">{(caregiver as Caregiver).name}</h3>
            )}
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
              {caregiver.city && <span>{translateCity(caregiver.city, lang)}</span>}
              {caregiver.city && caregiver.experienceYears != null && <span>•</span>}
              {caregiver.experienceYears != null && (
                <span>
                  {lang === "ta" ? `${caregiver.experienceYears} வருட அனுபவம்` : `${caregiver.experienceYears} yrs exp`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {lang === "ta" ? "திறன்கள்" : "Skills"}
            </span>
            <span className="mt-1 text-sm font-semibold text-slate-700 truncate">
              {skillsToDisplay}
            </span>
          </div>
          <div className="flex flex-col border-l border-slate-200 pl-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {lang === "ta" ? "கட்டணம்" : "Rate"}
            </span>
            <span className="mt-1 text-sm font-bold text-blue-950 truncate">
              {caregiver.dailyRate 
                ? `₹${caregiver.dailyRate}/${lang === "ta" ? "நாள்" : "day"}` 
                : caregiver.monthlyRate 
                  ? `₹${caregiver.monthlyRate}/${lang === "ta" ? "மாதம்" : "mo"}` 
                  : "—"}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <Link href={`/c/${caregiver.id}`} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-950 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:bg-blue-900 active:scale-[0.98]">
            {lang === "ta" ? "முழு சுயவிவரம் காண்க" : "View Full Profile"}
            <svg className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
