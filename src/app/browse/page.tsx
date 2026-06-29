import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import {
  applyCap,
  buildCaregiverWhere,
  CAREGIVER_ORDER_BY,
  CAREGIVER_PAGE_SIZE,
  type CaregiverFilters,
} from "@/lib/browse";
import { getViewed } from "@/lib/browseSession";
import { toPublicCaregiver, toFullCaregiver, type PublicCaregiver } from "@/lib/serializers";
import type { Caregiver } from "@prisma/client";
import { ProfileCard } from "@/components/ProfileCard";
import { CaregiverFeed } from "@/components/CaregiverFeed";
import { SubscribePrompt } from "@/components/SubscribePrompt";
import { RecordViews } from "@/components/RecordViews";
import { CITIES, SPECIALISATIONS } from "@/lib/constants";
import { cookies } from "next/headers";
import { getTranslations, translateCity, translateSpecialty } from "@/lib/translations";

export default async function BrowsePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { session, tier } = await getViewer();
  const params = await searchParams;
  const viewedIds = await getViewed();

  const lang = (await cookies()).get("lang")?.value || "en";
  const t = getTranslations(lang);

  // Filters (city/specialisation/skill still used as <select> defaults below)
  const city = params.city;
  const specialisation = params.specialisation;
  const skill = params.skill;
  const availableNow = params.available === "now";

  const filters: CaregiverFilters = {
    city,
    specialisation,
    skill,
    available: availableNow ? "now" : undefined,
  };
  const where = buildCaregiverWhere(filters);
  const isAnon = tier === "anon";

  // Anon (incl. unsubscribed members): fetch all + apply the 5-profile cap — no
  // infinite scroll, so the paywall nudge stays intact.
  // Non-anon: fetch only the first page; CaregiverFeed lazy-loads the rest.
  let anonItems: PublicCaregiver[] = [];
  let anonVisibleIds: string[] = [];
  let capped = false;
  let feedItems: Caregiver[] = [];
  let feedHasMore = false;

  if (isAnon) {
    const rawCaregivers = await db.caregiver.findMany({ where, orderBy: CAREGIVER_ORDER_BY });
    const orderedIds = rawCaregivers.map((c) => c.id);
    const validViewedIds = viewedIds.filter((id) => orderedIds.includes(id));
    const cap = applyCap(orderedIds, tier, validViewedIds);
    capped = cap.capped;
    anonVisibleIds = cap.visibleIds;
    anonItems = rawCaregivers.filter((c) => cap.visibleIds.includes(c.id)).map(toPublicCaregiver);
  } else {
    const rows = await db.caregiver.findMany({
      where,
      orderBy: CAREGIVER_ORDER_BY,
      take: CAREGIVER_PAGE_SIZE + 1,
    });
    feedHasMore = rows.length > CAREGIVER_PAGE_SIZE;
    feedItems = rows.slice(0, CAREGIVER_PAGE_SIZE).map(toFullCaregiver);
  }

  return (
    <main className="relative mx-auto flex max-w-md w-full flex-col bg-slate-50 pb-24">
      {/* Dark Hero Background */}
      <div className="absolute inset-x-0 top-0 h-[340px] bg-gradient-to-b from-blue-950 via-blue-900 to-slate-50 rounded-b-[3rem] shadow-sm" />

      <div className="relative z-10 flex flex-col gap-6 p-6 pt-12">
        <div className="mb-2 text-center text-white drop-shadow-md">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.browse_header}</h1>
          <p className="mt-2 text-sm font-medium text-slate-300">{t.browse_sub}</p>
        </div>
        
        <form className="flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/80 p-5 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t.filter_city}</label>
              <div className="relative">
                <select name="city" defaultValue={city || ""} className="w-full appearance-none rounded-xl border border-white/50 bg-white/50 py-3 pl-3 pr-8 text-base font-semibold text-slate-800 outline-none backdrop-blur-sm transition-all focus:bg-white focus:ring-2 focus:ring-slate-900 sm:text-sm shadow-sm">
                  <option value="">{t.filter_anywhere}</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {translateCity(c, lang)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t.filter_specialty}</label>
              <div className="relative">
                <select name="specialisation" defaultValue={specialisation || ""} className="w-full appearance-none rounded-xl border border-white/50 bg-white/50 py-3 pl-3 pr-8 text-base font-semibold text-slate-800 outline-none backdrop-blur-sm transition-all focus:bg-white focus:ring-2 focus:ring-slate-900 sm:text-sm shadow-sm">
                  <option value="">{t.filter_any_specialty}</option>
                  {SPECIALISATIONS.map((s) => (
                    <option key={s} value={s}>
                      {translateSpecialty(s, lang)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t.filter_keyword}</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input name="skill" placeholder={t.filter_placeholder} defaultValue={skill || ""} className="w-full appearance-none rounded-xl border border-white/50 bg-white/50 py-3 pl-10 pr-4 text-base font-semibold text-slate-800 outline-none backdrop-blur-sm transition-all focus:bg-white focus:ring-2 focus:ring-slate-900 sm:text-sm shadow-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{t.filter_availability}</label>
            <div className="relative">
              <select name="available" defaultValue={availableNow ? "now" : ""} className="w-full appearance-none rounded-xl border border-white/50 bg-white/50 py-3 pl-3 pr-8 text-base font-semibold text-slate-800 outline-none backdrop-blur-sm transition-all focus:bg-white focus:ring-2 focus:ring-slate-900 sm:text-sm shadow-sm">
                <option value="">{t.avail_any}</option>
                <option value="now">{t.avail_now}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <button type="submit" className="mt-2 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.98]">
            {t.filter_apply}
          </button>
        </form>

        {isAnon ? (
          <div className="flex flex-col gap-5 mt-2">
            <RecordViews ids={anonVisibleIds} />
            {anonItems.map((cg) => (
              <ProfileCard key={cg.id} caregiver={cg} lang={lang} />
            ))}
            {anonItems.length === 0 && (
              <div className="py-12 text-center rounded-3xl bg-white/50 backdrop-blur-sm border border-white p-6 shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 shadow-inner">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t.no_caregivers_title}</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">{t.no_caregivers_desc}</p>
              </div>
            )}
          </div>
        ) : (
          <CaregiverFeed
            initialItems={feedItems}
            initialHasMore={feedHasMore}
            filters={filters}
            lang={lang}
          />
        )}

        {capped && <div className="mt-4"><SubscribePrompt /></div>}
      </div>
    </main>
  );
}
