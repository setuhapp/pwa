import Link from "next/link";
import type { Caregiver } from "@prisma/client";
import { type PublicCaregiver } from "@/lib/serializers";
import { getTranslations, translateCity } from "@/lib/translations";
import { availabilityLabel } from "@/lib/availability";
import { whatsappLink } from "@/lib/whatsapp";
import { ProfileTabs } from "@/components/ProfileTabs";
import { toggleBookmarkAction } from "@/app/actions/member";

interface CaregiverProfilePreviewProps {
  caregiver: Caregiver | PublicCaregiver;
  canSeeDetails: boolean;
  isOwnProfile?: boolean;
  isLoggedIn?: boolean;
  isVerified?: boolean;
  verifiedAt?: Date | string | null;
  isBookmarked?: boolean;
  lang?: string;
}

function getInitials(nameString: string | null): string {
  if (!nameString) return "CG";
  const parts = nameString.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function CaregiverProfilePreview({
  caregiver,
  canSeeDetails,
  isOwnProfile = false,
  isLoggedIn = false,
  isVerified = false,
  verifiedAt = null,
  isBookmarked = false,
  lang = "en"
}: CaregiverProfilePreviewProps) {
  const cg = caregiver;
  const t = getTranslations(lang);

  // Expose fields conditionally based on access tier
  const phone = "phone" in cg ? cg.phone : null;
  const name = "name" in cg ? cg.name : null;
  const photoUrl = "photoUrl" in cg ? cg.photoUrl : null;
  const summary = cg.summary;

  const displayName = canSeeDetails ? (name || "Anonymous Caregiver") : (lang === "ta" ? "பிரீமியம் பராமரிப்பாளர்" : "Premium Caregiver");
  const initials = getInitials(name);
  const displayCity = translateCity(cg.city || "", lang);
  
  const formattedExp = cg.experienceYears != null 
    ? `${cg.experienceYears} ${lang === "ta" ? "ஆண்டுகள் அனுபவம்" : "yrs experience"}` 
    : (lang === "ta" ? "அனுபவம் குறிப்பிடப்படவில்லை" : "Experience unspecified");

  return (
    <div className="flex flex-col pb-36">
      {/* 1. PROFILE HERO (Blue BG, Avatar, Name & Quick Stats per Mockup) */}
      <div className="phero -mx-6 -mt-6 pt-6 pb-6 px-4 bg-blue text-white rounded-b-3xl shadow-md">
        <div className="phero-top flex gap-[14px] items-center">
          {/* Pavatar */}
          <div className="pavatar w-[72px] height-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-coral to-[#f0884a] flex items-center justify-center text-[26px] font-extrabold text-white flex-shrink-0 border-[2.5px] border-white/25 overflow-hidden shadow-inner">
            {canSeeDetails && photoUrl ? (
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {/* Details stack */}
          <div className="pname-wrap flex-1 min-w-0">
            <h2 className="pname text-[21px] font-extrabold tracking-tight leading-tight">{displayName}</h2>
            <div className="pmeta flex items-center gap-[5px] flex-wrap text-[13.5px] text-white/80 mt-1 font-medium">
              <span>{formattedExp}</span>
              {cg.city && (
                <>
                  <span className="dot w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
                  <span>{displayCity}</span>
                </>
              )}
            </div>
            {/* Verified Pill */}
            <div className="verified-pill inline-flex items-center gap-1.5 bg-green-500/22 text-[#7be3b4] py-1 px-[11px] rounded-full text-xs font-bold mt-2.5 border border-[#7be3b4]/30 select-none">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {isVerified ? t.verified : t.pending_verification}
            </div>
            {/* Availability status */}
            {(() => {
              const av = availabilityLabel(cg, lang);
              return (
                <div className={`ml-2 inline-flex items-center gap-1.5 py-1 px-[11px] rounded-full text-xs font-bold mt-2.5 select-none ${av.available ? "bg-green-tint text-green" : "bg-coral-tint text-coral"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${av.available ? "bg-green" : "bg-coral"}`} />
                  {av.text}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="phero-stats flex mt-5 bg-white/10 rounded-2xl p-1 select-none">
          <div className="phstat flex-1 text-center py-2.5 relative border-r border-white/15">
            <div className="num text-[19px] font-extrabold tracking-tight text-white">
              {cg.priorFamilies ? cg.priorFamilies.replace(/\D/g, "") || "3" : "3"}
            </div>
            <div className="lbl text-[11px] text-white/70 mt-0.5 font-semibold">
              {lang === "ta" ? "குடும்பங்கள்" : "Families served"}
            </div>
          </div>
          <div className="phstat flex-1 text-center py-2.5">
            <div className="num text-[19px] font-extrabold tracking-tight text-white truncate max-w-full px-1 capitalize">
              {cg.availability === "live-in" ? (lang === "ta" ? "தங்குபவர்" : "Live-in") : cg.availability === "part-time" ? (lang === "ta" ? "பகுதி" : "Part-time") : (cg.availability || "Not Available")}
            </div>
            <div className="lbl text-[11px] text-white/70 mt-0.5 font-semibold">
              {lang === "ta" ? "நேரவிருப்பம்" : "Availability"}
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY — always visible, the conversion hook */}
      {summary && (
        <div className="mt-3.5 bg-white rounded-[18px] p-[18px] shadow-sm border border-line/30">
          <p className="text-[15px] leading-relaxed text-ink-2 font-medium">{summary}</p>
        </div>
      )}

      {/* 1.1 LOCK BANNER (If Free Tier) */}
      {!canSeeDetails && (
        <div className="lock-banner mx-0 mt-3.5 bg-gradient-to-br from-blue to-blue-dark rounded-[18px] p-[18px] text-white flex items-center gap-[14px] shadow-sm select-none">
          <div className="lock-ic w-11 h-11 rounded-[13px] bg-white/15 flex items-center justify-center text-xl flex-shrink-0">
            🔒
          </div>
          <div>
            <div className="lt text-[14.5px] font-bold">{t.identity_protected}</div>
            <div className="ls text-[12.5px] text-white/80 mt-0.5 font-medium">{t.free_desc}</div>
          </div>
        </div>
      )}

      {/* 2. SUB-TABS: About / Verification / Timeline */}
      <ProfileTabs
        caregiver={cg}
        canSeeDetails={canSeeDetails}
        isVerified={isVerified}
        verifiedAt={verifiedAt}
        lang={lang}
      />

      {/* 5. STICKY CTA ACTION BAR (Bottom Floating) */}
      {!isOwnProfile && (
        <div className="cta-bar fixed bottom-20 left-0 right-0 p-3 bg-gradient-to-t from-bg via-bg/95 to-transparent flex gap-2.5 z-40 max-w-md mx-auto">
          {canSeeDetails ? (
            <>
              <a
                href={phone ? whatsappLink(phone) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-call flex-1 py-3.5 px-4 rounded-2xl bg-[#25D366] text-white border-none text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] hover:brightness-95 shadow-md"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t.chat_whatsapp}
              </a>
              <form action={toggleBookmarkAction.bind(null, cg.id)}>
                <button 
                  type="submit"
                  className={`btn-save w-[54px] h-[54px] rounded-2xl bg-white border border-line flex items-center justify-center text-xl transition-all active:scale-[0.96] ${isBookmarked ? "text-coral" : "text-ink-3"}`}
                  aria-label="Save"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={isBookmarked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <Link 
              href={!isLoggedIn ? "/login?role=member" : "/member/subscribe"}
              className="btn-call flex-1 py-3.5 px-4 rounded-2xl bg-blue text-white border-none text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] hover:bg-blue-dark shadow-md"
            >
              🔒 {t.subscribe_btn}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
