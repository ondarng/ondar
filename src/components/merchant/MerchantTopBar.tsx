"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OndarLogo } from "@/components/OndarLogo";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  Loader2,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react";

interface MerchantTopBarProps {
  businessName: string;
  location: string;
  initials: string;
  merchantEmail: string;
  fullStoreUrl: string;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  hasNotifications?: boolean;
}

export function MerchantTopBar({
  businessName,
  location,
  initials,
  merchantEmail,
  fullStoreUrl,
  menuOpen,
  onMenuOpenChange,
  hasNotifications = false,
}: MerchantTopBarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex items-center justify-between py-3 mb-4">
      <OndarLogo />

      <div className="flex items-center gap-2.5 relative">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => {}}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-800 relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-neutral-800" />
          {hasNotifications && (
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 border border-white" />
          )}
        </button>

        {/* User Profile Avatar with dropdown trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => onMenuOpenChange(!menuOpen)}
            className="flex items-center gap-1 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#064E3B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
          </button>

          {/* User Dropdown Popover */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => onMenuOpenChange(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-white border border-neutral-200/80 shadow-xl py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="text-xs font-bold text-neutral-900 truncate">
                    {businessName}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {merchantEmail}
                  </p>
                </div>

                <Link
                  href="/settings/profile"
                  onClick={() => onMenuOpenChange(false)}
                  className="w-full px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-neutral-500" />
                  <span>Business Profile</span>
                </Link>

                <Link
                  href="/settings/payouts/reauth/password"
                  onClick={() => onMenuOpenChange(false)}
                  className="w-full px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                >
                  <Wallet className="w-4 h-4 text-neutral-500" />
                  <span>Payout Settings</span>
                </Link>

                <a
                  href={fullStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onMenuOpenChange(false)}
                  className="w-full px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-neutral-500" />
                  <span>View Storefront</span>
                </a>

                <div className="border-t border-neutral-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 text-red-600" />
                    )}
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
