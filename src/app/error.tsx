"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { OndarLogo } from "@/components/OndarLogo";
import { RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 flex flex-col justify-between items-center px-4 py-8 antialiased">
      <div className="w-full max-w-[420px] mx-auto flex flex-col items-center text-center my-auto">
        <div className="mb-6">
          <OndarLogo />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-4 shadow-2xs">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-neutral-900 mb-2">
          Unable to load this screen
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-[320px] mb-6">
          A temporary connection delay occurred while retrieving your data. Your orders and shop are safe.
        </p>

        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-[#00A859] hover:bg-[#008f4c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload screen</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {error?.digest && (
          <p className="text-[10px] text-neutral-400 mt-6 font-mono">
            Ref: {error.digest}
          </p>
        )}
      </div>

      <p className="text-[11px] text-neutral-400 text-center">
        Ondar · Commerce built for Nigeria
      </p>
    </div>
  );
}
