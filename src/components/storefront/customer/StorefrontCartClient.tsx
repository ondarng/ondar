"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, ShoppingBag, Truck, FileText } from "lucide-react";
import { formatToWhatsappNumber, getWhatsappChatUrl } from "@/lib/phone";
import { OndarLogo } from "@/components/OndarLogo";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";

interface StorefrontCartClientProps {
  businessName: string;
  storeSlug: string;
  city?: string;
  state?: string;
  tagline?: string | null;
  whatsappNumber?: string;
  phoneNumber?: string;
  returnPolicy?: string | null;
  coveragePreview?: string;
  previewTemplate?: string;
  defaultSeedItems?: {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    imageUrl: string;
    priceKobo: number;
    variantTitle?: string;
    quantity: number;
    availableStock?: number;
  }[];
}

export function StorefrontCartClient(props: StorefrontCartClientProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <CartContent {...props} />
    </CartProvider>
  );
}

function CartContent({
  businessName,
  storeSlug,
  city = "Ikeja",
  state = "Lagos",
  tagline,
  whatsappNumber,
  phoneNumber,
  coveragePreview,
  previewTemplate,
}: StorefrontCartClientProps) {
  const router = useRouter();
  const { items, totalCount, subtotalNaira } = useCart();

  const storeUrl = previewTemplate ? `/s/${storeSlug}?previewTemplate=${previewTemplate}` : `/s/${storeSlug}`;
  const checkoutUrl = previewTemplate ? `/s/${storeSlug}/checkout?previewTemplate=${previewTemplate}` : `/s/${storeSlug}/checkout`;

  const initials = businessName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SS";

  const waLink = getWhatsappChatUrl(
    whatsappNumber || phoneNumber,
    `Hello ${businessName}, I have a question about my cart / order.`
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] antialiased text-neutral-900 pb-32">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 border-b border-neutral-100 mb-4">
          <Link href={storeUrl} className="cursor-pointer">
            <OndarLogo />
          </Link>
          <span className="text-xs text-neutral-500 font-medium truncate max-w-[170px]">
            {businessName}
          </span>
        </header>

        {/* Merchant Info Banner */}
        <div className="mb-4">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            {businessName}
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            {tagline || "Everyday pieces, made with a little colour."}
          </p>

          <div className="mt-3.5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F8EF] text-[#00A859] flex items-center justify-center text-sm font-black flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-neutral-900 truncate">
                Clothing & accessories
              </p>
              <p className="text-xs text-neutral-500 mt-0.5 truncate font-normal">
                {city}, {state} · @{storeSlug}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery & Pickup Banner Card */}
        <div className="rounded-2xl bg-[#E8F8EF] p-4 border border-[#A7F3D0]/60 space-y-2 mb-6">
          <div className="flex items-center gap-2 text-[#00A859]">
            <Truck className="w-5 h-5 stroke-[2.2]" />
            <h2 className="text-sm font-black text-neutral-900 tracking-tight">
              Delivery & pickup
            </h2>
          </div>
          <p className="text-xs text-neutral-700 leading-relaxed font-normal">
            {coveragePreview ||
              `Delivery across ${state}. Free in ${city}; fees apply in other areas. Free pickup in ${city}, ${state}.`}
          </p>
          <div className="pt-0.5 border-t border-[#A7F3D0]/40">
            <Link
              href={`/s/${storeSlug}/checkout`}
              className="text-xs font-bold text-[#00A859] hover:underline"
            >
              Choose your location at checkout to see the exact fee.
            </Link>
          </div>
        </div>

        {/* In Your Bag Section */}
        <div className="space-y-3 mb-6">
          <h2 className="text-base font-black text-neutral-900 tracking-tight">
            In your bag
          </h2>

          {items.length === 0 ? (
            <div className="py-10 text-center rounded-2xl border border-neutral-200 bg-white p-6">
              <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-900">Your bag is empty</p>
              <Link
                href={storeUrl}
                className="mt-3 inline-block text-xs font-bold text-[#00A859] hover:underline"
              >
                Browse items
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-neutral-200/90 bg-white p-3.5 flex items-center gap-3.5 shadow-2xs"
                >
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200/80 flex items-center justify-center">
                    {item.imageUrl && item.imageUrl !== "/sample-product.png" ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-neutral-400">
                        <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-neutral-900 text-sm truncate">
                        {item.productName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#E8F8EF] text-[#00A859] text-[11px] font-bold flex-shrink-0">
                        Added
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 truncate font-normal">
                      {item.variantTitle || "Standard"} · Qty {item.quantity}
                    </p>
                    <p className="text-sm font-black text-neutral-900 mt-1">
                      ₦{((item.priceKobo * item.quantity) / 100).toLocaleString("en-NG")}
                    </p>
                  </div>
                </div>
              ))}

              {/* Contact Merchant Button */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
              >
                <MessageCircle className="w-4 h-4 text-[#00A859]" />
                <span>Contact {businessName}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 z-40">
          <div className="w-full max-w-[430px] mx-auto space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-black text-neutral-900">
                Your bag · {totalCount} {totalCount === 1 ? "item" : "items"}
              </span>
              <span className="text-lg font-black text-neutral-900 tracking-tight">
                ₦{subtotalNaira}
              </span>
            </div>

            <Link
              href={checkoutUrl}
              className="w-full h-13 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
