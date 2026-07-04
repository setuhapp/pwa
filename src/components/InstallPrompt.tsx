"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Capture the native Android install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault(); // Prevent Chrome 67 and earlier from automatically showing the prompt
      (window as any).deferredInstallPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for custom trigger event from the InstallButton
    const forceShow = () => {
      setShowPrompt(true);
      // If forced, ensure we show the prompt even if they dismissed it before
      localStorage.removeItem("setuh_pwa_dismissed");
    };
    window.addEventListener("show-install-prompt", forceShow);

    // Check if running in standalone mode (already installed)
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // If already installed, don't show the prompt
    if (standalone) return;

    // Check if dismissed previously
    const dismissedAt = localStorage.getItem("setuh_pwa_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        // Don't show if dismissed within the last 7 days
        return;
      }
    }

    // Detect iOS and Android
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // Show prompt automatically on mobile if not installed
    if (isIosDevice || isAndroidDevice) {
      // Delay slightly so it doesn't interrupt immediate page load
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

  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-safe animate-in slide-in-from-bottom duration-500">
        <div className="relative mx-auto flex max-w-md items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-[0_0_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 backdrop-blur-xl">
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
              Tap <strong className="text-gray-700">Share</strong> below, then select <strong className="text-gray-700">&quot;Add to Home Screen&quot;</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAndroid) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pb-safe animate-in slide-in-from-bottom duration-500">
        <div className="relative mx-auto flex max-w-md items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-[0_0_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 backdrop-blur-xl">
          <button onClick={handleDismiss} className="absolute right-3 top-3 rounded-full bg-gray-100 p-1 text-gray-400 hover:bg-gray-200">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
          
          <div className="flex-1 pr-6">
            <h3 className="text-sm font-bold text-gray-900">Install SETUH App</h3>
            <p className="mt-0.5 text-xs font-medium text-gray-500 leading-tight">
              Check the <strong className="text-gray-700">Home screen  </strong> after clicking the <strong className="text-gray-700">&quot;Install App button &quot;</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
