"use client";

import React, { useState } from "react";
import { ArrowLeft, Info, Trash2 } from "lucide-react";
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

  const lgas = getLgasForState(parentStateRate.state);
  const statePopular = getPopularAreasForState(parentStateRate.state);
  const popularList = statePopular.length > 0 ? statePopular : (POPULAR_STATE_AREAS[parentStateRate.state] || [
    "Central Area",
    "GRA",
    "Township",
    "Expressway",
  ]);

  const [area, setArea] = useState(
    initialOverride?.area ||
      popularList.find((a) => !parentStateRate.overrides.some((o) => o.area === a)) ||
      popularList[0] ||
      ""
  );
  const [customArea, setCustomArea] = useState(
    initialOverride && !popularList.includes(initialOverride.area) ? initialOverride.area : ""
  );
  const [isCustom, setIsCustom] = useState(
    initialOverride ? !popularList.includes(initialOverride.area) : false
  );

  const [deliveryName, setDeliveryName] = useState(
    initialOverride?.deliveryName || (area ? `${area} delivery` : "")
  );
  const [isFree, setIsFree] = useState<boolean>(initialOverride?.isFree ?? false);
  const [feeInput, setFeeInput] = useState<string>(
    initialOverride ? (initialOverride.isFree ? "0" : initialOverride.feeNaira.toLocaleString()) : "2,500"
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    initialOverride?.estimatedDelivery || "1–2 business days"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentArea = isCustom ? customArea.trim() : area;

  const handleAreaChange = (val: string) => {
    if (val === "__custom__") {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    setArea(val);
    if (!initialOverride) {
      setDeliveryName(isFree ? `${val} free delivery` : `${val} delivery`);
    }
  };

  const handleFeeToggle = (free: boolean) => {
    setIsFree(free);
    if (!initialOverride) {
      if (free) {
        setDeliveryName(`${currentArea || "Area"} free delivery`);
      } else {
        setDeliveryName(`${currentArea || "Area"} delivery`);
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

    const effectiveArea = isCustom ? customArea.trim() : area.trim();
    if (!effectiveArea) {
      setError("Please select or specify an area");
      return;
    }

    if (!deliveryName.trim()) {
      setError("Please enter a delivery name");
      return;
    }

    const numericFee = isFree ? 0 : parseInt(feeInput.replace(/,/g, ""), 10) || 0;
    if (!isFree && numericFee <= 0) {
      setError("Please enter a valid fee or select Free delivery");
      return;
    }

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
          deliveryName: deliveryName.trim(),
          isFree,
          feeNaira: numericFee,
          estimatedDelivery: estimatedDelivery.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save area rate");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialOverride?.id) return;
    if (!confirm(`Are you sure you want to remove the rate for ${initialOverride.area}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/shipping/rate/${initialOverride.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove area rate");
      }

      if (onDeleted) onDeleted();
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to remove area rate");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedParentFee = parentStateRate.isFree
    ? "Free"
    : `₦${parentStateRate.feeNaira.toLocaleString()}`;

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
          <div className="mb-4">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {isEditing ? "Edit area rate" : "Add area rate"}
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-normal">
              Give this area its own fee instead of the statewide rate.
            </p>
          </div>

          {/* Overrides badge */}
          <div className="mb-5">
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold">
              Overrides {parentStateRate.state} · {formattedParentFee}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* State (locked) */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                State
              </label>
              <input
                type="text"
                disabled
                value={parentStateRate.state}
                className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-500 cursor-not-allowed"
              />
            </div>

            {/* Area Dropdown / Selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                Area
              </label>
              {!isCustom ? (
                <div className="relative">
                  <select
                    value={area}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859] appearance-none cursor-pointer"
                  >
                    {lgas.length > 0 && (
                      <optgroup label={`Local Government Areas (LGAs) in ${parentStateRate.state}`}>
                        {lgas.map((l) => (
                          <option key={`lga-${l}`} value={l}>
                            {l} LGA
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label={`Popular Neighborhoods / Districts in ${parentStateRate.state}`}>
                      {popularList.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other">
                      <option value="__custom__">+ Enter custom area name...</option>
                    </optgroup>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    placeholder="Enter area name (e.g. Alausa)"
                    className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustom(false)}
                    className="text-xs text-[#00A859] font-bold hover:underline"
                  >
                    ← Choose from popular areas
                  </button>
                </div>
              )}
              <p className="text-[11px] text-neutral-500 mt-1">
                Choose a known area. Customers select this exact area at checkout.
              </p>
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
                placeholder="e.g. Ikeja free delivery"
                className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859]"
              />
            </div>

            {/* Paid / Free radio cards */}
            <div className="space-y-2.5">
              {/* Paid delivery */}
              <button
                type="button"
                onClick={() => handleFeeToggle(false)}
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
                    Enter a fee in NGN
                  </p>
                </div>
              </button>

              {/* Free delivery */}
              <button
                type="button"
                onClick={() => handleFeeToggle(true)}
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
                    ₦0 for this area
                  </p>
                </div>
              </button>
            </div>

            {/* Fee (NGN) if paid */}
            {!isFree && (
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Fee (NGN)
                </label>
                <input
                  type="text"
                  value={feeInput}
                  onChange={(e) => handleFeeChange(e.target.value)}
                  placeholder="2,500"
                  className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-bold text-neutral-900 focus:outline-none focus:border-[#00A859]"
                />
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
                placeholder="1–2 business days"
                className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#00A859]"
              />
            </div>

            {/* Info callout */}
            <div className="rounded-2xl bg-[#E8F8EF] p-4 border border-[#A7F3D0]/60 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00A859]/15 text-[#00A859] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#064E3B]">
                  {currentArea || "Area"} customers pay {isFree ? "no delivery fee" : `₦${feeInput}`}
                </p>
                <p className="text-xs text-[#064E3B]/80 mt-0.5 leading-relaxed">
                  This replaces the {parentStateRate.state} {formattedParentFee} rate. Your other {parentStateRate.state} areas keep their existing rates.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 text-center">
              Changes apply to new orders only. Existing orders keep their delivery fee.
            </p>

            {/* Action buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save area rate"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-2.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? "Removing..." : "Remove area rate"}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
