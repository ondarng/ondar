"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Cpu, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import type { ProductDetailProps } from "./StorefrontProductClient";

export function ElectronicsProductClient(props: ProductDetailProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <ElectronicsProductContent {...props} />
    </CartProvider>
  );
}

function ElectronicsProductContent({
  businessName,
  storeSlug,
  city = "Ikeja",
  state = "Lagos",
  whatsappNumber,
  phoneNumber,
  returnPolicy,
  previewTemplate,
  product,
}: ProductDetailProps) {
  const { addItem, totalCount } = useCart();

  const storeUrl = previewTemplate ? `/s/${storeSlug}?previewTemplate=${previewTemplate}` : `/s/${storeSlug}`;
  const cartUrl = previewTemplate ? `/s/${storeSlug}/cart?previewTemplate=${previewTemplate}` : `/s/${storeSlug}/cart`;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.[0]?.id || null
  );
  const [addedToast, setAddedToast] = useState(false);

  // Active variant resolution
  const activeVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const currentPriceKobo = activeVariant?.priceKobo
    ? Number(activeVariant.priceKobo)
    : Number(product.priceKobo);
  const currentPriceNaira = Math.round(currentPriceKobo / 100);

  const availableStock = activeVariant
    ? activeVariant.stockOnHand - activeVariant.stockReserved
    : product.trackStock
    ? product.stockOnHand - product.stockReserved
    : 99;
  const isOutOfStock = product.isOutOfStockManual || availableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      id: activeVariant ? `${product.id}-${activeVariant.id}` : product.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.images[0]?.url || "/sample-product.png",
      priceKobo: currentPriceKobo,
      variantTitle: activeVariant?.title,
      availableStock,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const cleanWhatsapp = (whatsappNumber || phoneNumber || "").replace(/[^0-9]/g, "");

  return (
    <main className="min-h-screen bg-[#0F172A] text-slate-100 pb-20 font-sans selection:bg-[#38BDF8] selection:text-slate-950">
      <div className="max-w-[480px] mx-auto px-4 pt-4">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-800">
          <Link
            href={storeUrl}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Back to store"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link
            href={storeUrl}
            className="font-black text-sm text-white tracking-tight flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-[#38BDF8]" />
            <span>{businessName}</span>
          </Link>

          <Link
            href={cartUrl}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{totalCount}</span>
          </Link>
        </header>

        {/* Product Media */}
        <div className="relative aspect-square w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden my-5">
          {product.images[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
              <Cpu className="w-12 h-12 text-slate-700" />
              <span className="text-xs font-mono">{product.name}</span>
            </div>
          )}

          {isOutOfStock ? (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider">
              Out of stock
            </div>
          ) : availableStock <= 3 && product.trackStock ? (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              Only {availableStock} left
            </div>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            {product.category && (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider border border-slate-700">
                {product.category}
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">{city}, {state}</span>
          </div>

          <h1 className="text-xl font-black text-white tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#38BDF8] tracking-tight">
              ₦{currentPriceNaira.toLocaleString("en-NG")}
            </span>
          </div>

          {product.description && (
            <p className="text-xs text-slate-400 leading-relaxed pt-1 whitespace-pre-line">
              {product.description}
            </p>
          )}
        </div>

        {/* Real Variants (if present) */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Configuration / Option
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const vStock = v.stockOnHand - v.stockReserved;
                const vOOS = vStock <= 0;
                const vPriceNaira = v.priceKobo
                  ? Math.round(Number(v.priceKobo) / 100)
                  : currentPriceNaira;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={vOOS}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      vOOS
                        ? "border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed"
                        : isSelected
                        ? "border-[#38BDF8] bg-sky-950/40 text-white shadow-xs"
                        : "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-bold truncate">{v.title}</p>
                    <p className="font-mono text-[11px] text-[#38BDF8] mt-0.5">
                      ₦{vPriceNaira.toLocaleString("en-NG")}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-black tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer uppercase ${
              isOutOfStock
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-[#38BDF8] hover:bg-[#0EA5E9] text-slate-950 shadow-md active:scale-[0.99]"
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to cart!</span>
              </>
            ) : isOutOfStock ? (
              <span>Currently Out of Stock</span>
            ) : (
              <span>Add to Cart · ₦{currentPriceNaira.toLocaleString("en-NG")}</span>
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
                className="inline-block text-xs font-bold text-sky-400 hover:text-sky-300 underline underline-offset-4"
              >
                Inquire on WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Store Delivery & Trust */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            <span>Store Fulfilment & Policies</span>
          </div>
          <p>
            Pickup available in {city}, {state}. Delivery rates computed securely at checkout.
          </p>
          {returnPolicy && <p className="text-[11px] text-slate-500">{returnPolicy}</p>}
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-slate-800/80 text-center text-slate-500 text-[11px]">
          Powered by <span className="font-bold text-slate-400">Ondar</span>
        </footer>
      </div>
    </main>
  );
}
