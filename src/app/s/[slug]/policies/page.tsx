import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Truck,
  MapPin,
  MessageCircle,
  Phone,
  Building2,
  Mail,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StorefrontHeader } from "@/components/storefront/customer/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/customer/StorefrontFooter";
import {
  formatNigerianDisplayPhone,
  getWhatsappChatUrl,
} from "@/lib/phone";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StorePoliciesPage({ params }: Props) {
  const { slug } = await params;

  const profile = await prisma.businessProfile.findUnique({
    where: { slug },
  });

  if (!profile) {
    notFound();
  }

  const whatsappChatUrl = getWhatsappChatUrl(
    profile.whatsappNumber || profile.phoneNumber,
    `Hello ${profile.businessName}, I have an inquiry about your store policies.`
  );

  const displayPhone = formatNigerianDisplayPhone(
    profile.phoneNumber || profile.whatsappNumber
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] antialiased text-gray-900 flex flex-col justify-between selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div>
        <StorefrontHeader
          businessName={profile.businessName}
          storeSlug={slug}
          city={profile.city}
          subtitle={profile.description || "Everyday pieces, thoughtfully chosen"}
        />

        <main className="w-full max-w-[460px] mx-auto px-4 pt-3 pb-12 space-y-5">
          {/* Back link */}
          <div>
            <Link
              href={`/s/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to store</span>
            </Link>
          </div>

          {/* Title Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Store Policies</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Store Policies & Terms
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              Official fulfillment terms, return instructions, and customer guarantees for{" "}
              <strong className="text-gray-800">{profile.businessName}</strong>.
            </p>
          </div>

          {/* Section 1: Returns & Exchanges Policy */}
          <section className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Returns & Exchanges Policy
                </h2>
                <p className="text-[11px] text-gray-400">Guarantees & return windows</p>
              </div>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed pt-1 space-y-2">
              <p>
                {profile.returnPolicy ||
                  "Returns are accepted within 7 days of delivery for eligible items in their original, unused condition with all tags attached. Please contact us on WhatsApp to initiate a return inspection."}
              </p>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500 space-y-1">
                <p className="font-semibold text-gray-700">How to return an item:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Keep all original packaging, tags, and receipt reference.</li>
                  <li>Message us on WhatsApp with photos or reason for return.</li>
                  <li>Our team will inspect and coordinate exchange or store credit.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Section 2: Delivery & Shipping Policy */}
          <section className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Delivery & Shipping
                </h2>
                <p className="text-[11px] text-gray-400">Dispatch timelines & coverage</p>
              </div>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed pt-1 space-y-2">
              <p>
                {profile.deliveryCoverage
                  ? `Standard shipping coverage: ${profile.deliveryCoverage}.`
                  : `Shipping is coordinated within ${profile.city}, ${profile.state} and nationwide.`}
              </p>
              <p>
                Orders are processed and packaged immediately upon payment verification. You will receive dispatch updates and delivery notifications.
              </p>
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <p className="font-semibold">Delivery note:</p>
                <p className="text-blue-700">
                  Ensure your phone number is reachable so our courier can contact you on arrival.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Store Pickup Policy */}
          <section className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Store Pickup
                </h2>
                <p className="text-[11px] text-gray-400">Local collection terms</p>
              </div>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed pt-1 space-y-2">
              <p>
                Pickup is available in <strong>{profile.city}, {profile.state}</strong>.
              </p>
              <p>
                {profile.pickupInstructions ||
                  "Call on arrival. Please have your order reference number ready when picking up your items."}
              </p>
              <p className="text-[11px] text-gray-500 italic">
                For security and verified handoffs, exact street pickup instructions are revealed on your live order page once payment is confirmed.
              </p>
            </div>
          </section>

          {/* Section 4: Customer Support & Contact */}
          <section className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#00A859] shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Customer Support
                </h2>
                <p className="text-[11px] text-gray-400">Direct inquiries & assistance</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <a
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 bg-[#00A859] hover:bg-[#008f4c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat with us on WhatsApp</span>
              </a>

              {displayPhone && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>Phone:</span>
                  </span>
                  <span className="font-bold text-gray-900">{displayPhone}</span>
                </div>
              )}

              {profile.publicEmail && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>Email:</span>
                  </span>
                  <span className="font-bold text-gray-900">{profile.publicEmail}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Location:</span>
                </span>
                <span className="font-bold text-gray-900">
                  {profile.city}, {profile.state}
                </span>
              </div>
            </div>
          </section>

          {/* Bottom Back Button */}
          <div className="pt-2">
            <Link
              href={`/s/${slug}`}
              className="w-full h-11 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Return to Storefront Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>

      <StorefrontFooter
        businessName={profile.businessName}
        storeSlug={slug}
        city={profile.city}
        state={profile.state}
        whatsappNumber={profile.whatsappNumber}
        phoneNumber={profile.phoneNumber || undefined}
        returnPolicy={profile.returnPolicy || undefined}
      />
    </div>
  );
}
