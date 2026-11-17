import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { VersionSync } from "@/components/VersionSync";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ondar.ng"),
  title: "Ondar — Sell Faster, Stress Less",
  description: "The simplest way for a solo Nigerian merchant to get paid and keep track.",
  icons: {
    icon: "/ondar-icon.png",
    apple: "/ondar-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#FDFDFD] text-neutral-900 antialiased">
        <VersionSync />
        {children}
      </body>
    </html>
  );
}
