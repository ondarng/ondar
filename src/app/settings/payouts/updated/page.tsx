"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OndarLogo } from "@/components/OndarLogo";
import {
  HelpCircle,
  Building2,
  CheckCircle2,
  LayoutDashboard,
  Mail,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function PayoutAccountUpdatedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between items-center px-6 py-8 antialiased selection:bg-[#00A859]/20 selection:text-[#00A859] pb-16">
      <div className="w-full max-w-[390px] mx-auto flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between pt-2 pb-6">
          <OndarLogo />
          <button
            type="button"
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium py-1 px-2 rounded-lg"
          >
            <HelpCircle className="w-4 h-4 text-neutral-500" />
            <span>Help</span>
          </button>
        </header>

        {/* Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900 mb-2">
            Payout account
            <br />
            updated<span className="text-[#00A859]">.</span>
          </h1>
          <p className="text-[14px] leading-relaxed text-neutral-500 font-normal">
            You’ve confirmed your new bank account. Future payouts will go to the account below.
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2.5 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
            <span>Store live</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
            <span>Payments active</span>
          </span>
        </div>

        {/* Bank Account Details Card */}
        <div className="p-5 rounded-2xl border border-neutral-200 bg-white mb-6 shadow-xs">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#059669]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Guaranty Trust Bank</h2>
              <p className="text-sm text-neutral-500 font-normal mt-0.5">0123456789</p>
            </div>
          </div>

          <hr className="border-t border-neutral-100 my-3" />

          <div>
            <span className="text-xs text-neutral-400 font-normal">
              Confirmed account holder
            </span>
            <p className="text-base font-black text-neutral-900 tracking-wide mt-1 uppercase">
              ADA OKAFOR
            </p>
          </div>
        </div>

        {/* Protection Notice Section */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-neutral-900 mb-3">Your account is protected</h2>

          <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-4 shadow-xs">
            {/* Notice 1 */}
            <div className="flex items-start gap-3">
              <div className="text-[#059669] mt-0.5">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Recorded on your dashboard</p>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Security alert: payout bank changed from Access Bank to Guaranty Trust Bank.
                </p>
              </div>
            </div>

            <hr className="border-t border-neutral-100" />

            {/* Notice 2 */}
            <div className="flex items-start gap-3">
              <div className="text-[#059669] mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Security email sent</p>
                <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                  Sent to ada@adasedit.com with your payout-account change details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amber Alert Card: Don't recognise this change? */}
        <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200/60 flex items-start gap-3.5 mb-7">
          <div className="p-1 text-amber-700 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Don’t recognise this change?</h2>
            <p className="text-xs text-neutral-600 leading-relaxed mt-0.5 font-normal">
              Contact Ondar support immediately to help secure your account.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
          >
            <span>Back to payouts</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="mailto:support@ondar.ng"
            className="w-full py-3.5 px-6 rounded-2xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>Contact support</span>
            <HelpCircle className="w-4 h-4 text-neutral-400" />
          </a>
        </div>
      </div>
    </main>
  );
}
