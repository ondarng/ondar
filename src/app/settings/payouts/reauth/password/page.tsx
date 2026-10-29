"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OndarLogo } from "@/components/OndarLogo";
import {
  HelpCircle,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function ProtectPayoutsPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/settings/payouts/reauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Incorrect password. Please try again.");
        return;
      }

      // Unlocked — redirect to payout update confirmation screen
      router.push("/settings/payouts/updated");
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
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
            Before changing where your money goes, re-enter your password to confirm it’s you.
          </p>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-start gap-3.5 mb-6">
          <div className="p-0.5 text-[#059669] mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#065F46]">For email & password accounts</h2>
            <p className="text-xs text-[#047857] leading-relaxed mt-0.5 font-normal">
              This protects payout changes. No SMS code is needed.
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
            Current payout account. Bank and account-number editing unlock only after you confirm your password.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-2">
            <label htmlFor="payoutPassword" className="block text-xs font-bold text-neutral-900 mb-1.5">
              Your password
            </label>
            <div className="relative">
              <input
                id="payoutPassword"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mb-6">
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-[#00A859] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Confirm password to continue</span>
            )}
          </button>

          <p className="text-xs text-neutral-400 text-center mt-5 leading-relaxed font-normal">
            When your payout account changes, a security alert is recorded on your dashboard and emailed to ada@adasedit.com.
          </p>

          {/* Cancel Back Button */}
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel · Back to payouts</span>
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
