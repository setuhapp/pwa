"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Tier } from "@/lib/viewer";
import { logout } from "@/app/actions/auth";
import { getTranslations } from "@/lib/translations";

export function NavigationShim({ 
  children, 
  tier, 
  userType,
  lang = "en"
}: { 
  children: React.ReactNode; 
  tier: Tier; 
  userType: "caregiver" | "member" | "admin" | null;
  lang?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  const t = getTranslations(lang);

  useEffect(() => {
    setCanGoBack(window.history.length > 2); // basic check for back history
  }, [pathname]);

  // Pages where we don't want the bottom nav to save screen space
  const hideBottomNav =
    userType === "admin" ||
    pathname === "/login" ||
    pathname.startsWith("/caregiver/onboarding");

  // Pages where we don't want the top nav (because they have large desktop headers or are admin panels)
  const hideTopNav = pathname.startsWith("/admin");

  // Back button should only show on nested screens/sub-pages, not on the main dashboard tabs
  const isTopLevel =
    pathname === "/" ||
    pathname === "/browse" ||
    pathname === "/messages" ||
    pathname === "/member/settings" ||
    pathname === "/caregiver";

  const showBackButton = !isTopLevel;

  return (
    <>
      {/* Top App Bar - Solid Blue with White Text per Mockup */}
      {!hideTopNav && (
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-blue text-white px-4 shadow-sm select-none">
          {/* Left: Back Button or spacer */}
          <div className="flex w-10 items-center justify-start flex-shrink-0">
            {showBackButton && (
              <button
                onClick={() => {
                  if (canGoBack) router.back();
                  else router.push(userType === "caregiver" ? "/caregiver" : "/browse");
                }}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-white/12 text-white border-none cursor-pointer transition-all active:scale-90 hover:bg-white/20"
                aria-label="Back"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Center: Title Link */}
          <div className="flex-1 flex justify-center min-w-0">
            <Link href="/" className="text-base font-extrabold tracking-tight text-white hover:opacity-90 active:scale-95 transition-all truncate">
              SETUH
            </Link>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 justify-end flex-shrink-0">
            <button
              onClick={() => {
                const nextLang = lang === "en" ? "ta" : "en";
                document.cookie = `lang=${nextLang}; path=/; max-age=${60 * 60 * 24 * 365}`;
                window.location.reload();
              }}
              className="px-2.5 py-1.5 rounded-full bg-white/14 text-[11px] font-semibold text-white border-none cursor-pointer flex items-center gap-1 transition-all active:scale-95 hover:bg-white/20 select-none"
            >
              <span className={lang === "en" ? "text-white font-extrabold" : "text-white/50"}>EN</span>
              <span className="text-white/30 text-[10px] select-none">|</span>
              <span className={lang === "ta" ? "text-white font-extrabold" : "text-white/50"}>தமிழ்</span>
            </button>
            
            {/* No logout in header */}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 ${hideTopNav ? "" : "pt-16"} ${hideBottomNav ? "" : "pb-24"}`}>
        {children}
      </div>

      {/* Bottom Navigation - Solid White with Line Border per Mockup */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 border-t border-line bg-white pb-safe shadow-sm">
          {/* Home / Browse Tab */}
          {userType !== "caregiver" && (
            <Link
              href={userType === null ? "/" : "/browse"}
              className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
                pathname === "/browse" || pathname === "/" ? "text-blue" : "text-ink-3 hover:text-blue"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {pathname === "/" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/browse" ? 2.5 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                )}
              </svg>
              <span className="text-[11.5px] font-semibold tracking-wide">
                {userType === null ? t.nav_home : t.nav_browse}
              </span>
            </Link>
          )}

          {/* Saved Tab */}
          {userType === "member" && (
            <Link
              href="/member/bookmarks"
              className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
                pathname === "/member/bookmarks" ? "text-blue" : "text-ink-3 hover:text-blue"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/member/bookmarks" ? 2.5 : 2} d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-[11.5px] font-semibold tracking-wide">{t.nav_saved}</span>
            </Link>
          )}

          {/* Messages Tab */}
          <Link
            href={userType === null ? "/login?role=member" : "/messages"}
            className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
              pathname.startsWith("/messages")
                ? "text-blue"
                : "text-ink-3 hover:text-blue"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith("/messages") ? 2.5 : 2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[11.5px] font-semibold tracking-wide">{t.nav_messages}</span>
          </Link>

          {/* Settings / Account Tab */}
          <Link
            href={userType === null ? "/login" : (userType === "caregiver" ? "/caregiver" : "/member/settings")}
            className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
              pathname.startsWith("/member/settings") || pathname.startsWith("/caregiver") || pathname === "/login"
                ? "text-blue"
                : "text-ink-3 hover:text-blue"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {userType === "member" ? (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith("/member/settings") ? 2.5 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith("/member/settings") ? 2.5 : 2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith("/caregiver") || pathname === "/login" ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              )}
            </svg>
            <span className="text-[11.5px] font-semibold tracking-wide">
              {userType === null ? t.nav_login : (userType === "caregiver" ? t.nav_account : t.nav_settings)}
            </span>
          </Link>
        </nav>
      )}
    </>
  );
}
