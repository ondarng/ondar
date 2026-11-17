"use client";

import React from "react";
import { formatToWhatsappNumber, getWhatsappChatUrl } from "@/lib/phone";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface StorefrontFloatingWhatsappProps {
  whatsappNumber?: string | null;
  phoneNumber?: string | null;
  businessName: string;
  productName?: string;
  priceNaira?: number | string;
  bottomOffsetClass?: string; // e.g. "bottom-6" or "bottom-24"
}

export function StorefrontFloatingWhatsapp({
  whatsappNumber,
  phoneNumber,
  businessName,
  productName,
  priceNaira,
  bottomOffsetClass = "bottom-6",
}: StorefrontFloatingWhatsappProps) {
  const cleanNumber = formatToWhatsappNumber(whatsappNumber || phoneNumber);

  if (!cleanNumber) return null;

  const greeting = productName
    ? `Hello ${businessName}! I'm viewing "${productName}"${
        priceNaira ? ` (₦${Number(priceNaira).toLocaleString("en-NG")})` : ""
      } on your store and would like to ask a question.`
    : `Hello ${businessName}! I'm browsing your store on Ondar and have a question.`;

  const waUrl = getWhatsappChatUrl(cleanNumber, greeting);

  return (
    <aside
      aria-label="Contact store on WhatsApp"
      className={`fixed ${bottomOffsetClass} right-4 z-40 flex items-center justify-end select-none print:hidden`}
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${businessName} on WhatsApp`}
        title="Chat on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.58)] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* Subtle online pulse ring */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 border-2 border-white shadow-xs" />
        </span>

        {/* Real WhatsApp Icon */}
        <WhatsAppIcon className="w-8 h-8 text-white drop-shadow-xs" />
      </a>
    </aside>
  );
}
