import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PHProvider } from "@/components/providers/posthog-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-outfit", // Keep the CSS variable name the same for simplicity
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ondar | Sell faster, stress less",
  description: "The simplest storefront for Nigerian social media vendors.",
  manifest: "/manifest.json",
  themeColor: "#00A859",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ondar",
  },
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
