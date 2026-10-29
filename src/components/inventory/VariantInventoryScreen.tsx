"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Info,
  X,
} from "lucide-react";
import type { VariantItem } from "./VariantOptionsScreen";

interface VariantInventoryScreenProps {
  productName: string;
  productPhoto?: string | null;
  sku?: string;
  category?: string;
  basePriceNaira?: string;
  baseCostNaira?: string;
  variants: VariantItem[];
  onBack: () => void;
  onOptions: () => void;
  onSave: (updatedVariants: VariantItem[]) => void;
}

export function VariantInventoryScreen({
  productName,
  productPhoto,
  sku,
  category,
  basePriceNaira = "",
  baseCostNaira = "",
  variants: initialVariants,
  onBack,
  onOptions,
  onSave,
}: VariantInventoryScreenProps) {
  const [variants, setVariants] = useState<VariantItem[]>(initialVariants);
  const [expandedId, setExpandedId] = useState<string | null>(
    initialVariants[0]?.id || null
  );

  // Quick adjust modal state
  const [adjustingVariant, setAdjustingVariant] = useState<VariantItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("1");

  // Totals computed across all variants
  const totals = useMemo(() => {
    let onHand = 0;
    let reserved = 0;
    for (const v of variants) {
      onHand += v.stockOnHand || 0;
      // Reserved starts at 0 or uses saved value
      const res = (v as any).stockReserved || 0;
      reserved += res;
    }
    const available = Math.max(0, onHand - reserved);
    return { onHand, reserved, available };
  }, [variants]);

  const anyVariantOutOfStock = useMemo(() => {
    return variants.some((v) => {
      const res = (v as any).stockReserved || 0;
      return (v.stockOnHand - res) <= 0;
    });
  }, [variants]);

  const allVariantsOutOfStock = useMemo(() => {
    if (variants.length === 0) return false;
    return variants.every((v) => {
      const res = (v as any).stockReserved || 0;
      return (v.stockOnHand - res) <= 0;
    });
  }, [variants]);

  const updateVariant = (id: string, updates: Partial<VariantItem>) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const handleAdjustStock = (direction: 1 | -1) => {
    if (!adjustingVariant) return;
    const amount = parseInt(adjustDelta, 10);
    if (isNaN(amount) || amount <= 0) return;

    const currentHand = adjustingVariant.stockOnHand || 0;
    const currentReserved = (adjustingVariant as any).stockReserved || 0;
    const newHand = Math.max(currentReserved, currentHand + amount * direction);

    updateVariant(adjustingVariant.id, { stockOnHand: newHand });
    setAdjustingVariant(null);
  };

  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-16">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <h1 className="text-[20px] font-black tracking-tight text-neutral-900">
            Variant inventory
          </h1>

          <button
            type="button"
            onClick={onOptions}
            className="text-[15px] font-bold text-[#00A859] hover:text-[#00964E] transition-colors cursor-pointer"
          >
            Options
          </button>
        </div>

        {/* Product Summary Row */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 flex items-center justify-center">
            {productPhoto ? (
              <img
                src={productPhoto}
                alt="Product"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#E8F8EF] flex items-center justify-center text-[#00A859] font-bold text-xl">
                👕
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-neutral-900 truncate">
              {productName || "Product"}
            </h2>
            <p className="text-xs text-neutral-500 truncate mt-0.5">
              {sku ? `${sku} · ` : ""}
              {variants.length} variant{variants.length === 1 ? "" : "s"}
              {category ? ` · ${category}` : ""}
            </p>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-2">
          <div className="rounded-2xl p-3.5 bg-[#F4F6F5] text-left">
            <p className="text-xs text-neutral-500 font-medium">On hand</p>
            <p className="text-[26px] font-black text-neutral-900 leading-tight mt-0.5">
              {totals.onHand}
            </p>
          </div>
          <div className="rounded-2xl p-3.5 bg-[#F4F6F5] text-left">
            <p className="text-xs text-neutral-500 font-medium">Reserved</p>
            <p className="text-[26px] font-black text-neutral-900 leading-tight mt-0.5">
              {totals.reserved}
            </p>
          </div>
          <div className="rounded-2xl p-3.5 bg-[#E8F8EF] text-left">
            <p className="text-xs text-[#00A859] font-bold">Available</p>
            <p className="text-[26px] font-black text-[#00A859] leading-tight mt-0.5">
              {totals.available}
            </p>
          </div>
        </div>

        <p className="text-[12px] text-neutral-500 font-normal mb-5">
          Product totals are the sum of variants. Available = on hand – reserved.
        </p>

        {/* Informational Callout */}
        <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-3.5 flex items-start gap-2.5 mb-6">
          <div className="w-5 h-5 rounded-full bg-[#00A859] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <p className="text-[13px] text-[#065F46] leading-snug font-medium">
            {allVariantsOutOfStock
              ? "All variants are currently out of stock. The product is unavailable on the storefront."
              : anyVariantOutOfStock
              ? "Still available to buy. One variant is out; the product becomes unavailable only when all variants are out."
              : "All variants are available to purchase on your storefront."}
          </p>
        </div>

        {/* List of Variant Accordion Cards */}
        <div className="space-y-3.5 mb-8">
          {variants.map((v) => {
            const isExpanded = expandedId === v.id;
            const reserved = (v as any).stockReserved || 0;
            const available = Math.max(0, (v.stockOnHand || 0) - reserved);
            const isOutOfStock = available <= 0;
            const effectivePrice = v.priceNaira || basePriceNaira || "0";
            const effectiveCost = v.costNaira || baseCostNaira || "";
            const effectiveSku = v.sku || (sku ? `${sku}-${v.title.replace(/[\s/]+/g, "-").toUpperCase()}` : v.title.replace(/[\s/]+/g, "-").toUpperCase());

            return (
              <div
                key={v.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs transition-all"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[15px] font-bold text-neutral-900">
                    {v.title}
                  </p>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      isOutOfStock
                        ? "bg-[#FCE7EA] text-[#C2414A]"
                        : "bg-[#E8F8EF] text-[#00A859]"
                    }`}
                  >
                    {isOutOfStock ? "Out of stock" : "In stock"}
                  </span>
                </div>

                {/* SKU and Price Row */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-neutral-500 font-medium">
                    {effectiveSku}
                  </span>
                  <span className="text-sm font-bold text-neutral-900">
                    ₦{effectivePrice}
                  </span>
                </div>

                {/* 3 Mini Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-neutral-100 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">On hand</span>
                    <span className="font-bold text-neutral-900 text-[13px]">
                      {v.stockOnHand || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Reserved</span>
                    <span className="font-bold text-neutral-900 text-[13px]">
                      {reserved}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Available</span>
                    <span
                      className={`font-bold text-[13px] ${
                        isOutOfStock ? "text-[#C2414A]" : "text-[#00A859]"
                      }`}
                    >
                      {available}
                    </span>
                  </div>
                </div>

                {/* Expanded Fields */}
                {isExpanded ? (
                  <div className="pt-3 border-t border-neutral-100 space-y-4">
                    {/* Variant Photo Row */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        {v.imageUrl || productPhoto ? (
                          <img
                            src={v.imageUrl || productPhoto || ""}
                            alt="Variant"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>
                      <label className="text-xs font-bold text-[#00A859] hover:text-[#00964E] cursor-pointer">
                        Change variant photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              updateVariant(v.id, {
                                imageUrl: evt.target?.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>

                    {/* Price Override */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Price override
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-sm font-semibold text-neutral-900 pointer-events-none">
                          ₦
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={v.priceNaira || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            updateVariant(v.id, { priceNaira: val });
                          }}
                          placeholder={basePriceNaira ? basePriceNaira : "Same as product price"}
                          className="w-full h-11 pl-8 pr-3 rounded-xl border border-neutral-200 text-sm font-semibold outline-none focus:border-neutral-400"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Optional · uses product price if left blank.
                      </p>
                    </div>

                    {/* Cost Override */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Cost override · private
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-sm font-semibold text-neutral-900 pointer-events-none">
                          ₦
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={v.costNaira || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            updateVariant(v.id, { costNaira: val });
                          }}
                          placeholder={baseCostNaira ? baseCostNaira : "Same as product cost"}
                          className="w-full h-11 pl-8 pr-3 rounded-xl border border-neutral-200 text-sm font-semibold outline-none focus:border-neutral-400"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        {baseCostNaira
                          ? `Optional · blank uses product cost (₦${baseCostNaira}).`
                          : "Optional · blank uses product cost."}
                      </p>
                    </div>

                    {/* Variant SKU */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        Variant SKU
                      </label>
                      <input
                        type="text"
                        value={v.sku || ""}
                        onChange={(e) =>
                          updateVariant(v.id, {
                            sku: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder={effectiveSku}
                        className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-neutral-400"
                      />
                    </div>

                    {/* Adjust Stock Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustingVariant(v);
                        setAdjustDelta("1");
                      }}
                      className="w-full h-11 rounded-xl border border-neutral-200 hover:border-neutral-300 text-[#00A859] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                    >
                      Adjust this variant’s stock
                    </button>

                    {/* Collapse Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="w-full pt-1 flex items-center justify-center gap-1 text-xs font-semibold text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      <span>Close details</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setExpandedId(v.id)}
                    className="w-full pt-2 flex items-center justify-between text-xs font-semibold text-[#00A859] hover:text-[#00964E] cursor-pointer"
                  >
                    <span>
                      {v.priceNaira
                        ? "Price overridden · edit details"
                        : "Edit price, cost, SKU or photo"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              onSave(variants);
              onBack();
            }}
            className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            Save variants
          </button>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingVariant && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-3xl bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black">
                Adjust stock: {adjustingVariant.title}
              </h3>
              <button
                type="button"
                onClick={() => setAdjustingVariant(null)}
                className="p-1 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Current on hand: {adjustingVariant.stockOnHand || 0} units.
              Enter units to add or subtract.
            </p>
            <input
              type="number"
              min="1"
              value={adjustDelta}
              onChange={(e) => setAdjustDelta(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-neutral-200 mb-4 text-base font-bold outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAdjustStock(-1)}
                className="h-12 rounded-2xl border border-neutral-200 font-bold text-sm cursor-pointer hover:bg-neutral-50"
              >
                Subtract
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStock(1)}
                className="h-12 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm cursor-pointer"
              >
                Add units
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
