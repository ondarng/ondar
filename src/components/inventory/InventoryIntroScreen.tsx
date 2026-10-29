"use client";

import React, { useState } from "react";
import { Check, Plus } from "lucide-react";
import { InventoryBoxIllustration } from "./InventoryBoxIllustration";

interface InventoryIntroScreenProps {
  onStartAddProduct: (neverShowAgain: boolean) => void;
}

const FIVE_STEPS = [
  {
    step: 1,
    title: "Name",
    subtitle: "What are you selling?",
  },
  {
    step: 2,
    title: "Photo",
    subtitle: "Show it off. You can add one later.",
  },
  {
    step: 3,
    title: "Price",
    subtitle: "Set one selling price in naira.",
  },
  {
    step: 4,
    title: "Stock",
    subtitle: "Choose whether to track units.",
  },
  {
    step: 5,
    title: "Publish",
    subtitle: "Make it available on your storefront.",
  },
];

export function InventoryIntroScreen({ onStartAddProduct }: InventoryIntroScreenProps) {
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-[32px] leading-tight font-black tracking-tight text-neutral-900">
          Inventory
        </h1>
      </div>

      {/* Main Hero Card */}
      <div className="flex flex-col items-center text-center px-1">
        {/* Mint Box Squircle with 3D Box Illustration */}
        <div className="w-[88px] h-[88px] rounded-[28px] bg-[#E8F8EF] flex items-center justify-center mb-6 shadow-xs">
          <InventoryBoxIllustration className="w-12 h-12" />
        </div>

        <h2 className="text-[26px] leading-tight font-black text-neutral-900 tracking-tight">
          Your shop starts here
        </h2>

        <p className="text-[14px] leading-relaxed text-neutral-500 mt-2 max-w-[320px]">
          Add your first product and give customers a simple way to shop from your link.
        </p>

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => onStartAddProduct(neverShowAgain)}
          className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center gap-2 mt-6 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add your first product</span>
        </button>

        {/* Don't show again checkbox */}
        <button
          type="button"
          onClick={() => setNeverShowAgain(!neverShowAgain)}
          className="flex items-center justify-center gap-2.5 mt-3 py-1 px-2 text-neutral-600 hover:text-neutral-900 cursor-pointer select-none transition-colors"
        >
          <span
            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
              neverShowAgain
                ? "bg-[#00A859] border-[#00A859] text-white"
                : "border-neutral-300 bg-white"
            }`}
          >
            {neverShowAgain && <Check className="w-3 h-3 stroke-[3]" />}
          </span>
          <span className="text-[13px] font-medium text-neutral-600">
            Don’t show this tutorial again
          </span>
        </button>
      </div>

      {/* Divider */}
      <hr className="border-neutral-100 my-6" />

      {/* 5 Small Steps Section */}
      <div>
        <h3 className="text-[15px] font-bold text-neutral-900 mb-4 tracking-tight">
          Five small steps. Ready to sell.
        </h3>

        <div className="space-y-4">
          {FIVE_STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-3.5">
              <span className="w-7 h-7 rounded-full bg-[#E8F8EF] text-[#00A859] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.step}
              </span>
              <div>
                <p className="text-[14px] font-bold text-neutral-900 leading-snug">
                  {s.title}
                </p>
                <p className="text-[13px] text-neutral-500 font-normal leading-snug">
                  {s.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[13px] text-neutral-400 mt-7 mb-4">
          Not ready to publish? Save a draft and come back.
        </p>
      </div>
    </div>
  );
}
