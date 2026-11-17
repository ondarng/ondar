"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Building2,
  ExternalLink,
  Lock,
  Check,
  Link2,
  Landmark,
  Package,
} from "lucide-react";
import { LiveAppDemo } from "@/components/landing/LiveAppDemo";

const ONDAR_SUPPORT_WHATSAPP = "2347041402806";
const WHATSAPP_SUPPORT_URL = `https://wa.me/${ONDAR_SUPPORT_WHATSAPP}?text=${encodeURIComponent(
  "Hello Ondar team, I sell on social media and I want to set up my shop."
)}`;

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "Is my money safe?",
      a: "Yes. Customers pay directly into your own bank account (e.g. your OPay, GTBank, Kuda, or Zenith). Ondar never holds your sales money or delays your payout.",
    },
    {
      q: "What does it cost?",
      a: "Creating your shop, listing unlimited products, and store hosting are 100% free with no monthly subscription. Ondar charges a tiny 1% software fee on completed sales (capped at ₦1,000 max per order). If you don't make sales, you pay zero.",
    },
    {
      q: "Do I need a website or a custom domain?",
      a: "No. You get a free fast link (yourname.ondar.ng) immediately upon sign up. It works out-of-the-box on any phone browser without buying domains or hiring developers.",
    },
    {
      q: "What if my customers still want to chat on WhatsApp?",
      a: "That's completely fine! Every product and order has a direct 1-tap WhatsApp button. When customers place an order, they receive an automated WhatsApp receipt to chat with you directly.",
    },
    {
      q: "What if I only have a personal bank transfer account?",
      a: "You don't need a corporate CAC account or card payment processor to start. Ondar shows your account number with a 1-tap copy button and lets customers tap 'I have sent payment'. You confirm it on your phone.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F2] text-neutral-900 selection:bg-[#006B3A]/20 selection:text-[#006B3A] antialiased">
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP HEADER (Matching reference) */}
      {/* --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#F8F8F2]/95 backdrop-blur-md">
        <div className="max-w-md sm:max-w-xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-2xl font-black tracking-tight text-neutral-950 select-none">
            <span>ondar</span>
            <span className="w-2 h-2 rounded-full bg-[#008751] inline-block ml-0.5 mb-1" />
          </Link>

          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-neutral-700 hover:text-neutral-950 inline-flex items-center gap-1 transition-colors"
          >
            <span>Sign in</span>
            <span className="text-sm font-semibold">↗</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md sm:max-w-xl mx-auto px-5 pt-4 pb-20 space-y-12 sm:space-y-16">
        {/* --------------------------------------------------------------------- */}
        {/* 2. HERO FOLD (Pixel-precise to Reference UI) */}
        {/* --------------------------------------------------------------------- */}
        <section className="text-left sm:text-center space-y-4">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#006B3A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#008751]" />
            <span>SELL FASTER, STRESS LESS.</span>
          </div>

          {/* Headline */}
          <h1 className="text-[34px] sm:text-[46px] font-black tracking-tight text-neutral-950 leading-[1.08]">
            From &ldquo;Send DM&rdquo;
            <br />
            <span className="text-[#006B3A]">to &ldquo;Order received.&rdquo;</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-sm sm:max-w-md sm:mx-auto">
            Turn your WhatsApp chats into a proper online shop. Share one link, take orders, and keep your sales in order &mdash; without the back-and-forth.
          </p>

          {/* Yellow CTA Button */}
          <div className="pt-2 flex flex-col items-stretch sm:items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto sm:px-12 h-13 rounded-2xl bg-[#FFBF00] hover:bg-[#F2B500] text-neutral-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
            >
              <span>Create your store</span>
              <span className="text-base font-bold">➔</span>
            </Link>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-2 text-center">
              No website skills needed. Just your products.
            </p>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Mockup Store Card & Toast */}
          {/* ----------------------------------------------------------------- */}
          <div className="pt-4 sm:pt-6 relative max-w-[340px] sm:max-w-[370px] mx-auto">
            {/* Mint / soft green backdrop container */}
            <div className="bg-[#EBF2EC] rounded-[32px] p-2.5 sm:p-3 shadow-xs">
              {/* White store card */}
              <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-xs border border-neutral-100/80">
                {/* Browser URL pill */}
                <div className="bg-[#F3F4F0] text-neutral-600 rounded-full py-1.5 px-3 text-[11px] font-medium flex items-center justify-center gap-1.5 max-w-[240px] mx-auto mb-4">
                  <Lock className="w-3 h-3 text-emerald-800" />
                  <span>theeverydayedit.ondar.ng</span>
                </div>

                {/* Store Profile Header */}
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-10 h-10 rounded-full bg-[#E2ECE4] text-[#1D5139] font-black text-xs flex items-center justify-center shrink-0">
                    ee.
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-neutral-900 leading-tight truncate">
                      The Everyday Edit
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
                      Easy pieces. Everyday favourites. &bull; Lagos
                    </p>
                  </div>
                </div>

                {/* 2 Products Grid */}
                <div className="grid grid-cols-2 gap-2.5 mt-3.5 text-left">
                  {/* Product 1 */}
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                      <img
                        src="/demo/tote.jpg"
                        alt="Everyday canvas tote"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-neutral-800 mt-1.5 truncate">
                      Everyday canvas tote
                    </p>
                    <p className="text-xs font-black text-neutral-950 mt-0.5">
                      &#8358;18,500
                    </p>
                  </div>

                  {/* Product 2 */}
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
                      <img
                        src="/demo/shirt.jpg"
                        alt="Linen everyday shirt"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-neutral-800 mt-1.5 truncate">
                      Linen everyday shirt
                    </p>
                    <p className="text-xs font-black text-neutral-950 mt-0.5">
                      &#8358;24,000
                    </p>
                  </div>
                </div>

                {/* Store CTA Button */}
                <Link
                  href="/register"
                  className="mt-4 w-full h-10 rounded-xl bg-[#006B3A] hover:bg-[#00572F] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Shop the collection</span>
                  <span>➔</span>
                </Link>
              </div>
            </div>

            {/* Floating Order Toast Overlay */}
            <div className="relative -mt-6 sm:-mt-7 mx-auto w-[92%] bg-white/98 backdrop-blur-md rounded-2xl p-3 border border-neutral-100/90 shadow-xl flex items-center gap-3 z-10 text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">Order received!</span>
                  <span className="text-[10px] text-neutral-400">Just now</span>
                </div>
                <p className="text-[11px] text-neutral-600 truncate">
                  Everyday canvas tote &bull; &#8358;18,500
                </p>
                <p className="text-[10px] font-bold text-amber-600 mt-0.5">
                  Awaiting payment
                </p>
              </div>
            </div>

            {/* Micro Caption below Mockup */}
            <p className="text-[10px] sm:text-[11px] text-neutral-400 text-center mt-3">
              Example shop and order, made to show how Ondar works.
            </p>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Value Props Stack (Bottom of Reference Screenshot) */}
          {/* ----------------------------------------------------------------- */}
          <div className="border-t border-neutral-200/80 pt-6 mt-8 max-w-[340px] sm:max-w-sm mx-auto space-y-3.5 text-left">
            <div className="flex items-center gap-3">
              <Link2 className="w-4 h-4 text-[#006B3A] shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                One shareable shop link
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Landmark className="w-4 h-4 text-[#006B3A] shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                Bank transfer, made clear
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-[#006B3A] shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                Orders and stock, together
              </span>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------- */}
        {/* 3. SECOND SCROLL: SOUND FAMILIAR? (Matching reference UI) */}
        {/* --------------------------------------------------------------------- */}
        <section className="pt-4 sm:pt-8 text-left space-y-4 max-w-[340px] sm:max-w-md mx-auto">
          {/* Eyebrow */}
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#006B3A] block">
            SOUND FAMILIAR?
          </span>

          {/* Headline */}
          <h2 className="text-[32px] sm:text-[40px] font-black text-neutral-950 tracking-tight leading-[1.12]">
            Great products. Too many DMs.
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            You didn&rsquo;t start a business to answer the same questions all day. Give every customer a clearer way to buy.
          </p>

          {/* ----------------------------------------------------------------- */}
          {/* Card 1: THE DM SHUFFLE */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-[#F3F5F2] rounded-[28px] p-5 sm:p-6 space-y-3 mt-6">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block mb-3.5">
              THE DM SHUFFLE
            </span>

            <div className="bg-white rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-medium text-neutral-700 shadow-2xs">
              &ldquo;How much? Is it available?&rdquo;
            </div>

            <div className="bg-white rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-medium text-neutral-700 shadow-2xs">
              &ldquo;Send your account again.&rdquo;
            </div>

            <div className="bg-white rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-medium text-neutral-700 shadow-2xs">
              &ldquo;Have you seen my payment?&rdquo;
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Card 2: THE ONDAR WAY */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-[#EDF7EF] rounded-[28px] p-5 sm:p-6 space-y-4 mt-3.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#006B3A] block mb-3.5">
              THE ONDAR WAY
            </span>

            <div className="space-y-3.5 text-xs sm:text-sm font-semibold text-neutral-900">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006B3A] shrink-0 stroke-[2.5]" />
                <span>Prices and stock in your shop</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006B3A] shrink-0 stroke-[2.5]" />
                <span>Payment details at checkout</span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006B3A] shrink-0 stroke-[2.5]" />
                <span>One clear order record</span>
              </div>
            </div>

            {/* Punchline */}
            <div className="pt-4">
              <p className="text-xl sm:text-2xl font-black text-[#006B3A] tracking-tight">
                Less chasing. More selling.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------- */}
        {/* 4. INTERACTIVE PRODUCT PREVIEW (Tap through the screens) */}
        {/* --------------------------------------------------------------------- */}
        <section className="space-y-4 text-center pt-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006B3A]">
              Live Product Simulator
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Tap through the full shopping experience
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Test how buyers browse, copy bank details, track held stock, and how you confirm orders in 1 tap.
            </p>
          </div>

          <LiveAppDemo />
        </section>

        {/* --------------------------------------------------------------------- */}
        {/* 5. PRICE (Honest & Upfront) */}
        {/* --------------------------------------------------------------------- */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006B3A]">
              Clear Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              &#8358;0 to start. Zero monthly fees.
            </h2>
            <p className="text-xs text-neutral-600 max-w-md mx-auto">
              You never pay a subscription fee to keep your shop online.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-neutral-600 font-medium">Store creation & hosting</span>
              <span className="font-bold text-neutral-900">&#8358;0 Free</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-neutral-600 font-medium">Monthly maintenance</span>
              <span className="font-bold text-neutral-900">&#8358;0 Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 font-medium">Completed order software fee</span>
              <span className="font-bold text-[#006B3A]">1% (capped at &#8358;1,000 max)</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 text-center">
            If you sell an item for &#8358;10,000, Ondar&apos;s software fee is &#8358;100. If you make no sales, you pay nothing.
          </p>
        </section>

        {/* --------------------------------------------------------------------- */}
        {/* 6. FAQ (Answers the real objections) */}
        {/* --------------------------------------------------------------------- */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Questions & Answers
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2.5 max-w-2xl mx-auto">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4.5 text-left text-xs sm:text-sm font-bold text-neutral-900 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* --------------------------------------------------------------------- */}
        {/* 7. FINAL PUSH */}
        {/* --------------------------------------------------------------------- */}
        <section className="bg-[#006B3A] rounded-3xl p-8 text-center text-white space-y-5 shadow-lg shadow-emerald-950/10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ready to stop losing DM sales?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto leading-relaxed">
            Create your store link right now. Free forever, no card required.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <Link
              href="/register"
              className="w-full h-12 rounded-xl bg-[#FFBF00] hover:bg-[#F2B500] text-neutral-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <span>Create your store</span>
              <span className="font-bold">➔</span>
            </Link>

            <a
              href={WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-emerald-500/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Talk to us on WhatsApp</span>
            </a>
          </div>
        </section>
      </main>

      {/* --------------------------------------------------------------------- */}
      {/* 8. FOOTER */}
      {/* --------------------------------------------------------------------- */}
      <footer className="bg-white py-8 border-t border-neutral-200/80 text-[11px] text-neutral-500">
        <div className="max-w-md sm:max-w-xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-neutral-900 tracking-tight text-sm">ondar<span className="text-[#008751]">.</span></span>
            <span>&bull; Ondar Technologies Ltd</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-neutral-600">
            <Link href="/terms" className="hover:text-neutral-900">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-neutral-900">
              Privacy
            </Link>
            <a href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
