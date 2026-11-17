"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  SlidersHorizontal,
  X,
  FileText,
  Clock,
  Heart,
} from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import { StorefrontSocialLinks } from "../StorefrontSocialLinks";
import { StorefrontFloatingWhatsapp } from "../StorefrontFloatingWhatsapp";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { formatToWhatsappNumber } from "@/lib/phone";
import type { CatalogProduct } from "./StorefrontCatalogClient";

interface LuxeFashionCatalogProps {
  businessName: string;
  storeSlug: string;
  description?: string | null;
  logoUrl?: string | null;
  city?: string;
  state?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  returnPolicy?: string | null;
  products: CatalogProduct[];
  previewTemplate?: string;
}

export function LuxeFashionCatalogClient(props: LuxeFashionCatalogProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <LuxeFashionCatalogContent {...props} />
    </CartProvider>
  );
}

function LuxeFashionCatalogContent({
  businessName,
  storeSlug,
  description,
  logoUrl,
  city = "Lagos",
  state = "Nigeria",
  whatsappNumber,
  phoneNumber,
  instagram,
  tiktok,
  twitter,
  returnPolicy,
  products,
  previewTemplate,
}: LuxeFashionCatalogProps) {
  const { totalCount, items, addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeStockFilter, setActiveStockFilter] = useState<"all" | "in_stock">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [likedProductIds, setLikedProductIds] = useState<Record<string, boolean>>({});

  const storeUrl = previewTemplate ? `/s/${storeSlug}?previewTemplate=${previewTemplate}` : `/s/${storeSlug}`;
  const cartUrl = previewTemplate ? `/s/${storeSlug}/cart?previewTemplate=${previewTemplate}` : `/s/${storeSlug}/cart`;

  const cleanWhatsapp = formatToWhatsappNumber(whatsappNumber || phoneNumber);

  // Extract unique categories
  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number; image?: string }>();
    products.forEach((p) => {
      const cat = p.category?.trim();
      if (!cat) return;
      const existing = map.get(cat);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(cat, {
          name: cat,
          count: 1,
          image: p.images[0]?.url,
        });
      }
    });
    return Array.from(map.values());
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock filter
      if (activeStockFilter === "in_stock") {
        const avail = Math.max(0, p.stockOnHand - p.stockReserved);
        const oos = !p.isPreorder && (p.isOutOfStockManual || (p.trackStock && avail <= 0));
        if (oos) return false;
      }

      // Category filter
      if (selectedCategory) {
        if (!p.category || p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search query
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

  // Cart total in Naira
  const cartTotalNaira = useMemo(() => {
    const kobo = items.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0);
    return Math.round(kobo / 100);
  }, [items]);

  const toggleLike = (productId: string) => {
    setLikedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#141414] font-sans antialiased selection:bg-[#141414] selection:text-white pb-32">
      {/* 1. TOP EDITORIAL TICKER / ANNOUNCEMENT */}
      <div className="bg-[#121212] text-[#E8E6DF] py-2 px-4 text-center text-[10px] font-medium tracking-[0.25em] uppercase border-b border-black/40">
        <span className="opacity-90">
          {description?.trim() ? description : `${businessName} · Atelier & Ready-to-Wear · ${city}, ${state}`}
        </span>
      </div>

      {/* 2. BOUTIQUE MASTHEAD HEADER */}
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EAE6DF] transition-all">
        <div className="max-w-[480px] mx-auto px-5 py-3.5 flex items-center justify-between">
          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-700 hover:text-black hover:bg-black/5 transition-all cursor-pointer"
            aria-label="Search collection"
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4 stroke-[1.8]" />}
          </button>

          {/* Central Logo Brand Serif */}
          <Link href={storeUrl} className="text-center group flex flex-col items-center">
            <h1 className="font-serif font-black text-2xl md:text-3xl tracking-[0.28em] text-[#121212] uppercase group-hover:opacity-85 transition-opacity">
              {businessName}
            </h1>
            <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-[#8C847A] mt-0.5">
              {city} · Collection &apos;26
            </span>
          </Link>

          {/* Minimal Bag Trigger */}
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

        {/* Collapsible Search Drawer */}
        {showSearch && (
          <div className="max-w-[480px] mx-auto px-5 pb-3.5 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search silhouettes, bags, fabrics..."
                className="w-full h-10 pl-10 pr-9 bg-white border border-[#E0DCD3] rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-all shadow-2xs font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-600 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN ATELIER CANVAS */}
      <main className="max-w-[480px] mx-auto px-5 pt-4 space-y-6">
        {/* Social Signature & Location Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF] text-xs">
          <div className="flex items-center gap-1.5 text-[#6E675F] text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#141414]" />
            <span>Storefront Atelier · {city}, {state}</span>
          </div>
          <StorefrontSocialLinks
            instagram={instagram}
            tiktok={tiktok}
            whatsappNumber={whatsappNumber || phoneNumber}
            variant="compact"
          />
        </div>

        {/* Editorial Capsule Banner (Hero) */}
        {logoUrl ? (
          <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl bg-neutral-950 shadow-md group">
            <img
              src={logoUrl}
              alt={businessName}
              className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
              <div>
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/80 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                  Featured Capsule
                </span>
                <p className="font-serif font-black text-lg md:text-xl tracking-tight mt-1">
                  {businessName}
                </p>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase underline underline-offset-4 text-neutral-200">
                Explore ↓
              </span>
            </div>
          </div>
        ) : (
          <div className="relative py-7 px-5 rounded-2xl bg-gradient-to-br from-[#1F1F1F] to-[#121212] text-white overflow-hidden shadow-sm">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C4B7A6] block mb-1">
              Atelier Preview
            </span>
            <h2 className="font-serif font-bold text-xl md:text-2xl tracking-tight leading-snug">
              Curated luxury pieces crafted for timeless silhouettes.
            </h2>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-[10px] text-white/70 tracking-wider uppercase">
              <span>{products.length} {products.length === 1 ? "design" : "designs"}</span>
              <span>·</span>
              <span>Direct Courier Dispatch</span>
            </div>
          </div>
        )}

        {/* 4. EDITORIAL CATEGORY CHIPS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-[#8C847A]">
            <span>Collections</span>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-black underline lowercase text-[11px] font-medium"
              >
                reset filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                selectedCategory === null
                  ? "bg-[#141414] text-white border-[#141414] shadow-xs"
                  : "bg-white text-neutral-700 border-[#E5E0D5] hover:border-black"
              }`}
            >
              All Pieces ({products.length})
            </button>

            {categories.map((cat) => {
              const active = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(active ? null : cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    active
                      ? "bg-[#141414] text-white border-[#141414] shadow-xs"
                      : "bg-white text-neutral-700 border-[#E5E0D5] hover:border-black"
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. IN-STOCK TOGGLE & PRODUCT COUNT */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <span className="text-xs text-[#6B645C] font-serif italic">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
          </span>

          <div className="flex items-center bg-[#EEEAE1] p-0.5 rounded-full text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveStockFilter("all")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeStockFilter === "all"
                  ? "bg-white text-black shadow-2xs font-bold"
                  : "text-[#756E65] hover:text-black"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveStockFilter("in_stock")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeStockFilter === "in_stock"
                  ? "bg-white text-black shadow-2xs font-bold"
                  : "text-[#756E65] hover:text-black"
              }`}
            >
              Ready to Ship
            </button>
          </div>
        </div>

        {/* 6. EDITORIAL PORTRAIT PRODUCT GRID (4:5 Ratio) */}
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-6">
          {filteredProducts.map((p) => {
            const avail = Math.max(0, p.stockOnHand - p.stockReserved);
            const isPreorder = Boolean(p.isPreorder);
            const isOutOfStock = !isPreorder && (p.isOutOfStockManual || (p.trackStock && avail <= 0));
            const isLowStock = !isPreorder && !isOutOfStock && p.trackStock && avail <= (p.lowStockThreshold || 3);
            const photoUrl = p.images[0]?.url;
            const priceNaira = Math.round(Number(p.priceKobo) / 100).toLocaleString("en-NG");
            const isLiked = likedProductIds[p.id];

            const productUrl = previewTemplate
              ? `/s/${storeSlug}/p/${p.slug}?previewTemplate=${previewTemplate}`
              : `/s/${storeSlug}/p/${p.slug}`;

            return (
              <div key={p.id} className="group flex flex-col justify-between select-none">
                {/* Visual Canvas Card */}
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#ECE8DF] border border-[#E2DDD3]/60 shadow-2xs mb-2.5">
                  <Link href={productUrl} className="block w-full h-full relative overflow-hidden">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs font-serif">
                        No imagery
                      </div>
                    )}

                    {/* Subtle Dark Gradient Overlay at Base */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>

                  {/* High Fashion Corner Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
                    {isPreorder ? (
                      <span className="bg-[#121212] text-white text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full shadow-xs">
                        Pre-order
                      </span>
                    ) : isOutOfStock ? (
                      <span className="bg-neutral-800/90 text-white text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full">
                        Sold out
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-[#A44322] text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full shadow-xs">
                        Few left
                      </span>
                    ) : null}
                  </div>

                  {/* Favorite Heart Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(p.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-red-500 hover:bg-white transition-all shadow-xs cursor-pointer active:scale-90"
                    aria-label="Save piece"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        isLiked ? "fill-red-500 text-red-500" : "stroke-[2]"
                      }`}
                    />
                  </button>

                  {/* Quick View / Add Floating Action Button on Hover */}
                  {!isOutOfStock && (
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          id: p.id,
                          productId: p.id,
                          productName: p.name,
                          productSlug: p.slug,
                          priceKobo: Number(p.priceKobo),
                          availableStock: avail,
                          imageUrl: photoUrl,
                        })
                      }
                      className="absolute bottom-2.5 left-2.5 right-2.5 py-2 rounded-lg bg-white/95 hover:bg-black hover:text-white text-neutral-900 text-[10px] font-bold tracking-[0.15em] uppercase shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-3 h-3 stroke-[2.2]" />
                      <span>Quick Add</span>
                    </button>
                  )}
                </div>

                {/* Typography Information */}
                <div className="space-y-1">
                  {p.category && (
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#8A8277]">
                      {p.category}
                    </p>
                  )}

                  <Link href={productUrl} className="block group-hover:underline">
                    <h3 className="font-serif font-bold text-sm tracking-tight text-[#141414] line-clamp-1 leading-snug">
                      {p.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between pt-0.5">
                    <p className="text-xs font-bold text-[#141414] font-mono tracking-tight">
                      ₦{priceNaira}
                    </p>

                    {cleanWhatsapp && (
                      <a
                        href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                          `Hello ${businessName}, I would like to inquire about "${p.name}" (₦${priceNaira}) on your store.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#6E665E] hover:text-[#25D366] flex items-center gap-1 transition-colors"
                        title="Inquire about this piece"
                      >
                        <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
                        <span>Inquire</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search / Filter State */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white/70 rounded-2xl border border-[#EAE6DF] p-6">
            <Sparkles className="w-6 h-6 mx-auto text-neutral-400" />
            <h3 className="font-serif font-bold text-base text-neutral-900">
              No matching pieces found
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              We couldn&apos;t find any designs matching &ldquo;{searchQuery || selectedCategory}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                setActiveStockFilter("all");
              }}
              className="inline-block px-4 py-2 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              View Full Collection
            </button>
          </div>
        )}

        {/* 7. ATELIER TRUST & BESPOKE CONCIERGE */}
        <section className="pt-4 pb-2 border-t border-[#EAE6DF] space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#8C847A]">
                The Atelier Standard
              </span>
              <ShieldCheck className="w-4 h-4 text-[#141414]" />
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
              Complimentary pickup in <strong>{city}, {state}</strong>. Insured express delivery computed securely at checkout with Ondar Escrow protection.
            </p>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900">
              <Link
                href={`/s/${storeSlug}/policies`}
                className="hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span>Store policies & sizing</span>
              </Link>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>

          {/* Social Links Footer Bar */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#8C847A]">
              Connect With {businessName}
            </span>
            <StorefrontSocialLinks
              instagram={instagram}
              tiktok={tiktok}
              twitter={twitter}
              whatsappNumber={whatsappNumber || phoneNumber}
              variant="pills"
            />
          </div>
        </section>

        {/* 8. REFINED MINIMAL FOOTER */}
        <footer className="pt-6 border-t border-[#EAE6DF] text-center space-y-2">
          <p className="font-serif text-sm tracking-[0.2em] uppercase text-neutral-900 font-bold">
            {businessName}
          </p>
          <p className="text-[10px] text-neutral-400 tracking-wider">
            Curated e-commerce powered by <span className="font-bold text-neutral-700">Ondar</span>
          </p>
        </footer>
      </main>

      {/* 9. FLOATING BAG CHECKOUT TOAST (when items exist in cart) */}
      {totalCount > 0 && (
        <aside
          aria-label="View shopping bag"
          className="fixed bottom-6 left-4 right-20 z-40 max-w-[360px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <Link
            href={cartUrl}
            className="w-full py-3.5 px-4 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-bold flex items-center justify-between shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center font-mono">
                {totalCount}
              </span>
              <span className="tracking-wide uppercase font-sans text-[11px]">View Bag</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <span>₦{cartTotalNaira.toLocaleString("en-NG")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </aside>
      )}

      {/* 10. FLOATING WHATSAPP BUTTON (FAB) */}
      <StorefrontFloatingWhatsapp
        whatsappNumber={whatsappNumber}
        phoneNumber={phoneNumber}
        businessName={businessName}
        bottomOffsetClass="bottom-6"
      />
    </div>
  );
}
