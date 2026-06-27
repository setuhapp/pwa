import { Geist, Geist_Mono } from "next/font/google";
import { NavigationShim } from "@/components/NavigationShim";
import { InstallPrompt } from "@/components/InstallPrompt";
import { getViewer } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#172554",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
  
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <NavigationShim tier={tier} userType={session?.userType ?? null}>{children}</NavigationShim>
        <InstallPrompt />
      </body>
    </html>
  );
}
