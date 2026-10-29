"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import type { ProductDetailProps } from "./StorefrontProductClient";

export function FoodProductClient(props: ProductDetailProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <FoodProductContent {...props} />
    </CartProvider>
  );
}

interface ExtraAddon {
  id: string;
  name: string;
  priceNaira: number;
  priceKobo: number;
}

const DEFAULT_EXTRAS: ExtraAddon[] = [
  { id: "chicken", name: "Extra chicken", priceNaira: 1500, priceKobo: 150000 },
  { id: "plantain", name: "Extra plantain", priceNaira: 500, priceKobo: 50000 },
];

function FoodProductContent({
  businessName,
  storeSlug,
  city = "Ikeja",
  state = "Lagos",
  whatsappNumber,
  phoneNumber,
  product,
}: ProductDetailProps) {
  const router = useRouter();
  const { addItem, totalCount } = useCart();

  // Portion State (Regular vs Large)
  const [portion, setPortion] = useState<"regular" | "large">("regular");

  // Base price in Kobo and Naira
  const basePriceKobo = Number(product.priceKobo);
  const basePriceNaira = Math.round(basePriceKobo / 100);

  // Large portion markup (+₦1,500)
  const LARGE_PORTION_EXTRA_KOBO = 150000;
  const portionPriceKobo = portion === "large" ? basePriceKobo + LARGE_PORTION_EXTRA_KOBO : basePriceKobo;
  const portionPriceNaira = Math.round(portionPriceKobo / 100);

  // Selected extras
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Quantity Stepper
  const [quantity, setQuantity] = useState(1);

  // Calculate Unit & Total Price
  const extrasTotalKobo = selectedExtras.reduce((sum, extraId) => {
    const found = DEFAULT_EXTRAS.find((e) => e.id === extraId);
    return sum + (found ? found.priceKobo : 0);
  }, 0);

  const unitTotalKobo = portionPriceKobo + extrasTotalKobo;
  const unitTotalNaira = Math.round(unitTotalKobo / 100);

  const grandTotalKobo = unitTotalKobo * quantity;
  const grandTotalNaira = Math.round(grandTotalKobo / 100);

  // Visual Added feedback
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToOrder = () => {
    const extrasNames = selectedExtras
      .map((id) => DEFAULT_EXTRAS.find((e) => e.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    let variantDesc = portion === "large" ? "Large portion" : "Regular portion";
    if (extrasNames) {
      variantDesc += ` · ${extrasNames}`;
    }

    addItem(
      {
        id: `${product.id}-${portion}-${selectedExtras.sort().join("-")}`,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: product.images[0]?.url || "/default-product.png",
        priceKobo: unitTotalKobo,
        variantTitle: variantDesc,
        availableStock: 99,
      },
      quantity
    );

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 2000);
  };

  const cleanWhatsapp = (whatsappNumber || phoneNumber || "").replace(/[^0-9]/g, "");

  // Servings and Prep Info
  let prepInfo = "Serves 1 · Ready in 40 minutes";
  if (product.name.toLowerCase().includes("tray")) prepInfo = "Serves 10 · Needs 24 hours notice";
  else if (product.name.toLowerCase().includes("soup")) prepInfo = "Serves 1 to 2 · Ready in 45 minutes";
  else if (product.name.toLowerCase().includes("snack") || product.name.toLowerCase().includes("puff")) prepInfo = "Serves 1 · Ready in 20 minutes";

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-20 font-sans selection:bg-[#BA3C1D] selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#FDFDFD]/95 backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-neutral-100">
        <Link
          href={`/s/${storeSlug}`}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <Link
          href={`/s/${storeSlug}`}
          className="font-serif font-black text-xl text-neutral-900 tracking-tight"
        >
          {businessName}
        </Link>

        <Link
          href={`/s/${storeSlug}/cart`}
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

          <div className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-neutral-900 rounded-md shadow-2xs">
            Photo
          </div>
        </div>

        {/* 3. DISH TITLE & PREP METADATA */}
        <div className="space-y-1.5 mb-6">
          <h1 className="font-serif font-black text-2xl text-neutral-900 tracking-tight">
            {product.name}
          </h1>

          <p className="text-xs font-medium text-neutral-500">
            {prepInfo}
          </p>

          <p className="text-xs text-neutral-600 leading-relaxed pt-1.5">
            {product.description ||
              "Cooked fresh with authentic Nigerian spices, fine ingredients, and served hot upon order."}
          </p>
        </div>

        {/* 4. PORTION SELECTOR */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-neutral-900 mb-2.5">
            Portion
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPortion("regular")}
              className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                portion === "regular"
                  ? "bg-[#B83818] text-white shadow-xs"
                  : "bg-white border border-[#B83818] text-[#B83818] hover:bg-neutral-50"
              }`}
            >
              Regular · ₦{basePriceNaira.toLocaleString("en-NG")}
            </button>

            <button
              type="button"
              onClick={() => setPortion("large")}
              className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                portion === "large"
                  ? "bg-[#B83818] text-white shadow-xs"
                  : "bg-white border border-[#B83818] text-[#B83818] hover:bg-neutral-50"
              }`}
            >
              Large · ₦{(basePriceNaira + 1500).toLocaleString("en-NG")}
            </button>
          </div>
        </div>

        {/* 5. ADD EXTRAS */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-neutral-900 mb-2.5">
            Add extras
          </label>
          <div className="space-y-2">
            {DEFAULT_EXTRAS.map((extra) => {
              const isChecked = selectedExtras.includes(extra.id);
              return (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => toggleExtra(extra.id)}
                  className={`w-full p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? "border-[#B83818] bg-[#FCE7D2]/30 text-neutral-900"
                      : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked
                          ? "border-[#B83818] bg-[#B83818] text-white"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{extra.name}</span>
                  </div>
                  <span className="font-extrabold text-neutral-900">
                    +₦{extra.priceNaira.toLocaleString("en-NG")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. QUANTITY STEPPER */}
        <div className="flex items-center justify-center gap-5 my-6">
          <button
            type="button"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-base font-black text-neutral-900 w-8 text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-neutral-700 hover:bg-neutral-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 7. PRIMARY CTA: ADD TO ORDER */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleAddToOrder}
            className="w-full py-3.5 px-4 rounded-xl bg-[#B83818] hover:bg-[#A33014] text-white text-xs font-black tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to order!</span>
              </>
            ) : (
              <span>Add to order · ₦{grandTotalNaira.toLocaleString("en-NG")}</span>
            )}
          </button>

          <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
            Minimum order ₦5,000. Your total, including delivery and any payment fee, is shown at checkout before you pay.
          </p>
        </div>

        {/* 8. KITCHEN DELIVERY & RETURNS POLICIES */}
        <div className="pt-5 border-t border-neutral-200 space-y-2.5 text-xs leading-relaxed">
          <div>
            <span className="font-bold text-neutral-900">Delivery. </span>
            <span className="text-neutral-600">
              {state} from ₦1,500. Pickup in {city} is free.
            </span>
          </div>

          <div>
            <span className="font-bold text-neutral-900">Returns. </span>
            <span className="text-neutral-600">
              Cooked food can&apos;t be returned. Tell us within an hour if something is wrong.
            </span>
          </div>
        </div>

        {/* 9. FOOTER */}
        <footer className="mt-14 py-6 border-t border-neutral-100 text-center">
          <p className="text-[11px] font-medium text-neutral-400">
            Powered by <span className="font-bold text-neutral-600">Ondar</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
