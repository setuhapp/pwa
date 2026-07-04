"use client";

import { useEffect, useState } from "react";

export function InstallButton() {
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  // If the app is already installed and running standalone, don't show the button
  if (isStandalone) return null;

  const handleInstallClick = async () => {
    // Always trigger our custom instruction banner/message first so it immediately displays
    window.dispatchEvent(new Event('show-install-prompt'));

    // If we caught the native browser prompt, trigger it on top of the banner
    if ((window as any).deferredInstallPrompt) {
      try {
        const promptEvent = (window as any).deferredInstallPrompt;
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          (window as any).deferredInstallPrompt = null;
        }
      } catch (err) {
        console.error("Error showing native install prompt:", err);
      }
    }
  };

  return (
    <button 
      onClick={handleInstallClick}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-4 text-center text-lg font-bold text-white shadow-lg shadow-slate-600/30 transition-all hover:bg-slate-700 active:scale-[0.98]"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Install App
    </button>
  );
}
