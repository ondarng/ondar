"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, ShoppingBag } from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import type { ProductDetailProps } from "./StorefrontProductClient";

export function FashionProductClient(props: ProductDetailProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <FashionProductContent {...props} />
    </CartProvider>
  );
}

function FashionProductContent({
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
  const isLowStock = !isOutOfStock && stockRemaining > 0 && stockRemaining <= 3;

  // Price calculation
  const currentPriceKobo = activeVariant?.priceKobo
    ? Number(activeVariant.priceKobo)
    : Number(product.priceKobo);
  const currentPriceNaira = Math.round(currentPriceKobo / 100);

  // Added to bag visual feedback
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToBag = () => {
    if (isOutOfStock) return;

    addItem({
      id: activeVariant ? `${product.id}-${activeVariant.id}` : product.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.images[0]?.url || "/sample-product.png",
      priceKobo: currentPriceKobo,
      variantTitle: activeVariant ? activeVariant.title : undefined,
      availableStock: stockRemaining,
    });

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 2000);
  };

  const cleanWhatsapp = (whatsappNumber || phoneNumber || "").replace(/[^0-9]/g, "");

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-20 font-sans selection:bg-neutral-900 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#FDFDFD]/95 backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-neutral-100">
        <Link
          href={storeUrl}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
          aria-label="Back to store"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <Link
          href={storeUrl}
          className="font-serif font-black text-xl tracking-[0.25em] text-neutral-900 uppercase"
        >
          {businessName}
        </Link>

        <Link
          href={cartUrl}
          className="text-xs font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1.5"
        >
          <span>Cart</span>
          {totalCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </Link>
      </header>

      <div className="max-w-[440px] mx-auto px-4 pt-2">
        {/* 2. FULL-WIDTH PORTRAIT HERO IMAGE (aspect-[3/4]) */}
        <div className="relative aspect-[3/4] w-full bg-[#E5E7EB] overflow-hidden mb-5">
          {product.images[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-serif text-2xl">
              {product.name}
            </div>
          )}

          {/* Out of stock or low stock badge */}
          {isOutOfStock ? (
            <div className="absolute top-3 left-3 bg-neutral-900/90 text-white text-[10px] font-bold px-2.5 py-1 tracking-wider uppercase">
              Sold out
            </div>
          ) : isLowStock ? (
            <div className="absolute top-3 left-3 bg-white/95 text-neutral-900 text-[10px] font-bold px-2.5 py-1 tracking-wider uppercase shadow-2xs">
              Only {stockRemaining} left
            </div>
          ) : null}
        </div>

        {/* 3. PRODUCT TITLE, PRICE & DESCRIPTION */}
        <div className="space-y-2 mb-6">
          {product.category && (
            <p className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              {product.category}
            </p>
          )}

          <h1 className="font-serif font-black text-2xl text-neutral-900 tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-neutral-900">
              ₦{currentPriceNaira.toLocaleString("en-NG")}
            </span>
            {isLowStock && (
              <span className="text-xs font-bold text-[#B45309]">
                Only {stockRemaining} remaining
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-xs text-neutral-600 leading-relaxed pt-1 whitespace-pre-line">
              {product.description}
            </p>
          )}
        </div>

        {/* 4. REAL VARIANTS (only rendered if product has real variants in database) */}
        {hasVariants && (
          <div className="mb-6">
            <label className="block text-[11px] font-black tracking-[0.12em] text-neutral-900 uppercase mb-2.5">
              Select Option
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const vStock = Math.max(0, v.stockOnHand - v.stockReserved);
                const vOOS = vStock <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={vOOS}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
                      vOOS
                        ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed line-through"
                        : isSelected
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 bg-white text-neutral-800 hover:border-black"
                    }`}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. ADD TO BAG CTA */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToBag}
            className={`w-full py-4 text-xs font-black tracking-[0.15em] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase ${
              isOutOfStock
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-black hover:bg-neutral-800 text-white shadow-md active:scale-[0.99]"
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>ADDED TO BAG</span>
              </>
            ) : isOutOfStock ? (
              <span>SOLD OUT</span>
            ) : (
              <span>ADD TO BAG · ₦{currentPriceNaira.toLocaleString("en-NG")}</span>
            )}
          </button>

          {cleanWhatsapp && (
            <div className="text-center">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                  `Hello ${businessName}! I am interested in ${product.name}${
                    activeVariant ? ` (${activeVariant.title})` : ""
                  }. Is this available?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-neutral-900 hover:text-neutral-600 underline underline-offset-4"
              >
                Inquire on WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* 6. STORE FULFILMENT & POLICIES */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
          <div className="flex items-center gap-2 text-neutral-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-neutral-900" />
            <span>Store policies & shipping</span>
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

        {/* 7. FOOTER */}
        <footer className="mt-12 py-6 border-t border-neutral-100 text-center text-neutral-400 text-[11px]">
          Powered by <span className="font-bold text-neutral-600">Ondar</span>
        </footer>
      </div>
    </main>
  );
}
