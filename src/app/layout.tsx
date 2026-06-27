import { Plus_Jakarta_Sans } from "next/font/google";
import { NavigationShim } from "@/components/NavigationShim";
import { InstallPrompt } from "@/components/InstallPrompt";
import { getViewer } from "@/lib/session";
import { cookies } from "next/headers";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#172554",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SETUH",
  description: "Find Verified Elder Caregivers You Can Trust.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SETUH",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, tier } = await getViewer();
  const lang = (await cookies()).get("lang")?.value || "en";
  
  return (
    <html
      lang={lang}
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <NavigationShim tier={tier} userType={session?.userType ?? null} lang={lang}>{children}</NavigationShim>
        <InstallPrompt />
      </body>
    </html>
  );
}
