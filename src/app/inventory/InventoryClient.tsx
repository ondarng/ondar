"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";
import { MerchantTopBar } from "@/components/merchant/MerchantTopBar";
import { InventoryIntroScreen } from "@/components/inventory/InventoryIntroScreen";
import { AddProductFlow } from "@/components/inventory/AddProductFlow";
import { ProductDetailsScreen } from "@/components/inventory/ProductDetailsScreen";
import { CustomCheckoutModal } from "@/components/inventory/CustomCheckoutModal";
import { Link2 } from "lucide-react";
import {
  availableStock,
  formatNairaFromKobo,
  getStockState,
  type ProductStatusValue,
  type StockStateValue,
} from "@/lib/inventory";

export interface InventoryProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category: string | null;
  priceKobo: string;
  costKobo?: string | null;
  status: ProductStatusValue;
  trackStock: boolean;
  isOutOfStockManual?: boolean;
  stockOnHand: number;
  stockReserved: number;
  lowStockThreshold: number | null;
  images: { url: string }[];
  variants?: any[];
}

interface InventoryClientProps {
  businessName: string;
  location: string;
  initials: string;
  merchantEmail: string;
  fullStoreUrl: string;
  products: InventoryProduct[];
  pendingBadgeCount: number;
}

type SortKey = "name-asc" | "name-desc";

const STATUS_LABEL: Record<ProductStatusValue, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  HIDDEN: "Hidden",
  ARCHIVED: "Archived",
};

