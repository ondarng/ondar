"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  ShoppingBag,
  FileText,
  Clock,
  Share2,
  Truck,
  Sparkles,
  ChevronRight,
  Heart,
} from "lucide-react";
import { formatToWhatsappNumber, getWhatsappChatUrl } from "@/lib/phone";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import { ProductShareModal } from "./ProductShareModal";
import { StorefrontFloatingWhatsapp } from "../StorefrontFloatingWhatsapp";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type { ProductDetailProps } from "./StorefrontProductClient";

export function LuxeFashionProductClient(props: ProductDetailProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <LuxeFashionProductContent {...props} />
    </CartProvider>
  );
}

function LuxeFashionProductContent({
  businessName,
  storeSlug,
  city = "Lagos",
  state = "Nigeria",
  tagline,
  whatsappNumber,
  phoneNumber,
  returnPolicy,
  previewTemplate,
  product,
}: ProductDetailProps) {
  const { addItem, totalCount } = useCart();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

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

  const isPreorder = Boolean(product.isPreorder);
  const isOutOfStock = !isPreorder && (product.isOutOfStockManual || stockRemaining <= 0);
  const isLowStock = !isPreorder && !isOutOfStock && product.trackStock && stockRemaining <= (product.lowStockThreshold || 3);

  // Price calculation
  const currentPriceKobo = activeVariant?.priceKobo
    ? Number(activeVariant.priceKobo)
    : Number(product.priceKobo);
  const currentPriceNaira = Math.round(currentPriceKobo / 100);

  // Pre-order name
  const [customerPreorderName, setCustomerPreorderName] = useState("");

  // Added visual feedback
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToBag = () => {
    if (isOutOfStock) return;

    addItem({
      id: activeVariant ? `${product.id}-${activeVariant.id}` : product.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.images[selectedImageIndex]?.url || product.images[0]?.url,
      priceKobo: currentPriceKobo,
      variantTitle: activeVariant?.title,
      availableStock: stockRemaining,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  const cleanWhatsapp = formatToWhatsappNumber(whatsappNumber || phoneNumber);
  const images = product.images.length > 0 ? product.images : [{ url: "/sample-product.png" }];
  const currentImage = images[selectedImageIndex] || images[0];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#141414] font-sans antialiased selection:bg-[#141414] selection:text-white pb-32">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#121212] text-[#E8E6DF] py-2 px-4 text-center text-[10px] font-medium tracking-[0.25em] uppercase border-b border-black/40">
        <span>{businessName} · Atelier & Ready-to-Wear · {city}, {state}</span>
      </div>

      {/* 2. REFINED HEADER WITH BACK LINK */}
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EAE6DF]">
        <div className="max-w-[480px] mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link
            href={storeUrl}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Collection</span>
          </Link>

          <Link href={storeUrl} className="text-center group">
            <h1 className="font-serif font-black text-xl tracking-[0.28em] text-[#121212] uppercase group-hover:opacity-85 transition-opacity">
              {businessName}
            </h1>
          </Link>

          <Link
            href={cartUrl}
            className="group relative flex items-center gap-1.5 py-1.5 px-2.5 rounded-full bg-black/5 hover:bg-black text-[#141414] hover:text-white transition-all duration-200"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
            <span className="text-[11px] font-bold tracking-wider uppercase font-mono">
              {totalCount}
            </span>
          </Link>
        </div>
      </header>

      {/* 3. PRODUCT CANVAS */}
      <main className="max-w-[480px] mx-auto px-5 pt-4 space-y-6">
        {/* Full-width 4:5 Portrait Editorial Hero Canvas */}
        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#ECE8DF] border border-[#E2DDD3]/60 shadow-xs">
          <img
            src={currentImage.url}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
            {isPreorder ? (
              <span className="bg-[#121212] text-white text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full shadow-xs">
                Pre-order Piece
              </span>
            ) : isOutOfStock ? (
              <span className="bg-neutral-800/90 text-white text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="bg-[#A44322] text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full shadow-xs">
                Only {stockRemaining} Left
              </span>
            ) : null}
          </div>

          {/* Like / Wishlist Button */}
          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-red-500 hover:bg-white transition-all shadow-xs cursor-pointer active:scale-90"
            aria-label="Save to Wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "stroke-[2]"
              }`}
            />
          </button>

          {/* Multiple Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === selectedImageIndex ? "bg-white w-5" : "bg-white/50"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. PRODUCT TITLE, PRICE & SHARE */}
        <div className="space-y-3 pb-2 border-b border-[#EAE6DF]">
          <div className="flex items-center justify-between">
            {product.category && (
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#8C847A]">
                {product.category} · Collection &apos;26
              </span>
            )}
            <span className="text-[11px] text-[#6B645C] font-mono">
              {city}, {state}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif font-black text-2xl md:text-3xl text-[#141414] tracking-tight leading-tight">
                {product.name}
              </h2>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-xl md:text-2xl font-black text-[#141414] font-mono">
                  ₦{currentPriceNaira.toLocaleString("en-NG")}
                </span>
                {!isOutOfStock && !isPreorder && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Ready to Dispatch
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 border border-[#E0DCD3] flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer shrink-0 shadow-2xs active:scale-95 mt-1"
              aria-label="Share product card"
            >
              <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Share</span>
            </button>
          </div>

          {product.isPreorder && product.preorderNote && (
            <div className="p-3.5 rounded-xl bg-[#FAF4E8] border border-[#E8DEC7] text-xs text-[#6E5421] font-medium leading-relaxed">
              <strong>Pre-order Note:</strong> {product.preorderNote}
            </div>
          )}

          {product.description && (
            <p className="text-xs text-[#524B43] leading-relaxed pt-1 whitespace-pre-line font-sans">
              {product.description}
            </p>
          )}
        </div>

        {/* 5. REAL VARIANTS (if configured) */}
        {hasVariants && (
          <div className="space-y-2.5 pb-2 border-b border-[#EAE6DF]">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-[#8C847A]">
              <span>Select Option / Size</span>
              {activeVariant && (
                <span className="text-neutral-900 lowercase font-medium">
                  selected: <strong>{activeVariant.title}</strong>
                </span>
              )}
            </div>

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
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      vOOS
                        ? "border-[#EAE6DF] bg-neutral-100 text-neutral-400 line-through cursor-not-allowed"
                        : isSelected
                        ? "border-[#141414] bg-[#141414] text-white shadow-xs"
                        : "border-[#E0DCD3] bg-white text-neutral-800 hover:border-black"
                    }`}
                  >
                    <span>{v.title}</span>
                    {v.priceKobo && Number(v.priceKobo) !== Number(product.priceKobo) && (
                      <span className="ml-1.5 opacity-80 font-mono text-[11px]">
                        · ₦{Math.round(Number(v.priceKobo) / 100).toLocaleString("en-NG")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. PRIMARY CALL TO ACTION BUTTON */}
        <div className="space-y-3 pt-1">
          {isPreorder ? (
            <div className="rounded-2xl border border-neutral-300 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 tracking-wide uppercase">
                  Bespoke Pre-order
                </span>
                <span className="text-[10px] font-bold tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
                  NO PAYMENT NOW
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                This atelier piece is open for pre-order. Enter your name below to register interest directly with the merchant on WhatsApp.
              </p>
              <input
                type="text"
                value={customerPreorderName}
                onChange={(e) => setCustomerPreorderName(e.target.value)}
                placeholder="Your name or size preference (optional)"
                className="w-full h-11 px-3.5 border border-[#E0DCD3] rounded-xl bg-[#FAF9F5] text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black font-sans transition-colors"
              />
              {cleanWhatsapp ? (
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                    `Hello ${businessName}! I would like to pre-order "${product.name}" (₦${currentPriceNaira.toLocaleString("en-NG")})${
                      customerPreorderName.trim() ? " - My name is " + customerPreorderName.trim() : ""
                    }.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold tracking-[0.15em] uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99]"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>PRE-ORDER ON WHATSAPP</span>
                </a>
              ) : (
                <div className="w-full py-3.5 bg-neutral-200 text-neutral-700 text-xs font-bold tracking-wider uppercase text-center rounded-xl">
                  PRE-ORDER ONLY · GENERAL ORDERS CLOSED
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToBag}
                className={`w-full py-4 rounded-xl text-xs font-black tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer ${
                  isOutOfStock
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none"
                    : addedToast
                    ? "bg-emerald-700 text-white"
                    : "bg-[#141414] hover:bg-black text-white"
                }`}
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>ADDED TO BAG · VIEW CART</span>
                  </>
                ) : isOutOfStock ? (
                  <span>SOLD OUT</span>
                ) : (
                  <span>ADD TO BAG · ₦{currentPriceNaira.toLocaleString("en-NG")}</span>
                )}
              </button>

              {cleanWhatsapp && (
                <div className="text-center pt-1">
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                      `Hello ${businessName}! I am interested in ${product.name}${
                        activeVariant ? ` (${activeVariant.title})` : ""
                      } (₦${currentPriceNaira.toLocaleString("en-NG")}). Is this piece available for immediate pickup or delivery?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#141414] hover:text-[#25D366] underline underline-offset-4 transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Inquire with Lagos Stylist on WhatsApp</span>
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* 7. FULFILMENT & ATELIER POLICIES */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] text-xs text-neutral-600 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-neutral-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#141414]" />
            <span>Atelier Fulfilment & Assurance</span>
          </div>
          <p className="leading-relaxed">
            Complimentary pickup in <strong>{city}, {state}</strong>. Direct courier delivery calculated securely at checkout.
          </p>
          <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between font-bold text-neutral-900">
            <Link
              href={`/s/${storeSlug}/policies`}
              className="hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              <span>View return policies & warranty terms</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* 8. FOOTER */}
        <footer className="mt-12 py-6 border-t border-[#EAE6DF] text-center text-neutral-400 text-[11px] space-y-1">
          <p className="font-serif font-bold text-xs tracking-wider uppercase text-neutral-800">
            {businessName}
          </p>
          <p>
            Powered by <span className="font-bold text-neutral-600">Ondar</span>
          </p>
        </footer>
      </main>

      {/* 9. SHARE MODAL */}
      <ProductShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={{
          name: product.name,
          slug: product.slug,
          priceKobo: product.priceKobo,
          imageUrl: currentImage.url,
          category: product.category,
        }}
        businessName={businessName}
        storeSlug={storeSlug}
      />

      {/* 10. FLOATING WHATSAPP FAB */}
      <StorefrontFloatingWhatsapp
        whatsappNumber={whatsappNumber}
        phoneNumber={phoneNumber}
        businessName={businessName}
        productName={product.name}
        priceNaira={currentPriceNaira}
        bottomOffsetClass="bottom-6"
      />
    </div>
  );
}
