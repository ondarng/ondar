"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";
import { GoogleIcon } from "@/components/GoogleIcon";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err === "oauth_failed") {
        setErrorMessage("Google authentication failed. Please try again or sign up with email.");
      } else if (err === "missing_code") {
        setErrorMessage("Authentication code was missing. Please try again.");
      } else if (err === "oauth_account_mismatch") {
        setErrorMessage("An account with this email exists with a different login method.");
      } else if (err === "oauth_unavailable") {
        setErrorMessage("OAuth service is temporarily unavailable.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create shop. Please try again.");
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
          redirectTo: `${window.location.origin}/api/auth/callback`,
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
        <section className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#EAB308] inline-block" />
            <span className="text-[11px] font-extrabold tracking-wider text-[#00A859] uppercase">
              SELL FASTER, STRESS LESS.
            </span>
          </div>

          <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900">
            Create your
            <br />
            Ondar shop
            <span className="text-[#00A859]">.</span>
          </h1>

          <p className="mt-3 text-[14px] leading-relaxed text-neutral-500 font-normal">
            Start with email and password. Your business details, WhatsApp
            number, and first product come next.
          </p>
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-neutral-900 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={isLoading || isGoogleLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm disabled:opacity-60"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-neutral-900 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading || isGoogleLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-neutral-500" />
                ) : (
                  <Eye className="w-5 h-5 text-neutral-500" />
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 font-normal">
              At least 8 characters.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-[15px] flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
            <span>Continue with Google</span>
          </button>

          {/* Primary CTA Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full mt-1 py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating shop...</span>
              </>
            ) : (
              <>
                <span>Create my shop</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Terms & Privacy */}
          <p className="text-[12px] leading-relaxed text-neutral-500 text-center mt-2 px-2">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="text-[#00A859] font-semibold hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#00A859] font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        {/* Divider */}
        <hr className="border-t border-neutral-100 my-7" />

        {/* Footer Login Link */}
        <footer className="text-center pb-6">
          <p className="text-[14px] text-neutral-600">
            Already have a shop?{" "}
            <Link
              href="/login"
              className="text-[#00A859] font-bold hover:underline"
            >
              Log in
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
