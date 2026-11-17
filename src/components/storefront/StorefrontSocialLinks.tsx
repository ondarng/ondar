"use client";

import React from "react";
import { formatToWhatsappNumber } from "@/lib/phone";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { XIcon } from "@/components/icons/XIcon";

export interface StorefrontSocialLinksProps {
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  whatsappNumber?: string | null;
  className?: string;
  variant?: "pills" | "compact" | "footer";
}

/**
 * Normalizes an Instagram input to a valid URL and clean handle.
 */
function parseInstagram(input?: string | null) {
  if (!input || !input.trim()) return null;
  let handle = input.trim();
  handle = handle.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  handle = handle.replace(/^@/, "");
  handle = handle.replace(/\/.*$/, "");
  if (!handle) return null;
  return {
    handle: `@${handle}`,
    url: `https://instagram.com/${handle}`,
  };
}

/**
 * Normalizes a Twitter / X input to a valid URL and clean handle.
 */
function parseTwitter(input?: string | null) {
  if (!input || !input.trim()) return null;
  let handle = input.trim();
  handle = handle.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "");
  handle = handle.replace(/^@/, "");
  handle = handle.replace(/\/.*$/, "");
  if (!handle) return null;
  return {
    handle: `@${handle}`,
    url: `https://x.com/${handle}`,
  };
}

/**
 * Normalizes a TikTok input to a valid URL and clean handle.
 */
function parseTiktok(input?: string | null) {
  if (!input || !input.trim()) return null;
  let handle = input.trim();
  handle = handle.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "");
  handle = handle.replace(/^@/, "");
  handle = handle.replace(/\/.*$/, "");
  if (!handle) return null;
  return {
    handle: `@${handle}`,
    url: `https://tiktok.com/@${handle}`,
  };
}

export function StorefrontSocialLinks({
  instagram,
  tiktok,
  twitter,
  whatsappNumber,
  className = "",
  variant = "pills",
}: StorefrontSocialLinksProps) {
  const ig = parseInstagram(instagram);
  const tt = parseTiktok(tiktok);
  const xTw = parseTwitter(twitter);
  const cleanWa = whatsappNumber ? formatToWhatsappNumber(whatsappNumber) : null;
  const waUrl = cleanWa ? `https://wa.me/${cleanWa}` : null;

  if (!ig && !tt && !xTw && !waUrl) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {ig && (
          <a
            href={ig.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-all hover:scale-105"
            aria-label={`Visit Instagram profile ${ig.handle}`}
          >
            <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
          </a>
        )}
        {xTw && (
          <a
            href={xTw.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 flex items-center justify-center transition-all hover:scale-105"
            aria-label={`Visit X profile ${xTw.handle}`}
          >
            <XIcon className="w-3.5 h-3.5 text-black" />
          </a>
        )}
        {tt && (
          <a
            href={tt.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-all hover:scale-105"
            aria-label={`Visit TikTok profile ${tt.handle}`}
          >
            <TikTokIcon className="w-4 h-4 text-black" />
          </a>
        )}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {ig && (
        <a
          href={ig.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 text-[11px] font-semibold transition-all shadow-2xs hover:border-neutral-300 active:scale-95"
        >
          <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
          <span>{ig.handle}</span>
        </a>
      )}

      {xTw && (
        <a
          href={xTw.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 text-[11px] font-semibold transition-all shadow-2xs hover:border-neutral-300 active:scale-95"
        >
          <XIcon className="w-3 h-3 text-black" />
          <span>{xTw.handle}</span>
        </a>
      )}

      {tt && (
        <a
          href={tt.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 text-[11px] font-semibold transition-all shadow-2xs hover:border-neutral-300 active:scale-95"
        >
          <TikTokIcon className="w-3.5 h-3.5 text-black" />
          <span>{tt.handle}</span>
        </a>
      )}

      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 text-[11px] font-semibold transition-all shadow-2xs active:scale-95"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
          <span>WhatsApp</span>
        </a>
      )}
    </div>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.37 6.37 0 0 0-.86-.06A6.34 6.34 0 0 0 3.1 15.7a6.34 6.34 0 0 0 10.83 4.48c.36-.36.68-.76.94-1.2v-7.2a8.16 8.16 0 0 0 4.72 1.49v-3.5a4.83 4.83 0 0 1-.03-.08z" />
    </svg>
  );
}
