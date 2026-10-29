import React from "react";

export function InventoryBoxIllustration({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Isometric 3D Box Outline */}
      <path
        d="M32 10L52 21.5V42.5L32 54L12 42.5V21.5L32 10Z"
        stroke="#00A859"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top Face Center Line */}
      <path
        d="M32 10V32"
        stroke="#00A859"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left Face Divider */}
      <path
        d="M12 21.5L32 32"
        stroke="#00A859"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Face Divider */}
      <path
        d="M52 21.5L32 32"
        stroke="#00A859"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Plus Symbol on Right Front */}
      <path
        d="M45 35V45"
        stroke="#00A859"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M40 40H50"
        stroke="#00A859"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
