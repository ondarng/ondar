"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, Info, X } from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/constants";
import { OndarLogo } from "@/components/OndarLogo";
import { ShippingStateRate } from "@/lib/shipping";

interface StateRateModalProps {
  businessName: string;
  initialRate?: ShippingStateRate | null;
  existingStates: string[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function StateRateModal({
  businessName,
  initialRate,
  existingStates,
  isOpen,
  onClose,
  onSaved,
}: StateRateModalProps) {
  const isEditing = !!initialRate;

  const [state, setState] = useState(initialRate?.state || (existingStates.includes("Lagos") ? NIGERIAN_STATES.find(s => !existingStates.includes(s)) || "Lagos" : "Lagos"));
  const [deliveryName, setDeliveryName] = useState(
    initialRate?.deliveryName || (state ? `${state} delivery` : "Lagos delivery")
  );
  const [isFree, setIsFree] = useState<boolean>(initialRate?.isFree ?? false);
  const [feeInput, setFeeInput] = useState<string>(
    initialRate ? (initialRate.isFree ? "0" : initialRate.feeNaira.toLocaleString()) : "4,000"
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    initialRate?.estimatedDelivery || "2–4 business days"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStateChange = (newState: string) => {
    setState(newState);
    if (!initialRate) {
      setDeliveryName(`${newState} delivery`);
    }
  };

  const handleFeeChange = (val: string) => {
    // Keep only numbers and comma
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

    if (!state) {
      setError("Please select a state");
      return;
    }
    if (!deliveryName.trim()) {
      setError("Please enter a delivery name");
      return;
    }

    const numericFee = isFree ? 0 : parseInt(feeInput.replace(/,/g, ""), 10) || 0;
    if (!isFree && numericFee <= 0) {
      setError("Please enter a valid delivery fee or select Free delivery");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/shipping/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialRate?.id,
          state,
          deliveryName: deliveryName.trim(),
          isFree,
          feeNaira: numericFee,
          estimatedDelivery: estimatedDelivery.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save state rate");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFDFD] overflow-y-auto">
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
          <div className="mb-6">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {isEditing ? "Edit delivery location" : "Add delivery location"}
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-normal">
              Set where you are available for delivery and your fee. You can also add specific delivery zones and custom prices.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* State Dropdown */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                State
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={isEditing}
                  className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859] appearance-none cursor-pointer disabled:bg-neutral-100 disabled:text-neutral-500"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s} disabled={!isEditing && existingStates.includes(s)}>
                      {s} {!isEditing && existingStates.includes(s) ? "(already added)" : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Delivery name */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Delivery name
              </label>
              <input
                type="text"
                value={deliveryName}
                onChange={(e) => setDeliveryName(e.target.value)}
                placeholder="e.g. Lagos delivery"
                className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859]"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Customers see this name at checkout.
              </p>
            </div>

            {/* Delivery fee toggle card radios */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Delivery fee
              </label>
              <div className="space-y-2.5">
                {/* Paid delivery */}
                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    !isFree
                      ? "border-[#00A859] bg-[#E8F8EF]/40"
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
                    <p className="text-sm font-bold text-neutral-900">Paid delivery</p>
                    <p className="text-xs text-neutral-500 font-normal">
                      Set one fee for the whole order
                    </p>
                  </div>
                </button>

                {/* Free delivery */}
                <button
                  type="button"
                  onClick={() => setIsFree(true)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    isFree
                      ? "border-[#00A859] bg-[#E8F8EF]/40"
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
                      No delivery charge
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Fee input (if Paid delivery) */}
            {!isFree && (
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Fee (NGN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={feeInput}
                    onChange={(e) => handleFeeChange(e.target.value)}
                    placeholder="4,000"
                    className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-bold text-neutral-900 focus:outline-none focus:border-[#00A859]"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Charged once per order, not per item.
                </p>
              </div>
            )}

            {/* Estimated delivery */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Estimated delivery · Optional
              </label>
              <input
                type="text"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                placeholder="2–4 business days"
                className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859]"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Plain text for customers. No scheduling or automatic promise.
              </p>
            </div>

            {/* Fallback info callout */}
            <div className="rounded-2xl bg-[#E8F8EF] p-4 border border-[#A7F3D0]/60 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00A859]/15 text-[#00A859] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#064E3B]">
                  A fallback for the rest of {state}
                </p>
                <p className="text-xs text-[#064E3B]/80 mt-0.5 leading-relaxed">
                  Customers can choose &ldquo;Other area in {state}&rdquo;. Any area overrides you add take priority.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-500 pt-1 text-center">
              You arrange delivery yourself. Ondar does not book a rider.
            </p>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save state rate"}
              </button>
              <p className="text-[11px] text-neutral-400 text-center mt-2">
                Applies to new orders only.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
