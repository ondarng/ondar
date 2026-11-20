import React from "react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";

export default function InventoryLoading() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-28 antialiased">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col gap-4 animate-pulse">
        {/* Top Header Skeleton */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-200" />
            <div className="h-5 w-24 bg-neutral-200 rounded" />
          </div>
          <div className="w-8 h-8 rounded-full bg-neutral-200" />
        </div>

        {/* Store Card Skeleton */}
        <div className="rounded-2xl border border-neutral-200/60 bg-neutral-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-neutral-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-neutral-200 rounded" />
              <div className="h-3 w-20 bg-neutral-200 rounded" />
            </div>
          </div>
          <div className="h-9 w-28 bg-neutral-200 rounded-xl" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-10 flex-1 bg-neutral-100 border border-neutral-200/60 rounded-xl" />
          <div className="h-10 w-10 bg-neutral-100 border border-neutral-200/60 rounded-xl" />
        </div>

        {/* Category Pills Skeleton */}
        <div className="flex gap-2 overflow-x-hidden">
          <div className="h-8 w-16 bg-neutral-200 rounded-full" />
          <div className="h-8 w-20 bg-neutral-100 rounded-full" />
          <div className="h-8 w-24 bg-neutral-100 rounded-full" />
        </div>

        {/* Product Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl border border-neutral-200/60 bg-white flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-neutral-100 flex-shrink-0" />
                <div className="space-y-2 min-w-0">
                  <div className="h-4 w-32 bg-neutral-200 rounded" />
                  <div className="h-3.5 w-20 bg-neutral-200 rounded" />
                  <div className="h-3 w-16 bg-neutral-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-14 bg-neutral-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <MerchantBottomNav active="products" />
    </div>
  );
}
