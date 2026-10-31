import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";

export const metadata = {
  title: "Privacy Policy | Ondar",
  description: "Privacy policy and data protection practices for Ondar.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500 mb-8">Last updated: October 2026</p>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">1. Overview</h2>
            <p className="text-neutral-600 leading-relaxed">
              Ondar (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy and is dedicated to safeguarding your personal data in compliance with the **Nigeria Data Protection Act (NDPA) 2023** and applicable global standards. This Privacy Policy details how we collect, use, and protect information across our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600">
              <li>
                <strong>Merchant Information:</strong> Email address, hashed password, business name, WhatsApp contact number, and bank account settlement details.
              </li>
              <li>
                <strong>Customer / Order Information:</strong> Full name, phone number, optional email address, delivery street address, and purchase line items necessary for fulfilling sales.
              </li>
              <li>
                <strong>Transaction & Analytics:</strong> Payment reference tokens, payment timestamps, and device session cookies. We do not store sensitive payment card credentials directly on our servers.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">3. How We Use Your Data</h2>
            <p className="text-neutral-600 leading-relaxed mb-2">
              We process personal data solely for legitimate business operations:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>Facilitating storefront administration and order management.</li>
              <li>Communicating order status updates and payment receipts.</li>
              <li>Executing automated bank settlements and platform software fee deductions.</li>
              <li>Preventing unauthorized access, fraudulent activities, and abuse.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">4. Protection of Children&apos;s Privacy</h2>
            <p className="text-neutral-600 leading-relaxed">
              Ondar is not directed toward children under 18 years of age. In compliance with Section 31 of the NDPA 2023, we do not knowingly collect, store, or process personal identifiable data of minors. If you believe a minor has registered an account, please contact us immediately to have the information removed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">5. Data Sharing & Third Parties</h2>
            <p className="text-neutral-600 leading-relaxed">
              We never sell your personal data. Information is shared only with vetted service providers strictly necessary to deliver our services, such as licensed payment processors (Paystack) and cloud hosting/database infrastructure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">6. Your Rights</h2>
            <p className="text-neutral-600 leading-relaxed">
              Under Nigerian data protection regulations, you have the right to access, rectify, or request deletion of your personal records. For inquiries or data requests, contact our Data Protection Officer at{" "}
              <a href="mailto:privacy@ondar.ng" className="text-[#00A859] font-medium underline">
                privacy@ondar.ng
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
