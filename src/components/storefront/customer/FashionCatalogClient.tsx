"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Search, ShoppingBag, X, FileText, ChevronRight } from "lucide-react";
import { formatToWhatsappNumber, getWhatsappChatUrl } from "@/lib/phone";
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
  previewTemplate?: string;
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
  logoUrl,
  city = "Lagos",
  state = "Nigeria",
  whatsappNumber,
  phoneNumber,
  returnPolicy,
  products,
  previewTemplate,
}: FashionCatalogProps) {
  const { totalCount } = useCart();

  const [activeStockFilter, setActiveStockFilter] = useState<"all" | "in_stock">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const storeUrl = previewTemplate ? `/s/${storeSlug}?previewTemplate=${previewTemplate}` : `/s/${storeSlug}`;
  const cartUrl = previewTemplate ? `/s/${storeSlug}/cart?previewTemplate=${previewTemplate}` : `/s/${storeSlug}/cart`;

  // Extract categories truthfully from active products (no fake fallback categories)
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
    return Array.from(map.values());
  }, [products]);

  // Filter products by stock status, category, and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const availableQty = p.trackStock ? p.stockOnHand - p.stockReserved : 99;
      const isPreorder = Boolean(p.isPreorder);
      const isOutOfStock = !isPreorder && (p.isOutOfStockManual || (p.trackStock && availableQty <= 0));

      if (activeStockFilter === "in_stock" && isOutOfStock) {
        return false;
      }

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
  }, [products, activeStockFilter, selectedCategory, searchQuery]);

  const cleanWhatsapp = formatToWhatsappNumber(whatsappNumber || phoneNumber);

  // Top announcement text: uses merchant description if available, otherwise city/state or brand headline
  const announcementText = description?.trim()
    ? description
    : `${businessName} · ${city}, ${state}`;

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-20 font-sans selection:bg-neutral-900 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-black text-white text-[11px] font-medium py-2 px-4 text-center tracking-tight truncate">
        {announcementText}
      </div>

      <div className="max-w-[440px] mx-auto px-4">
        {/* 2. BRAND SERIF HEADER */}
        <header className="sticky top-0 z-30 bg-[#FDFDFD]/95 backdrop-blur-md py-4 flex items-center justify-between border-b border-neutral-100 mb-4">
          <Link
            href={storeUrl}
            className="font-serif font-black text-2xl tracking-[0.25em] text-neutral-900 uppercase"
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

        {/* Editorial Highlight Banner (if banner/logo uploaded) */}
        {logoUrl && (
          <div className="relative aspect-[16/7] w-full overflow-hidden mb-5 bg-neutral-900 shadow-2xs">
            <img
              src={logoUrl}
              alt={businessName}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <span className="text-[9px] font-black tracking-widest uppercase bg-white text-black px-1.5 py-0.5">
                HIGHLIGHT
              </span>
              <p className="font-serif font-black text-base mt-1">{businessName}</p>
            </div>
          </div>
        )}

        {/* 3. CIRCULAR CATEGORY STORIES (only rendered if merchant has categories) */}
        {categories.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
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
        )}

        {/* 4. STOCK FILTER TABS */}
        <div className="p-1 bg-neutral-100 rounded-xl grid grid-cols-2 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveStockFilter("all")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeStockFilter === "all"
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            All pieces ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveStockFilter("in_stock")}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              activeStockFilter === "in_stock"
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            In stock
          </button>
        </div>

        {/* 5. 2-COLUMN FASHION EDITORIAL GRID */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <p className="font-serif text-base font-bold text-neutral-700">No pieces found</p>
            <p className="text-xs mt-1">Try resetting your filters.</p>
            {(selectedCategory || searchQuery || activeStockFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setActiveStockFilter("all");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs font-bold text-neutral-900 underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-7">
            {filteredProducts.map((p) => {
              const priceNaira = Math.round(Number(p.priceKobo) / 100);
              const availableQty = p.trackStock ? p.stockOnHand - p.stockReserved : 99;
              const isPreorder = Boolean(p.isPreorder);
              const isOutOfStock = !isPreorder && (p.isOutOfStockManual || (p.trackStock && availableQty <= 0));
              const isLowStock = !isPreorder && !isOutOfStock && availableQty > 0 && availableQty <= 3;

              let metaSubtitle = "";
              if (p.variants && p.variants.length > 0) {
                metaSubtitle = `${p.variants.length} option${p.variants.length > 1 ? "s" : ""}`;
              } else if (p.category) {
                metaSubtitle = p.category;
              }

              const productUrl = previewTemplate
                ? `/s/${storeSlug}/p/${p.slug}?previewTemplate=${previewTemplate}`
                : `/s/${storeSlug}/p/${p.slug}`;

              return (
                <Link
                  key={p.id}
                  href={productUrl}
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

                    {/* Stock Status Badge */}
                    {isPreorder ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-900 text-[10px] font-bold text-white shadow-2xs tracking-wider uppercase">
                        Pre-order
                      </span>
                    ) : isOutOfStock ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-neutral-900/90 text-[10px] font-bold text-white shadow-2xs">
                        Sold out
                      </span>
                    ) : isLowStock ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-[10px] font-bold text-neutral-900 shadow-2xs">
                        Only {availableQty} left
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
                    {metaSubtitle && (
                      <p className="text-[11px] text-neutral-500 mt-0.5 font-normal truncate">
                        {metaSubtitle}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 6. STORE INFORMATION & POLICIES FOOTER */}
        <section className="mt-14 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-2"><h4 className="text-[10px] font-black tracking-[0.18em] text-neutral-900 uppercase">STORE POLICIES</h4><Link href={`/s/${storeSlug}/policies`} className="text-xs font-bold text-neutral-900 flex items-center gap-1 hover:underline"><span>View policies</span><ChevronRight className="w-3.5 h-3.5" /></Link></div>


          <p className="text-xs text-neutral-600 leading-relaxed">
            Pickup available in {city}, {state}. Delivery options and exact rates computed at checkout.
            <Link href={`/s/${storeSlug}/policies`} className="ml-1 text-[#00A859] font-bold underline">Read store policies →</Link>
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
