"use client";

import Link from "next/link";
import { Home, Menu, Package, Settings, ShoppingBag } from "lucide-react";

type MerchantTab = "home" | "products" | "orders" | "settings" | "more";

interface MerchantBottomNavProps {
  active: MerchantTab;
  pendingBadgeCount?: number;
  onMore?: () => void;
}

export function MerchantBottomNav({
  active,
  pendingBadgeCount = 0,
  onMore,
}: MerchantBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80">
      <div className="w-full max-w-[430px] mx-auto flex items-center justify-between px-6 py-2.5">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 transition-colors ${
            active === "home" ? "text-[#00A859]" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className={`text-[11px] ${active === "home" ? "font-bold" : "font-medium"}`}>Home</span>
        </Link>

        <Link
          href="/inventory"
          className={`flex flex-col items-center gap-1 transition-colors ${
            active === "products" ? "text-[#00A859]" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Package className="w-5 h-5" />
          <span className={`text-[11px] ${active === "products" ? "font-bold" : "font-medium"}`}>
            Products
          </span>
        </Link>

        <Link
          href="/orders"
          className={`flex flex-col items-center gap-1 transition-colors relative ${
            active === "orders" ? "text-[#00A859]" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {pendingBadgeCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingBadgeCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] ${active === "orders" ? "font-bold" : "font-medium"}`}>
            Orders
          </span>
        </Link>

        <Link
          href="/settings/profile"
          className={`flex flex-col items-center gap-1 transition-colors ${
            active === "settings" ? "text-[#00A859]" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className={`text-[11px] ${active === "settings" ? "font-bold" : "font-medium"}`}>
            Settings
          </span>
        </Link>

        {onMore ? (
          <button
            type="button"
            onClick={onMore}
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              active === "more" ? "text-[#00A859]" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className={`text-[11px] ${active === "more" ? "font-bold" : "font-medium"}`}>More</span>
          </button>
        ) : (
          <Link
            href="/more"
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
              active === "more" ? "text-[#00A859]" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className={`text-[11px] ${active === "more" ? "font-bold" : "font-medium"}`}>More</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
