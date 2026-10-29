import React from "react";

export function StoreLiveIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Decorative Sparkles */}
      <path
        d="M24 38L26 31L33 29L26 27L24 20L22 27L15 29L22 31L24 38Z"
        fill="#10B981"
        fillOpacity="0.7"
      />
      <path
        d="M102 36L103.5 31L108 29.5L103.5 28L102 23L100.5 28L96 29.5L100.5 31L102 36Z"
        fill="#10B981"
        fillOpacity="0.7"
      />
      <circle cx="106" cy="56" r="2.5" fill="#10B981" fillOpacity="0.5" />
      <circle cx="18" cy="52" r="2" fill="#10B981" fillOpacity="0.5" />

      {/* Phone Body Frame */}
      <rect
        x="36"
        y="16"
        width="56"
        height="88"
        rx="14"
        fill="#FFFFFF"
        stroke="#10B981"
        strokeWidth="2.5"
        filter="drop-shadow(0 4px 12px rgba(16, 185, 129, 0.15))"
      />
      {/* Phone Screen Background */}
      <rect x="40" y="20" width="48" height="80" rx="10" fill="#F8FAFC" />

      {/* Store Awning / Canopy on Phone Top */}
      <path
        d="M34 26C34 22 36 19 40 18H88C92 19 94 22 94 26L92 34C92 36 90 38 87 38C84 38 82 36 82 34C82 36 80 38 77 38C74 38 72 36 72 34C72 36 70 38 67 38C64 38 62 36 62 34C62 36 60 38 57 38C54 38 52 36 52 34C52 36 50 38 47 38C44 38 42 36 42 34C42 36 40 38 37 38C34 38 34 35 34 34L34 26Z"
        fill="#00A859"
      />
      {/* Canopy Stripes */}
      <path d="M43 18L43 38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M53 18L53 38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M63 18L63 38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M73 18L73 38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <path d="M83 18L83 38" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

      {/* Product Display Card inside screen */}
      <rect x="46" y="44" width="36" height="38" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      {/* T-Shirt Product graphic */}
      <path
        d="M58 50C59 52 61 53 64 53C67 53 69 52 70 50L75 52L72 57L69 56V68H59V56L56 57L53 52L58 50Z"
        fill="#1E293B"
      />

      {/* Floating Shopping Cart Badge */}
      <g filter="drop-shadow(0 2px 6px rgba(0, 168, 89, 0.3))">
        <circle cx="88" cy="88" r="14" fill="#00A859" />
        {/* Shopping Cart Icon */}
        <path
          d="M82 83H83.5L85 89H91L92.5 85H84.5"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="85.5" cy="91.5" r="1" fill="#FFFFFF" />
        <circle cx="90.5" cy="91.5" r="1" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
