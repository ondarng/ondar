"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CornerDownRight,
  Info,
  MapPin,
  Plus,
} from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";
import { ShippingConfig, ShippingOverride, ShippingStateRate } from "@/lib/shipping";
import { StateRateModal } from "./StateRateModal";
import { AreaRateModal } from "./AreaRateModal";

interface ShippingSettingsClientProps {
  initialConfig: ShippingConfig;
  businessName: string;
}

export function ShippingSettingsClient({
  initialConfig,
  businessName,
}: ShippingSettingsClientProps) {
  const router = useRouter();

  const [deliveryEnabled, setDeliveryEnabled] = useState(initialConfig.deliveryEnabled);
  const [pickupEnabled, setPickupEnabled] = useState(initialConfig.pickupEnabled);
  const [stateRates, setStateRates] = useState<ShippingStateRate[]>(initialConfig.stateRates);
  const [coveragePreview, setCoveragePreview] = useState(initialConfig.coveragePreview);
  const [isUpdatingToggle, setIsUpdatingToggle] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [editingStateRate, setEditingStateRate] = useState<ShippingStateRate | null>(null);

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [activeParentStateRate, setActiveParentStateRate] = useState<ShippingStateRate | null>(null);
  const [editingOverride, setEditingOverride] = useState<ShippingOverride | null>(null);

  const hasLocations = stateRates.length > 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshData = async () => {
    try {
      const res = await fetch("/api/shipping");
      const data = await res.json();
      if (data.success) {
        setDeliveryEnabled(data.deliveryEnabled);
        setPickupEnabled(data.pickupEnabled);
        setStateRates(data.stateRates);
        setCoveragePreview(data.coveragePreview);
        showToast("Changes saved");
      }
    } catch (err) {
      console.error("Failed to refresh shipping data:", err);
    }
  };

  const handleToggleDelivery = async () => {
    if (!hasLocations && !deliveryEnabled) {
      // If no locations exist yet, prompt them to add a location first
      setIsStateModalOpen(true);
      return;
    }

    const nextVal = !deliveryEnabled;
    setDeliveryEnabled(nextVal);
    setIsUpdatingToggle(true);

    try {
      const res = await fetch("/api/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryEnabled: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setCoveragePreview(data.coveragePreview);
        showToast("Changes saved");
      }
    } catch (err) {
      console.error(err);
      setDeliveryEnabled(!nextVal); // Revert on error
    } finally {
      setIsUpdatingToggle(false);
    }
  };

  const handleTogglePickup = async () => {
    const nextVal = !pickupEnabled;
    setPickupEnabled(nextVal);
    setIsUpdatingToggle(true);

    try {
      const res = await fetch("/api/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupEnabled: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setCoveragePreview(data.coveragePreview);
        showToast("Changes saved");
      }
    } catch (err) {
      console.error(err);
      setPickupEnabled(!nextVal);
    } finally {
      setIsUpdatingToggle(false);
    }
  };

  const handleDeleteStateRate = async (rate: ShippingStateRate) => {
    if (!confirm(`Are you sure you want to remove delivery for ${rate.state} and all its area overrides?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/shipping/rate/${rate.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        refreshData();
        showToast("State rate removed");
      }
    } catch (err) {
      console.error("Failed to delete state rate:", err);
    }
  };

  const handleDeleteOverride = async (override: ShippingOverride) => {
    if (!confirm(`Are you sure you want to remove ${override.area} override?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/shipping/rate/${override.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        refreshData();
        showToast("Area override removed");
      }
    } catch (err) {
      console.error("Failed to delete override:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-36">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 mb-4">
          <Link
            href="/more"
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
        <div className="mb-4">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Shipping
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-normal">
            {hasLocations
              ? "Your rates. Your delivery arrangements."
              : "Choose where you deliver and what it costs."}
          </p>
        </div>

        {/* 1. Delivery Toggle Card */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 mb-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Delivery</h2>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                {deliveryEnabled && hasLocations
                  ? "Available at checkout"
                  : "Accept delivery orders at checkout"}
              </p>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={handleToggleDelivery}
              disabled={isUpdatingToggle}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer relative ${
                deliveryEnabled && hasLocations ? "bg-[#00A859]" : "bg-neutral-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  deliveryEnabled && hasLocations ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="mt-2.5">
            {deliveryEnabled && hasLocations ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F8EF] text-[#00A859] text-[11px] font-bold">
                <Check className="w-3 h-3 stroke-[3]" />
                Changes saved
              </span>
            ) : (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-semibold">
                Off · {hasLocations ? "Delivery paused" : "No locations yet"}
              </span>
            )}
          </div>
        </div>

        {/* M01: Empty State If No Locations */}
        {!hasLocations ? (
          <div className="space-y-4">
            {/* Middle Empty illustration */}
            <div className="py-8 flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E8F8EF] flex items-center justify-center text-[#00A859] mb-4">
                <MapPin className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-black text-neutral-900 tracking-tight">
                Start with where you deliver
              </h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-[280px] leading-relaxed">
                Add a state and delivery fee. You can add different fees for specific areas later.
              </p>
            </div>

            {/* Pickup Card (Empty State version) */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Pickup</h2>
                  <p className="text-xs text-neutral-500 font-normal mt-0.5">
                    Let customers collect from your business
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePickup}
                  disabled={isUpdatingToggle}
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
              <p className="text-[11px] text-neutral-400 mt-2">
                Pickup can stay on even when delivery is off.
              </p>
            </div>

            {/* Info callout */}
            <div className="rounded-2xl bg-[#F8FAF9] p-4 border border-neutral-200 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-200/80 text-neutral-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">
                  No delivery available yet
                </p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Your storefront won&rsquo;t offer delivery until you add a location and turn it on.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* M02: Configured State */
          <div className="space-y-4">
            {/* Delivery Locations Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-black text-neutral-900 tracking-tight">
                Delivery Zones & Pricing
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold">
                {stateRates.length} {stateRates.length === 1 ? "state" : "states"}
              </span>
            </div>

            {/* State Cards List */}
            {stateRates.map((stateRate) => (
              <div
                key={stateRate.id}
                className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-4"
              >
                {/* Statewide Fallback Header */}
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-semibold mb-2.5">
                    Statewide / Base rate
                  </span>

                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-5 h-5 text-[#00A859] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-base font-black text-neutral-900">
                          {stateRate.state}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {stateRate.deliveryName}
                          {stateRate.estimatedDelivery && ` · ${stateRate.estimatedDelivery}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-black text-neutral-900">
                      {stateRate.isFree ? (
                        <span className="text-[#00A859]">Free</span>
                      ) : (
                        `₦${stateRate.feeNaira.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStateRate(stateRate);
                        setIsStateModalOpen(true);
                      }}
                      className="text-[#00A859] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStateRate(stateRate)}
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Area Overrides Sub-section */}
                {stateRate.overrides.length > 0 && (
                  <div className="pt-3 border-t border-neutral-100 space-y-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8F8EF] text-[#00A859] text-[11px] font-bold">
                      Configured Delivery Zones & Prices
                    </span>

                    <div className="divide-y divide-neutral-100">
                      {stateRate.overrides.map((override) => (
                        <div key={override.id} className="py-2.5 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <CornerDownRight className="w-4 h-4 text-[#00A859] flex-shrink-0 mt-1" />
                              <div>
                                <p className="text-sm font-bold text-neutral-900">
                                  {override.area}
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                  {override.deliveryName}
                                  {override.estimatedDelivery && ` · ${override.estimatedDelivery}`}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-neutral-900">
                              {override.isFree ? (
                                <span className="text-[#00A859]">Free</span>
                              ) : (
                                `₦${override.feeNaira.toLocaleString()}`
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-1.5 ml-6 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveParentStateRate(stateRate);
                                setEditingOverride(override);
                                setIsAreaModalOpen(true);
                              }}
                              className="text-[#00A859] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOverride(override)}
                              className="text-red-500 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add area override button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveParentStateRate(stateRate);
                    setEditingOverride(null);
                    setIsAreaModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl border border-neutral-200 text-xs font-bold text-[#00A859] hover:bg-neutral-50 transition-colors flex items-center justify-center cursor-pointer"
                >
                  + Add delivery zone & price
                </button>
              </div>
            ))}

            <p className="text-[11px] text-neutral-400 px-1">
              Area fees replace the statewide fee. They are not added to it.
            </p>

            {/* Pickup Card (Configured State version) */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Pickup</h2>
                  <p className="text-xs text-neutral-500 font-normal mt-0.5">
                    Independent of delivery
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePickup}
                  disabled={isUpdatingToggle}
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

              <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                <span className="text-xs text-neutral-500">Business location</span>
                <span className="text-xs font-bold text-neutral-900">
                  {initialConfig.businessLocation.city},{" "}
                  {initialConfig.businessLocation.state}
                </span>
              </div>

              <div className="pt-1">
                <Link
                  href="/settings/shipping/pickup"
                  className="text-xs font-bold text-[#00A859] hover:underline flex items-center gap-1"
                >
                  <span>Edit pickup settings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Storefront Coverage Preview Card */}
            <div className="rounded-2xl bg-[#E8F8EF] p-4 border border-[#A7F3D0]/60 space-y-2">
              <h3 className="text-sm font-black text-neutral-900 tracking-tight">
                Storefront coverage preview
              </h3>
              <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                {coveragePreview}
              </p>
              <p className="text-[11px] text-neutral-500 pt-1">
                Generated from your current shipping settings.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 z-40">
        <div className="w-full max-w-[430px] mx-auto space-y-2">
          <button
            type="button"
            onClick={() => {
              setEditingStateRate(null);
              setIsStateModalOpen(true);
            }}
            className="w-full h-13 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>
              {hasLocations ? "+ Add state / delivery zone" : "Add your first delivery zone"}
            </span>
          </button>
          {!hasLocations && (
            <p className="text-[11px] text-neutral-400 text-center">
              You arrange delivery. Ondar applies your fees.
            </p>
          )}
        </div>
      </div>

      {/* State Rate Modal */}
      {isStateModalOpen && (
        <StateRateModal
          businessName={businessName}
          initialRate={editingStateRate}
          existingStates={stateRates.map((s) => s.state)}
          isOpen={isStateModalOpen}
          onClose={() => {
            setIsStateModalOpen(false);
            setEditingStateRate(null);
          }}
          onSaved={refreshData}
        />
      )}

      {/* Area Rate Modal */}
      {isAreaModalOpen && activeParentStateRate && (
        <AreaRateModal
          businessName={businessName}
          parentStateRate={activeParentStateRate}
          initialOverride={editingOverride}
          isOpen={isAreaModalOpen}
          onClose={() => {
            setIsAreaModalOpen(false);
            setActiveParentStateRate(null);
            setEditingOverride(null);
          }}
          onSaved={refreshData}
        />
      )}

      {/* Quick toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
