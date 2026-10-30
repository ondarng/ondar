"use client";

import React, { useState } from "react";
import { ArrowLeft, Info, Trash2, MapPin, Check } from "lucide-react";
import { POPULAR_STATE_AREAS, ShippingOverride, ShippingStateRate } from "@/lib/shipping";
import { getLgasForState, getPopularAreasForState } from "@/lib/nigeriaData";
import { OndarLogo } from "@/components/OndarLogo";

interface AreaRateModalProps {
  businessName: string;
  parentStateRate: ShippingStateRate;
  initialOverride?: ShippingOverride | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}

export function AreaRateModal({
  businessName,
  parentStateRate,
  initialOverride,
  isOpen,
  onClose,
  onSaved,
  onDeleted,
}: AreaRateModalProps) {
  const isEditing = !!initialOverride;

  const statePopular = getPopularAreasForState(parentStateRate.state);
  const popularList =
    statePopular.length > 0
      ? statePopular
      : POPULAR_STATE_AREAS[parentStateRate.state] || [
          "Central Area",
          "Mainland",
          "Island",
          "GRA",
          "Expressway",
        ];

  const [areaInput, setAreaInput] = useState(initialOverride?.area || "");
  const [deliveryName, setDeliveryName] = useState(
    initialOverride?.deliveryName || (initialOverride?.area ? `${initialOverride.area} delivery` : "")
  );
  const [isFree, setIsFree] = useState<boolean>(initialOverride?.isFree ?? false);
  const [feeInput, setFeeInput] = useState<string>(
    initialOverride ? (initialOverride.isFree ? "0" : initialOverride.feeNaira.toLocaleString()) : "2,000"
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    initialOverride?.estimatedDelivery || "1–2 business days"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAreaSelect = (chosen: string) => {
    setAreaInput(chosen);
    if (!deliveryName || deliveryName.endsWith("delivery")) {
      setDeliveryName(isFree ? `${chosen} free delivery` : `${chosen} delivery`);
    }
  };

  const handleFeeToggle = (free: boolean) => {
    setIsFree(free);
    const effective = areaInput.trim() || "Area";
    if (!initialOverride) {
      if (free) {
        setDeliveryName(`${effective} free delivery`);
      } else {
        setDeliveryName(`${effective} delivery`);
      }
    }
  };

  const handleFeeChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, "");
    if (!raw) {
      setFeeInput("");
      return;
    }
    const num = parseInt(raw, 10);
    setFeeInput(num.toLocaleString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const effectiveArea = areaInput.trim();
    if (!effectiveArea) {
      setError("Please enter or select a delivery zone / area name.");
      return;
    }

    const numericFee = isFree ? 0 : parseInt(feeInput.replace(/,/g, ""), 10) || 0;
    if (!isFree && numericFee <= 0) {
      setError("Please enter a valid delivery fee or select Free delivery");
      return;
    }

    const finalDeliveryName =
      deliveryName.trim() || (isFree ? `${effectiveArea} free delivery` : `${effectiveArea} delivery`);

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/shipping/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialOverride?.id,
          parentId: parentStateRate.id,
          state: parentStateRate.state,
          area: effectiveArea,
          deliveryName: finalDeliveryName,
          isFree,
          feeNaira: numericFee,
          estimatedDelivery: estimatedDelivery.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save delivery zone");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong saving the delivery zone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialOverride?.id) return;
    if (!confirm(`Are you sure you want to remove the delivery zone "${initialOverride.area}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/shipping/rate/${initialOverride.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove delivery zone");
      }

      if (onDeleted) onDeleted();
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to remove delivery zone");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedParentFee = parentStateRate.isFree
    ? "Free"
    : `₦${parentStateRate.feeNaira.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFDFD] overflow-y-auto antialiased">
      <div className="w-full max-w-[430px] min-h-screen mx-auto flex flex-col justify-between px-4 pt-4 pb-8">
        <div>
          {/* Top Header */}
          <header className="flex items-center justify-between py-2 border-b border-neutral-100 mb-5">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 text-neutral-800 hover:text-neutral-900 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <OndarLogo />
            </button>
            <span className="text-xs text-neutral-500 font-medium truncate max-w-[170px]">
              {businessName} · Merchant
            </span>
          </header>

          {/* Heading */}
          <div className="mb-4">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {isEditing ? "Edit delivery zone" : "Add delivery zone"}
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-normal">
              Choose an area in <strong className="text-neutral-900">{parentStateRate.state}</strong> and set its exact delivery price.
            </p>
          </div>

          {/* Overrides badge */}
          <div className="mb-5 flex items-center justify-between">
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold">
              State: {parentStateRate.state} · Base rate: {formattedParentFee}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Zone / Area Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Delivery Zone / Area Name *
              </label>
              <input
                type="text"
                required
                value={areaInput}
                onChange={(e) => {
                  setAreaInput(e.target.value);
                  if (!deliveryName || deliveryName.endsWith("delivery")) {
                    setDeliveryName(isFree ? `${e.target.value} free delivery` : `${e.target.value} delivery`);
                  }
                }}
                placeholder="e.g. Lekki Phase 1, Mainland, Ikeja, Island, Garki..."
                className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859] transition-colors"
              />

              {/* Quick suggestions */}
              <div className="mt-2 space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Quick tap suggestions:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {popularList.slice(0, 8).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleAreaSelect(p)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        areaInput.toLowerCase() === p.toLowerCase()
                          ? "bg-[#E8F8EF] border-[#A7F3D0] text-[#00A859] font-bold"
                          : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery name */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Display name at checkout
              </label>
              <input
                type="text"
                value={deliveryName}
                onChange={(e) => setDeliveryName(e.target.value)}
                placeholder="e.g. Lekki standard delivery"
                className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859]"
              />
            </div>

            {/* Paid / Free radio cards */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-neutral-800 mb-0.5">
                Delivery Pricing *
              </label>

              {/* Paid delivery */}
              <button
                type="button"
                onClick={() => handleFeeToggle(false)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  !isFree
                    ? "border-[#00A859] bg-[#E8F8EF]/40 ring-1 ring-[#00A859]"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    !isFree
                      ? "border-[#00A859] bg-[#00A859]"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {!isFree && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Custom Delivery Fee</p>
                  <p className="text-xs text-neutral-500 font-normal">
                    Enter the fee customers will pay for delivery to this zone
                  </p>
                </div>
              </button>

              {/* Free delivery */}
              <button
                type="button"
                onClick={() => handleFeeToggle(true)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  isFree
                    ? "border-[#00A859] bg-[#E8F8EF]/40 ring-1 ring-[#00A859]"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isFree
                      ? "border-[#00A859] bg-[#00A859]"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {isFree && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Free delivery</p>
                  <p className="text-xs text-neutral-500 font-normal">
                    Delivery to this zone is completely free of charge
                  </p>
                </div>
              </button>
            </div>

            {/* Fee Input (if paid) */}
            {!isFree && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800">
                  Fee Amount (NGN) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                    ₦
                  </span>
                  <input
                    type="text"
                    required
                    value={feeInput}
                    onChange={(e) => handleFeeChange(e.target.value)}
                    placeholder="2,500"
                    className="w-full h-12 pl-8 pr-4 rounded-2xl border border-neutral-200 bg-white text-base font-bold text-neutral-900 focus:outline-none focus:border-[#00A859]"
                  />
                </div>
              </div>
            )}

            {/* Estimated delivery */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Estimated delivery timeframe
              </label>
              <input
                type="text"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                placeholder="e.g. 1–2 business days, Same-day delivery"
                className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859]"
              />
              <div className="flex gap-2 mt-2">
                {["Same-day delivery", "1–2 business days", "2–4 business days"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEstimatedDelivery(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div className="rounded-2xl bg-[#F8FAF9] p-3.5 border border-neutral-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Customers selecting this zone at checkout will pay exactly this fee. Area fees replace the statewide rate.
              </p>
            </div>

            {/* Submit button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                {isSubmitting ? "Saving delivery zone..." : "Save Delivery Zone"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full h-11 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? "Removing..." : "Remove this delivery zone"}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
