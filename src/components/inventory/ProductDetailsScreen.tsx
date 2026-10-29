"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  History,
  Lock,
  Plus,
  Store,
} from "lucide-react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";
import {
  availableStock,
  formatNairaFromKobo,
  getStockState,
} from "@/lib/inventory";
import type { InventoryProduct } from "@/app/inventory/InventoryClient";
import type { ProductStatusValue } from "@/lib/inventory";
import { AdjustStockScreen } from "./AdjustStockScreen";
import { InventoryHistoryScreen } from "./InventoryHistoryScreen";
import { ProductStatusScreen } from "./ProductStatusScreen";
import { ProductAvailabilityScreen } from "./ProductAvailabilityScreen";
import { EditProductScreen } from "./EditProductScreen";

interface ProductDetailsScreenProps {
  product: InventoryProduct;
  storeSlug: string;
  storefrontUrl: string;
  pendingBadgeCount?: number;
  merchantName?: string;
  onBack: () => void;
  onEdit?: () => void;
  onUpdateProduct?: (updated: InventoryProduct) => void;
  onAdjustStock: (delta: number) => Promise<void>;
  onArchive: () => Promise<void>;
  onChangeStatus?: (newStatus: ProductStatusValue) => Promise<void>;
}

export function ProductDetailsScreen({
  product,
  storeSlug,
  storefrontUrl,
  pendingBadgeCount = 0,
  merchantName = "Ada",
  onBack,
  onEdit,
  onUpdateProduct,
  onAdjustStock,
  onArchive,
  onChangeStatus,
}: ProductDetailsScreenProps) {
  // Navigation inside product detail subsystem: "main" | "adjust" | "history" | "status" | "availability" | "edit"
  const [subView, setSubView] = useState<
    "main" | "adjust" | "history" | "status" | "availability" | "edit"
  >("main");

  const onHand = product.stockOnHand;
  const reserved = product.stockReserved;
  const available = availableStock(onHand, reserved);
  const stockState = getStockState(product);
  const threshold = product.lowStockThreshold || 8;
  const isLowStock = available <= threshold && available > 0;
  const isOutOfStock = available <= 0;

  const photoUrl = product.images[0]?.url;
  const productStoreUrl = `${storefrontUrl}/p/${product.slug}`;

  // Sub-screens
  if (subView === "adjust") {
    return (
      <AdjustStockScreen
        product={product}
        merchantName={merchantName}
        onBack={() => setSubView("main")}
        onSuccess={(updated) => {
          onUpdateProduct?.(updated);
          setSubView("main");
        }}
      />
    );
  }

  if (subView === "history") {
    return (
      <InventoryHistoryScreen
        product={product}
        merchantName={merchantName}
        onBack={() => setSubView("main")}
      />
    );
  }

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

  if (subView === "edit") {
    return (
      <EditProductScreen
        product={product}
        storeSlug={storeSlug}
        onBack={() => setSubView("main")}
        onSuccess={(updated) => {
          onUpdateProduct?.(updated);
          setSubView("main");
        }}
        onOpenAdjustStock={() => setSubView("adjust")}
      />
    );
  }

  // If viewing availability OR if product is untracked, render ProductAvailabilityScreen
  if (subView === "availability" || !product.trackStock) {
    return (
      <ProductAvailabilityScreen
        product={product}
        pendingBadgeCount={pendingBadgeCount}
        onBack={() => {
          if (!product.trackStock) {
            onBack();
          } else {
            setSubView("main");
          }
        }}
        onEdit={() => setSubView("edit")}
        onUpdateProduct={(updated) => {
          onUpdateProduct?.(updated);
        }}
        onArchive={onArchive}
        onChangeStatus={onChangeStatus}
      />
    );
  }

  // ==============================================================
  // MAIN VIEW: PRODUCT DETAILS (media_1792534651352_c8d84460.png)
  // ==============================================================
  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-28">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Back to inventory"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <h1 className="text-[20px] font-black tracking-tight text-neutral-900">
            Product details
          </h1>

          <button
            type="button"
            onClick={() => setSubView("edit")}
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

        {/* Tags Row */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F8EF] text-[#00A859] capitalize">
            {product.status.toLowerCase()}
          </span>

          <span className="text-xs text-neutral-500 font-medium">
            {product.category || "General"}
            {product.sku ? ` · ${product.sku}` : ""}
          </span>
        </div>

        {/* Title and Price */}
        <h2 className="text-[24px] font-black tracking-tight text-neutral-900 leading-tight">
          {product.name}
        </h2>

        <p className="text-[22px] font-black text-neutral-900 mt-1 mb-5">
          {formatNairaFromKobo(product.priceKobo)}
        </p>

        {/* ============================================================== */}
        {/* STOCK BALANCE */}
        {/* ============================================================== */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-neutral-900">Stock balance</h3>
            {isLowStock ? (
              <span className="bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold px-2 py-0.5 rounded-md">
                Low stock
              </span>
            ) : isOutOfStock ? (
              <span className="bg-[#FCE7EA] text-[#C2414A] text-[11px] font-bold px-2 py-0.5 rounded-md">
                Out of stock
              </span>
            ) : (
              <span className="bg-[#E8F8EF] text-[#00A859] text-[11px] font-bold px-2 py-0.5 rounded-md">
                In stock
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-2">
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

          <p className="text-[12px] text-neutral-500 font-normal mb-3">
            {onHand} on hand – {reserved} reserved = {available} available to sell
          </p>

          <button
            type="button"
            onClick={() => setSubView("adjust")}
            className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-[0.99]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Adjust stock</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* INVENTORY HISTORY */}
        {/* ============================================================== */}
        <button
          type="button"
          onClick={() => setSubView("history")}
          className="w-full flex items-center justify-between py-3.5 border-t border-neutral-100 text-left group cursor-pointer"
        >
          <div>
            <h4 className="text-sm font-bold text-neutral-900">
              Inventory history
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Why does it say {available}? See every stock event.
            </p>
          </div>
          <History className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
        </button>

        {/* ============================================================== */}
        {/* VARIANTS BREAKDOWN (if product has variants) */}
        {/* ============================================================== */}
        {product.variants && product.variants.length > 0 && (
          <div className="border-t border-neutral-100 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-neutral-900">
                Variants ({product.variants.length})
              </h4>
            </div>
            <div className="space-y-2">
              {product.variants.map((v: any) => {
                const vOnHand = typeof v.stockOnHand === "number" ? v.stockOnHand : 0;
                const vReserved = typeof v.stockReserved === "number" ? v.stockReserved : 0;
                const vAvailable = Math.max(0, vOnHand - vReserved);
                const isOut = vAvailable <= 0;
                return (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-[#F4F6F5] border border-neutral-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-neutral-900 text-sm">{v.title}</p>
                      <p className="text-neutral-500 font-mono text-[11px] mt-0.5">
                        {v.sku || (product.sku ? `${product.sku}-${v.title.replace(/[\s/]+/g, "-").toUpperCase()}` : v.title.replace(/[\s/]+/g, "-").toUpperCase())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 text-sm">
                        {v.priceKobo ? formatNairaFromKobo(v.priceKobo) : formatNairaFromKobo(product.priceKobo)}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                          isOut ? "bg-[#FCE7EA] text-[#C2414A]" : "bg-[#E8F8EF] text-[#00A859]"
                        }`}
                      >
                        {isOut ? "Out of stock" : `${vAvailable} available`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CUSTOMER AVAILABILITY CALLOUT (Clickable to open Product Availability) */}
        {/* ============================================================== */}
        <button
          type="button"
          onClick={() => setSubView("availability")}
          className="w-full text-left my-4 rounded-2xl bg-[#FFFBEB] hover:bg-[#FEF3C7]/70 border border-[#FDE68A] p-4 space-y-1 shadow-xs cursor-pointer transition-all group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#92400E]">
              <Store className="w-4 h-4 stroke-[2]" />
              <span className="text-[11px] font-black tracking-wider uppercase">
                CUSTOMER AVAILABILITY
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#92400E]/70 group-hover:text-[#92400E] group-hover:translate-x-0.5 transition-all" />
          </div>

          <p className="text-[18px] font-black text-neutral-900">
            {isOutOfStock
              ? "Out of stock"
              : isLowStock
              ? `Only ${available} left`
              : "In stock"}
          </p>

          <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
            <span>Low-stock threshold: {threshold} available units</span>
            <span className="text-[#92400E] font-bold text-[11px]">Manage availability →</span>
          </div>
        </button>

        {/* ============================================================== */}
        {/* PRIVACY COST PRICE */}
        {/* ============================================================== */}
        <div className="border-t border-neutral-100 pt-4 pb-4">
          <div className="flex items-center gap-1.5 text-neutral-800 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Only you can see this</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500 font-normal">Private cost</span>
            {(product as any).costKobo ? (
              <span className="text-sm font-bold text-neutral-900">
                {formatNairaFromKobo((product as any).costKobo)}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                Unknown
              </span>
            )}
          </div>

          {!(product as any).costKobo ? (
            <div className="mt-3 p-3.5 rounded-2xl bg-[#FAFAFA] border border-neutral-200/80 space-y-2">
              <p className="text-xs font-bold text-neutral-800">Profit unavailable</p>
              <p className="text-xs text-neutral-500 leading-snug">
                Add a cost price to calculate profit. We don’t assume a missing cost is ₦0.
              </p>
              <button
                type="button"
                onClick={() => setSubView("edit")}
                className="w-full py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold text-[#00A859] transition-colors cursor-pointer"
              >
                Add private cost
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-neutral-400 mt-1">
              Never shown on storefront, checkout, order links or receipts.
            </p>
          )}
        </div>

        {/* ============================================================== */}
        {/* STOREFRONT LINK */}
        {/* ============================================================== */}
        <div className="border-t border-neutral-100 pt-4 pb-4 space-y-2">
          <p className="text-xs font-bold text-neutral-800">Storefront link</p>
          <a
            href={productStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#00A859] hover:underline break-all block"
          >
            ondar.shop/{storeSlug}/{product.slug}
          </a>

          <a
            href={productStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs font-bold text-neutral-800 hover:text-neutral-950 pt-1 group"
          >
            <span>View on storefront</span>
            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
          </a>
        </div>

        {/* ============================================================== */}
        {/* PRODUCT STATUS */}
        {/* ============================================================== */}
        <button
          type="button"
          onClick={() => setSubView("status")}
          className="w-full flex items-center justify-between py-3.5 border-t border-neutral-100 text-left group cursor-pointer"
        >
          <div>
            <h4 className="text-sm font-bold text-neutral-900">Product status</h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              {product.status === "ACTIVE"
                ? "Active · for sale on storefront"
                : `${product.status} · manage visibility or archive`}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
        </button>
      </div>

      <MerchantBottomNav active="products" pendingBadgeCount={pendingBadgeCount} />
    </div>
  );
}
