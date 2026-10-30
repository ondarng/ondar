"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import type { ProductDetailProps } from "./StorefrontProductClient";

export function FoodProductClient(props: ProductDetailProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <FoodProductContent {...props} />
    </CartProvider>
  );
}

function FoodProductContent({
  businessName,
  storeSlug,
  city = "Lagos",
  state = "Nigeria",
  whatsappNumber,
  phoneNumber,
  returnPolicy,
  previewTemplate,
  product,
}: ProductDetailProps) {
  const { addItem, totalCount } = useCart();

  const storeUrl = previewTemplate ? `/s/${storeSlug}?previewTemplate=${previewTemplate}` : `/s/${storeSlug}`;
  const cartUrl = previewTemplate ? `/s/${storeSlug}/cart?previewTemplate=${previewTemplate}` : `/s/${storeSlug}/cart`;

  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasVariants ? product.variants[0].id : null
  );

  const activeVariant = hasVariants
    ? product.variants.find((v) => v.id === selectedVariantId) || product.variants[0]
    : null;

  // Stock calculation
  const stockRemaining = activeVariant
    ? Math.max(0, activeVariant.stockOnHand - activeVariant.stockReserved)
    : product.trackStock
    ? Math.max(0, product.stockOnHand - product.stockReserved)
    : 99;

  const isOutOfStock = product.isOutOfStockManual || stockRemaining <= 0;

  // Price calculation
  const unitPriceKobo = activeVariant?.priceKobo
    ? Number(activeVariant.priceKobo)
    : Number(product.priceKobo);
  const unitPriceNaira = Math.round(unitPriceKobo / 100);

  // Quantity Stepper
  const [quantity, setQuantity] = useState(1);
  const totalPriceNaira = unitPriceNaira * quantity;

  // Added visual feedback
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToOrder = () => {
    if (isOutOfStock) return;

    addItem(
      {
        id: activeVariant ? `${product.id}-${activeVariant.id}` : product.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: product.images[0]?.url || "/sample-product.png",
        priceKobo: unitPriceKobo,
        variantTitle: activeVariant ? activeVariant.title : undefined,
        availableStock: stockRemaining,
      },
      quantity
    );

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 2000);
  };

  const cleanWhatsapp = (whatsappNumber || phoneNumber || "").replace(/[^0-9]/g, "");

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-20 font-sans selection:bg-[#BA3C1D] selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#FDFDFD]/95 backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-neutral-100">
        <Link
          href={storeUrl}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <Link
          href={storeUrl}
          className="font-serif font-black text-xl text-neutral-900 tracking-tight"
        >
          {businessName}
        </Link>

        <Link
          href={cartUrl}
          className="text-xs font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1.5"
        >
          <span>Cart</span>
          {totalCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#BA3C1D] text-white text-[10px] font-bold flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </Link>
      </header>

      <div className="max-w-[440px] mx-auto px-4 pt-2">
        {/* 2. FOOD PHOTO */}
        <div className="relative aspect-[16/10] w-full bg-[#FCE7D2]/40 rounded-2xl overflow-hidden mb-5 border border-neutral-100">
          {product.images[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <UtensilsCrossed className="w-10 h-10 text-[#BA3C1D]/40" />
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute top-3 left-3 bg-neutral-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
              Sold out
            </div>
          )}
        </div>

        {/* 3. DISH TITLE & DESCRIPTION */}
        <div className="space-y-1.5 mb-6">
          {product.category && (
            <span className="text-[10px] font-mono tracking-wider text-[#BA3C1D] uppercase font-bold">
              {product.category}
            </span>
          )}

          <h1 className="font-serif font-black text-2xl text-neutral-900 tracking-tight">
            {product.name}
          </h1>

          <p className="text-base font-bold text-neutral-900 pt-0.5">
            ₦{unitPriceNaira.toLocaleString("en-NG")}
          </p>

          {product.description && (
            <p className="text-xs text-neutral-600 leading-relaxed pt-1 whitespace-pre-line">
              {product.description}
            </p>
          )}
        </div>

        {/* 4. REAL VARIANTS (if configured by merchant) */}
        {hasVariants && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-neutral-900 mb-2">
              Select Option
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const vStock = Math.max(0, v.stockOnHand - v.stockReserved);
                const vOOS = vStock <= 0;
                const vPriceNaira = v.priceKobo
                  ? Math.round(Number(v.priceKobo) / 100)
                  : unitPriceNaira;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={vOOS}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left ${
                      vOOS
                        ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed line-through"
                        : isSelected
                        ? "border-[#BA3C1D] bg-[#FCE7D2]/40 text-[#BA3C1D]"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    <div>{v.title}</div>
                    <div className="text-[11px] text-neutral-500 font-normal mt-0.5">
                      ₦{vPriceNaira.toLocaleString("en-NG")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. QUANTITY STEPPER */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-100/80 mb-6">
          <span className="text-xs font-bold text-neutral-800">Quantity</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={quantity <= 1 || isOutOfStock}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-sm text-neutral-900 w-4 text-center">
              {quantity}
            </span>
            <button
              type="button"
              disabled={isOutOfStock || quantity >= stockRemaining}
              onClick={() => setQuantity((q) => Math.min(stockRemaining, q + 1))}
              className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6. ADD TO ORDER CTA BUTTON */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToOrder}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] ${
              isOutOfStock
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-[#BA3C1D] hover:bg-[#A33014] text-white"
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to order!</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold out</span>
            ) : (
              <span>Add to order · ₦{totalPriceNaira.toLocaleString("en-NG")}</span>
            )}
          </button>

          {cleanWhatsapp && (
            <div className="text-center">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                  `Hello ${businessName}! I am inquiring about ${product.name}${
                    activeVariant ? ` (${activeVariant.title})` : ""
                  }.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-[#BA3C1D] hover:opacity-80 underline underline-offset-4"
              >
                Inquire on WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* 7. STORE POLICIES */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
          <div className="flex items-center gap-2 text-neutral-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#BA3C1D]" />
            <span>Fulfilment & Policies</span>
          </div>
          <p>
            Pickup available in {city}, {state}. Delivery fees computed at checkout.
          </p>
          {returnPolicy && (
            <p className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/80">
              {returnPolicy}
            </p>
          )}
        </div>

        {/* 8. FOOTER */}
        <footer className="mt-12 py-6 border-t border-neutral-100 text-center text-neutral-400 text-[11px]">
          Powered by <span className="font-bold text-neutral-600">Ondar</span>
        </footer>
      </div>
    </main>
  );
}
