"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import { formatNairaFromKobo } from "@/lib/inventory";
import type { InventoryProduct } from "@/app/inventory/InventoryClient";

interface ProductPublishedScreenProps {
  product: InventoryProduct;
  storeSlug: string;
  storefrontUrl: string;
  onBackToInventory: () => void;
}

export function ProductPublishedScreen({
  product,
  storeSlug,
  storefrontUrl,
  onBackToInventory,
}: ProductPublishedScreenProps) {
  const [copied, setCopied] = useState(false);

  const photoUrl = product.images[0]?.url;
  const productPath = `ondar.shop/${storeSlug}/${product.slug}`;
  const fullProductUrl = `${storefrontUrl}/p/${product.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${productPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleViewProduct = () => {
    window.open(fullProductUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-16">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBackToInventory}
            className="p-1 -ml-1 text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="text-[20px] font-black tracking-tight text-neutral-900">
            Product published
          </h1>
        </div>

        {/* Big Celebration Check Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-[#E8F8EF] flex items-center justify-center text-[#00A859] animate-in zoom-in-75 duration-300">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-6">
          <h2 className="text-[26px] font-black text-neutral-900 tracking-tight leading-tight">
            Your product is live!
          </h2>
          <p className="text-[14px] text-neutral-500 font-normal mt-2 leading-snug max-w-[320px] mx-auto">
            {product.name} is now on your storefront. One less thing to worry about.
          </p>
        </div>

        {/* Product Summary Card */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-xs mb-6">
          <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-100 mb-3 flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#E8F8EF] flex items-center justify-center text-[#00A859] font-bold text-3xl">
                👕
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F8EF] text-[#00A859] capitalize">
              {product.status.toLowerCase()}
            </span>
            <span className="text-xs text-neutral-500 font-medium truncate">
              {product.category || "General"}
              {product.sku ? ` · ${product.sku}` : ""}
            </span>
          </div>

          <h3 className="text-[18px] font-black text-neutral-900 tracking-tight truncate">
            {product.name}
          </h3>

          <p className="text-[20px] font-black text-neutral-900 mt-1">
            {formatNairaFromKobo(product.priceKobo)}
          </p>
        </div>

        {/* Storefront Link Section */}
        <div className="mb-6 space-y-2">
          <p className="text-xs font-bold text-neutral-800">Your storefront link</p>
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-neutral-200">
            <span className="text-xs font-medium text-[#00A859] break-all select-all pr-2">
              {productPath}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
              title="Copy link"
            >
              {copied ? (
                <span className="text-[11px] font-bold text-[#00A859] flex items-center gap-1">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  Copied
                </span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-4">
          <button
            type="button"
            onClick={handleViewProduct}
            className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            <span>View product</span>
          </button>

          <button
            type="button"
            onClick={onBackToInventory}
            className="w-full h-[52px] rounded-2xl border border-neutral-200 text-[#00A859] hover:bg-neutral-50 font-bold text-[15px] flex items-center justify-center transition-colors cursor-pointer"
          >
            Back to inventory
          </button>
        </div>

        <p className="text-xs text-neutral-400 text-center px-4 leading-relaxed">
          You can edit product details or manage stock from Inventory any time.
        </p>
      </div>
    </div>
  );
}
