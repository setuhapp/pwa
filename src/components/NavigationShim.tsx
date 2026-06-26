"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Tier } from "@/lib/viewer";

export function NavigationShim({ children, tier }: { children: React.ReactNode; tier: Tier }) {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 2); // basic check for back history
  }, [pathname]);

  // Pages where we don't want the bottom nav to save screen space
  const hideBottomNav =
    pathname === "/login" ||
    pathname.startsWith("/caregiver/onboarding");

  // Pages where we don't want the top nav (because they have large hero headers)
  const hideTopNav = pathname === "/" || pathname === "/browse";

  // Determine top bar title based on route
  let title = "SETUH";
  if (pathname === "/browse") title = "Browse";
  else if (pathname.startsWith("/c/")) title = "Profile";
  else if (pathname === "/login") title = "Sign In";
  else if (pathname.startsWith("/member")) title = "Member Area";
  else if (pathname.startsWith("/caregiver")) title = "Caregiver Area";

  return (
    <>
      {/* Top App Bar - Glassmorphism */}
      {!hideTopNav && (
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-center border-b border-gray-200/50 bg-white/70 px-4 shadow-[0_4px_30px_rgb(0,0,0,0.03)] backdrop-blur-xl">
          {pathname !== "/" && pathname !== "/browse" && (
            <button
              onClick={() => {
                if (canGoBack) router.back();
                else router.push("/browse");
              }}
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50/80 text-gray-700 transition-transform active:scale-90"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight text-gray-900">{title}</h1>
        </header>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 ${hideTopNav ? "" : "pt-16"} ${hideBottomNav ? "" : "pb-24"}`}>
        {children}
      </div>

      {/* Bottom Navigation - Glassmorphism */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 border-t border-gray-200/50 bg-white/80 pb-safe shadow-[0_-4px_30px_rgb(0,0,0,0.03)] backdrop-blur-xl">
          {/* Home / Browse Tab */}
          {tier !== "caregiver" && (
            <Link
              href={tier === "anon" ? "/" : "/browse"}
              className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
                pathname === "/browse" || pathname === "/" ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {pathname === "/" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === "/browse" ? 2.5 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                )}
              </svg>
              <span className="text-[11px] font-semibold tracking-wide">{tier === "anon" ? "Home" : "Browse"}</span>
            </Link>
          )}

          {/* Account Tab */}
          <Link
            href={tier === "anon" ? "/login" : (tier === "caregiver" ? "/caregiver" : "/member")}
            className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
              pathname.startsWith("/member") || pathname.startsWith("/caregiver") || pathname === "/login"
                ? "text-brand-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith("/member") || pathname.startsWith("/caregiver") ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[11px] font-semibold tracking-wide">{tier === "anon" ? "Log in" : "Account"}</span>
          </Link>
        </nav>
      )}
    </>
  );
}
