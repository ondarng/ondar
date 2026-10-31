"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Store,
} from "lucide-react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";
import { formatNairaFromKobo } from "@/lib/inventory";
import type { InventoryProduct } from "@/app/inventory/InventoryClient";
import { ProductStatusScreen } from "./ProductStatusScreen";

interface ProductAvailabilityScreenProps {
  product: InventoryProduct;
  pendingBadgeCount?: number;
  onBack: () => void;
  onEdit: () => void;
  onUpdateProduct: (updated: InventoryProduct) => void;
  onArchive: () => Promise<void>;
  onChangeStatus?: (newStatus: any) => Promise<void>;
}

export function ProductAvailabilityScreen({
  product,
  pendingBadgeCount = 0,
  onBack,
  onEdit,
  onUpdateProduct,
  onArchive,
  onChangeStatus,
}: ProductAvailabilityScreenProps) {
  const [subView, setSubView] = useState<"main" | "status">("main");
  const [trackStock, setTrackStock] = useState<boolean>(product.trackStock);
  const [isOutOfStockManual, setIsOutOfStockManual] = useState<boolean>(
    Boolean(product.isOutOfStockManual)
  );
  const [isPreorder, setIsPreorder] = useState<boolean>(Boolean(product.isPreorder));
  const [preorderNote, setPreorderNote] = useState<string>(product.preorderNote || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoUrl = product.images[0]?.url;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackStock,
          isOutOfStockManual,
          isPreorder,
          preorderNote,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save availability.");
        return;
      }

      onUpdateProduct(data.product);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (subView === "status") {
    return (
      <ProductStatusScreen
        product={product}
        onBack={() => setSubView("main")}
        onUpdateStatus={async (newStatus) => {
          await onChangeStatus?.(newStatus);
          setSubView("main");
        }}
        onArchive={async () => {
          await onArchive();
          onBack();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-28">
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
            Product availability
          </h1>

          <button
            type="button"
            onClick={onEdit}
            className="text-[15px] font-bold text-[#00A859] hover:text-[#00964E] transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* Product Hero Image */}
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 mb-4 shadow-xs">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#E8F8EF] flex items-center justify-center text-[#00A859] font-bold text-4xl">
              👕
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F8EF] text-[#00A859] capitalize">
            {product.status.toLowerCase()}
          </span>
          {isOutOfStockManual && (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FCE7EA] text-[#C2414A]">
              Out of stock · manual
            </span>
          )}
        </div>

        {/* Title & Price & Meta */}
        <h2 className="text-[24px] font-black tracking-tight text-neutral-900 leading-tight">
          {product.name}
        </h2>

        <p className="text-[22px] font-black text-neutral-900 mt-1 mb-1">
          {formatNairaFromKobo(product.priceKobo)}
        </p>

        <p className="text-xs text-neutral-500 font-medium mb-6">
          {product.sku ? `${product.sku} · ` : ""}
          {product.category || "General"}
        </p>

        {/* Track Stock Toggle Row */}
        <div className="border-t border-neutral-100 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-neutral-900">Track stock</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {trackStock
                  ? "On · units counted on orders and stock alerts active."
                  : "Off · no unit counts or stock alerts."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTrackStock(!trackStock)}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer ${
                trackStock ? "bg-[#00A859]" : "bg-neutral-300"
              }`}
              title="Toggle stock tracking"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform shadow-xs ${
                  trackStock ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <p className="text-[13px] text-neutral-500 font-normal mt-3 leading-relaxed">
            Without tracking, this product is always orderable unless you mark it out of stock below.
          </p>
        </div>

        {/* Mark out of stock Card */}
        <div className="rounded-3xl border border-neutral-200 bg-[#F9FAFB] p-4 shadow-xs mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-neutral-900">
                Mark out of stock
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isOutOfStockManual
                  ? "On · customers cannot order this product."
                  : "Off · customers can order this product."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOutOfStockManual(!isOutOfStockManual)}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer ${
                isOutOfStockManual ? "bg-[#00A859]" : "bg-neutral-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform shadow-xs ${
                  isOutOfStockManual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Customer Availability Callout Sub-card */}
          <div className="rounded-2xl bg-white border border-neutral-200 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-800">
              <Store className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-[10px] font-black tracking-wider uppercase text-neutral-500">
                CUSTOMER AVAILABILITY
              </span>
            </div>
            <p className="text-[17px] font-black text-neutral-900">
              {isPreorder
                ? "Pre-order"
                : isOutOfStockManual
                ? "Out of stock"
                : "In stock"}
            </p>
            <p className="text-xs text-neutral-500 font-normal">
              {isPreorder
                ? "Product is tagged as Pre-order. Instant bag checkout is disabled."
                : isOutOfStockManual
                ? "Ordering is unavailable."
                : "Ordering is available to customers."}
            </p>
          </div>
        </div>

        {/* Pre-order Toggle Card */}
        <div className="rounded-3xl border border-neutral-200 bg-[#F9FAFB] p-4 shadow-xs mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold text-neutral-900">Pre-order product</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Pre-order
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isPreorder
                  ? "On · Product shows Pre-order badge; cart ordering button is replaced so customers don't pay upfront."
                  : "Off · Standard shopping and ordering applies."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPreorder(!isPreorder)}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer ${
                isPreorder ? "bg-[#00A859]" : "bg-neutral-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform shadow-xs ${
                  isPreorder ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {isPreorder && (
            <div className="space-y-2 pt-2 border-t border-neutral-200">
              <label className="text-xs font-bold text-neutral-700 block">
                Pre-order release note or timeframe (optional)
              </label>
              <input
                type="text"
                value={preorderNote}
                onChange={(e) => setPreorderNote(e.target.value)}
                placeholder="e.g. Expected to ship Nov 20, or Limited batch"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859]"
              />
              <p className="text-[11px] text-neutral-500">
                Customers see this note on the product page and can register interest or contact on WhatsApp without an order button.
              </p>
            </div>
          )}
        </div>

        {/* Amber warning callout when marked out of stock */}
        {isOutOfStockManual && (
          <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3.5 flex items-start gap-2.5 mb-5">
            <AlertTriangle className="w-4 h-4 text-[#92400E] stroke-[2.5] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E] leading-relaxed font-medium">
              Turn off “Mark out of stock” when you’re ready to accept orders again.
            </p>
          </div>
        )}

        {/* Error / Success Feedback */}
        {error && (
          <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl mb-3">
            {error}
          </p>
        )}
        {savedSuccess && (
          <p className="text-xs font-bold text-[#00A859] bg-[#E8F8EF] p-3 rounded-xl mb-3 text-center">
            Availability settings saved successfully!
          </p>
        )}

        {/* Save Availability Button */}
        <div className="mb-6">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving availability...
              </span>
            ) : (
              "Save availability"
            )}
          </button>
        </div>

        {/* Product Status Navigation Link */}
        <button
          type="button"
          onClick={() => setSubView("status")}
          className="w-full flex items-center justify-between py-3.5 border-t border-neutral-100 text-left group cursor-pointer"
        >
          <div>
            <h4 className="text-sm font-bold text-neutral-900">Product status</h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              {product.status === "ACTIVE"
                ? isOutOfStockManual
                  ? "Active · visible, but not orderable"
                  : "Active · visible and orderable"
                : `${product.status} · manage visibility`}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
        </button>
      </div>

      <MerchantBottomNav active="products" pendingBadgeCount={pendingBadgeCount} />
    </div>
  );
}
