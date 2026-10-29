"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Info,
  Ruler,
  ShoppingBag,
  X,
} from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import type { ProductDetailProps } from "./StorefrontProductClient";

export function FashionProductClient(props: ProductDetailProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <FashionProductContent {...props} />
    </CartProvider>
  );
}

// Preset color hex map for Nigerian fashion textiles
const COLOR_PALETTE: Record<string, string> = {
  blue: "#1E3A8A",
  "ankara blue": "#1E40AF",
  navy: "#0F172A",
  green: "#15803D",
  emerald: "#047857",
  brown: "#9A3412",
  rust: "#B45309",
  orange: "#C2410C",
  black: "#18181B",
  white: "#F8FAFC",
  cream: "#FEF3C7",
  red: "#DC2626",
  pink: "#DB2777",
  yellow: "#EAB308",
  gold: "#CA8A04",
  purple: "#7E22CE",
};

function FashionProductContent({
  businessName,
  storeSlug,
  city = "Lagos",
  whatsappNumber,
  phoneNumber,
  product,
}: ProductDetailProps) {
  const router = useRouter();
  const { addItem, totalCount } = useCart();

  // Color options
  const defaultColors = ["Ankara Blue", "Emerald Green", "Terracotta"];
  const colors = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      const extracted = product.variants
        .map((v) => {
          const parts = v.title.split("/");
          return parts.length > 1 ? parts[1].trim() : parts[0].trim();
        })
        .filter((c) => !["S", "M", "L", "XL", "XXL"].includes(c));
      const unique = Array.from(new Set(extracted));
      if (unique.length > 0) return unique;
    }
    return defaultColors;
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState(colors[0] || "Ankara Blue");

  // Size options
  const sizes = ["S", "M", "L", "XL"];
  const [selectedSize, setSelectedSize] = useState("M");

  // Out of stock sizes logic (XL strikes out if stock <= 3 as shown in design)
  const availableStock = product.trackStock ? product.stockOnHand - product.stockReserved : 99;
  const isOutOfStockSize = (sz: string) => {
    if (product.isOutOfStockManual) return true;
    if (sz === "XL" && availableStock <= 3) return true;
    return false;
  };

  // Custom Measurements Add-on (+₦3,000)
  const [makeToMeasurements, setMakeToMeasurements] = useState(false);
  const MEASUREMENTS_ADDON_NAIRA = 3000;
  const MEASUREMENTS_ADDON_KOBO = 300000;

  // Base price in Naira & Kobo
  const basePriceKobo = Number(product.priceKobo);
  const basePriceNaira = Math.round(basePriceKobo / 100);

  // Dynamic Total Price
  const effectivePriceKobo = makeToMeasurements
    ? basePriceKobo + MEASUREMENTS_ADDON_KOBO
    : basePriceKobo;
  const effectivePriceNaira = Math.round(effectivePriceKobo / 100);

  // Added to bag visual feedback
  const [addedToast, setAddedToast] = useState(false);

  // Size Guide Modal
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const handleAddToBag = () => {
    let variantDesc = `${selectedSize} · ${selectedColor}`;
    if (makeToMeasurements) {
      variantDesc += " (Bespoke measurements +₦3,000)";
    }

    addItem({
      id: `${product.id}-${selectedColor}-${selectedSize}-${makeToMeasurements ? "custom" : "std"}`,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.images[0]?.url || "/default-product.png",
      priceKobo: effectivePriceKobo,
      variantTitle: variantDesc,
      variantColor: selectedColor,
      variantSize: selectedSize,
      availableStock: makeToMeasurements ? 99 : availableStock,
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
          href={`/s/${storeSlug}`}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <Link
          href={`/s/${storeSlug}`}
          className="font-serif font-black text-xl tracking-[0.25em] text-neutral-900 uppercase"
        >
          {businessName}
        </Link>

        <Link
          href={`/s/${storeSlug}/cart`}
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

          {/* Color tag on image corner */}
          <div className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-neutral-900 tracking-tight shadow-2xs">
            {selectedColor}
          </div>
        </div>

        {/* 3. PRODUCT TITLE, PRICE & DESCRIPTION */}
        <div className="space-y-2 mb-6">
          <h1 className="font-serif font-black text-2xl text-neutral-900 tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-neutral-900">
              ₦{effectivePriceNaira.toLocaleString("en-NG")}
            </span>
            {availableStock > 0 && availableStock <= 3 && (
              <span className="text-xs font-bold text-[#B45309]">
                Only {availableStock} left
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed pt-1">
            {product.description ||
              "Lined wrap dress in bold print, tailored silhouette with fine artisan finishing."}
          </p>
        </div>

        {/* 4. COLOUR SWATCH SELECTOR */}
        <div className="mb-6">
          <label className="block text-[11px] font-black tracking-[0.12em] text-neutral-900 uppercase mb-2.5">
            COLOUR: {selectedColor.toUpperCase()}
          </label>
          <div className="flex items-center gap-3">
            {colors.map((c) => {
              const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
              const hexColor =
                COLOR_PALETTE[c.toLowerCase()] ||
                COLOR_PALETTE[c.toLowerCase().replace(/ankara|emerald|terracotta/, "").trim()] ||
                "#2563EB";

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-9 h-9 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                    isSelected
                      ? "ring-2 ring-neutral-900 ring-offset-2 scale-105"
                      : "hover:scale-105 border border-black/10"
                  }`}
                  style={{ backgroundColor: hexColor }}
                  title={c}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. SIZE SELECTOR WITH OUT-OF-STOCK STRIKE & SIZE GUIDE */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[11px] font-black tracking-[0.12em] text-neutral-900 uppercase">
              SIZE
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs font-semibold text-neutral-900 underline underline-offset-2 hover:text-neutral-600 cursor-pointer"
            >
              Size guide
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {sizes.map((sz) => {
              const isSelected = selectedSize === sz;
              const isOOS = isOutOfStockSize(sz);

              return (
                <button
                  key={sz}
                  type="button"
                  disabled={isOOS}
                  onClick={() => setSelectedSize(sz)}
                  className={`h-12 border text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${
                    isOOS
                      ? "border-neutral-200 text-neutral-300 bg-neutral-50 cursor-not-allowed"
                      : isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                  }`}
                >
                  <span>{sz}</span>
                  {/* Diagonal strike-through line for out-of-stock sizes */}
                  {isOOS && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-[1px] bg-neutral-400 rotate-45 transform" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. MADE TO ORDER MEASUREMENTS CHECKBOX */}
        <div className="mb-6 p-4 rounded-xl border border-neutral-200 bg-white">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={makeToMeasurements}
              onChange={(e) => setMakeToMeasurements(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-xs font-bold text-neutral-900">
                Make it to my measurements (+ ₦{MEASUREMENTS_ADDON_NAIRA.toLocaleString("en-NG")})
              </p>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Ready in 5 to 7 days. We will ask for your measurements on WhatsApp after you pay. Final sale.
              </p>
            </div>
          </label>
        </div>

        {/* 7. PRIMARY CTA: ADD TO BAG */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleAddToBag}
            className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] uppercase"
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Added to bag!</span>
              </>
            ) : (
              <span>ADD TO BAG · ₦{effectivePriceNaira.toLocaleString("en-NG")}</span>
            )}
          </button>

          {/* Secondary CTA: Message Seller */}
          {cleanWhatsapp && (
            <div className="text-center">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                  `Hello ${businessName}! I am interested in the ${product.name} (Colour: ${selectedColor}, Size: ${selectedSize}${
                    makeToMeasurements ? ", Custom Measurements" : ""
                  }). Is this available?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors"
              >
                Message seller
              </a>
            </div>
          )}

          <p className="text-[11px] text-neutral-400 text-center leading-relaxed pt-1">
            Your total, including delivery and any payment fee, is shown at checkout before you pay.
          </p>
        </div>

        {/* 8. POLICIES & DELIVERY BREAKDOWN */}
        <div className="pt-5 border-t border-neutral-200 space-y-3 text-xs leading-relaxed">
          <div>
            <span className="font-bold text-neutral-900">Delivery. </span>
            <span className="text-neutral-600">
              Ready to wear ships in 24 hours. Lagos from ₦2,500, other states from ₦4,000.
            </span>
          </div>

          <div>
            <span className="font-bold text-neutral-900">Returns. </span>
            <span className="text-neutral-600">
              Exchanges within 3 days if unworn and with tags. Made-to-order pieces are final sale.
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

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-neutral-900" />
                <h3 className="font-serif font-bold text-sm text-neutral-900 uppercase tracking-wider">
                  Women&apos;s Size Guide (Inches)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-neutral-400 hover:text-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 font-bold">
                    <th className="py-2">Size</th>
                    <th className="py-2">UK/NG</th>
                    <th className="py-2">Bust</th>
                    <th className="py-2">Waist</th>
                    <th className="py-2">Hips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  <tr>
                    <td className="py-2 font-bold">S</td>
                    <td className="py-2">8 - 10</td>
                    <td className="py-2">34 - 36&quot;</td>
                    <td className="py-2">26 - 28&quot;</td>
                    <td className="py-2">36 - 38&quot;</td>
                  </tr>
                  <tr className="bg-neutral-50 font-medium">
                    <td className="py-2 font-bold text-neutral-900">M</td>
                    <td className="py-2">12 - 14</td>
                    <td className="py-2">38 - 40&quot;</td>
                    <td className="py-2">30 - 32&quot;</td>
                    <td className="py-2">40 - 42&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">L</td>
                    <td className="py-2">16</td>
                    <td className="py-2">42 - 44&quot;</td>
                    <td className="py-2">34 - 36&quot;</td>
                    <td className="py-2">44 - 46&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">XL</td>
                    <td className="py-2">18</td>
                    <td className="py-2">46 - 48&quot;</td>
                    <td className="py-2">38 - 40&quot;</td>
                    <td className="py-2">48 - 50&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
