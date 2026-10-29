"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, MessageCircle, Plus, Search, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import type { CatalogProduct } from "./StorefrontCatalogClient";

interface FoodCatalogProps {
  businessName: string;
  storeSlug: string;
  description?: string | null;
  logoUrl?: string | null;
  city?: string;
  state?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  returnPolicy?: string | null;
  products: CatalogProduct[];
}

export function FoodCatalogClient(props: FoodCatalogProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <FoodCatalogContent {...props} />
    </CartProvider>
  );
}

function FoodCatalogContent({
  businessName,
  storeSlug,
  city = "Ikeja, Lagos",
  state = "Lagos",
  whatsappNumber,
  phoneNumber,
  products,
}: FoodCatalogProps) {
  const { items, totalCount, addItem, subtotalKobo, subtotalNaira } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickAddToast, setQuickAddToast] = useState<string | null>(null);

  // Extract food categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    const list = Array.from(set);
    if (list.length === 0) {
      return ["All", "Rice", "Soups", "Snacks", "Trays"];
    }
    return ["All", ...list];
  }, [products]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "All" && p.category?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [products, activeCategory, searchQuery]);

  const handleQuickAdd = (e: React.MouseEvent, p: CatalogProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const price = Number(p.priceKobo);
    addItem({
      id: p.id,
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      imageUrl: p.images[0]?.url || "/default-product.png",
      priceKobo: price,
      variantTitle: "Regular portion",
      availableStock: p.trackStock ? p.stockOnHand - p.stockReserved : 99,
    });

    setQuickAddToast(p.name);
    setTimeout(() => setQuickAddToast(null), 2000);
  };

  const cleanWhatsapp = (whatsappNumber || phoneNumber || "").replace(/[^0-9]/g, "");

  // Default Minimum order in Naira
  const MINIMUM_ORDER_NAIRA = 5000;
  const currentSubtotalNaira = Math.round(subtotalKobo / 100);
  const isMinMet = currentSubtotalNaira >= MINIMUM_ORDER_NAIRA;

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-28 font-sans selection:bg-[#BA3C1D] selection:text-white">
      <div className="max-w-[440px] mx-auto px-4 pt-4">
        {/* 1. KITCHEN HEADER */}
        <header className="flex items-center justify-between py-2 mb-3">
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

        {/* 2. APPETIZING HERO BANNER */}
        <section className="p-5 rounded-2xl bg-[#FCE7D2] text-neutral-900 mb-6 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[10px] font-bold text-[#15803D] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
              Open now · closes 8pm
            </span>
          </div>

          <h2 className="font-serif font-black text-2xl text-neutral-900 tracking-tight leading-snug max-w-[280px]">
            Home-cooked meals, delivered hot
          </h2>
          <p className="text-xs font-medium text-neutral-700 mt-2">
            Order by 4pm for same-day delivery
          </p>
        </section>

        {/* 3. CATEGORY NAVIGATION TABS */}
        <div className="flex items-center gap-5 border-b border-neutral-200 overflow-x-auto pb-2.5 mb-6 scrollbar-none text-xs">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap pb-1 transition-all cursor-pointer relative ${
                  isActive
                    ? "font-bold text-neutral-900"
                    : "font-medium text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <span>{cat}</span>
                {isActive && (
                  <div className="absolute left-0 right-0 -bottom-2.5 h-[2px] bg-[#BA3C1D]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Toast for quick add */}
        {quickAddToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#BA3C1D] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Added {quickAddToast} to order!</span>
          </div>
        )}

        {/* 4. 2-COLUMN FOOD CARD GRID */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <UtensilsCrossed className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
            <p className="font-serif text-base font-bold text-neutral-700">No dishes found</p>
            <p className="text-xs mt-1">Try switching categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-6">
            {filteredProducts.map((p) => {
              const priceNaira = Math.round(Number(p.priceKobo) / 100);
              const availableQty = p.trackStock ? p.stockOnHand - p.stockReserved : 99;
              const isSoldOut = p.isOutOfStockManual || (p.trackStock && availableQty <= 0);

              // Derive prep time or serving text
              let prepText = "40 min";
              if (p.name.toLowerCase().includes("tray")) prepText = "Serves 10";
              else if (p.name.toLowerCase().includes("soup")) prepText = "45 min";
              else if (p.name.toLowerCase().includes("snack") || p.name.toLowerCase().includes("puff")) prepText = "20 min";
              else if (p.name.toLowerCase().includes("pounded")) prepText = "60 min";

              return (
                <Link
                  key={p.id}
                  href={`/s/${storeSlug}/p/${p.slug}`}
                  className="group flex flex-col cursor-pointer"
                >
                  {/* Food Card Image Container */}
                  <div className="relative aspect-square w-full rounded-2xl bg-[#FCE7D2]/40 overflow-hidden border border-neutral-100">
                    {p.images[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1">
                        <UtensilsCrossed className="w-6 h-6 text-[#BA3C1D]/40" />
                        <span className="font-serif text-xs font-bold text-neutral-600">
                          {p.name.slice(0, 8)}
                        </span>
                      </div>
                    )}

                    {/* Sold out badge */}
                    {isSoldOut && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-bold text-neutral-900 shadow-2xs">
                        Sold out today
                      </div>
                    )}

                    {/* Floating Quick Add Button */}
                    {!isSoldOut && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, p)}
                        className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#BA3C1D] hover:bg-[#BA3C1D] hover:text-white transition-all cursor-pointer active:scale-90"
                        title="Add to order"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* Food Title & Pricing */}
                  <div className="mt-2.5">
                    <h3 className="font-bold text-xs text-neutral-900 group-hover:text-[#BA3C1D] transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                      ₦{priceNaira.toLocaleString("en-NG")} · {prepText}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 5. STORE INFORMATION */}
        <section className="mt-12 pt-6 border-t border-neutral-200">
          <h4 className="font-serif font-black text-base text-neutral-900 tracking-tight mb-2">
            Store information
          </h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Open daily 10am to 8pm. Pickup in {city} is free. Delivery across {state} from ₦1,500. Party trays need 24 hours notice. Cooked food can&apos;t be returned.
          </p>
          {cleanWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                `Hello ${businessName}! I would like to make an inquiry about your food menu.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-bold text-[#BA3C1D] underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Chat on WhatsApp
            </a>
          )}
        </section>

        {/* 6. MINIMAL FOOTER */}
        <footer className="mt-12 py-6 border-t border-neutral-100 text-center">
          <p className="text-[11px] font-medium text-neutral-400">
            Powered by <span className="font-bold text-neutral-600">Ondar</span>
          </p>
        </footer>
      </div>

      {/* 7. FLOATING MINIMUM ORDER / VIEW CART BAR */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-[440px] mx-auto pointer-events-none">
        <Link
          href={`/s/${storeSlug}/cart`}
          className="pointer-events-auto w-full py-3.5 px-4 rounded-2xl bg-[#4A4543] hover:bg-[#3D3836] text-white text-xs font-bold flex items-center justify-between shadow-xl transition-all active:scale-[0.99]"
        >
          {totalCount === 0 ? (
            <span className="mx-auto">Minimum order ₦{MINIMUM_ORDER_NAIRA.toLocaleString("en-NG")}</span>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white text-[#4A4543] text-[10px] font-bold flex items-center justify-center">
                  {totalCount}
                </span>
                <span>View Cart</span>
              </div>
              <span>
                {isMinMet ? (
                  `₦${currentSubtotalNaira.toLocaleString("en-NG")}`
                ) : (
                  `Add ₦${(MINIMUM_ORDER_NAIRA - currentSubtotalNaira).toLocaleString("en-NG")} for min`
                )}
              </span>
            </>
          )}
        </Link>
      </div>
    </main>
  );
}
