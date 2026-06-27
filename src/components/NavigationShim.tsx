"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Tier } from "@/lib/viewer";
import { logout } from "@/app/actions/auth";

export function NavigationShim({ 
  children, 
  tier, 
  userType 
}: { 
  children: React.ReactNode; 
  tier: Tier; 
  userType: "caregiver" | "member" | "admin" | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

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
      {/* Top App Bar - Glassmorphism */}
      {!hideTopNav && (
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-center border-b border-gray-200/50 bg-white/70 px-4 shadow-[0_4px_30px_rgb(0,0,0,0.03)] backdrop-blur-xl">
          {showBackButton && (
            <button
              onClick={() => {
                if (canGoBack) router.back();
                else router.push(userType === "caregiver" ? "/caregiver" : "/browse");
              }}
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50/80 text-gray-700 transition-transform active:scale-90"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight text-gray-900">SETUH</h1>
          
          {userType === "caregiver" && (
            <form action={logout} className="absolute right-4">
              <button className="rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 hover:text-red-700 transition-all active:scale-[0.98]">
                Logout
              </button>
            </form>
          )}
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
          {userType !== "caregiver" && (
            <Link
              href={userType === null ? "/" : "/browse"}
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
              <span className="text-[11px] font-semibold tracking-wide">{userType === null ? "Home" : "Browse"}</span>
            </Link>
          )}

          {/* Messages Tab */}
          <Link
            href={userType === null ? "/login?role=member" : "/messages"}
            className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
              pathname.startsWith("/messages")
                ? "text-brand-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.startsWith("/messages") ? 2.5 : 2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[11px] font-semibold tracking-wide">Messages</span>
          </Link>

          {/* Settings / Account Tab */}
          <Link
            href={userType === null ? "/login" : (userType === "caregiver" ? "/caregiver" : "/member/settings")}
            className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
              pathname.startsWith("/member/settings") || pathname.startsWith("/caregiver") || pathname === "/login"
                ? "text-brand-600"
                : "text-gray-400 hover:text-gray-600"
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
            <span className="text-[11px] font-semibold tracking-wide">
              {userType === null ? "Log in" : (userType === "caregiver" ? "Account" : "Settings")}
            </span>
          </Link>
        </nav>
      )}
    </>
  );
}
