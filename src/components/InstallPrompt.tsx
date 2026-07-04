"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [showPrompt, setShowPrompt] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ isMobile: false, isSafari: false, isChromeOrEdge: false });

  useEffect(() => {
    // Capture the native Android/Chrome install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for custom trigger event from the InstallButton
    const forceShow = () => {
      setShowPrompt(true);
      localStorage.removeItem("setuh_pwa_dismissed");
    };
    window.addEventListener("show-install-prompt", forceShow);

    // Check if running in standalone mode (already installed)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if dismissed previously
    const dismissedAt = localStorage.getItem("setuh_pwa_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Detect browser/device info
    const ua = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /iphone|ipad|ipod|android/.test(ua);
    const isSafariBrowser = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android");
    const isChromeOrEdgeBrowser = ua.includes("chrome") || ua.includes("edg") || ua.includes("chromium");

    setBrowserInfo({
      isMobile: isMobileDevice,
      isSafari: isSafariBrowser,
      isChromeOrEdge: isChromeOrEdgeBrowser,
    });

    // Show prompt automatically on mobile if not installed
    if (isMobileDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("show-install-prompt", forceShow);
      };
    }
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("show-install-prompt", forceShow);
    };
  }, []);

  if (!showPrompt || isStandalone) return null;

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("setuh_pwa_dismissed", Date.now().toString());
  };

  // Determine message to display based on device type
  let installInstruction = "Check the Home screen after clicking the \"Install App button \".";
  if (!browserInfo.isMobile) {
    if (browserInfo.isSafari) {
      installInstruction = "To install on Mac: Go to File > Add to Dock in Safari's top menu.";
    } else if (browserInfo.isChromeOrEdge) {
      installInstruction = "To install on your laptop: Click the Install icon in the browser address bar at the top right.";
    } else {
      installInstruction = "To install on your laptop: Open your browser's menu and select Install or Add to Applications.";
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-safe animate-in slide-in-from-bottom duration-500">
      <div className="relative mx-auto flex max-w-md items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-[0_0_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 backdrop-blur-xl text-gray-900">
        <button onClick={handleDismiss} className="absolute right-3 top-3 rounded-full bg-gray-100 p-1 text-gray-400 hover:bg-gray-200">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        
        <div className="flex-1 pr-6">
          <h3 className="text-sm font-bold text-gray-900">Install SETUH App</h3>
          <p className="mt-0.5 text-xs font-medium text-gray-500 leading-tight">
            {installInstruction}
          </p>
        </div>
      </div>
    </div>
  );
}
