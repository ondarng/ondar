"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Search,
  Truck,
  X,
} from "lucide-react";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontFooter } from "./StorefrontFooter";
import { CartProvider } from "@/context/StorefrontCartContext";

export interface CatalogProduct {
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
}

interface StorefrontCatalogClientProps {
  businessName: string;
  storeSlug: string;
  description?: string | null;
  logoUrl?: string | null;
  city?: string;
  state?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  returnPolicy?: string | null;
  deliveryCoverage?: string | null;
  products: CatalogProduct[];
  previewTemplate?: string;
}

export function StorefrontCatalogClient({
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
}: StorefrontCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Derive initials for avatar (e.g. "ia.")
  const initials = useMemo(() => {
    const parts = (businessName || "Store").trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}.`.toLowerCase();
    }
    return `${(businessName || "st").slice(0, 2)}.`.toLowerCase();
  }, [businessName]);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    // Default fallback categories if none set yet
    if (set.size === 0) {
      return ["All", "Bags", "Jewellery", "Accessories"];
    }
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === "All" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;

  const cleanWhatsapp = (whatsappNumber || "").replace(/[^0-9]/g, "");

  return (
    <CartProvider storeSlug={storeSlug}>
      <div className="min-h-screen bg-[#FDFDFD] antialiased text-neutral-900 selection:bg-[#00A859]/20 selection:text-[#00A859]">
        {/* Top Sticky Header */}
        <StorefrontHeader
          businessName={businessName}
          storeSlug={storeSlug}
          city={city}
          subtitle={description || "Everyday pieces, thoughtfully chosen"}
          previewTemplate={previewTemplate}
        />

        <div className="w-full max-w-[440px] mx-auto px-4 pt-4 flex flex-col">
          {/* Header Title / Back */}
          {isSearchActive ? (
            /* Search Mode Top Title */
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 -ml-1 text-neutral-700 hover:text-neutral-900 cursor-pointer"
                aria-label="Back to store"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">
                Search products
              </h1>
            </div>
          ) : (
            /* Standard Store Profile Card */
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3 text-neutral-900 font-black text-lg tracking-tight">
                <ArrowLeft className="w-4 h-4 cursor-pointer" />
                <span>Shop {businessName}</span>
              </div>

              <div className="flex items-start gap-3.5">
                {/* Store Avatar */}
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={businessName}
                    className="w-14 h-14 rounded-2xl object-cover border border-neutral-100 shadow-2xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#F2EDE4] text-neutral-900 font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight truncate">
                    {businessName}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2 font-normal">
                    {description || "Thoughtful little things for every day."}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 font-normal">
                    {city}, {state}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar Input */}
          <div className="relative mb-3.5">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or categories"
              className="w-full h-11 pl-10 pr-9 rounded-2xl bg-[#F4F4F4] text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
            {categories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                    active
                      ? "bg-[#171717] text-white shadow-2xs"
                      : "bg-[#F4F4F4] text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Result Count or Catalog Section Header */}
          {isSearchActive ? (
            <div className="mb-3 space-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-neutral-900">
                  {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"} for “{searchQuery}”
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold text-[#00A859] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-neutral-400 font-normal">
                In all categories · Search matches product names and categories.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {selectedCategory === "All" ? "All products" : selectedCategory}
              </h3>
              <span className="text-xs text-neutral-400 font-normal">
                {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
              </span>
            </div>
          )}

          {/* 2-Column Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 my-4 space-y-2">
              <p className="text-sm font-bold text-neutral-700">No products found</p>
              <p className="text-xs text-neutral-400">
                Try searching for something else or clear the filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-2 text-xs font-bold text-[#00A859] hover:underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredProducts.map((p) => {
                const nairaPrice = (Number(p.priceKobo) / 100).toLocaleString("en-NG");
                const imageUrl = p.images[0]?.url || "/sample-product.png";
                const availableStock = p.stockOnHand - p.stockReserved;
                const isOutOfStock =
                  p.isOutOfStockManual || (p.trackStock && availableStock <= 0);
                const hasVariants = p.variants && p.variants.length > 0;

                // Derive stock label matching the design
                let stockLabel = "In stock";
                let stockTone = "text-[#00A859]";

                if (isOutOfStock) {
                  stockLabel = "Sold out";
                  stockTone = "text-neutral-400";
                } else if (hasVariants) {
                  stockLabel = `In stock · ${p.variants.length} colours available`;
                } else if (p.trackStock && availableStock <= 3) {
                  stockLabel = `Only ${availableStock} left`;
                  stockTone = "text-[#D97706]";
                } else if (p.trackStock) {
                  stockLabel = `In stock · ${availableStock} available`;
                }

                const productUrl = previewTemplate
                  ? `/s/${storeSlug}/p/${p.slug}?previewTemplate=${previewTemplate}`
                  : `/s/${storeSlug}/p/${p.slug}`;

                return (
                  <Link
                    key={p.id}
                    href={productUrl}
                    className="flex flex-col group cursor-pointer"
                  >
                    {/* Square Image Card */}
                    <div className="aspect-square w-full rounded-2xl bg-[#F7F7F7] overflow-hidden border border-neutral-100 shadow-2xs relative">
                      <img
                        src={imageUrl}
                        alt={p.name}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          isOutOfStock ? "opacity-60 grayscale-[25%]" : ""
                        }`}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <span className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Sold out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="pt-2 flex flex-col">
                      <p className="text-xs font-bold text-neutral-900 truncate group-hover:text-[#00A859] transition-colors">
                        {p.name}
                      </p>
                      <p className="text-xs font-black text-neutral-900 mt-0.5">
                        ₦{nairaPrice}
                      </p>
                      <p className={`text-[11px] font-medium mt-0.5 truncate ${stockTone}`}>
                        {stockLabel}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Active Search Fallback Button */}
          {isSearchActive && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="w-full py-3 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs flex items-center justify-center shadow-2xs transition-colors"
              >
                Browse all {products.length} products
              </button>
              <p className="text-xs text-neutral-400 text-center font-normal px-2">
                Looking for something specific? Message {businessName} from the contact link below.
              </p>
            </div>
          )}

          {/* Store Delivery Banner & WhatsApp Support (Screen 1) */}
          {!isSearchActive && (
            <div className="mt-8 space-y-4">
              {/* Delivery Banner */}
              <div className="p-3.5 rounded-2xl bg-[#F9FAF9] border border-neutral-200/80 flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#00A859] flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-neutral-900">
                    {city || state} delivery · 2–4 business days
                  </p>
                  <p className="text-neutral-500 font-normal">
                    Delivery calculated at checkout.
                  </p>
                </div>
              </div>

              {/* Chat with us on WhatsApp */}
              {cleanWhatsapp && (
                <div>
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                      `Hello ${businessName}, I'm browsing your storefront on Ondar and have a question about a product.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 rounded-2xl border border-neutral-200 hover:bg-neutral-50 bg-white text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#00A859]" />
                    <span>Chat with us on WhatsApp</span>
                  </a>
                  <p className="text-xs text-neutral-400 text-center mt-2 font-normal">
                    Questions about a product? We’re happy to help.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Storefront Footer */}
          <StorefrontFooter
            businessName={businessName}
            whatsappNumber={whatsappNumber}
            phoneNumber={phoneNumber}
            city={city}
            state={state}
            returnPolicy={returnPolicy || undefined}
          />
        </div>
      </div>
    </CartProvider>
  );
}
