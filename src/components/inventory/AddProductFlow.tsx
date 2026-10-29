"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Loader2,
} from "lucide-react";
import {
  OptionalDetailsScreen,
  type OptionalDetailsData,
} from "./OptionalDetailsScreen";
import {
  VariantOptionsScreen,
  type OptionGroup,
  type VariantItem,
} from "./VariantOptionsScreen";
import { ProductPublishedScreen } from "./ProductPublishedScreen";

interface AddProductFlowProps {
  storeSlug?: string;
  onBack: () => void;
  onSuccess: (createdProduct: any) => void;
}

export function AddProductFlow({
  storeSlug = "store",
  onBack,
  onSuccess,
}: AddProductFlowProps) {
  // Navigation inside flow: "main" | "optional" | "variants" | "published"
  const [subView, setSubView] = useState<
    "main" | "optional" | "variants" | "published"
  >("main");
  const [publishedProduct, setPublishedProduct] = useState<any | null>(null);

  // Variant options state
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [variantItems, setVariantItems] = useState<VariantItem[]>([]);

  // Core fields matching screen
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceNaira, setPriceNaira] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [trackStock, setTrackStock] = useState(true);
  const [startingStock, setStartingStock] = useState("");

  // Optional fields
  const [optionalData, setOptionalData] = useState<OptionalDetailsData>({
    description: "",
    costPriceNaira: "",
    category: "",
    sku: "",
    lowStockThreshold: "",
    extraImages: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live auto-generated URL slug
  const productSlug = useMemo(() => {
    if (!name.trim()) return "product";
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }, [name]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (targetStatus: "ACTIVE" | "DRAFT") => {
    setError(null);
    setNameError(null);
    setPriceError(null);

    let hasValidationError = false;
    if (targetStatus === "ACTIVE") {
      if (!name.trim()) {
        setNameError("! Enter a product name.");
        hasValidationError = true;
      }

      const cleanPrice = priceNaira.replace(/,/g, "").trim();
      const parsedPrice = parseFloat(cleanPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0 || /[^0-9.]/.test(cleanPrice)) {
        setPriceError("! Enter a valid selling price in naira.");
        hasValidationError = true;
      }

      if (hasValidationError) {
        return;
      }
    }

    const cleanPrice = priceNaira.replace(/,/g, "").trim();
    const parsedPrice = parseFloat(cleanPrice);

    if (trackStock) {
      const parsedStock = parseInt(startingStock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        setError("Please enter a valid starting stock.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          priceNaira: isNaN(parsedPrice) ? "0" : parsedPrice.toString(),
          stockQuantity: trackStock ? startingStock : "0",
          trackStock,
          photoUrl,
          description: optionalData.description,
          costPriceNaira: optionalData.costPriceNaira || null,
          category: optionalData.category || null,
          sku: optionalData.sku || null,
          lowStockThreshold: optionalData.lowStockThreshold || null,
          extraImages: optionalData.extraImages,
          status: targetStatus,
          variants: variantItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create product.");
        return;
      }

      if (targetStatus === "ACTIVE") {
        setPublishedProduct(data.product);
        setSubView("published");
      } else {
        onSuccess(data.product);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (subView === "published" && publishedProduct) {
    return (
      <ProductPublishedScreen
        product={publishedProduct}
        storeSlug={storeSlug}
        storefrontUrl={`https://${storeSlug}.ondar.ng`}
        onBackToInventory={() => {
          onSuccess(publishedProduct);
        }}
      />
    );
  }

  if (subView === "optional") {
    return (
      <OptionalDetailsScreen
        productName={name}
        data={optionalData}
        onChange={(updates) => setOptionalData((prev) => ({ ...prev, ...updates }))}
        onBack={() => setSubView("main")}
        onOpenExtras={() => setSubView("variants")}
      />
    );
  }

  if (subView === "variants") {
    return (
      <VariantOptionsScreen
        productName={name}
        productPhoto={photoUrl}
        sku={optionalData.sku}
        category={optionalData.category}
        basePriceNaira={priceNaira}
        baseCostNaira={optionalData.costPriceNaira}
        startingStock={startingStock}
        initialGroups={optionGroups}
        onBack={() => setSubView("main")}
        onSave={(newGroups, newVariants) => {
          setOptionGroups(newGroups);
          setVariantItems(newVariants);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-16">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <h1 className="text-[20px] font-black tracking-tight text-neutral-900">
            Add product
          </h1>

          <button
            type="button"
            onClick={onBack}
            className="text-[15px] font-semibold text-[#00A859] hover:text-[#00964E] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-[14px] text-neutral-500 font-normal mb-6">
          A few essentials, then you’re ready to sell.
        </p>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* ============================================================== */}
          {/* 1. PRODUCT NAME */}
          {/* ============================================================== */}
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">
              Product name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Product name"
              className={`w-full h-[52px] px-4 rounded-2xl border text-[15px] font-medium text-neutral-900 placeholder:text-neutral-300 outline-none shadow-xs transition-all ${
                nameError
                  ? "border-red-500 bg-red-50/20 focus:border-red-500"
                  : "border-neutral-200 bg-white focus:border-neutral-400"
              }`}
            />
            {nameError && (
              <p className="text-xs font-semibold text-red-600 mt-1">
                {nameError}
              </p>
            )}
          </div>

          {/* ============================================================== */}
          {/* 2. PHOTOS */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-neutral-900">
                Photos
              </label>
              <span className="text-xs text-neutral-400 font-normal">Optional</span>
            </div>

            <div className="flex items-start gap-3">
              {/* If photo exists, show thumbnail with 'Main photo · Edit' */}
              {photoUrl && (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 relative group shadow-xs">
                    <img
                      src={photoUrl}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="text-xs text-neutral-600 font-medium mt-1.5 cursor-pointer hover:text-neutral-900 transition-colors">
                    Main photo · Edit
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Add photos card */}
              <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#00A859]/30 bg-[#F0FAF5] hover:bg-[#E8F8EF] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs">
                <ImagePlus className="w-6 h-6 text-[#00A859]" />
                <span className="text-[12px] font-bold text-[#00A859]">
                  Add photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. SELLING PRICE */}
          {/* ============================================================== */}
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">
              Selling price *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-base font-semibold text-neutral-900 pointer-events-none">
                ₦
              </span>
              <input
                type="text"
                inputMode="decimal"
                required
                value={priceNaira}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setPriceNaira(val);
                  if (priceError) setPriceError(null);
                }}
                placeholder="0"
                className={`w-full h-[52px] pl-9 pr-4 rounded-2xl border text-[15px] font-semibold text-neutral-900 placeholder:text-neutral-300 outline-none shadow-xs transition-all ${
                  priceError
                    ? "border-red-500 bg-red-50/20 focus:border-red-500"
                    : "border-neutral-200 bg-white focus:border-neutral-400"
                }`}
              />
            </div>
            {priceError ? (
              <p className="text-xs font-semibold text-red-600 mt-1">
                {priceError}
              </p>
            ) : (
              <p className="text-[13px] text-neutral-500 font-normal mt-1.5 leading-snug">
                The price customers pay. One selling price per product.
              </p>
            )}
          </div>

          {/* Required fields validation edge state card */}
          {(nameError || priceError) && (
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5 animate-in fade-in-50">
              <p className="text-xs font-bold text-neutral-800">
                Required fields need attention
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Name and selling price are required to publish. Photos are optional. An incomplete draft can still be saved.
              </p>
              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                className="w-full h-11 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-bold text-neutral-800 transition-colors cursor-pointer"
              >
                Save draft instead
              </button>
            </div>
          )}

          <hr className="border-neutral-100" />

          {/* ============================================================== */}
          {/* 4. TRACK STOCK */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-900">Track stock</p>
                <p className="text-[13px] text-neutral-500 mt-0.5">
                  Keep track of units as orders come in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackStock(!trackStock)}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer ${
                  trackStock ? "bg-[#00A859]" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform shadow-xs ${
                    trackStock ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 5. STARTING STOCK */}
          {/* ============================================================== */}
          {trackStock && (
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Starting stock
              </label>
              <input
                type="number"
                min="0"
                value={startingStock}
                onChange={(e) => setStartingStock(e.target.value)}
                placeholder="0"
                className="w-full h-[52px] px-4 rounded-2xl border border-neutral-200 bg-white text-[15px] font-semibold text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-neutral-400 shadow-xs transition-all"
              />
              <p className="text-[13px] text-neutral-500 font-normal mt-1.5 leading-snug">
                Units you have now. Reserved stock starts at 0.
              </p>
            </div>
          )}

          <hr className="border-neutral-100" />

          {/* ============================================================== */}
          {/* 6. OPTIONAL DETAILS TRIGGER */}
          {/* ============================================================== */}
          <button
            type="button"
            onClick={() => setSubView("optional")}
            className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
          >
            <div>
              <p className="text-[15px] font-bold text-neutral-900">
                Optional details
              </p>
              <p className="text-[13px] text-neutral-500 mt-0.5">
                Description, cost, category, SKU & more
              </p>
            </div>
            <ChevronDown className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
          </button>

          {/* ============================================================== */}
          {/* 7. ADD VARIANTS TRIGGER */}
          {/* ============================================================== */}
          <button
            type="button"
            onClick={() => setSubView("variants")}
            className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold text-neutral-900">
                  Add variants
                </p>
                {variantItems.length > 0 && (
                  <span className="text-[11px] font-bold text-[#00A859] bg-[#E8F8EF] px-2 py-0.5 rounded-full">
                    {variantItems.length} combination{variantItems.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-neutral-500 mt-0.5">
                For products with sizes or colours
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
          </button>

          {/* ============================================================== */}
          {/* 8. AUTOMATIC URL LINK PREVIEW */}
          {/* ============================================================== */}
          <div className="pt-1">
            <p className="text-[13px] font-bold text-neutral-800">
              Your link is created automatically
            </p>
            <p className="text-[13px] text-neutral-500 break-all mt-0.5">
              ondar.shop/{storeSlug}/{productSlug}
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ACTION BUTTONS */}
        {/* ============================================================== */}
        <div className="mt-8 space-y-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("ACTIVE")}
            className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-60 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing product...
              </span>
            ) : (
              "Publish product"
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("DRAFT")}
            className="w-full h-[52px] rounded-2xl border border-neutral-200 text-[#00A859] hover:bg-neutral-50 font-bold text-[15px] flex items-center justify-center transition-colors cursor-pointer"
          >
            Save draft
          </button>

          <p className="text-[12px] text-neutral-400 text-center px-2 leading-relaxed pt-1">
            Only name and selling price are required to publish. Drafts can be saved before those details are complete.
          </p>
        </div>
      </div>
    </div>
  );
}
