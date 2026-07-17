import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PHProvider } from "@/components/providers/posthog-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL('https://ondar.shop'),
  title: "Ondar | Sell faster, stress less",
  description: "The simplest storefront for Nigerian social media vendors. Stop copy-pasting bank details and sell professionally via WhatsApp.",
  keywords: ["nigeria ecommerce", "whatsapp selling", "social commerce", "instagram vendor", "storefront"],
  openGraph: {
    title: "Ondar | Sell faster, stress less",
    description: "The simplest storefront for Nigerian social media vendors. Stop copy-pasting bank details and sell professionally.",
    url: "https://ondar.shop",
    siteName: "Ondar",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ondar | Sell faster, stress less",
    description: "The simplest storefront for Nigerian social media vendors.",
    images: ["/og-image.jpg"],
  },
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
