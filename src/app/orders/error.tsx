"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";
import { RefreshCw, ShoppingBag, ArrowLeft } from "lucide-react";

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Orders page error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-28 antialiased flex flex-col justify-between">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-4 shadow-2xs">
          <ShoppingBag className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-neutral-900 mb-2">
          Could not load orders
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-[300px] mb-6">
          A temporary network delay prevented loading your orders list. Tap below to reload your orders.
        </p>

        <div className="w-full max-w-[280px] space-y-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-[#00A859] hover:bg-[#008f4c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload orders</span>
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

      <MerchantBottomNav active="orders" />
    </div>
  );
}
