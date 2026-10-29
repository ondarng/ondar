"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Check, ChevronDown, Info, Search, MapPin, X } from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";
import {
  getAllStateNames,
  getStateData,
  getLgasForState,
  getPopularAreasForState,
} from "@/lib/nigeriaData";

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
  const [filterTab, setFilterTab] = useState<"all" | "overrides" | "lgas">("all");

  const allNigerianStates = useMemo(() => getAllStateNames(), []);

  // Fallback statewide rate from options
  const fallbackOption = useMemo(() => {
    return options.find((o) => o.isFallback) || options[options.length - 1] || {
      name: `Other area in ${state}`,
      deliveryName: `${state} delivery`,
      feeKobo: 400000,
      feeNaira: 4000,
      isFree: false,
      estimatedDelivery: "2–4 business days",
      isFallback: true,
    };
  }, [options, state]);

  // LGAs and Popular areas for current state
  const lgas = useMemo(() => getLgasForState(state), [state]);
  const popularAreas = useMemo(() => getPopularAreasForState(state), [state]);

  // Combine merchant options with Nigerian LGAs & popular areas
  const combinedOptions = useMemo<DeliveryAreaOption[]>(() => {
    const list: DeliveryAreaOption[] = [...options];

    // Add state LGAs if not already in list
    lgas.forEach((lga) => {
      const exists = list.some(
        (o) => o.name.toLowerCase() === lga.toLowerCase()
      );
      if (!exists) {
        list.push({
          name: lga,
          deliveryName: fallbackOption.deliveryName,
          feeKobo: fallbackOption.feeKobo,
          feeNaira: fallbackOption.feeNaira,
          isFree: fallbackOption.isFree,
          estimatedDelivery: fallbackOption.estimatedDelivery,
          isFallback: false,
        });
      }
    });

    // Add popular areas in this state if not already in list
    popularAreas.forEach((area) => {
      const exists = list.some(
        (o) => o.name.toLowerCase() === area.toLowerCase()
      );
      if (!exists) {
        list.push({
          name: area,
          deliveryName: fallbackOption.deliveryName,
          feeKobo: fallbackOption.feeKobo,
          feeNaira: fallbackOption.feeNaira,
          isFree: fallbackOption.isFree,
          estimatedDelivery: fallbackOption.estimatedDelivery,
          isFallback: false,
        });
      }
    });

    return list;
  }, [options, lgas, popularAreas, fallbackOption]);

  // Filter options by search query and tab
  const filteredOptions = useMemo(() => {
    let result = combinedOptions;

    if (filterTab === "overrides") {
      result = result.filter((o) => {
        return options.some((orig) => orig.name.toLowerCase() === o.name.toLowerCase());
      });
    } else if (filterTab === "lgas") {
      result = result.filter((o) => lgas.some((l) => l.toLowerCase() === o.name.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => o.name.toLowerCase().includes(q));
    }

    return result;
  }, [combinedOptions, filterTab, searchQuery, options, lgas]);

  if (!isOpen) return null;

  const activeOption =
    combinedOptions.find(
      (o) => o.name.toLowerCase() === selectedOptionName.toLowerCase()
    ) || fallbackOption;

  const handleUseOption = () => {
    if (activeOption) {
      onConfirm(activeOption);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFDFD] overflow-y-auto">
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
              Choose delivery area
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-normal">
              Select your state, LGA, or area to see accurate delivery rates and timelines.
            </p>
          </div>

          {/* Section 1: State Selection (All 36 States + FCT) */}
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
                <button
                  type="button"
                  onClick={() => setIsChangingState(true)}
                  className="text-xs font-bold text-[#00A859] hover:underline cursor-pointer"
                >
                  Change state
                </button>
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
                    {allNigerianStates.map((s) => (
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

          {/* Section 2: Area / LGA Search & Selection */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8F8EF] text-[#00A859] text-xs font-bold">
                2 · LGA or Area in {state}
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {filteredOptions.length} available
              </span>
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search LGA or area in ${state}...`}
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

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer flex-shrink-0 ${
                  filterTab === "all"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                All Areas
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("overrides")}
                className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer flex-shrink-0 ${
                  filterTab === "overrides"
                    ? "bg-[#00A859] text-white"
                    : "bg-[#E8F8EF] text-[#00A859] hover:bg-[#d5f5e2]"
                }`}
              >
                Store Featured ({options.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("lgas")}
                className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer flex-shrink-0 ${
                  filterTab === "lgas"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                LGAs ({lgas.length})
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredOptions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center text-xs text-neutral-500">
                  No areas matching &ldquo;{searchQuery}&rdquo;. You can use the &ldquo;Other area in {state}&rdquo; option below.
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected =
                    activeOption &&
                    activeOption.name.toLowerCase() === option.name.toLowerCase();

                  const isCustomOverride = options.some(
                    (orig) => !orig.isFallback && orig.name.toLowerCase() === option.name.toLowerCase()
                  );

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
                          ? "border-[#00A859] bg-[#E8F8EF]/40"
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
                            {isCustomOverride && (
                              <span className="text-[10px] font-bold text-[#00A859] bg-[#E8F8EF] px-1.5 py-0.5 rounded-md flex-shrink-0">
                                Store rate
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-neutral-600 mt-0.5">
                            {option.deliveryName} ·{" "}
                            {option.isFree ? (
                              <span className="font-bold text-[#00A859]">Free</span>
                            ) : (
                              <span className="font-bold text-neutral-900">
                                ₦{option.feeNaira.toLocaleString("en-NG")}
                              </span>
                            )}
                          </p>

                          {option.estimatedDelivery && (
                            <p className="text-[10px] text-neutral-400 mt-0.5 font-normal">
                              {option.estimatedDelivery}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Don't see your area callout */}
          <div className="rounded-2xl bg-[#F8FAF9] p-3.5 border border-neutral-200 flex items-start gap-2.5 mb-4">
            <div className="w-5 h-5 rounded-full bg-neutral-200/70 text-neutral-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">
                Any location in {state} covered
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                If your exact street or village is not named, select the LGA or &ldquo;Other area in {state}&rdquo;. The statewide rate applies.
              </p>
            </div>
          </div>

          {/* Your Selected Delivery Summary Card */}
          {activeOption && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 space-y-1 mb-4 shadow-2xs">
              <p className="text-xs font-bold text-neutral-900">
                Selected delivery
              </p>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs text-neutral-600 font-medium truncate max-w-[240px]">
                  {activeOption.name} · {activeOption.deliveryName}
                </span>
                <span className="text-sm font-black text-neutral-900 flex-shrink-0">
                  {activeOption.isFree ? (
                    <span className="text-[#00A859]">Free</span>
                  ) : (
                    `₦${activeOption.feeNaira.toLocaleString("en-NG")}`
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sticky CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleUseOption}
            className="w-full h-12 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            Use {activeOption?.name} ·{" "}
            {activeOption?.isFree
              ? "Free"
              : `₦${(activeOption?.feeNaira || 0).toLocaleString("en-NG")}`}
          </button>
        </div>
      </div>
    </div>
  );
}
