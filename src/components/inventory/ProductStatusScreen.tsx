"use client";

import React, { useState } from "react";
import {
  Archive,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import type { InventoryProduct } from "@/app/inventory/InventoryClient";
import type { ProductStatusValue } from "@/lib/inventory";

interface ProductStatusScreenProps {
  product: InventoryProduct;
  onBack: () => void;
  onUpdateStatus: (newStatus: ProductStatusValue) => Promise<void>;
  onArchive: () => Promise<void>;
}

export function ProductStatusScreen({
  product,
  onBack,
  onUpdateStatus,
  onArchive,
}: ProductStatusScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<ProductStatusValue>(
    product.status
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoUrl = product.images[0]?.url;

  const statusOptions: {
    value: ProductStatusValue;
    title: string;
    description: string;
  }[] = [
    {
      value: "DRAFT",
      title: "Draft",
      description: "Not public. Finish the details later.",
    },
    {
      value: "ACTIVE",
      title: "Active",
      description: "For sale on your storefront.",
    },
    {
      value: "HIDDEN",
      title: "Hidden",
      description: "Kept in inventory, not shown in your shop.",
    },
    {
      value: "ARCHIVED",
      title: "Archived",
      description: "Retired. Product and history are kept.",
    },
  ];

  const handleSaveNonArchive = async (status: ProductStatusValue) => {
    setSelectedStatus(status);
    setError(null);
    if (status === "ARCHIVED") return; // Handled by confirm archive card

    setIsSaving(true);
    try {
      await onUpdateStatus(status);
      onBack();
    } catch {
      setError("Failed to update status. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmArchive = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await onArchive();
      onBack();
    } catch {
      setError("Failed to archive product. Please try again.");
    } finally {
      setIsSaving(false);
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
            Product status
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

        {/* Current status pill */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-bold text-neutral-700">Current status</span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#E8F8EF] text-[#00A859] capitalize">
            {product.status.toLowerCase()}
          </span>
        </div>

        <p className="text-[14px] text-neutral-600 font-normal mb-5 leading-snug">
          Choose how this product appears in your shop.
        </p>

        {/* Status Option Radio Cards */}
        <div className="space-y-3 mb-4">
          {statusOptions.map((opt) => {
            const isSelected = selectedStatus === opt.value;
            const isArchivedOpt = opt.value === "ARCHIVED";

            return (
              <button
                key={opt.value}
                type="button"
                disabled={isSaving}
                onClick={() => {
                  if (isArchivedOpt) {
                    setSelectedStatus("ARCHIVED");
                  } else {
                    handleSaveNonArchive(opt.value);
                  }
                }}
                className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected && isArchivedOpt
                    ? "border-[#FDE68A] bg-[#FFFBEB]"
                    : isSelected
                    ? "border-[#00A859] bg-[#F0FAF5]"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "border-[#00A859] bg-[#00A859]"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-neutral-900 leading-snug">
                    {opt.title}
                  </p>
                  <p className="text-xs text-neutral-500 font-normal mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed mb-6">
          Hidden is a visibility choice — it does not mean the product is out of stock.
        </p>

        {error && (
          <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl mb-4">
            {error}
          </p>
        )}

        {/* Archive Confirmation Card */}
        {selectedStatus === "ARCHIVED" && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-neutral-900">
              <Archive className="w-5 h-5 text-neutral-700 stroke-[2.5]" />
              <h3 className="text-[17px] font-bold">Archive this product?</h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              <span className="font-bold text-neutral-900">{product.name}</span> will no longer be shown or available for new purchases.
            </p>

            <ul className="text-xs text-neutral-600 space-y-1.5 pl-1 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">•</span>
                <span>Inventory and stock history are kept.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">•</span>
                <span>The product stays visible in old orders.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">•</span>
                <span>Existing order details do not change.</span>
              </li>
            </ul>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmArchive}
                className="w-full h-12 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Archiving...
                  </span>
                ) : (
                  "Confirm archive"
                )}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => setSelectedStatus(product.status)}
                className="w-full h-12 rounded-2xl border border-neutral-200 text-[#00A859] hover:bg-neutral-50 font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                Cancel · keep {product.status === "ACTIVE" ? "Active" : "current"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
