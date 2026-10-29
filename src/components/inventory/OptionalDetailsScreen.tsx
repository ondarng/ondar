"use client";

import React from "react";
import {
  ArrowLeft,
  Bold,
  Italic,
  List,
  Lock,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export interface OptionalDetailsData {
  description: string;
  costPriceNaira: string;
  category: string;
  sku: string;
  lowStockThreshold: string;
  extraImages: string[];
}

interface OptionalDetailsScreenProps {
  productName: string;
  data: OptionalDetailsData;
  onChange: (updated: Partial<OptionalDetailsData>) => void;
  onBack: () => void;
  onOpenExtras?: () => void;
}

const CATEGORY_OPTIONS = [
  "Clothing",
  "Shoes",
  "Bags & Luggage",
  "Accessories & Jewelry",
  "Beauty & Skincare",
  "Food & Groceries",
  "Electronics & Gadgets",
  "Home & Living",
  "Art & Crafts",
  "Health & Wellness",
  "Other",
];

export function OptionalDetailsScreen({
  productName,
  data,
  onChange,
  onBack,
  onOpenExtras,
}: OptionalDetailsScreenProps) {
  // Rich text formatting toggles (markdown-style append/wrap)
  const applyFormat = (type: "bold" | "italic" | "list") => {
    const textarea = document.getElementById("optional-desc-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = data.description.substring(start, end);
    let replacement = "";

    if (type === "bold") {
      replacement = `**${selected || "bold text"}**`;
    } else if (type === "italic") {
      replacement = `*${selected || "italic text"}*`;
    } else if (type === "list") {
      replacement = `\n• ${selected || "List item"}`;
    }

    const newText =
      data.description.substring(0, start) +
      replacement +
      data.description.substring(end);
    onChange({ description: newText });
  };

  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-12">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Back to product"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="text-[22px] font-black tracking-tight text-neutral-900">
            Optional details
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-[14px] text-neutral-500 font-normal mb-6">
          {productName ? `${productName} · ` : ""}All fields here are optional.
        </p>

        <div className="space-y-6">
          {/* ============================================================== */}
          {/* DESCRIPTION */}
          {/* ============================================================== */}
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">
              Description
            </label>
            <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs focus-within:border-neutral-400 transition-all">
              {/* Mini Toolbar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100 bg-[#FAFAFA]">
                <button
                  type="button"
                  onClick={() => applyFormat("bold")}
                  className="p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-200 transition-colors font-bold text-sm"
                  title="Bold"
                >
                  <Bold className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("italic")}
                  className="p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-200 transition-colors text-sm"
                  title="Italic"
                >
                  <Italic className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("list")}
                  className="p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-200 transition-colors text-sm"
                  title="Bullet list"
                >
                  <List className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                id="optional-desc-textarea"
                rows={4}
                value={data.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Describe this product to your customers..."
                className="w-full px-4 py-3 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 outline-none resize-none"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* COST PRICE */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-neutral-900">
                Cost price
              </label>
              <span className="text-xs text-neutral-400 font-normal">Optional</span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-4 text-base font-semibold text-neutral-900 pointer-events-none">
                ₦
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={data.costPriceNaira}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  onChange({ costPriceNaira: val });
                }}
                placeholder="0"
                className="w-full h-[52px] pl-9 pr-11 rounded-2xl border border-neutral-200 bg-white text-[15px] font-semibold text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-neutral-400 shadow-xs transition-all"
              />
              <Lock className="w-4 h-4 text-neutral-700 absolute right-4 pointer-events-none" />
            </div>

            <p className="text-[13px] text-neutral-500 font-normal mt-1.5 leading-snug">
              Private to you. Used to calculate profit; never shown to customers.
            </p>

            {/* Informational Callout */}
            <div className="mt-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-3.5 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#00A859] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <p className="text-[13px] text-[#065F46] leading-snug">
                No cost entered? Cost stays Unknown and profit is unavailable — we never assume{" "}
                <span className="font-bold text-[#064E3B]">₦0</span>.
              </p>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CATEGORY */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-neutral-900">
                Category
              </label>
              <span className="text-xs text-neutral-400 font-normal">Optional</span>
            </div>

            <div className="relative">
              <select
                value={data.category}
                onChange={(e) => onChange({ category: e.target.value })}
                className="w-full h-[52px] px-4 rounded-2xl border border-neutral-200 bg-white text-[15px] font-medium text-neutral-900 appearance-none outline-none focus:border-neutral-400 shadow-xs transition-all cursor-pointer"
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-neutral-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <p className="text-[13px] text-neutral-500 font-normal mt-1.5">
              Choose one category for this product.
            </p>
          </div>

          {/* ============================================================== */}
          {/* SKU */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-neutral-900">
                SKU
              </label>
              <span className="text-xs text-neutral-400 font-normal">Optional</span>
            </div>

            <input
              type="text"
              value={data.sku}
              onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })}
              placeholder="e.g. SKU-001"
              className="w-full h-[52px] px-4 rounded-2xl border border-neutral-200 bg-white text-[15px] font-medium text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-neutral-400 shadow-xs transition-all"
            />

            <p className="text-[13px] text-neutral-500 font-normal mt-1.5">
              Use your own stock code to find products quickly.
            </p>
          </div>

          {/* ============================================================== */}
          {/* LOW-STOCK THRESHOLD */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-neutral-900">
                Low-stock threshold
              </label>
              <span className="text-xs text-neutral-400 font-normal">Optional</span>
            </div>

            <input
              type="number"
              min="0"
              value={data.lowStockThreshold}
              onChange={(e) => onChange({ lowStockThreshold: e.target.value })}
              placeholder="0"
              className="w-full h-[52px] px-4 rounded-2xl border border-neutral-200 bg-white text-[15px] font-medium text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-neutral-400 shadow-xs transition-all"
            />

            <p className="text-[13px] text-neutral-500 font-normal mt-1.5">
              At {data.lowStockThreshold || "5"} or fewer available, customers see “Only X left”.
            </p>
          </div>

          {/* ============================================================== */}
          {/* EXTRAS */}
          {/* ============================================================== */}
          <div className="border-t border-neutral-100 pt-5">
            <button
              type="button"
              onClick={onOpenExtras}
              className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
            >
              <div>
                <p className="text-[15px] font-bold text-neutral-900">Extras</p>
                <p className="text-[13px] text-neutral-500">Extra images & variant options</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#00A859] transition-transform group-hover:translate-x-0.5" />
            </button>

            <p className="text-[13px] text-neutral-500 font-normal mt-3 leading-snug">
              Sale pricing is managed in Discounts, not as a second selling price here.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM ACTION BUTTON */}
        {/* ============================================================== */}
        <div className="mt-8 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            Done · back to product
          </button>
        </div>
      </div>
    </div>
  );
}
