"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/StorefrontCartContext";

interface StorefrontHeaderProps {
  businessName: string;
  storeSlug: string;
  city?: string;
  subtitle?: string | null;
}

export function StorefrontHeader({
  businessName,
  storeSlug,
  city = "Lagos",
  subtitle = "Everyday pieces, thoughtfully chosen",
}: StorefrontHeaderProps) {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="w-full max-w-[440px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand name and location/tagline */}
        <Link
          href={`/s/${storeSlug}`}
          className="flex flex-col hover:opacity-90 transition-opacity text-left"
        >
          <span className="text-lg font-bold text-gray-900 tracking-tight leading-snug">
            {businessName}
          </span>
          <span className="text-xs text-gray-500 font-normal leading-tight truncate max-w-[270px]">
            {city}
            {subtitle ? ` · ${subtitle}` : ""}
          </span>
        </Link>

        {/* Cart Bag Button */}
        <Link
          href={`/s/${storeSlug}/cart`}
          className="w-10 h-10 rounded-full bg-[#E8F8EF] flex items-center justify-center text-[#00A859] relative transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
          aria-label="Shopping bag"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#00A859] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {totalCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