export function InventoryClient({
  businessName,
  location,
  initials,
  merchantEmail,
  fullStoreUrl,
  products: initialProducts,
  pendingBadgeCount,
}: InventoryClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isCustomCheckoutOpen, setIsCustomCheckoutOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState("");
  const [statuses, setStatuses] = useState<ProductStatusValue[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<ProductStatusValue[]>([]);
  const [category, setCategory] = useState("");
  const [draftCategory, setDraftCategory] = useState("");
  const [stockStates, setStockStates] = useState<StockStateValue[]>([]);
  const [draftStockStates, setDraftStockStates] = useState<StockStateValue[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<InventoryProduct | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("1");
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [showIntroGuide, setShowIntroGuide] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);

  const storeSlug = useMemo(() => {
    try {
      const url = new URL(fullStoreUrl);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "s" && parts[1]) return parts[1];
      const hostParts = url.hostname.split(".");
      if (hostParts.length > 2) return hostParts[0];
    } catch {
      // fallback
    }
    return businessName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") || "adas-everyday";
  }, [fullStoreUrl, businessName]);

  const handleInitiateAddProduct = () => {
    const neverShow =
      typeof window !== "undefined" &&
      localStorage.getItem("ondar_never_show_inventory_intro") === "true";
    if (neverShow) {
      setShowIntroGuide(false);
      setIsAddProductOpen(true);
    } else {
      setShowIntroGuide(true);
    }
  };

  const handleTutorialComplete = (neverShowAgain: boolean) => {
    if (neverShowAgain && typeof window !== "undefined") {
      localStorage.setItem("ondar_never_show_inventory_intro", "true");
    }
    setShowIntroGuide(false);
    setIsAddProductOpen(true);
  };

  const categories = useMemo(() => {
    const fromProducts = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
    const defaults = [
      "Clothing",
      "Shoes",
      "Bags & Luggage",
      "Accessories & Jewelry",
      "Beauty & Skincare",
      "Food & Groceries",
      "Electronics & Gadgets",
      "Home & Living",
    ];
    return Array.from(new Set([...fromProducts, ...defaults]));
  }, [products]);

  const matchesFilters = (
    product: InventoryProduct,
    query: string,
    selectedStatuses: ProductStatusValue[],
    selectedCategory: string,
    selectedStock: StockStateValue[]
  ) => {
    const needle = query.trim().toLowerCase();
    const haystack = `${product.name} ${product.sku || ""}`.toLowerCase();
    if (needle && !haystack.includes(needle)) return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(product.status)) return false;
    if (selectedCategory && product.category !== selectedCategory) return false;
    const state = getStockState(product);
    if (selectedStock.length > 0 && !selectedStock.includes(state)) return false;
    return true;
  };

  const filtered = useMemo(() => {
    const list = products.filter((product) =>
      matchesFilters(product, search, statuses, category, stockStates)
    );
    return list.sort((a, b) =>
      sort === "name-asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  }, [products, search, statuses, category, stockStates, sort]);

  const draftResultCount = useMemo(() => {
    return products.filter((product) =>
      matchesFilters(product, draftSearch, draftStatuses, draftCategory, draftStockStates)
    ).length;
  }, [products, draftSearch, draftStatuses, draftCategory, draftStockStates]);

  const appliedFilterCount =
    statuses.length + (category ? 1 : 0) + stockStates.length;
  const draftFilterCount =
    draftStatuses.length + (draftCategory ? 1 : 0) + draftStockStates.length;

  const activeCount = products.filter((p) => p.status === "ACTIVE").length;
  const lowStockCount = products.filter((p) => getStockState(p) === "low").length;
  const outOfStockCount = products.filter((p) => getStockState(p) === "out").length;
  const isEmptyShop = products.length === 0;

  const openFilters = () => {
    setDraftSearch(search);
    setDraftStatuses(statuses);
    setDraftCategory(category);
    setDraftStockStates(stockStates);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setSearch(draftSearch);
    setStatuses(draftStatuses);
    setCategory(draftCategory);
    setStockStates(draftStockStates);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setDraftSearch("");
    setDraftStatuses([]);
    setDraftCategory("");
    setDraftStockStates([]);
  };

  const resetAllAndApply = () => {
    setSearch("");
    setStatuses([]);
    setCategory("");
    setStockStates([]);
    resetFilters();
    setFiltersOpen(false);
  };

  const toggleDraftStatus = (value: ProductStatusValue) => {
    setDraftStatuses((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const toggleDraftStock = (value: StockStateValue) => {
    setDraftStockStates((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const patchProduct = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Update failed.");
    }
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...data.product } : item)));
    return data.product as InventoryProduct;
  };

  const handleArchive = async (product: InventoryProduct) => {
    setOpenMenuId(null);
    try {
      await patchProduct(product.id, { action: "archive" });
    } catch {
      // Keep list unchanged if archive fails.
    }
  };

  const handleAdjust = async (direction: 1 | -1) => {
    if (!adjusting) return;
    const amount = parseInt(adjustDelta, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      setAdjustError("Enter how many units to add or subtract.");
      return;
    }
    setIsAdjusting(true);
    setAdjustError(null);
    try {
      await patchProduct(adjusting.id, { action: "adjust", delta: amount * direction });
      setAdjusting(null);
    } catch (error) {
      setAdjustError(error instanceof Error ? error.message : "Could not adjust stock.");
    } finally {
      setIsAdjusting(false);
    }
  };

  if (isAddProductOpen) {
    return (
      <AddProductFlow
        storeSlug={storeSlug}
        onBack={() => setIsAddProductOpen(false)}
        onSuccess={(created) => {
          setProducts((prev) => [
            {
              ...created,
              sku: created.sku ?? null,
              category: created.category ?? null,
              trackStock: created.trackStock ?? true,
              stockReserved: created.stockReserved ?? 0,
              lowStockThreshold: created.lowStockThreshold ?? null,
              images: created.images ?? [],
            },
            ...prev,
          ]);
          setIsAddProductOpen(false);
          router.refresh();
        }}
      />
    );
  }

  if (selectedProduct) {
    return (
      <ProductDetailsScreen
        product={selectedProduct}
        storeSlug={storeSlug}
        storefrontUrl={fullStoreUrl}
        pendingBadgeCount={pendingBadgeCount}
        merchantName={businessName}
        onBack={() => setSelectedProduct(null)}
        onEdit={() => {
          setSelectedProduct(null);
          setIsAddProductOpen(true);
        }}
        onUpdateProduct={(updated) => {
          setProducts((prev) =>
            prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
          );
          setSelectedProduct((prev) =>
            prev && prev.id === updated.id ? { ...prev, ...updated } : prev
          );
        }}
        onAdjustStock={async (delta) => {
          await patchProduct(selectedProduct.id, { action: "adjust", delta });
          setProducts((prev) =>
            prev.map((p) =>
              p.id === selectedProduct.id
                ? { ...p, stockOnHand: p.stockOnHand + delta }
                : p
            )
          );
          setSelectedProduct((prev) =>
            prev ? { ...prev, stockOnHand: prev.stockOnHand + delta } : null
          );
        }}
        onArchive={async () => {
          await handleArchive(selectedProduct);
          setSelectedProduct(null);
        }}
        onChangeStatus={async (newStatus) => {
          await patchProduct(selectedProduct.id, { status: newStatus });
          setProducts((prev) =>
            prev.map((p) => (p.id === selectedProduct.id ? { ...p, status: newStatus } : p))
          );
          setSelectedProduct((prev) => (prev ? { ...prev, status: newStatus } : null));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white antialiased selection:bg-[#00A859]/20 selection:text-[#00A859] relative pb-28">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-3 flex flex-col min-h-screen">
        <MerchantTopBar
          businessName={businessName}
          location={location}
          initials={initials}
          merchantEmail={merchantEmail}
          fullStoreUrl={fullStoreUrl}
          menuOpen={isUserMenuOpen}
          onMenuOpenChange={setIsUserMenuOpen}
        />

        {isEmptyShop || showIntroGuide ? (
          <InventoryIntroScreen
            onStartAddProduct={handleTutorialComplete}
          />
        ) : (
          <>
            <div className="flex items-end justify-between mb-4">
              <h1 className="text-[32px] leading-none font-black tracking-tight text-neutral-900">
                Inventory
              </h1>
              <p className="text-sm text-neutral-400 mb-1">
                {products.length} product{products.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <StatCard value={activeCount} label="Active" />
              <StatCard value={lowStockCount} label="Low stock" tone="warning" />
              <StatCard value={outOfStockCount} label="Out of stock" />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or SKU"
                  className="w-full h-12 pl-10 pr-4 rounded-2xl bg-[#F4F6F5] text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={openFilters}
                className="w-12 h-12 rounded-2xl bg-[#F4F6F5] flex items-center justify-center relative cursor-pointer"
                aria-label="Filters"
              >
                <SlidersHorizontal className="w-5 h-5 text-neutral-700" />
                {appliedFilterCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00A859]" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                type="button"
                onClick={handleInitiateAddProduct}
                className="h-12 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add product
              </button>

              <button
                type="button"
                onClick={() => setIsCustomCheckoutOpen(true)}
                className="h-12 rounded-2xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Link2 className="w-4 h-4 text-[#00A859]" />
                Custom link
              </button>
            </div>

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-neutral-900">All products</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((open) => !open)}
                  className="text-sm text-neutral-500 flex items-center gap-1 cursor-pointer"
                >
                  {sort === "name-asc" ? "Name A-Z" : "Name Z-A"}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-7 z-40 w-36 rounded-xl bg-white border border-neutral-200 shadow-lg py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSort("name-asc");
                          setSortOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                      >
                        Name A-Z
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSort("name-desc");
                          setSortOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                      >
                        Name Z-A
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              search.trim() ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 mx-auto flex items-center justify-center text-neutral-400">
                    <Search className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      No results for “{search}”
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-[280px] mx-auto">
                      Try another name or SKU, or clear your search.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setDraftSearch("");
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="py-12 px-4 text-center space-y-3">
                  <p className="text-sm text-neutral-500">No products match these filters.</p>
                  <button
                    type="button"
                    onClick={resetAllAndApply}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              )
            ) : (
              <div className="divide-y divide-neutral-100">
                {filtered.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    menuOpen={openMenuId === product.id}
                    onSelect={() => setSelectedProduct(product)}
                    onToggleMenu={() =>
                      setOpenMenuId((current) => (current === product.id ? null : product.id))
                    }
                    onCloseMenu={() => setOpenMenuId(null)}
                    onAdjust={() => {
                      setOpenMenuId(null);
                      setAdjustDelta("1");
                      setAdjustError(null);
                      setAdjusting(product);
                    }}
                    onArchive={() => handleArchive(product)}
                  />
                ))}
              </div>
            )}

            <p className="text-[13px] text-neutral-400 py-5">
              Product menu: edit, adjust stock or archive.
            </p>
          </>
        )}
      </div>

      <CustomCheckoutModal
        isOpen={isCustomCheckoutOpen}
        onClose={() => setIsCustomCheckoutOpen(false)}
        products={products}
        storeSlug={storeSlug}
      />

      <MerchantBottomNav
        active="products"
        pendingBadgeCount={pendingBadgeCount}
      />

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto antialiased">
          <div className="w-full max-w-[430px] mx-auto min-h-screen px-4 pt-4 pb-40 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex items-center gap-2 text-neutral-900 cursor-pointer p-1 -ml-1 hover:text-neutral-600 transition-colors"
                aria-label="Close filters"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                <span className="text-xl font-black">Filters</span>
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-bold text-[#00A859] hover:text-[#00964E] cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                placeholder="Search name or SKU"
                className="w-full h-12 pl-10 pr-10 rounded-2xl bg-[#F4F6F5] text-sm outline-none focus:ring-2 focus:ring-[#00A859]/20"
              />
              {draftSearch && (
                <button
                  type="button"
                  onClick={() => setDraftSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-neutral-400">Searching within your inventory</p>
              {draftFilterCount > 0 && (
                <span className="text-xs font-semibold text-[#00A859] bg-[#E8F8EF] px-2.5 py-1 rounded-full">
                  {draftFilterCount} applied
                </span>
              )}
            </div>

            <section className="mb-5">
              <h3 className="text-base font-bold text-neutral-900 mb-3">Product status</h3>
              <div className="space-y-2">
                {(["ACTIVE", "DRAFT", "HIDDEN", "ARCHIVED"] as ProductStatusValue[]).map((value) => (
                  <CheckboxRow
                    key={value}
                    label={STATUS_LABEL[value]}
                    checked={draftStatuses.includes(value)}
                    onChange={() => toggleDraftStatus(value)}
                  />
                ))}
              </div>
            </section>

            <hr className="border-neutral-100 mb-5" />

            <section className="mb-5">
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Category <span className="font-normal text-xs text-neutral-400">· choose one</span>
              </h3>
              <div className="relative">
                <select
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl border border-neutral-200 bg-white text-sm font-medium appearance-none outline-none focus:border-neutral-400 cursor-pointer"
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[12px] text-neutral-400 mt-1.5">
                All categories when no category is selected.
              </p>
            </section>

            <hr className="border-neutral-100 mb-5" />

            <section className="mb-6">
              <h3 className="text-base font-bold text-neutral-900 mb-3">Stock state</h3>
              <div className="space-y-2">
                <CheckboxRow
                  label="In stock"
                  checked={draftStockStates.includes("in")}
                  onChange={() => toggleDraftStock("in")}
                />
                <CheckboxRow
                  label="Low stock"
                  checked={draftStockStates.includes("low")}
                  onChange={() => toggleDraftStock("low")}
                />
                <CheckboxRow
                  label="Out of stock"
                  checked={draftStockStates.includes("out")}
                  onChange={() => toggleDraftStock("out")}
                />
                <CheckboxRow
                  label="Stock not tracked"
                  checked={draftStockStates.includes("not_tracked")}
                  onChange={() => toggleDraftStock("not_tracked")}
                />
              </div>
            </section>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-100 p-4 shadow-lg">
            <div className="w-full max-w-[430px] mx-auto flex flex-col gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="w-full h-12 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm cursor-pointer transition-colors shadow-sm active:scale-[0.99]"
              >
                Apply {draftFilterCount} filter{draftFilterCount === 1 ? "" : "s"} · {draftResultCount}{" "}
                result{draftResultCount === 1 ? "" : "s"}
              </button>
              <button
                type="button"
                onClick={resetAllAndApply}
                className="w-full h-11 rounded-2xl border border-neutral-200 text-[#00A859] hover:bg-neutral-50 font-bold text-sm cursor-pointer transition-colors"
              >
                Reset all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-3xl bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black">Adjust stock</h3>
              <button type="button" onClick={() => setAdjusting(null)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              {adjusting.name} · {availableStock(adjusting.stockOnHand, adjusting.stockReserved)} available.
              Adds or subtracts units, it does not overwrite them.
            </p>
            {adjustError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-2.5 mb-3">
                {adjustError}
              </p>
            )}
            <input
              type="number"
              min="1"
              value={adjustDelta}
              onChange={(e) => setAdjustDelta(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-neutral-200 mb-3 outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isAdjusting}
                onClick={() => handleAdjust(-1)}
                className="h-12 rounded-2xl border border-neutral-200 font-bold text-sm cursor-pointer"
              >
                Subtract
              </button>
              <button
                type="button"
                disabled={isAdjusting}
                onClick={() => handleAdjust(1)}
                className="h-12 rounded-2xl bg-[#00A859] text-white font-bold text-sm cursor-pointer"
              >
                {isAdjusting ? "Saving..." : "Add units"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={`rounded-2xl px-3 py-3.5 ${
        tone === "warning" ? "bg-[#F8F4D8]" : "bg-[#F3F7F4]"
      }`}
    >
      <p className="text-[28px] leading-none font-black text-neutral-900">{value}</p>
      <p className="text-[13px] text-neutral-600 mt-1">{label}</p>
    </div>
  );
}

function ProductRow({
  product,
  menuOpen,
  onSelect,
  onToggleMenu,
  onCloseMenu,
  onAdjust,
  onArchive,
}: {
  product: InventoryProduct;
  menuOpen: boolean;
  onSelect: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onAdjust: () => void;
  onArchive: () => void;
}) {
  const available = availableStock(product.stockOnHand, product.stockReserved);
  const stockState = getStockState(product);
  const imageUrl = product.images[0]?.url || "/default-product.png";

  return (
    <div className="flex items-start gap-3 py-4 relative group">
      <div
        onClick={onSelect}
        className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 cursor-pointer"
      >
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div onClick={onSelect} className="min-w-0 flex-1 cursor-pointer">
            <p className="text-[15px] font-bold text-neutral-900 truncate hover:text-[#00A859] transition-colors">
              {product.name}
            </p>
            <p className="text-[13px] text-neutral-400 mt-0.5">
              {product.sku || product.slug.toUpperCase().slice(0, 8)}
            </p>
            <p className="text-[15px] font-bold text-neutral-900 mt-1">
              {formatNairaFromKobo(product.priceKobo)}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <StatusBadge label={STATUS_LABEL[product.status]} />
              {stockState === "low" && <StatusBadge label="Low stock" tone="warning" />}
              {stockState === "out" && <StatusBadge label="Out of stock" tone="danger" />}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu();
              }}
              className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <p className="text-[13px] text-neutral-500 whitespace-nowrap">
              {product.trackStock ? `${available} available` : "Not tracked"}
            </p>
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onCloseMenu} />
          <div className="absolute right-0 top-10 z-40 w-40 rounded-xl bg-white border border-neutral-200 shadow-lg py-1">
            <button
              type="button"
              onClick={() => {
                onCloseMenu();
                onSelect();
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 text-neutral-700"
            >
              View details
            </button>
            <button type="button" onClick={onAdjust} className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">
              Adjust stock
            </button>
            <button type="button" onClick={onArchive} className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">
              Archive
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "warning" | "danger";
}) {
  const classes =
    tone === "warning"
      ? "bg-[#F8F0C8] text-[#8A6D12]"
      : tone === "danger"
        ? "bg-[#FCE7EA] text-[#C2414A]"
        : "bg-[#F1F2F2] text-neutral-600";
  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${classes}`}>{label}</span>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-3.5 w-full text-left cursor-pointer min-h-[44px] py-1.5 px-1 rounded-xl hover:bg-neutral-50 transition-colors select-none"
    >
      <span
        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? "bg-[#00A859] border-[#00A859]" : "border-neutral-300 bg-white"
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
      </span>
      <span className="text-[15px] font-medium text-neutral-800">{label}</span>
    </button>
  );
}
