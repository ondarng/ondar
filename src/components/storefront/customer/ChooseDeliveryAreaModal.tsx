"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Check, ChevronDown, Info, Search, MapPin, X } from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";
import { getAllStateNames } from "@/lib/nigeriaData";

export interface DeliveryAreaOption {
  name: string;
  deliveryName: string;
  feeKobo: number;
  feeNaira: number;
  isFree: boolean;
  estimatedDelivery?: string | null;
  isFallback?: boolean;
}

interface ChooseDeliveryAreaModalProps {
  businessName: string;
  state: string;
  availableStates?: string[];
  onStateChange: (state: string) => void;
  options: DeliveryAreaOption[];
  currentArea: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (option: DeliveryAreaOption) => void;
}

export function ChooseDeliveryAreaModal({
  businessName,
  state,
  availableStates,
  onStateChange,
  options,
  currentArea,
  isOpen,
  onClose,
  onConfirm,
}: ChooseDeliveryAreaModalProps) {
  const [selectedOptionName, setSelectedOptionName] = useState<string>(
    currentArea || options[0]?.name || ""
  );
  const [isChangingState, setIsChangingState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectableStates = useMemo(() => {
    if (availableStates && availableStates.length > 0) {
      return availableStates;
    }
    return getAllStateNames();
  }, [availableStates]);

  const hasMultipleStates = selectableStates.length > 1;

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const q = searchQuery.toLowerCase().trim();
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, searchQuery]);

  if (!isOpen) return null;

  const activeOption =
    options.find(
      (o) => o.name.toLowerCase() === selectedOptionName.toLowerCase()
    ) || options[0] || null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFDFD] overflow-y-auto antialiased selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div className="w-full max-w-[440px] min-h-screen mx-auto flex flex-col justify-between px-4 pt-4 pb-8">
        <div>
          {/* Top Header */}
          <header className="flex items-center justify-between py-2 border-b border-neutral-100 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 text-neutral-800 hover:text-neutral-900 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <OndarLogo />
            </button>
            <span className="text-xs text-neutral-500 font-medium truncate max-w-[170px]">
              {businessName}
            </span>
          </header>

          {/* Heading */}
          <div className="mb-4">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Choose delivery zone
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-normal">
              Select your delivery area in <strong className="text-neutral-900">{state}</strong> to apply the merchant&apos;s verified rate.
            </p>
          </div>

          {/* State Section */}
          <div className="space-y-2 mb-4">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold">
              1 · State
            </span>

            {!isChangingState ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 bg-white">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#00A859]" />
                  <span className="text-sm font-bold text-neutral-900">{state}</span>
                </div>
                {hasMultipleStates && (
                  <button
                    type="button"
                    onClick={() => setIsChangingState(true)}
                    className="text-xs font-bold text-[#00A859] hover:underline cursor-pointer"
                  >
                    Change state
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => {
                      onStateChange(e.target.value);
                      setSelectedOptionName("");
                      setSearchQuery("");
                      setIsChangingState(false);
                    }}
                    className="w-full h-12 px-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-bold text-neutral-900 appearance-none focus:outline-none focus:border-[#00A859] cursor-pointer"
                  >
                    {selectableStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingState(false)}
                  className="text-xs text-neutral-500 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Delivery Zones Section */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8F8EF] text-[#00A859] text-xs font-bold">
                2 · Available Delivery Zones
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {filteredOptions.length} {filteredOptions.length === 1 ? "zone" : "zones"}
              </span>
            </div>

            {/* Instant Search Bar */}
            {options.length > 3 && (
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search delivery zones in ${state}...`}
                  className="w-full h-11 pl-9 pr-8 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Options List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredOptions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center text-xs text-neutral-500">
                  {options.length === 0 ? (
                    <p>
                      This store does not have active delivery zones in {state}. Please choose pickup or contact the seller.
                    </p>
                  ) : (
                    <p>No delivery zones matching &ldquo;{searchQuery}&rdquo;.</p>
                  )}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected =
                    activeOption &&
                    activeOption.name.toLowerCase() === option.name.toLowerCase();

                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => {
                        setSelectedOptionName(option.name);
                        onConfirm(option);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#00A859] bg-[#E8F8EF]/40 ring-1 ring-[#00A859]"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Radio dot */}
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? "border-[#00A859] bg-[#00A859]"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-neutral-900 truncate">
                              {option.name}
                            </p>
                            <span className="text-xs font-black text-neutral-900 flex-shrink-0">
                              {option.isFree ? (
                                <span className="text-[#00A859]">Free</span>
                              ) : (
                                `₦${option.feeNaira.toLocaleString("en-NG")}`
                              )}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                            <span>{option.deliveryName}</span>
                            {option.estimatedDelivery && (
                              <span>{option.estimatedDelivery}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Info callout */}
          <div className="rounded-2xl bg-[#F8FAF9] p-3.5 border border-neutral-200 flex items-start gap-2.5 mb-4">
            <Info className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-neutral-600 leading-relaxed">
              Delivery zones and rates are set directly by{" "}
              <strong className="text-neutral-800">{businessName}</strong>. If your specific area is not listed, message the seller to confirm special delivery arrangements.
            </div>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div>
          <button
            type="button"
            onClick={() => {
              if (activeOption) {
                onConfirm(activeOption);
              } else {
                onClose();
              }
            }}
            disabled={!activeOption}
            className="w-full h-12 bg-[#00A859] hover:bg-[#008f4c] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <span>Confirm Delivery Zone</span>
            {activeOption && !activeOption.isFree && (
              <span>· ₦{activeOption.feeNaira.toLocaleString("en-NG")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
