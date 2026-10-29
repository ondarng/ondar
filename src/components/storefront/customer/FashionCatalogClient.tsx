"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageCircle, Search, ShoppingBag, X } from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import type { CatalogProduct } from "./StorefrontCatalogClient";

interface FashionCatalogProps {
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

export function FashionCatalogClient(props: FashionCatalogProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <FashionCatalogContent {...props} />
    </CartProvider>
  );
}

function FashionCatalogContent({
  businessName,
  storeSlug,
  description,
  city = "Lagos",
  state = "Nigeria",
  whatsappNumber,
  phoneNumber,
  products,
}: FashionCatalogProps) {
  const { totalCount } = useCart();

  const [activeTab, setActiveTab] = useState<"all" | "ready" | "custom">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Extract categories dynamically with count and preview image
  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number; image?: string }>();
    products.forEach((p) => {
      const cat = p.category?.trim();
      if (cat) {
        const existing = map.get(cat.toLowerCase());
        if (!existing) {
          map.set(cat.toLowerCase(), {
            name: cat,
            count: 1,
            image: p.images[0]?.url,
          });
        } else {
          existing.count += 1;
        }
      }
    });

    // If merchant has few or no categories set, supply high-fashion fallbacks mapped to products
    const list = Array.from(map.values());
    if (list.length === 0) {
      return [
        { name: "Dresses", count: products.length, image: products[0]?.images[0]?.url },
        { name: "Tops", count: products.length, image: products[1]?.images[0]?.url },
        { name: "Native wear", count: products.length, image: products[2]?.images[0]?.url },
        { name: "Bags", count: products.length, image: products[3]?.images[0]?.url },
      ];
    }
    return list;
  }, [products]);

  // Filter products by tab, category, and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isCustomOrder =
        (p.trackStock && p.stockOnHand - p.stockReserved <= 0) ||
        p.name.toLowerCase().includes("measure") ||
        p.name.toLowerCase().includes("made to order") ||
        (p.description && p.description.toLowerCase().includes("made to order"));

      if (activeTab === "ready" && isCustomOrder) return false;
      if (activeTab === "custom" && !isCustomOrder) return false;

      if (
        selectedCategory &&
        p.category?.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesCat = p.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [products, activeTab, selectedCategory, searchQuery]);

  const cleanWhatsapp = (whatsappNumber || phoneNumber || "").replace(/[^0-9]/g, "");

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-20 font-sans selection:bg-neutral-900 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-black text-white text-[11px] font-medium py-2 px-4 text-center tracking-tight">
        Ready to wear ships in 24 hours. Made to order takes 5 to 7 days.
      </div>

      <div className="max-w-[440px] mx-auto px-4">
        {/* 2. BRAND SERIF HEADER */}
        <header className="sticky top-0 z-30 bg-[#FDFDFD]/95 backdrop-blur-md py-4 flex items-center justify-between border-b border-neutral-100 mb-4">
          <Link
            href={`/s/${storeSlug}`}
            className="font-serif font-black text-2xl tracking-[0.25em] text-neutral-900 uppercase"
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

        {/* 3. CIRCULAR CATEGORY STORIES */}
        <section className="mb-5">
          <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : cat.name)
                  }
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
                >
                  <div
                    className={`w-[60px] h-[60px] rounded-full overflow-hidden border transition-all flex items-center justify-center ${
                      isSelected
                        ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2"
                        : "border-neutral-200 bg-neutral-100 group-hover:border-neutral-400"
                    }`}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#E5E7EB] flex items-center justify-center text-xs font-serif font-bold text-neutral-600">
                        {cat.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[11px] transition-colors whitespace-nowrap ${
                      isSelected
                        ? "font-black text-neutral-900"
                        : "font-semibold text-neutral-700 group-hover:text-neutral-900"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. SEGMENT FILTER SWITCHER */}
        <div className="p-1 bg-neutral-100 rounded-xl grid grid-cols-3 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ready")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "ready"
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Ready to wear
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Made to order
          </button>
        </div>

        {/* 5. 2-COLUMN FASHION EDITORIAL GRID */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <p className="font-serif text-base font-bold text-neutral-700">No pieces found</p>
            <p className="text-xs mt-1">Try switching tabs or resetting filters.</p>
            {(selectedCategory || searchQuery || activeTab !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs font-bold text-neutral-900 underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-7">
            {filteredProducts.map((p) => {
              const priceNaira = Math.round(Number(p.priceKobo) / 100);
              const isMadeToOrder =
                (p.trackStock && p.stockOnHand - p.stockReserved <= 0) ||
                p.name.toLowerCase().includes("measure") ||
                p.name.toLowerCase().includes("made to order");

              const availableQty = p.trackStock ? p.stockOnHand - p.stockReserved : 99;
              const isLowStock = availableQty > 0 && availableQty <= 3;

              // Derive variant summary (e.g. "3 colours · S M L XL")
              let metaSubtitle = "Ready to ship";
              if (isMadeToOrder) {
                metaSubtitle = "Your measurements · 5 to 7 days";
              } else if (p.variants && p.variants.length > 0) {
                const sizes = Array.from(
                  new Set(
                    p.variants
                      .map((v) => v.title.split("/")[0]?.trim())
                      .filter((s) => ["S", "M", "L", "XL", "XXL", "One size"].includes(s))
                  )
                ).join(" ");
                metaSubtitle = sizes ? `Multiple sizes · ${sizes}` : `${p.variants.length} options`;
              }

              return (
                <Link
                  key={p.id}
                  href={`/s/${storeSlug}/p/${p.slug}`}
                  className="group flex flex-col cursor-pointer"
                >
                  {/* Portrait Image Container (aspect-[3/4]) */}
                  <div className="relative aspect-[3/4] w-full bg-[#E5E7EB] overflow-hidden">
                    {p.images[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 font-serif text-sm">
                        {p.name.slice(0, 1)}
                      </div>
                    )}

                    {/* Corner Badge */}
                    {isLowStock ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-[10px] font-bold text-neutral-900 shadow-2xs">
                        Only {availableQty} left
                      </span>
                    ) : isMadeToOrder ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-[10px] font-bold text-neutral-900 shadow-2xs">
                        Made to order
                      </span>
                    ) : null}
                  </div>

                  {/* Typography & Pricing */}
                  <div className="mt-2.5">
                    <h3 className="font-serif font-bold text-sm text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      ₦{priceNaira.toLocaleString("en-NG")}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 font-normal truncate">
                      {metaSubtitle}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 6. STORE INFORMATION & POLICIES FOOTER */}
        <section className="mt-14 pt-6 border-t border-neutral-200">
          <h4 className="text-[10px] font-black tracking-[0.18em] text-neutral-900 uppercase mb-2">
            STORE INFORMATION
          </h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Pickup in {city}, {state}. Delivery across Nigeria from ₦2,500. Exchanges within 3 days if unworn and with tags. Made-to-order pieces are final sale.
          </p>
          {cleanWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                `Hello ${businessName}, I am browsing your store on Ondar and have a question.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors"
            >
              Chat on WhatsApp
            </a>
          )}
        </section>

        {/* 7. MINIMAL FOOTER */}
        <footer className="mt-12 py-6 border-t border-neutral-100 text-center">
          <p className="text-[11px] font-medium text-neutral-400">
            Powered by <span className="font-bold text-neutral-600">Ondar</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
