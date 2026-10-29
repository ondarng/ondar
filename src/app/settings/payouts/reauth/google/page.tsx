"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OndarLogo } from "@/components/OndarLogo";
import { GoogleIcon } from "@/components/GoogleIcon";
import { supabase } from "@/lib/supabase";
import {
  HelpCircle,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function ProtectPayoutsGooglePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleReauth = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/settings/payouts/updated`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setErrorMessage("Unable to connect to Google. Please try again.");
      setIsLoading(false);
    }
  };

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
            Protect your payouts<span className="text-[#00A859]">.</span>
          </h1>
          <p className="text-[14px] leading-relaxed text-neutral-500 font-normal">
            Before changing where your money goes, confirm it’s you with your connected Google account.
          </p>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-start gap-3.5 mb-6">
          <div className="p-0.5 text-[#059669] mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#065F46]">For Google accounts</h2>
            <p className="text-xs text-[#047857] leading-relaxed mt-0.5 font-normal">
              Use Google instead of a password. No SMS code is needed.
            </p>
          </div>
        </div>

        {/* Bank Details Locked Card */}
        <div className="p-5 rounded-2xl border border-neutral-200 bg-white mb-6 shadow-xs">
          <div className="flex items-center gap-2 text-neutral-600 text-xs font-bold mb-2">
            <Lock className="w-4 h-4" />
            <span>Bank details locked</span>
          </div>
          <p className="text-base font-bold text-neutral-900">
            Access Bank · ending 5432
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed mt-1 font-normal">
            Current payout account. Bank and account-number editing unlock only after Google reauthentication.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {/* Connected Google Account Section */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-neutral-900 mb-2">Connected Google account</h2>

          {/* Account Profile Box */}
          <div className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center gap-3.5 mb-3 shadow-xs">
            <div className="w-11 h-11 rounded-full bg-[#E6F7EF] text-[#00A859] font-black text-sm flex items-center justify-center">
              AO
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">Ada Okafor</p>
              <p className="text-xs text-neutral-500">ada@adasedit.com</p>
            </div>
          </div>

          {/* Reauthenticate Button */}
          <button
            type="button"
            onClick={handleGoogleReauth}
            disabled={isLoading}
            className="w-full py-4 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-[15px] flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
            <span>Reauthenticate with Google</span>
          </button>
        </div>

        <p className="text-xs text-neutral-500 mb-6 leading-relaxed font-normal">
          Continue with this Google account to unlock payout changes. You don’t need to create a password.
        </p>

        <p className="text-xs text-neutral-400 text-center mb-6 leading-relaxed font-normal">
          When your payout account changes, a security alert is recorded on your dashboard and emailed to ada@adasedit.com.
        </p>

        {/* Cancel Back Button */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel · Back to payouts</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
