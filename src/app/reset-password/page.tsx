"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OndarLogo } from "@/components/OndarLogo";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Lock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-type your new password.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch {
      setErrorMessage("An unexpected error occurred while resetting your password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between items-center px-6 py-8 antialiased selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div className="w-full max-w-[390px] mx-auto flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between pt-2 pb-6">
          <OndarLogo />
        </header>

        {/* Section Title */}
        <section className="mt-4 mb-6">
          <h1 className="text-[32px] leading-[1.12] font-black tracking-tight text-neutral-900">
            Set new password<span className="text-[#00A859]">.</span>
          </h1>
          <p className="mt-2.5 text-[14px] leading-relaxed text-neutral-500 font-normal">
            Choose a strong password to secure your store and payouts.
          </p>
        </section>

        {success ? (
          <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#065F46] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#00A859]" />
              <span>Password updated successfully!</span>
            </div>
            <p className="text-xs text-[#047857]">
              Redirecting you to your store dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-in fade-in flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-xs font-bold text-neutral-900 mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-neutral-900 mb-1.5">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving new password...</span>
                </>
              ) : (
                <span>Update password</span>
              )}
            </button>
          </form>
        )}
      </div>

      <footer className="text-center pt-8 pb-4">
        <Link href="/login" className="text-xs font-bold text-neutral-600 hover:text-neutral-900">
          Back to login
        </Link>
      </footer>
    </main>
  );
}
