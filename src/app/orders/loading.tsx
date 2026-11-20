import React from "react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";

export default function OrdersLoading() {
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

        {/* Tab Pills Skeleton */}
        <div className="flex bg-neutral-100 p-1 rounded-xl gap-1">
          <div className="h-9 flex-1 bg-white rounded-lg shadow-xs" />
          <div className="h-9 flex-1 bg-transparent rounded-lg" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-10 flex-1 bg-neutral-100 border border-neutral-200/60 rounded-xl" />
          <div className="h-10 w-10 bg-neutral-100 border border-neutral-200/60 rounded-xl" />
        </div>

        {/* Order Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-neutral-200/60 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-28 bg-neutral-200 rounded" />
                <div className="h-5 w-16 bg-neutral-100 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-neutral-200 rounded" />
                  <div className="h-3 w-20 bg-neutral-100 rounded" />
                </div>
                <div className="h-5 w-20 bg-neutral-200 rounded" />
              </div>
              <div className="h-9 w-full bg-neutral-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      <MerchantBottomNav active="orders" />
    </div>
  );
}
