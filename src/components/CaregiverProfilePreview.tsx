import Link from "next/link";
import type { Caregiver } from "@prisma/client";
import { type PublicCaregiver } from "@/lib/serializers";
import { parseStringArray } from "@/lib/json";
import { getTranslations, translateCity, translateSpecialty } from "@/lib/translations";
import { availabilityLabel } from "@/lib/availability";
import { whatsappLink } from "@/lib/whatsapp";
import { toggleBookmarkAction } from "@/app/actions/member";

interface CaregiverProfilePreviewProps {
  caregiver: Caregiver | PublicCaregiver;
  canSeeDetails: boolean;
  isOwnProfile?: boolean;
  isLoggedIn?: boolean;
  isVerified?: boolean;
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
  isBookmarked = false,
  lang = "en"
}: CaregiverProfilePreviewProps) {
  const cg = caregiver;
  const skills = parseStringArray(cg.skills);
  const specs = parseStringArray(cg.specialisations);
  const langs = parseStringArray("languages" in cg ? cg.languages : null);
  const t = getTranslations(lang);

  // Expose fields conditionally based on access tier
  const phone = "phone" in cg ? cg.phone : null;
  const name = "name" in cg ? cg.name : null;
  const photoUrl = "photoUrl" in cg ? cg.photoUrl : null;
  const address = "address" in cg ? cg.address : null;

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

      {/* 2. SKILLS & EXPERTISE CARD */}
      <div className="section bg-white mx-0 mt-3.5 rounded-[18px] p-[18px] shadow-sm border border-line/30">
        <div className="section-head flex items-center gap-[9px] mb-[15px] select-none">
          <div className="section-ic w-[30px] h-[30px] rounded-[9px] bg-coral-tint flex items-center justify-center text-[15px] flex-shrink-0">
            🩺
          </div>
          <div className="section-title text-[15px] font-bold tracking-tight text-ink">
            {t.skills_expertise}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mb-4">
            <div className="chip-label text-[12px] font-bold text-ink-3 mb-[9px] tracking-wider uppercase">{t.core_skills}</div>
            <div className="chips flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="chip py-2 px-3.5 rounded-[11px] text-[13.5px] font-bold bg-coral-tint text-coral leading-none">
                  {s === "bedridden" ? (lang === "ta" ? "படுக்கை நோயாளி" : "Bedridden") : s === "injection" ? (lang === "ta" ? "ஊசி போடுதல்" : "Injection") : s === "mobility-assist" ? (lang === "ta" ? "இயக்க உதவி" : "Mobility-assist") : s}
                </span>
              ))}
            </div>
          </div>
        )}

        {specs.length > 0 && (
          <div>
            <div className="chip-label text-[12px] font-bold text-ink-3 mb-[9px] tracking-wider uppercase">{t.specialisations}</div>
            <div className="chips flex flex-wrap gap-2">
              {specs.map((s) => (
                <span key={s} className="chip spec py-2 px-3.5 rounded-[11px] text-[13.5px] font-bold bg-[#efe9fb] text-[#6d4aae] leading-none">
                  {s === "bedridden" ? (lang === "ta" ? "படுக்கை நோயாளி" : "Bedridden") : s === "post-op" ? (lang === "ta" ? "அறுவை சிகிச்சைக்கு பின்" : "Post-op") : s}
                </span>
              ))}
            </div>
          </div>
        )}

        {skills.length === 0 && specs.length === 0 && (
          <p className="text-sm text-ink-3 text-center py-2">{t.no_skills}</p>
        )}
      </div>

      {/* 2.1 LANGUAGES KNOWN CARD */}
      {langs.length > 0 && (
        <div className="section bg-white mx-0 mt-3.5 rounded-[18px] p-[18px] shadow-sm border border-line/30">
          <div className="section-head flex items-center gap-[9px] mb-[15px] select-none">
            <div className="section-ic w-[30px] h-[30px] rounded-[9px] bg-indigo-50 flex items-center justify-center text-[15px] flex-shrink-0">
              🗣️
            </div>
            <div className="section-title text-[15px] font-bold tracking-tight text-ink">
              {lang === "ta" ? "அறிந்த மொழிகள்" : "Languages known"}
            </div>
          </div>
          <div className="chips flex flex-wrap gap-2">
            {langs.map((l) => (
              <span key={l} className="chip py-2 px-3.5 rounded-[11px] text-[13.5px] font-bold bg-indigo-50 text-indigo-700 leading-none">
                {l === "English" ? (lang === "ta" ? "ஆங்கிலம்" : "English") : l === "Tamil" ? (lang === "ta" ? "தமிழ்" : "Tamil") : l === "Hindi" ? (lang === "ta" ? "இந்தி" : "Hindi") : l === "Malayalam" ? (lang === "ta" ? "மலையாளம்" : "Malayalam") : l === "Kannada" ? (lang === "ta" ? "கன்னடம்" : "Kannada") : l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. VERIFICATION TIMELINE CARD */}
      <div className="section bg-white mx-0 mt-3.5 rounded-[18px] p-[18px] shadow-sm border border-line/30">
        <div className="section-head flex items-center gap-[9px] mb-[15px] select-none">
          <div className="section-ic w-[30px] h-[30px] rounded-[9px] bg-green-tint flex items-center justify-center text-[15px] flex-shrink-0">
            🛡️
          </div>
          <div>
            <div className="section-title text-[15px] font-bold tracking-tight text-ink">
              {lang === "ta" ? "சரிபார்ப்பு விவரங்கள்" : "Verification details"}
            </div>
            <div className="section-sub text-[12.5px] text-ink-3 font-semibold mt-0.5">
              {lang === "ta" ? "சரிபார்க்கப்பட்டவை மற்றும் தேதி" : "What we checked, and when"}
            </div>
          </div>
        </div>

        {/* Verification rows */}
        <div className="flex flex-col">
          <div className="vrow flex items-center gap-3 py-3 border-b border-line">
            <div className={`vcheck w-[26px] h-[26px] rounded-lg flex items-center justify-center text-[13px] font-extrabold flex-shrink-0 ${isVerified ? "bg-green-tint text-green" : "bg-[#fbf1e0] text-amber"}`}>
              {isVerified ? "✓" : "!"}
            </div>
            <div className="vlabel flex-1 text-sm font-bold text-ink">
              {lang === "ta" ? "ஆதார் கார்டு அடையாளம்" : "Aadhaar identity check"}
            </div>
            <div className="vdate text-xs text-ink-3 font-semibold">
              {isVerified ? (lang === "ta" ? "மே 2025" : "May 2025") : (lang === "ta" ? "நிலுவையில் உள்ளது" : "Pending")}
            </div>
          </div>

          <div className="vrow flex items-center gap-3 py-3 border-b border-line">
            <div className={`vcheck w-[26px] h-[26px] rounded-lg flex items-center justify-center text-[13px] font-extrabold flex-shrink-0 ${isVerified ? "bg-green-tint text-green" : "bg-[#fbf1e0] text-amber"}`}>
              {isVerified ? "✓" : "!"}
            </div>
            <div className="vlabel flex-1 text-sm font-bold text-ink">
              {lang === "ta" ? "பின்னணி சரிபார்ப்பு" : "Background check"}
            </div>
            <div className="vdate text-xs text-ink-3 font-semibold">
              {isVerified ? (lang === "ta" ? "மே 2025" : "May 2025") : (lang === "ta" ? "நிலுவையில் உள்ளது" : "Pending")}
            </div>
          </div>

          <div className="vrow flex items-center gap-3 py-3 border-b border-line">
            <div className={`vcheck w-[26px] h-[26px] rounded-lg flex items-center justify-center text-[13px] font-extrabold flex-shrink-0 ${isVerified ? "bg-green-tint text-green" : "bg-[#fbf1e0] text-amber"}`}>
              {isVerified ? "✓" : "!"}
            </div>
            <div className="vlabel flex-1 text-sm font-bold text-ink">
              {lang === "ta" ? "பரிந்துரைகள் சரிபார்க்கப்பட்டது" : "References called"}
            </div>
            <div className="vdate text-xs text-ink-3 font-semibold">
              {isVerified ? (lang === "ta" ? "ஏப் 2025" : "Apr 2025") : (lang === "ta" ? "நிலுவையில் உள்ளது" : "Pending")}
            </div>
          </div>

          <div className="vrow flex items-center gap-3 py-3">
            <div className="vcheck pending w-[26px] h-[26px] rounded-lg bg-[#fbf1e0] text-amber flex items-center justify-center text-[13px] font-extrabold flex-shrink-0">
              !
            </div>
            <div className="vlabel flex-1 text-sm font-bold text-ink">
              {lang === "ta" ? "அடுத்த சரிபார்ப்பு சுழற்சி" : "Next verification cycle"}
            </div>
            <div className="vdate text-xs text-ink-3 font-semibold">
              {lang === "ta" ? "ஏப் 2026" : "Due Apr 2026"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. EXPECTED RATE CARD */}
      <div className="section bg-white mx-0 mt-3.5 rounded-[18px] p-[18px] shadow-sm border border-line/30">
        <div className="section-head flex items-center gap-[9px] mb-[15px] select-none">
          <div className="section-ic w-[30px] h-[30px] rounded-[9px] bg-blue-tint flex items-center justify-center text-[15px] flex-shrink-0">
            💰
          </div>
          <div>
            <div className="section-title text-[15px] font-bold tracking-tight text-ink">
              {t.expected_pricing}
            </div>
            <div className="section-sub text-[12.5px] text-ink-3 font-semibold mt-0.5">
              {lang === "ta" ? "பராமரிப்பாளரால் நிர்ணயிக்கப்பட்டது" : "Set by the caregiver"}
            </div>
          </div>
        </div>

        <div className="rate-grid flex gap-2.5">
          <div className="rate-card flex-1 border border-line rounded-[14px] p-3.5">
            <div className="rlbl text-[12px] text-ink-3 font-semibold">{t.daily_rate}</div>
            <div className="rval text-[21px] font-extrabold text-ink mt-1 tracking-tight">
              {cg.dailyRate ? `₹${cg.dailyRate.toLocaleString()}` : "—"}
            </div>
          </div>
          <div className="rate-card primary flex-1 border-[1.5px] border-blue bg-blue-tint-2 rounded-[14px] p-3.5">
            <div className="rlbl text-[12px] text-ink-3 font-semibold">
              {lang === "ta" ? "மாதாந்திர · தங்குதல்" : "Monthly · live-in"}
            </div>
            <div className="rval text-[21px] font-extrabold text-ink mt-1 tracking-tight">
              {cg.monthlyRate ? `₹${cg.monthlyRate.toLocaleString()}` : "—"}
            </div>
          </div>
        </div>
      </div>

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
