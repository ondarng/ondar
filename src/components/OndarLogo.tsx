import React from "react";
import Image from "next/image";

export function OndarLogo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <Image
        src="/ondar-logo.png"
        alt="Ondar"
        width={140}
        height={38}
        className="h-8 w-auto object-contain"
        priority
      />
    </div>
  );
}
