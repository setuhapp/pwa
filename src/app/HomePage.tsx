"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TiltCard } from "@/components/TiltCard";
import { InstallButton } from "@/components/InstallButton";
import type { SessionInfo, Tier } from "@/lib/viewer";

interface HomePageClientProps {
  session: SessionInfo;
  tier: Tier;
  t: Record<string, string>;
}

export function HomePageClient({ session, tier, t }: HomePageClientProps) {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  const isAnon = !session;
  const isCaregiver = session?.userType === "caregiver";
  const isAdmin = session?.userType === "admin";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-blue via-blue to-blue-dark p-4 sm:p-8 text-white">
      {/* Decorative Blur */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-brand-500/20 blur-[80px]" />

      <main className="relative z-10 flex w-full max-w-md flex-col justify-center rounded-none bg-transparent p-2 sm:rounded-3xl sm:border sm:border-white/10 sm:bg-white/5 sm:p-8 sm:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sm:backdrop-blur-md">
        <div className="relative z-10 mb-6 flex flex-col items-center text-center">
          <TiltCard maxRotation={20} scale={1.05} className="mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white p-2 shadow-xl overflow-hidden border border-white/20 select-none">
              <img src="/logo.png" alt="Setuh Logo" className="h-full w-full object-contain" />
            </div>
          </TiltCard>
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg mb-2">
            {t.brand_name || "Setuh"}
          </h1>
          <div className="h-1 w-12 bg-brand-500 rounded-full mb-4"></div>
          <p className="mt-2 text-lg font-medium text-blue-100/90 leading-snug">
            {t.tagline || "Connecting families with specialized caregivers."}
          </p>

          <InstallButton />
        </div>

        {isStandalone ? (
          /* Standalone PWA Home View */
          <div className="relative z-10 flex flex-col gap-4 mt-2 animate-fade-in">
            {!isCaregiver && !isAdmin && (
              <Link
                href="/browse"
                className="group relative flex items-center justify-center overflow-hidden rounded-2xl bg-white px-4 py-4 text-center text-lg font-bold text-blue shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-transform active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isAnon ? t.browse_caregivers : t.continue_browsing}
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            )}

            {isAnon ? (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Link
                  href="/login?role=member"
                  className="flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3.5 text-sm font-semibold backdrop-blur-md ring-1 ring-white/20 transition-all hover:bg-white/20 active:scale-[0.98]"
                >
                  {t.family_sign_in}
                </Link>
                <Link
                  href="/login?role=caregiver"
                  className="flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3.5 text-sm font-semibold backdrop-blur-md ring-1 ring-white/20 transition-all hover:bg-white/20 active:scale-[0.98]"
                >
                  {t.caregiver_sign_in}
                </Link>
              </div>
            ) : (
              <Link
                href={isAdmin ? "/admin" : isCaregiver ? "/caregiver" : "/member/settings"}
                className="flex items-center justify-center rounded-2xl bg-white/10 px-4 py-4 text-center text-lg font-semibold backdrop-blur-md ring-1 ring-white/20 transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                {isAdmin ? t.go_to_admin : t.go_to_dashboard}
              </Link>
            )}

            <div className="mt-4 flex justify-center">
              <Link
                href="/admin"
                className="text-xs font-medium text-blue-200/50 hover:text-blue-200 transition-colors py-2 px-4 rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                {t.admin_portal}
              </Link>
            </div>
          </div>
        ) : (
          /* Web Browser Home View (Marketing / Install Instructions Only) */
          <div className="relative z-10 flex flex-col gap-6 mt-2 text-center animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-blue-100 backdrop-blur-md">
              <p className="font-semibold text-white mb-2">About SETUH</p>
              <p>
                SETUH is a platform dedicated to connecting families in Chennai seeking caregiver assistance for dementia, elderly care, and support attender needs with verified, experienced, and trait-led caregivers.
              </p>
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <Link
                href="/terms"
                className="text-xs font-bold text-blue-200/50 underline transition-colors hover:text-blue-200 py-2 px-4"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
