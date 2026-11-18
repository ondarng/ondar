"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OndarLogo } from "@/components/OndarLogo";
import { supabase } from "@/lib/supabase";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  HelpCircle,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  ONDAR_SUPPORT_WHATSAPP,
  ONDAR_SUPPORT_EMAIL,
  ONDAR_SUPPORT_DISPLAY_PHONE,
} from "@/lib/constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your account email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const redirectUrl =
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "";

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMessage("Network error. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportWhatsappUrl = `https://wa.me/${ONDAR_SUPPORT_WHATSAPP}?text=${encodeURIComponent(
    `Hello Ondar Support, I need help resetting the password for my store account (${email || "my email"}).`
  )}`;

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between items-center px-6 py-8 antialiased selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div className="w-full max-w-[390px] mx-auto flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between pt-2 pb-6">
          <OndarLogo />
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium py-1 px-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-500" />
            <span>Back</span>
          </Link>
        </header>

        {/* Section Heading */}
        <section className="mt-4 mb-6">
          <h1 className="text-[32px] leading-[1.12] font-black tracking-tight text-neutral-900">
            Reset password<span className="text-[#00A859]">.</span>
          </h1>
          <p className="mt-2.5 text-[14px] leading-relaxed text-neutral-500 font-normal">
            Enter the email address registered with your Ondar shop and we’ll help you regain access.
          </p>
        </section>

        {submitted ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Success Box */}
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#00A859] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold text-[#065F46]">
                  Request submitted for {email}
                </h2>
                <p className="text-xs text-[#047857] leading-relaxed mt-1">
                  Our merchant security team will verify your account. For instant recovery, message support directly on WhatsApp.
                </p>
              </div>
            </div>

            {/* Instant WhatsApp Recovery CTA */}
            <a
              href={supportWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Instant Recovery via WhatsApp</span>
            </a>

            <div className="p-4 rounded-2xl border border-neutral-200 bg-[#FAFAFA] space-y-1.5 text-xs text-neutral-600">
              <p className="font-bold text-neutral-800">Support Hours</p>
              <p>Daily · 8:00 AM – 10:00 PM WAT</p>
              <p className="text-neutral-500">Phone: {ONDAR_SUPPORT_DISPLAY_PHONE}</p>
              <p className="text-neutral-500">Email: {ONDAR_SUPPORT_EMAIL}</p>
            </div>

            <Link
              href="/login"
              className="w-full py-3 px-4 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all text-center"
            >
              <span>Return to login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-in fade-in">
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="resetEmail"
                className="block text-xs font-bold text-neutral-900 mb-1.5"
              >
                Registered shop email
              </label>
              <input
                id="resetEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Request password reset</span>
              )}
            </button>

            {/* Direct WhatsApp Option */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#FDFDFD] px-2 text-neutral-400 font-medium">or</span>
              </div>
            </div>

            <a
              href={supportWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>Message Ondar Support on WhatsApp</span>
            </a>
          </form>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center pt-8 pb-4">
        <p className="text-xs text-neutral-500">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-[#00A859] hover:underline">
            Log in
          </Link>
        </p>
      </footer>
    </main>
  );
}
