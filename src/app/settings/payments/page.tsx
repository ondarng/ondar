import React from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";

export default function PaymentSettingsPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-16 antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="w-full max-w-[480px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/more"
            className="p-2 -ml-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-900">
            <CreditCard className="w-4 h-4 text-[#00A859]" />
            <span>Paystack Online Payments</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="w-full max-w-[480px] mx-auto px-4 pt-6 space-y-5">
        {/* Coming Soon Showcase Card */}
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F7EF] text-[#00A859] flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7 stroke-[2]" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold mb-1">
              <span>Coming Soon</span>
            </div>
            <h1 className="text-lg font-bold text-neutral-900">
              Paystack Card Payments (BYOK)
            </h1>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
              Bring Your Own Keys (BYOK) will allow merchants to connect their personal or corporate Paystack account. Card checkout and custom gateway settlement are currently in private beta and will be rolled out to all stores soon.
            </p>
          </div>

          {/* Current Supported Methods Callout */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <ShieldCheck className="w-4 h-4 text-[#00A859]" />
              <span>Active Payment System: Direct Bank Transfer</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              All orders in your shop currently settle directly via instant bank transfer with automated reference tracking into your verified bank account.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/settings/payouts"
              className="w-full h-11 bg-[#00A859] hover:bg-[#00924c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <span>Manage Bank Payout Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/more"
              className="w-full h-11 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
            >
              <span>Back to Menu</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
