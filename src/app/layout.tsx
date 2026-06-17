import type { Metadata } from "next";
// import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PHProvider } from "@/components/providers/posthog-provider";

const inter = { variable: "font-inter" };
const plusJakartaSans = { variable: "font-outfit" };

export const metadata: Metadata = {
  title: "Ondar | Sell faster, stress less",
  description: "The simplest storefront for Nigerian social media vendors.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ondar",
  },
};

export const viewport = {
  themeColor: "#00A859",
};

import { PWARegistration } from "@/components/pwa-registration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PWARegistration />
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}
