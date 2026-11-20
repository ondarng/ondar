import React from "react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";

export default function SettingsLoading() {
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

        {/* Profile Card Skeleton */}
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-neutral-100" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-neutral-200 rounded" />
              <div className="h-3 w-40 bg-neutral-100 rounded" />
            </div>
          </div>
        </div>

        {/* Setting Group 1 Skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-16 bg-neutral-200 rounded" />
          <div className="rounded-2xl border border-neutral-200/60 bg-white divide-y divide-neutral-100 overflow-hidden shadow-2xs">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-neutral-200 rounded" />
                    <div className="h-3 w-36 bg-neutral-100 rounded" />
                  </div>
                </div>
                <div className="w-4 h-4 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <MerchantBottomNav active="settings" />
    </div>
  );
}
