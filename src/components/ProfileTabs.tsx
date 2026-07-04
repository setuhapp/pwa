"use client";

import { useState } from "react";
import type { Caregiver } from "@prisma/client";
import { type PublicCaregiver } from "@/lib/serializers";
import { parseStringArray } from "@/lib/json";
import { getTranslations, translateSpecialty } from "@/lib/translations";

type TabKey = "about" | "verification" | "timeline";

function formatMonthYear(d: Date | string | null | undefined, lang: string): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "ta" ? "ta-IN" : "en-IN", { month: "short", year: "numeric" }).format(date);
}

export function ProfileTabs({
  caregiver,
  canSeeDetails,
  isVerified,
  verifiedAt,
  lang = "en",
}: {
  caregiver: Caregiver | PublicCaregiver;
  canSeeDetails: boolean;
  isVerified: boolean;
  verifiedAt?: Date | string | null;
  lang?: string;
}) {
  const cg = caregiver;
  const t = getTranslations(lang);
  const [tab, setTab] = useState<TabKey>("about");

  const skills = parseStringArray(cg.skills);
  const specs = parseStringArray(cg.specialisations);
  const langs = parseStringArray("languages" in cg ? cg.languages : null);
  const workHistory = ("workHistory" in cg ? cg.workHistory : null) ?? "";
  const events = workHistory.split("\n").map((l) => l.trim()).filter(Boolean);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "about", label: t.tab_about },
    { key: "verification", label: t.tab_verification },
    { key: "timeline", label: t.tab_timeline },
  ];

  const label = (s: string) => (
    <div className="text-[11px] font-bold uppercase tracking-wider text-ink-3 mb-2">{s}</div>
  );

  return (
    <div className="mt-3.5">
      {/* Tab bar */}
      <div className="flex border-b border-line select-none">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`flex-1 pb-2.5 pt-1 text-[13.5px] font-bold border-b-2 -mb-px transition-colors ${
              tab === tb.key ? "border-blue text-blue" : "border-transparent text-ink-3 hover:text-ink-2"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="bg-white mt-3.5 rounded-[18px] p-[18px] shadow-sm border border-line/30">
        {tab === "about" && (
          <div className="flex flex-col gap-5">
            {(skills.length > 0 || specs.length > 0) ? (
              <div className="flex flex-col gap-4">
                {skills.length > 0 && (
                  <div>
                    {label(t.core_skills)}
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <span key={s} className="py-2 px-3.5 rounded-[11px] text-[13.5px] font-bold bg-coral-tint text-coral leading-none">
                          {translateSpecialty(s, lang)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {specs.length > 0 && (
                  <div>
                    {label(t.specialisations)}
                    <div className="flex flex-wrap gap-2">
                      {specs.map((s) => (
                        <span key={s} className="py-2 px-3.5 rounded-[11px] text-[13.5px] font-bold bg-[#efe9fb] text-[#6d4aae] leading-none">
                          {translateSpecialty(s, lang)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-3">{t.no_skills}</p>
            )}

            {langs.length > 0 && (
              <div>
                {label(lang === "ta" ? "அறிந்த மொழிகள்" : "Languages known")}
                <div className="flex flex-wrap gap-2">
                  {langs.map((l) => (
                    <span key={l} className="py-2 px-3.5 rounded-[11px] text-[13.5px] font-bold bg-indigo-50 text-indigo-700 leading-none">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            <div>
              {label(t.experience)}
              <div className="flex flex-col gap-1 text-[14px] text-ink">
                {cg.experienceYears != null && (
                  <div>{cg.experienceYears} {lang === "ta" ? "ஆண்டுகள் அனுபவம்" : "years experience"}</div>
                )}
                {cg.priorFamilies && <div className="text-ink-2">{cg.priorFamilies}</div>}
                {cg.qualifications && (
                  <div className="text-ink-2">{t.qualifications}: {cg.qualifications}</div>
                )}
                {cg.experienceYears == null && !cg.priorFamilies && !cg.qualifications && (
                  <div className="text-ink-3">{t.not_specified}</div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div>
              {label(t.expected_pricing)}
              <div className="flex gap-2.5">
                <div className="flex-1 border border-line rounded-[14px] p-3.5">
                  <div className="text-[12px] text-ink-3 font-semibold">{t.daily_rate}</div>
                  <div className="text-[21px] font-extrabold text-ink mt-1 tracking-tight">
                    {cg.dailyRate ? `₹${cg.dailyRate.toLocaleString()}` : "—"}
                  </div>
                </div>
                <div className="flex-1 border-[1.5px] border-blue bg-blue-tint-2 rounded-[14px] p-3.5">
                  <div className="text-[12px] text-ink-3 font-semibold">
                    {lang === "ta" ? "மாதாந்திர · தங்குதல்" : "Monthly · live-in"}
                  </div>
                  <div className="text-[21px] font-extrabold text-ink mt-1 tracking-tight">
                    {cg.monthlyRate ? `₹${cg.monthlyRate.toLocaleString()}` : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "verification" && (
          <div className="flex flex-col gap-3">
            <div className={`inline-flex items-center gap-2 self-start py-1.5 px-3 rounded-full text-sm font-bold ${isVerified ? "bg-green-tint text-green" : "bg-[#fbf1e0] text-amber"}`}>
              <span className="text-base">{isVerified ? "✓" : "!"}</span>
              {isVerified
                ? `${t.verified_on}${formatMonthYear(verifiedAt, lang) ? ` · ${formatMonthYear(verifiedAt, lang)}` : ""}`
                : t.pending_verification}
            </div>
            <p className="text-[13.5px] text-ink-2 leading-relaxed">
              {isVerified ? t.verification_note : t.verification_pending_note}
            </p>
          </div>
        )}

        {tab === "timeline" && (
          <div>
            {events.length > 0 ? (
              <ol className="flex flex-col">
                {events.map((ev, i) => (
                  <li key={i} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-blue flex-shrink-0" />
                      {i < events.length - 1 && <span className="w-px flex-1 bg-line mt-1" />}
                    </div>
                    <div className="text-[14px] text-ink leading-snug pb-1">{ev}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-ink-3">{t.timeline_empty}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
