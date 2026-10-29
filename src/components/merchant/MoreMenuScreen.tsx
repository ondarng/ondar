"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  CreditCard,
  ExternalLink,
  Headphones,
  HelpCircle,
  KeyRound,
  Lightbulb,
  Link2,
  LogOut,
  MapPin,
  Settings,
  Share2,
  ShieldCheck,
  Store,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";
import { MerchantBottomNav } from "./MerchantBottomNav";
import { NotificationsModal } from "./NotificationsModal";

interface MoreMenuScreenProps {
  businessName: string;
  storeSlug: string;
  fullStoreUrl: string;
  merchantEmail?: string;
  initials?: string;
  pendingBadgeCount?: number;
  onNavigateTab?: (tab: "home" | "products" | "orders" | "settings") => void;
  onClose?: () => void;
}

export function MoreMenuScreen({
  businessName,
  storeSlug,
  fullStoreUrl,
  merchantEmail,
  initials = "AO",
  pendingBadgeCount = 0,
  onNavigateTab,
  onClose,
}: MoreMenuScreenProps) {
  const router = useRouter();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeFeatureModal, setActiveFeatureModal] = useState<string | null>(null);

  const cleanStoreUrl = fullStoreUrl.replace(/^https?:\/\//, "");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullStoreUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] antialiased text-neutral-900 pb-28">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 mb-4">
          <OndarLogo />

          <div className="flex items-center gap-3 relative">
            {/* Notification Bell with red dot */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="p-1.5 text-neutral-700 hover:text-neutral-900 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Merchant Avatar Circle */}
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1 p-0.5 cursor-pointer rounded-full hover:opacity-90 transition-opacity"
              aria-label="Account menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#064E3B] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                {initials[0] || "A"}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
            </button>

            {/* Quick User Dropdown */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-neutral-200 bg-white p-2.5 shadow-xl animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-sm font-bold text-neutral-900 truncate">
                      {businessName}
                    </p>
                    {merchantEmail && (
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {merchantEmail}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/settings/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 rounded-xl"
                    >
                      <Settings className="w-4 h-4 text-neutral-500" />
                      <span>Business settings</span>
                    </Link>

                    <a
                      href={fullStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 text-xs font-bold text-[#00A859] hover:bg-neutral-50 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5">
                        <Store className="w-4 h-4" />
                        <span>View storefront</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                    </a>
                  </div>

                  <div className="pt-1 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* 1. Top Business Profile Card */}
        <Link
          href="/settings/profile"
          className="rounded-2xl border border-neutral-200/90 bg-white p-3.5 flex items-center justify-between shadow-2xs hover:border-[#00A859]/50 transition-all group mb-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
              <Store className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-neutral-900 tracking-tight truncate group-hover:text-[#00A859] transition-colors">
                {businessName}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5 truncate font-normal">
                View your business profile
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
        </Link>

        {/* 2. STORE SECTION */}
        <div className="mt-4">
          <p className="text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase px-1 mb-2">
            Store
          </p>
          <div className="rounded-2xl border border-neutral-200/90 bg-white divide-y divide-neutral-100 overflow-hidden shadow-2xs">
            {/* Storefront & Website */}
            <Link
              href="/settings/templates"
              className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <Store className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                      Storefront Templates
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F7EF] text-[#00A859]">
                      New Tech Theme
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    Switch between Ondar Minimal and Cyber Electronics
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>

            {/* Share store link */}
            <Link
              href="/storefront?view=share"
              className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <Link2 className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Share store link
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    Get more customers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* 3. SALES & CUSTOMERS SECTION */}
        <div className="mt-5">
          <p className="text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase px-1 mb-2">
            Sales & Customers
          </p>
          <div className="rounded-2xl border border-neutral-200/90 bg-white divide-y divide-neutral-100 overflow-hidden shadow-2xs">
            {/* Customers */}
            <Link
              href="/customers"
              className="w-full text-left p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <Users className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Customers
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    View and manage your customers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>

            {/* Sales & Analytics */}
            <Link
              href="/dashboard"
              className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <BarChart2 className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Sales & Analytics
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    Track performance and reports
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>

            {/* Coupons & Discounts */}
            <button
              type="button"
              onClick={() => setActiveFeatureModal("Coupons & Discounts")}
              className="w-full text-left p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <Tag className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Coupons & Discounts
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    Create and manage offers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* 4. PAYMENTS & PAYSTACK SECTION (HIGH PRIORITY & SENSITIVE) */}
        <div className="mt-5">
          <p className="text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase px-1 mb-2">
            Payments & Keys
          </p>
          <div className="rounded-2xl border border-neutral-200/90 bg-white divide-y divide-neutral-100 overflow-hidden shadow-2xs">
            {/* Paystack Integration */}
            <Link
              href="/settings/payments"
              className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <CreditCard className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                      Paystack Online Payments
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F7EF] text-[#00A859]">
                      Live BYOK
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    API keys, Ondar 1% subaccount & fee bearer
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>

            {/* Bank details & Payouts */}
            <Link
              href="/settings/payouts"
              className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Bank Account & Direct Transfer
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    Verified settlement bank for customer transfers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* 5. DELIVERY & SHIPPING SECTION */}
        <div className="mt-5">
          <p className="text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase px-1 mb-2">
            Delivery & Shipping
          </p>
          <div className="rounded-2xl border border-neutral-200/90 bg-white divide-y divide-neutral-100 overflow-hidden shadow-2xs">
            {/* Shipping & Delivery */}
            <Link
              href="/settings/shipping"
              className="w-full text-left p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <Truck className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Shipping & Delivery
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    Set up delivery rates and options
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>

            {/* Delivery zones */}
            <Link
              href="/settings/shipping"
              className="w-full text-left p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <MapPin className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Delivery zones
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    Manage states and areas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* 5. SETTINGS & SUPPORT SECTION */}
        <div className="mt-5">
          <p className="text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase px-1 mb-2">
            Settings & Support
          </p>
          <div className="rounded-2xl border border-neutral-200/90 bg-white divide-y divide-neutral-100 overflow-hidden shadow-2xs">
            {/* Business settings */}
            <Link
              href="/settings/profile"
              className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <Settings className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Business settings
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    Profile, bank details, payout settings
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </Link>

            {/* Help & Support */}
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
              className="w-full text-left p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] flex-shrink-0">
                  <Headphones className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                    Help & Support
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-normal truncate">
                    FAQs, contact us, and more
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* 6. Need help? Banner Card */}
        <button
          type="button"
          onClick={() => setIsHelpModalOpen(true)}
          className="mt-5 rounded-2xl border border-[#A7F3D0]/60 bg-[#ECFDF5] hover:bg-[#E1F9ED] p-3.5 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00A859]/15 flex items-center justify-center text-[#00A859] flex-shrink-0">
              <Lightbulb className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 leading-tight">
                Need help?
              </p>
              <p className="text-xs text-neutral-600 font-normal mt-0.5 truncate">
                Check out our help center for quick answers.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#00A859] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>
      </div>

      {/* 5-Tab Merchant Bottom Nav with More Active */}
      <MerchantBottomNav active="more" pendingBadgeCount={pendingBadgeCount} />

      {/* Share Store Link Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-3xl bg-white p-5 space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#00A859]" />
                <h3 className="text-lg font-black text-neutral-900">
                  Share store link
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Customers can browse all your products, place orders, and pay directly on this link.
            </p>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-neutral-200">
              <span className="text-xs font-semibold text-[#00A859] break-all select-all pr-2">
                {cleanStoreUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-[#00A859] text-white text-xs font-bold hover:bg-[#00964E] transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Check out my store on Ondar: ${fullStoreUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 rounded-2xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                Share on WhatsApp
              </a>
              <a
                href={fullStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 rounded-2xl border border-neutral-200 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit shop
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-3xl bg-white p-5 space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#00A859]" />
                <h3 className="text-lg font-black text-neutral-900">
                  Help & Support
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Have questions about your inventory, payouts or orders? The Ondar merchant support team is available to assist you.
            </p>

            <div className="space-y-2">
              <a
                href="https://wa.me/2348000000000?text=Hello%20Ondar%20Support%2C%20I%20need%20help%20with%20my%20store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Chat on WhatsApp with Support
              </a>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full h-12 rounded-2xl border border-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Preview Modal */}
      {activeFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-3xl bg-white p-5 space-y-3 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900">
                {activeFeatureModal}
              </h3>
              <button
                type="button"
                onClick={() => setActiveFeatureModal(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              {activeFeatureModal === "Notifications"
                ? "You have no unread merchant alerts. Order updates and payments will appear here."
                : activeFeatureModal === "Customers"
                ? "Customer database keeps track of every buyer who checked out on your storefront."
                : activeFeatureModal === "Coupons & Discounts"
                ? "Promotional discount codes can be shared with customers for checkout discounts."
                : activeFeatureModal === "Shipping & Delivery"
                ? "Configure flat rate delivery fees and pickup options for orders in Lagos and nationwide."
                : "Manage delivery rates by state and local government areas across Nigeria."}
            </p>

            <button
              type="button"
              onClick={() => setActiveFeatureModal(null)}
              className="w-full h-12 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs mt-2"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Notifications Live Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
