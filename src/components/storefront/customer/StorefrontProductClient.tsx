"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag, Truck, MessageCircle, Clock } from "lucide-react";
import { StorefrontHeader } from "./StorefrontHeader";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";

export interface ProductDetailProps {
  businessName: string;
  storeSlug: string;
  city?: string;
  state?: string;
  tagline?: string | null;
  whatsappNumber?: string;
  phoneNumber?: string;
  returnPolicy?: string | null;
  previewTemplate?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    priceKobo: string;
    category: string | null;
    description: string | null;
    stockOnHand: number;
    stockReserved: number;
    trackStock: boolean;
    isOutOfStockManual: boolean;
    isPreorder?: boolean;
    preorderNote?: string | null;
    lowStockThreshold: number | null;
    images: { url: string }[];
    variants: {
      id: string;
      title: string;
      priceKobo: string | null;
      stockOnHand: number;
      stockReserved: number;
      options: any;
    }[];
  };
}

export function StorefrontProductClient(props: ProductDetailProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <ProductContent {...props} />
    </CartProvider>
  );
}

function ProductContent({
  businessName,
  storeSlug,
  city = "Lagos",
  tagline,
  whatsappNumber,
  phoneNumber,
  previewTemplate,
  product,
}: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const storeUrl = previewTemplate ? `/s/${storeSlug}?previewTemplate=${previewTemplate}` : `/s/${storeSlug}`;
  const cartUrl = previewTemplate ? `/s/${storeSlug}/cart?previewTemplate=${previewTemplate}` : `/s/${storeSlug}/cart`;

  // Images
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imagesList =
    product.images.length > 0
      ? product.images.map((img) => img.url)
      : ["/sample-product.png"];
  const currentImage = imagesList[activeImageIndex] || imagesList[0];

  // Variants
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasVariants ? product.variants[0].id : null
  );

  const selectedVariant = hasVariants
    ? product.variants.find((v) => v.id === selectedVariantId) || product.variants[0]
    : null;

  // Stock calculation
  const stockRemaining = selectedVariant
    ? Math.max(0, selectedVariant.stockOnHand - selectedVariant.stockReserved)
    : Math.max(0, product.stockOnHand - product.stockReserved);

  // Price calculation
  const unitPriceKobo = selectedVariant?.priceKobo
    ? Number(selectedVariant.priceKobo)
    : Number(product.priceKobo);
  const nairaPrice = (unitPriceKobo / 100).toLocaleString("en-NG");

  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [customerPreorderName, setCustomerPreorderName] = useState("");

  const handleAddToCart = () => {
    if (stockRemaining <= 0) return;

    addItem(
      {
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: currentImage,
        priceKobo: unitPriceKobo,
        variantTitle: selectedVariant ? selectedVariant.title : "Standard · Single option",
        availableStock: stockRemaining,
      },
      quantity
    );

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const totalPrice = ((unitPriceKobo * quantity) / 100).toLocaleString("en-NG");

  return (
    <div className="min-h-screen bg-white antialiased text-gray-900 flex flex-col justify-between selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div>
        {/* Top Header */}
        <StorefrontHeader
          businessName={businessName}
          storeSlug={storeSlug}
          city={city}
          subtitle={tagline || "Everyday pieces, thoughtfully chosen"}
        />

        <main className="w-full max-w-[440px] mx-auto px-4 pb-8">
          {/* Back to shop */}
          <div className="py-3">
            <Link
              href={storeUrl}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#00A859] hover:underline cursor-pointer"
            >
              <span className="text-base leading-none">←</span>
              <span>Back to shop</span>
            </Link>
          </div>

          {/* Product Hero Image */}
          <div className="w-full aspect-[4/3] sm:aspect-square rounded-3xl bg-[#F6F5F2] overflow-hidden border border-gray-100 flex items-center justify-center">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Thumbnails if more than 1 */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-2 mt-2">
              {imagesList.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-[#00A859]"
                      : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Stock Badge & Category */}
          <div className="flex items-center justify-between mt-4">
            {product.isPreorder ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Pre-order</span>
              </span>
            ) : stockRemaining > 0 && stockRemaining <= 10 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#FEF3C7] text-[#92400E] text-xs font-semibold">
                Only {stockRemaining} left
              </span>
            ) : stockRemaining > 10 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#E8F8EF] text-[#00A859] text-xs font-semibold">
                In stock
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 text-xs font-semibold">
                Sold out
              </span>
            )}
            <span className="text-sm text-gray-500 font-normal">
              {product.category || "General"}
            </span>
          </div>

          {product.isPreorder && product.preorderNote && (
            <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed font-medium">
              {product.preorderNote}
            </div>
          )}

          {/* Product Title & Price */}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-2.5">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            ₦{nairaPrice}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed mt-2.5 whitespace-pre-line">
              {product.description}
            </p>
          )}

          {/* Variant Selector if product has variants */}
          {hasVariants && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Select Option:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const vStock = Math.max(0, v.stockOnHand - v.stockReserved);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#00A859] bg-[#E8F8EF] text-[#00A859] font-bold"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {v.title} {vStock <= 0 ? "(Sold out)" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 my-4" />

          {/* Quantity Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Quantity</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedVariant ? selectedVariant.title : "Standard · Single option"}
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl px-3 py-1 flex items-center gap-4 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="text-gray-700 hover:text-gray-900 font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-0.5"
                aria-label="Decrease quantity"
              >
                –
              </button>
              <span className="text-sm font-bold text-gray-900 w-4 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stockRemaining || 10, q + 1))}
                disabled={quantity >= (stockRemaining || 10)}
                className="text-gray-700 hover:text-gray-900 font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-0.5"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="flex items-start gap-3 mt-4">
            <Truck className="w-5 h-5 text-[#00A859] flex-shrink-0 mt-0.5 stroke-[2]" />
            <p className="text-xs text-gray-600 leading-snug">
              Delivery in selected {city || "Lagos"} areas or free pickup. Choose at checkout.
            </p>
          </div>

          {/* Success Toast */}
          {addedNotice && (
            <div className="mt-4 p-3 rounded-xl bg-[#E8F8EF] border border-[#A7F3D0] flex items-center justify-between text-xs text-[#00A859] font-bold animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to cart!</span>
              </div>
              <Link href={cartUrl} className="underline hover:text-[#008f4c]">
                View cart
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-[440px] mx-auto p-4">
          {product.isPreorder ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-indigo-50/80 border border-indigo-200 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-700" />
                    <span className="text-xs font-bold text-indigo-950">Pre-order Item</span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                    ₦{nairaPrice}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-snug">
                  This product is open for pre-order without immediate payment. You can enter your name below to reserve or message the merchant directly.
                </p>
                <input
                  type="text"
                  value={customerPreorderName}
                  onChange={(e) => setCustomerPreorderName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full h-10 px-3 rounded-xl border border-indigo-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-indigo-600 transition-colors"
                />
                {whatsappNumber || phoneNumber ? (
                  <a
                    href={`https://wa.me/${(whatsappNumber || phoneNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hello ${businessName}, I would like to pre-order "${product.name}" (₦${nairaPrice})${
                        customerPreorderName.trim() ? " - My name is " + customerPreorderName.trim() : ""
                      }.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 bg-[#00A859] hover:bg-[#008f4c] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Pre-order on WhatsApp</span>
                  </a>
                ) : (
                  <div className="w-full h-11 bg-indigo-100/70 border border-indigo-200 text-indigo-900 font-bold rounded-xl text-xs flex items-center justify-center">
                    Pre-order Only · General checkout disabled
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 font-normal">
                  {quantity} {quantity === 1 ? "item" : "items"}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₦{totalPrice}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stockRemaining <= 0}
                className="w-full bg-[#00A859] hover:bg-[#008f4c] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
                <span>{stockRemaining <= 0 ? "Sold out" : "Add to cart"}</span>
              </button>
            </>
          )}

          <p className="text-xs text-gray-400 text-center mt-3">
            Checkout powered by ondar
          </p>
        </div>
      </div>
    </div>
  );
}
