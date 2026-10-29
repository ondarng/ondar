"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Loader2,
  User,
} from "lucide-react";
import { availableStock } from "@/lib/inventory";
import type { InventoryProduct } from "@/app/inventory/InventoryClient";

interface AdjustStockScreenProps {
  product: InventoryProduct;
  merchantName?: string;
  onBack: () => void;
  onSuccess: (updatedProduct: InventoryProduct) => void;
}

export function AdjustStockScreen({
  product,
  merchantName = "Ada",
  onBack,
  onSuccess,
}: AdjustStockScreenProps) {
  const [mode, setMode] = useState<"ADD" | "REMOVE">("ADD");
  const [quantity, setQuantity] = useState("5");
  const [reason, setReason] = useState("Restock");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onHand = product.stockOnHand;
  const reserved = product.stockReserved;
  const available = availableStock(onHand, reserved);
  const photoUrl = product.images[0]?.url;

  const parsedQty = parseInt(quantity, 10);
  const validQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 0;

  // Review calculations
  const newOnHand = mode === "ADD" ? onHand + validQty : onHand - validQty;
  const newAvailable = mode === "ADD" ? available + validQty : Math.max(0, available - validQty);

  const isExcessiveRemoval = mode === "REMOVE" && validQty > available;

  const handleModeChange = (newMode: "ADD" | "REMOVE") => {
    setMode(newMode);
    setError(null);
    if (newMode === "ADD") {
      setReason("Restock");
    } else {
      setReason("Merchant correction");
    }
  };

  const handleConfirm = async () => {
    setError(null);
    if (validQty <= 0) {
      setError("Please enter a positive whole number.");
      return;
    }

    if (isExcessiveRemoval) {
      setError(`You can remove at most ${available} available units.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const delta = mode === "ADD" ? validQty : -validQty;
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          delta,
          reasonCode: mode === "ADD" ? "MANUAL_RESTOCK" : "MANUAL_CORRECTION",
          note: note.trim() || reason,
          actor: `${merchantName} · Merchant adjustment`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update stock.");
        return;
      }

      onSuccess(data.product);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-16">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="text-[20px] font-black tracking-tight text-neutral-900">
            Adjust stock
          </h1>
        </div>

        {/* Product Mini Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={product.name}
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
              {product.name}
            </h2>
            <p className="text-xs text-neutral-500 truncate mt-0.5">
              {product.sku ? `${product.sku} · ` : ""}
              {product.category || "General"}
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="rounded-2xl p-3.5 bg-[#F4F6F5] text-left">
            <p className="text-xs text-neutral-500 font-medium">On hand</p>
            <p className="text-[26px] font-black text-neutral-900 leading-tight mt-0.5">
              {onHand}
            </p>
          </div>
          <div className="rounded-2xl p-3.5 bg-[#F4F6F5] text-left">
            <p className="text-xs text-neutral-500 font-medium">Reserved</p>
            <p className="text-[26px] font-black text-neutral-900 leading-tight mt-0.5">
              {reserved}
            </p>
          </div>
          <div className="rounded-2xl p-3.5 bg-[#E8F8EF] text-left">
            <p className="text-xs text-[#00A859] font-bold">Available</p>
            <p className="text-[26px] font-black text-[#00A859] leading-tight mt-0.5">
              {available}
            </p>
          </div>
        </div>

        {/* Update your stock card */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs mb-6 space-y-5">
          {/* Top handle pill */}
          <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto" />

          <h3 className="text-[18px] font-bold text-neutral-900">
            Update your stock
          </h3>

          {/* Segmented Control */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F4F6F5]">
            <button
              type="button"
              onClick={() => handleModeChange("ADD")}
              className={`h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                mode === "ADD"
                  ? "bg-[#E8F8EF] text-[#00A859] shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Add units
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("REMOVE")}
              className={`h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                mode === "REMOVE"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Remove units
            </button>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-900 mb-1.5">
              {mode === "ADD" ? "Quantity to add" : "Quantity to remove"}
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError(null);
              }}
              className={`w-full h-12 px-4 rounded-xl border text-base font-bold text-neutral-900 outline-none transition-all ${
                isExcessiveRemoval
                  ? "border-red-500 bg-red-50/20 focus:border-red-500"
                  : "border-neutral-200 focus:border-neutral-400"
              }`}
            />
            {isExcessiveRemoval ? (
              <p className="text-xs font-semibold text-red-600 mt-1">
                ! You can remove up to {available} available units, not {validQty}.
              </p>
            ) : (
              <p className="text-[12px] text-neutral-400 mt-1">
                Enter a positive whole number.
              </p>
            )}
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-900 mb-1.5">
              Reason
            </label>
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-900 appearance-none outline-none focus:border-neutral-400 cursor-pointer"
              >
                {mode === "ADD" ? (
                  <>
                    <option value="Restock">Restock</option>
                    <option value="Inventory recount">Inventory recount</option>
                    <option value="Customer return">Customer return</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Merchant correction">Merchant correction</option>
                    <option value="Damaged during stock check">Damaged</option>
                    <option value="Lost / Theft">Lost / Theft</option>
                    <option value="Internal use">Internal use</option>
                    <option value="Inventory recount">Inventory recount</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Note Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-neutral-900">Note</label>
              <span className="text-[11px] text-neutral-400 font-normal">Optional</span>
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                mode === "ADD"
                  ? "e.g. New delivery from supplier"
                  : "e.g. Damaged during stock check"
              }
              className="w-full h-12 px-4 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900 outline-none focus:border-neutral-400 placeholder:text-neutral-400"
            />
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>Source: {merchantName} · Merchant adjustment</span>
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Review this change box */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-900">
              Review this change
            </h4>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-500">On hand</span>
              <span className="font-bold text-neutral-900">
                {onHand} → {newOnHand}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-500">Reserved</span>
              <span className="font-bold text-neutral-900">
                {reserved} → {reserved} (unchanged)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-500">Available</span>
              <span className="font-bold text-[#00A859]">
                {available} → {newAvailable}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Amber Warning Banner */}
          <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#92400E] stroke-[2.5] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E] leading-relaxed font-medium">
              {isExcessiveRemoval
                ? `The ${reserved} units held for orders cannot be removed. No stock has changed.`
                : `Removing stock? You can remove at most ${available} available units. The ${reserved} reserved units are protected; stock can never be negative.`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              disabled={isSubmitting || validQty <= 0 || isExcessiveRemoval}
              onClick={handleConfirm}
              className={`w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isExcessiveRemoval
                  ? "border border-neutral-300 bg-neutral-100 text-neutral-500 cursor-not-allowed"
                  : "bg-[#00A859] hover:bg-[#00964E] text-white disabled:opacity-50"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving stock...
                </span>
              ) : isExcessiveRemoval ? (
                "Review quantity"
              ) : (
                `Confirm · ${mode === "ADD" ? "add" : "remove"} ${validQty} unit${validQty === 1 ? "" : "s"}`
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onBack}
              className="w-full h-12 rounded-2xl border border-neutral-200 text-[#00A859] hover:bg-neutral-50 font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
