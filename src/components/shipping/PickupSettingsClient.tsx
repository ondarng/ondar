"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Package, ShieldCheck } from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";

interface PickupSettingsClientProps {
  businessName: string;
  initialPickupEnabled: boolean;
  address: string;
  city: string;
  state: string;
  initialInstructions: string;
}

export function PickupSettingsClient({
  businessName,
  initialPickupEnabled,
  address,
  city,
  state,
  initialInstructions,
}: PickupSettingsClientProps) {
  const router = useRouter();

  const [pickupEnabled, setPickupEnabled] = useState(initialPickupEnabled);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/shipping/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupEnabled,
          pickupInstructions: instructions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save pickup settings");
      }

      showToast("Pickup settings saved");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-36">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 mb-4">
          <Link
            href="/settings/shipping"
            className="flex items-center gap-2 text-neutral-800 hover:text-neutral-900 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <OndarLogo />
          </Link>
          <span className="text-xs text-neutral-500 font-medium truncate max-w-[170px]">
            {businessName} · Merchant
          </span>
        </header>

        {/* Title */}
        <div className="mb-5">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Pickup
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-normal">
            Let customers collect their orders for free.
          </p>
        </div>

        {/* 1. Offer Pickup Toggle Card */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 mb-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Offer pickup</h2>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                Works even when delivery is off
              </p>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={() => setPickupEnabled(!pickupEnabled)}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer relative ${
                pickupEnabled ? "bg-[#00A859]" : "bg-neutral-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  pickupEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Business Location Section */}
        <div className="space-y-2 mb-6">
          <h2 className="text-base font-black text-neutral-900 tracking-tight">
            Your business location
          </h2>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-semibold">
              Single business location
            </span>

            <div>
              <p className="text-sm font-black text-neutral-900">
                {address || "No street address configured"}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {city}, {state}
              </p>
            </div>

            <div className="pt-1">
              <Link
                href="/settings/profile"
                className="text-xs font-bold text-[#00A859] hover:underline inline-flex items-center gap-1"
              >
                <span>Manage in Business profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 px-1 leading-snug">
            Pickup uses this address. To change it, update your business profile; there is no separate pickup address.
          </p>
        </div>

        {/* 3. Collection Instructions Input */}
        <div className="space-y-1.5 mb-6">
          <label className="block text-xs font-bold text-neutral-900">
            Collection instructions · Optional
          </label>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 focus-within:border-[#00A859] transition-colors">
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Call on arrival. Please have your order number ready."
              className="w-full text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none resize-none bg-transparent font-medium"
            />
          </div>
        </div>

        {/* 4. Shield Info Callout */}
        <div className="rounded-2xl bg-[#E8F8EF] p-4 border border-[#A7F3D0]/60 flex items-start gap-3 mb-3.5">
          <div className="w-6 h-6 rounded-full bg-[#00A859]/15 text-[#00A859] flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#064E3B]">
              Your exact address stays private
            </p>
            <p className="text-xs text-[#064E3B]/80 mt-0.5 leading-relaxed">
              Before payment, customers see only &ldquo;{city}, {state}&rdquo;. Your full address and instructions appear after successful payment.
            </p>
          </div>
        </div>

        {/* 5. Parcel Ready Info Callout */}
        <div className="rounded-2xl bg-[#F8FAF9] p-4 border border-neutral-200 flex items-start gap-3 mb-6">
          <div className="w-6 h-6 rounded-full bg-neutral-200/70 text-neutral-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">
              Tell customers when it&rsquo;s ready
            </p>
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
              Payment does not mean ready for pickup. Mark the order Ready for pickup once it is packed.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 z-40">
        <div className="w-full max-w-[430px] mx-auto">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSubmitting}
            className="w-full h-13 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save pickup settings"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 stroke-[3] text-[#00A859]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
