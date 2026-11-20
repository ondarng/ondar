import React from "react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-28 antialiased">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col gap-5 animate-pulse">
        {/* Top Bar Skeleton */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-200" />
            <div className="h-5 w-24 bg-neutral-200 rounded" />
          </div>
          <div className="w-8 h-8 rounded-full bg-neutral-200" />
        </div>

        {/* Greeting Skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-36 bg-neutral-200 rounded-lg" />
          <div className="h-4 w-48 bg-neutral-100 rounded" />
        </div>

        {/* Store Link Card Skeleton */}
        <div className="h-16 w-full rounded-2xl bg-neutral-100 border border-neutral-200/60" />

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 rounded-2xl bg-neutral-100 border border-neutral-200/60 p-3.5 space-y-2">
            <div className="h-3.5 w-16 bg-neutral-200 rounded" />
            <div className="h-7 w-28 bg-neutral-200 rounded-lg" />
            <div className="h-3 w-20 bg-neutral-200 rounded" />
          </div>
          <div className="h-28 rounded-2xl bg-neutral-100 border border-neutral-200/60 p-3.5 space-y-2">
            <div className="h-3.5 w-16 bg-neutral-200 rounded" />
            <div className="h-7 w-28 bg-neutral-200 rounded-lg" />
            <div className="h-3 w-20 bg-neutral-200 rounded" />
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="h-52 w-full rounded-2xl bg-neutral-100 border border-neutral-200/60 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-neutral-200 rounded" />
            <div className="h-6 w-24 bg-neutral-200 rounded-full" />
          </div>
          <div className="h-32 w-full bg-neutral-200/60 rounded-xl" />
        </div>

        {/* Attention Items Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-16 w-full rounded-2xl bg-neutral-100 border border-neutral-200/60" />
          <div className="h-16 w-full rounded-2xl bg-neutral-100 border border-neutral-200/60" />
        </div>
      </div>

      <MerchantBottomNav active="home" />
    </div>
  );
}
