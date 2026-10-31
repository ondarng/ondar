import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";

export const metadata = {
  title: "Terms of Service | Ondar",
  description: "Terms and conditions for merchants and customers using Ondar.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 px-6 py-10 antialiased selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between pb-8 border-b border-neutral-100">
          <OndarLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </header>

        <article className="prose prose-neutral max-w-none mt-8 text-[15px] leading-relaxed">
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-xs text-neutral-500 mb-8">Last updated: October 2026</p>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">1. Agreement to Terms</h2>
            <p className="text-neutral-600 leading-relaxed">
              Welcome to Ondar (&ldquo;Ondar&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), an e-commerce platform operated in Nigeria that provides merchants with storefront infrastructure, product cataloging, and payment coordination tools. By creating an account, browsing, or utilizing any of our services, you confirm that you are at least 18 years of age and agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">2. Eligibility & Age Requirements</h2>
            <p className="text-neutral-600 leading-relaxed">
              Ondar is intended strictly for individuals who are 18 years of age or older and possess the legal capacity to enter into binding agreements under the laws of the Federal Republic of Nigeria. Minors under the age of 18 are prohibited from registering merchant accounts or administering storefronts on the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">3. Merchant Accounts & Payouts</h2>
            <p className="text-neutral-600 leading-relaxed">
              To receive payments, merchants must provide valid Nigerian banking details (settlement account) and maintain verified payout credentials. Merchants are solely responsible for ensuring that all account information, product descriptions, pricing, and tax obligations are accurate and compliant with applicable laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">4. Payments & Platform Charges</h2>
            <p className="text-neutral-600 leading-relaxed">
              Online transactions on Ondar are processed securely via licensed payment gateways (such as Paystack) and direct bank transfer. Ondar charges a 1% software and platform maintenance fee on product subtotal, capped at ₦1,000 per order. Gateway processing fees are calculated and deducted according to standard payment partner rules.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">5. Prohibited Items & Activities</h2>
            <p className="text-neutral-600 leading-relaxed">
              Merchants may not list, advertise, or sell any illegal, fraudulent, infringing, counterfeit, or harmful goods, including weapons, narcotics, unapproved pharmaceuticals, or age-restricted items prohibited by Nigerian regulation. Ondar reserves the right to suspend or terminate accounts in violation of this section.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">6. Order Fulfilment & Disputes</h2>
            <p className="text-neutral-600 leading-relaxed">
              Merchants are directly responsible for fulfilling customer orders, delivering items in the condition described, and honoring their stated return policies. Ondar facilitates order creation and stock holding but does not store, ship, or physically handle merchant merchandise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">7. Contact & Inquiries</h2>
            <p className="text-neutral-600 leading-relaxed">
              If you have any questions or require legal assistance regarding these Terms, please reach out to us at{" "}
              <a href="mailto:support@ondar.ng" className="text-[#00A859] font-medium underline">
                support@ondar.ng
              </a>
              .
            </p>
          </section>
        </article>

        <footer className="mt-12 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} Ondar Technologies. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
