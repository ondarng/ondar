"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";
import { GoogleIcon } from "@/components/GoogleIcon";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rate limiting / lock state
  const [attemptCount, setAttemptCount] = useState(0);
  const isLocked = attemptCount >= 5;

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err === "oauth_failed") {
        setErrorMessage("Google authentication failed. Please try again or log in with email.");
      } else if (err === "missing_code") {
        setErrorMessage("Authentication code was missing. Please try again.");
      } else if (err === "oauth_account_mismatch") {
        setErrorMessage("An account with this email exists with a different login method.");
      } else if (err === "oauth_unavailable") {
        setErrorMessage("OAuth service is temporarily unavailable.");
      } else if (err) {
        setErrorMessage(decodeURIComponent(err));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLocked) {
      return;
    }

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const nextAttempts = attemptCount + 1;
        setAttemptCount(nextAttempts);

        if (nextAttempts >= 5) {
          setErrorMessage("Too many login attempts. Please wait a little while, then try again.");
        } else {
          setErrorMessage(data.error || "Invalid email or password.");
        }
        return;
      }

      router.push(data.redirectTo || "/onboarding");
    } catch {
      setErrorMessage("Unable to connect to the server. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        console.error("Supabase OAuth error:", error);
        setErrorMessage(error.message);
        setIsGoogleLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      console.error("Google sign in exception:", err);
      setErrorMessage("Unable to connect to Google service. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between items-center px-6 py-8 antialiased selection:bg-[#00A859]/20 selection:text-[#00A859]">
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

        {/* Hero Copy */}
        <section className="mt-2 mb-6">
          <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900">
            Good to have you back<span className="text-[#00A859]">.</span>
          </h1>

          <p className="mt-2.5 text-[14px] leading-relaxed text-neutral-500 font-normal">
            Log in to manage your shop, orders and payouts.
          </p>
        </section>

        {/* Too many login attempts Alert Box */}
        {isLocked && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200/60 flex items-start gap-3.5 shadow-xs animate-in fade-in duration-200">
            <div className="p-1 text-amber-700 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Too many login attempts</h2>
              <p className="text-xs text-neutral-600 leading-relaxed mt-1 font-normal">
                We’ve temporarily paused login attempts to protect your account. Please wait a little while, then try again.
              </p>
            </div>
          </div>
        )}

        {/* Standard Error Alert */}
        {!isLocked && errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-neutral-900 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={isLoading || isGoogleLoading || isLocked}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@adasedit.com"
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs disabled:opacity-60"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-neutral-900 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading || isGoogleLoading || isLocked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-neutral-400" />
                ) : (
                  <Eye className="w-5 h-5 text-neutral-400" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-[#00A859] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary CTA / Disabled Button */}
          {isLocked ? (
            <button
              type="button"
              disabled
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#E2E8F0] text-neutral-500 font-bold text-base cursor-not-allowed"
            >
              Try again later
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Log in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Notice when locked */}
          {isLocked ? (
            <p className="text-xs text-neutral-500 text-center leading-relaxed font-normal my-1">
              There’s nothing to verify or pay for. Waiting keeps your account protected.
            </p>
          ) : (
            <p className="text-xs text-neutral-500 text-center font-normal mt-1">
              Or use your Google account
            </p>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-4 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-[15px] flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
            <span>Continue with Google</span>
          </button>

          {isLocked && (
            <p className="text-xs text-neutral-500 text-center font-normal mt-0.5">
              For shops connected to a Google account.
            </p>
          )}

          {/* Security Cookie Note */}
          <div className="flex items-start gap-2.5 mt-2 px-1">
            <ShieldCheck className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <p className="text-xs text-neutral-500 leading-relaxed font-normal">
              Stay securely logged in for 30 days on this device. Log out on shared devices.
            </p>
          </div>
        </form>

        {/* Footer Create Shop Link */}
        <footer className="text-center pt-8 pb-6 border-t border-neutral-100 mt-6">
          <p className="text-[14px] text-neutral-600">
            New to Ondar?{" "}
            <Link
              href="/"
              className="text-[#00A859] font-bold hover:underline"
            >
              Create a shop
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
