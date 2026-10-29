"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Cpu,
  Smartphone,
  Laptop,
  Headphones,
  Check,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Plus,
} from "lucide-react";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import { StorefrontFooter } from "./StorefrontFooter";

interface ProductVariant {
  id: string;
  title: string;
  priceKobo: string | null;
  stockOnHand: number;
  stockReserved: number;
  options: Record<string, string>;
}

export interface ElectronicsProduct {
  id: string;
  name: string;
  slug: string;
  priceKobo: string;
  category: string | null;
  description: string | null;
  stockOnHand: number;
  stockReserved: number;
  trackStock: boolean;
  isOutOfStockManual?: boolean;
  lowStockThreshold?: number | null;
  images: { url: string }[];
  variants?: ProductVariant[];
}

interface ElectronicsCatalogClientProps {
  businessName: string;
  storeSlug: string;
  description?: string | null;
  logoUrl?: string | null;
  city?: string;
  state?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  products: ElectronicsProduct[];
}

export function ElectronicsCatalogClient(props: ElectronicsCatalogClientProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <ElectronicsCatalogContent {...props} />
    </CartProvider>
  );
}

function ElectronicsCatalogContent({
  businessName,
  storeSlug,
  description,
  logoUrl,
  city = "Ikeja",
  state = "Lagos",
  whatsappNumber,
  phoneNumber,
  products,
}: ElectronicsCatalogClientProps) {
  const { totalCount, addItem } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const formatNaira = (koboStr: string) => {
    const val = Math.round(Number(koboStr) / 100);
    return `₦${val.toLocaleString()}`;
  };

  // Derive categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === "All" ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between antialiased">
      {/* 1. Tech Store Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800">
        <div className="w-full max-w-[430px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00A859] to-[#38BDF8] flex items-center justify-center text-white font-black text-sm shadow-md">
              <Zap className="w-5 h-5 fill-white stroke-none" />
            </div>
            <div>
              <h1 className="text-[15px] font-black tracking-tight text-white leading-none">
                {businessName}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A859] inline-block animate-pulse" />
                Verified Tech Hub · {city}, {state}
              </p>
            </div>
          </div>

          {/* Cart Icon */}
          <Link
            href={`/s/${storeSlug}/cart`}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 hover:text-white relative transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00A859] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[#0F172A]">
                {totalCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search */}
        <div className="max-w-[430px] mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search specs, phones, gadgets, audio..."
              className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-xl text-[12px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A859] transition-all"
            />
          </div>
        </div>

        {/* Tech Specs Trust Bar */}
        <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1 shrink-0 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" /> 100% Tested
          </span>
          <span className="flex items-center gap-1 shrink-0 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-[#38BDF8]" /> Fast Dispatch
          </span>
          <span className="flex items-center gap-1 shrink-0 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-amber-400" /> Warranty Included
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[430px] mx-auto px-4 py-4 flex-1 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap transition-all border ${
                  active
                    ? "bg-[#00A859] border-[#00A859] text-white shadow-sm"
                    : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 2-Column Electronics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => {
            const avail = Math.max(0, p.stockOnHand - p.stockReserved);
            const isOutOfStock = p.isOutOfStockManual || (p.trackStock && avail <= 0);
            const hasVariants = p.variants && p.variants.length > 0;
            const photoUrl = p.images[0]?.url;

            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800/90 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm group"
              >
                <Link
                  href={`/s/${storeSlug}/p/${p.slug}`}
                  className="block relative aspect-square bg-slate-950 overflow-hidden"
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Cpu className="w-10 h-10 stroke-[1.5]" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded-md bg-red-950/90 text-red-400 border border-red-800/50 text-[9px] font-extrabold uppercase">
                        Sold out
                      </span>
                    ) : avail <= 3 && p.trackStock ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-950/90 text-amber-300 border border-amber-800/50 text-[9px] font-extrabold uppercase">
                        {avail} left
                      </span>
                    ) : null}
                  </div>
                </Link>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-[#38BDF8] font-bold uppercase tracking-wider block">
                      {p.category || "Gadget"}
                    </span>
                    <Link
                      href={`/s/${storeSlug}/p/${p.slug}`}
                      className="text-[12px] font-bold text-slate-100 hover:text-white line-clamp-2 leading-snug"
                    >
                      {p.name}
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-black text-white">
                        {formatNaira(p.priceKobo)}
                      </span>
                    </div>

                    {!isOutOfStock && !hasVariants ? (
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
                        className="w-8 h-8 rounded-lg bg-[#00A859] hover:bg-[#00924c] text-white flex items-center justify-center transition-colors shadow-2xs"
                        aria-label="Add to cart"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    ) : (
                      <Link
                        href={`/s/${storeSlug}/p/${p.slug}`}
                        className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-0.5"
                      >
                        Specs <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Cpu className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-[13px] font-bold text-slate-400">No electronics found</p>
            <p className="text-[11px]">Try adjusting your search query or category filter.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[430px] mx-auto px-4 py-6 border-t border-slate-800/80 text-center text-[11px] text-slate-500 space-y-2">
        <p>© {new Date().getFullYear()} {businessName}. High performance tech shopping powered by Ondar.</p>
        <p className="text-[10px] text-slate-600">Secure escrow-free payments via Paystack & Direct Bank Transfer.</p>
      </footer>
    </div>
  );
}
