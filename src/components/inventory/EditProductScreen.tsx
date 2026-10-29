"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bold,
  Boxes,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Image as ImageIcon,
  Info,
  Italic,
  Layers,
  List,
  Loader2,
  Lock,
  Plus,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { availableStock, formatNairaFromKobo } from "@/lib/inventory";
import type { InventoryProduct } from "@/app/inventory/InventoryClient";
import {
  VariantOptionsScreen,
  type OptionGroup,
  type VariantItem,
} from "./VariantOptionsScreen";
import { VariantInventoryScreen } from "./VariantInventoryScreen";
import { OptionalDetailsScreen } from "./OptionalDetailsScreen";

interface EditProductScreenProps {
  product: InventoryProduct;
  storeSlug: string;
  onBack: () => void;
  onSuccess: (updatedProduct: InventoryProduct) => void;
  onOpenAdjustStock: () => void;
}

const CATEGORY_OPTIONS = [
  "Clothing",
  "Shoes",
  "Bags & Luggage",
  "Accessories & Jewelry",
  "Beauty & Skincare",
  "Food & Groceries",
  "Electronics & Gadgets",
  "Home & Living",
  "Art & Crafts",
  "Health & Wellness",
  "Other",
];

export function EditProductScreen({
  product,
  storeSlug,
  onBack,
  onSuccess,
  onOpenAdjustStock,
}: EditProductScreenProps) {
  // Navigation inside edit: "main" | "optional" | "variant-options" | "variant-inventory"
  const [subView, setSubView] = useState<
    "main" | "optional" | "variant-options" | "variant-inventory"
  >("main");

  const initialPriceNaira = (Number(product.priceKobo) / 100).toString();
  const initialCostNaira = product.costKobo
    ? (Number(product.costKobo) / 100).toString()
    : "";

  const [name, setName] = useState(product.name);
  const [priceInput, setPriceInput] = useState(initialPriceNaira);
  const [costInput, setCostInput] = useState(initialCostNaira);
  const [sku, setSku] = useState(product.sku || "");
  const [category, setCategory] = useState(product.category || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    product.images[0]?.url || null
  );

  // Variant items from product.variants
  const initialVariantItems: VariantItem[] = useMemo(() => {
    return (product.variants || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      options: v.options && typeof v.options === "object" ? v.options : {},
      stockOnHand:
        typeof v.stockOnHand === "number"
          ? v.stockOnHand
          : parseInt(v.stockOnHand, 10) || 0,
      stockReserved:
        typeof v.stockReserved === "number"
          ? v.stockReserved
          : parseInt(v.stockReserved, 10) || 0,
      sku: v.sku || "",
      priceNaira: v.priceKobo ? (Number(v.priceKobo) / 100).toString() : "",
      costNaira: v.costKobo ? (Number(v.costKobo) / 100).toString() : "",
      imageUrl: v.imageUrl || "",
    }));
  }, [product.variants]);

  // Option groups derived from product.variants
  const initialOptionGroups: OptionGroup[] = useMemo(() => {
    const groupMap: Record<string, Set<string>> = {};
    (product.variants || []).forEach((v: any) => {
      if (v.options && typeof v.options === "object") {
        Object.entries(v.options).forEach(([k, val]) => {
          if (!groupMap[k]) groupMap[k] = new Set();
          if (typeof val === "string" && val.trim()) {
            groupMap[k].add(val.trim());
          }
        });
      } else if (v.title && v.title.includes("/")) {
        const parts = v.title.split("/").map((s: string) => s.trim());
        if (parts.length >= 2) {
          if (!groupMap["Size"]) groupMap["Size"] = new Set();
          if (!groupMap["Colour"]) groupMap["Colour"] = new Set();
          groupMap["Size"].add(parts[0]);
          groupMap["Colour"].add(parts[1]);
        }
      }
    });

    const groups: OptionGroup[] = Object.entries(groupMap).map(
      ([name, valSet], idx) => ({
        id: `group-${idx}`,
        name,
        values: Array.from(valSet),
      })
    );

    return groups;
  }, [product.variants]);

  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>(initialOptionGroups);
  const [variantItems, setVariantItems] = useState<VariantItem[]>(initialVariantItems);

  // More details accordion state
  const [isMoreDetailsOpen, setIsMoreDetailsOpen] = useState(false);
  const [description, setDescription] = useState((product as any).description || "");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product.lowStockThreshold?.toString() || ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Total variant stock
  const totalVariantStock = useMemo(() => {
    return variantItems.reduce((acc, v) => acc + (v.stockOnHand || 0), 0);
  }, [variantItems]);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    const variantsChanged =
      JSON.stringify(
        variantItems.map((v) => ({
          title: v.title,
          stock: v.stockOnHand,
          price: v.priceNaira,
          sku: v.sku,
        }))
      ) !==
      JSON.stringify(
        initialVariantItems.map((v) => ({
          title: v.title,
          stock: v.stockOnHand,
          price: v.priceNaira,
          sku: v.sku,
        }))
      );

    return (
      name !== product.name ||
      priceInput !== initialPriceNaira ||
      costInput !== initialCostNaira ||
      sku !== (product.sku || "") ||
      category !== (product.category || "") ||
      photoUrl !== (product.images[0]?.url || null) ||
      description !== ((product as any).description || "") ||
      lowStockThreshold !== (product.lowStockThreshold?.toString() || "") ||
      variantsChanged
    );
  }, [
    name,
    priceInput,
    costInput,
    sku,
    category,
    photoUrl,
    description,
    lowStockThreshold,
    variantItems,
    initialVariantItems,
    product,
    initialPriceNaira,
    initialCostNaira,
  ]);

  // Live price validation
  const priceValidationError = useMemo(() => {
    if (!priceInput.trim()) {
      return "Enter a selling price.";
    }
    if (/[^0-9.,]/.test(priceInput)) {
      return "Use numbers only, for example 18500.";
    }
    const clean = priceInput.replace(/,/g, "");
    const parsed = parseFloat(clean);
    if (isNaN(parsed) || parsed <= 0) {
      return "Enter a valid selling price in naira.";
    }
    return null;
  }, [priceInput]);

  const onHand = variantItems.length > 0 ? totalVariantStock : product.stockOnHand;
  const reserved = product.stockReserved;
  const available = availableStock(onHand, reserved);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const applyFormat = (type: "bold" | "italic" | "list") => {
    const textarea = document.getElementById("edit-desc-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.substring(start, end);
    let replacement = "";

    if (type === "bold") {
      replacement = `**${selected || "bold text"}**`;
    } else if (type === "italic") {
      replacement = `*${selected || "italic text"}*`;
    } else if (type === "list") {
      replacement = `\n• ${selected || "List item"}`;
    }

    setDescription(
      description.substring(0, start) + replacement + description.substring(end)
    );
  };

  const handleSave = async () => {
    setSaveError(null);
    if (!name.trim()) {
      setSaveError("Product name is required.");
      return;
    }
    if (priceValidationError) {
      setSaveError("Fix the selling price before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const cleanPrice = priceInput.replace(/,/g, "").trim();
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          priceNaira: cleanPrice,
          costPriceNaira: costInput.trim() ? costInput.trim() : null,
          sku: sku.trim() || null,
          category: category.trim() || null,
          description: description.trim() || null,
          lowStockThreshold: lowStockThreshold.trim() ? lowStockThreshold.trim() : null,
          photoUrl: photoUrl || undefined,
          variants: variantItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(
          data.error ||
            "Couldn't save changes. Your entries are still here. Check your connection and retry."
        );
        return;
      }

      onSuccess(data.product);
      onBack();
    } catch {
      setSaveError(
        "Couldn't save changes. Your entries are still here. Check your connection and retry."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==============================================================
  // SUB-VIEW 1: VARIANT OPTIONS SCREEN (Option Groups)
  // ==============================================================
  if (subView === "variant-options") {
    return (
      <VariantOptionsScreen
        productName={name}
        productPhoto={photoUrl}
        sku={sku}
        category={category}
        basePriceNaira={priceInput}
        baseCostNaira={costInput}
        startingStock={onHand.toString()}
        initialGroups={optionGroups}
        onBack={() => setSubView("main")}
        onSave={(newGroups, newVariants) => {
          setOptionGroups(newGroups);
          setVariantItems(newVariants);
          setSubView("main");
        }}
      />
    );
  }

  // ==============================================================
  // SUB-VIEW 2: VARIANT INVENTORY SCREEN (Stock & Price per variant)
  // ==============================================================
  if (subView === "variant-inventory") {
    return (
      <VariantInventoryScreen
        productName={name}
        productPhoto={photoUrl}
        sku={sku}
        category={category}
        basePriceNaira={priceInput}
        baseCostNaira={costInput}
        variants={variantItems}
        onBack={() => setSubView("main")}
        onOptions={() => setSubView("variant-options")}
        onSave={(updatedVariants) => {
          setVariantItems(updatedVariants);
          setSubView("main");
        }}
      />
    );
  }

  // ==============================================================
  // SUB-VIEW 3: OPTIONAL DETAILS SCREEN (Deep details)
  // ==============================================================
  if (subView === "optional") {
    return (
      <OptionalDetailsScreen
        productName={name}
        data={{
          description,
          costPriceNaira: costInput,
          category,
          sku,
          lowStockThreshold,
          extraImages: [],
        }}
        onChange={(updates) => {
          if (updates.description !== undefined) setDescription(updates.description);
          if (updates.costPriceNaira !== undefined) setCostInput(updates.costPriceNaira);
          if (updates.category !== undefined) setCategory(updates.category);
          if (updates.sku !== undefined) setSku(updates.sku);
          if (updates.lowStockThreshold !== undefined)
            setLowStockThreshold(updates.lowStockThreshold);
        }}
        onBack={() => setSubView("main")}
        onOpenExtras={() => setSubView("variant-options")}
      />
    );
  }

  // ==============================================================
  // MAIN VIEW: EDIT PRODUCT SCREEN
  // ==============================================================
  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-20">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1 -ml-1 text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="text-[20px] font-black tracking-tight text-neutral-900">
              Edit product
            </h1>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="text-[15px] font-bold text-[#00A859] hover:text-[#00964E] transition-colors cursor-pointer"
          >
            Discard
          </button>
        </div>

        {/* Status Pill & Unsaved changes indicator */}
        <div className="flex items-center justify-between mb-5">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E8F8EF] text-[#00A859] capitalize">
            {product.status.toLowerCase()}
          </span>

          {isDirty && (
            <span className="text-xs text-neutral-500 font-medium">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="space-y-5">
          {/* 1. Product Name */}
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-1.5">
              Product name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-neutral-200 text-[15px] font-medium text-neutral-900 outline-none focus:border-neutral-400"
            />
          </div>

          {/* 2. Photo Row */}
          <div className="flex items-center gap-3.5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-neutral-400" />
              )}
            </div>
            <div>
              <label className="text-sm font-bold text-[#00A859] hover:underline cursor-pointer block">
                Edit photos
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-neutral-500 mt-0.5">
                Main image + extra photos
              </p>
            </div>
          </div>

          {/* 3. Selling Price */}
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-1.5">
              Selling price *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-base font-semibold text-neutral-900 pointer-events-none">
                ₦
              </span>
              <input
                type="text"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className={`w-full h-12 pl-9 pr-4 rounded-2xl border text-[15px] font-semibold text-neutral-900 outline-none transition-all ${
                  priceValidationError
                    ? "border-red-500 bg-red-50/20 focus:border-red-500"
                    : "border-neutral-200 focus:border-neutral-400"
                }`}
              />
            </div>

            {priceValidationError ? (
              <p className="text-xs font-semibold text-red-600 mt-1.5 flex items-center gap-1">
                ! {priceValidationError}
              </p>
            ) : null}

            <p className="text-xs text-neutral-400 mt-1">
              Current saved selling price: {formatNairaFromKobo(product.priceKobo)}
            </p>
          </div>

          {/* 4. Cost Price */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-neutral-900">
                Cost price · private
              </label>
              <span className="text-[11px] text-neutral-400 font-normal">Optional</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-base font-semibold text-neutral-900 pointer-events-none">
                ₦
              </span>
              <input
                type="text"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                className="w-full h-12 pl-9 pr-11 rounded-2xl border border-neutral-200 text-[15px] font-semibold text-neutral-900 outline-none focus:border-neutral-400"
              />
              <Lock className="w-4 h-4 text-neutral-700 absolute right-4 pointer-events-none" />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Never shared with customers. Leave blank for Unknown; profit will be unavailable.
            </p>
          </div>

          {/* 5. SKU */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-neutral-900">SKU</label>
              <span className="text-[11px] text-neutral-400 font-normal">Optional</span>
            </div>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. SKU-001"
              className="w-full h-12 px-4 rounded-2xl border border-neutral-200 text-[15px] font-medium text-neutral-900 outline-none focus:border-neutral-400"
            />
          </div>

          {/* 6. Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-neutral-900">Category</label>
              <span className="text-[11px] text-neutral-400 font-normal">Optional</span>
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-neutral-200 bg-white text-sm font-medium text-neutral-900 appearance-none outline-none focus:border-neutral-400 cursor-pointer"
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-neutral-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* ============================================================== */}
          {/* 7. VARIANTS (OPTIONS & COMBINATIONS) SECTION */}
          {/* ============================================================== */}
          <div className="border-t border-neutral-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-neutral-900">
                    Variants
                  </p>
                  {variantItems.length > 0 && (
                    <span className="text-[11px] font-bold text-[#00A859] bg-[#E8F8EF] px-2 py-0.5 rounded-full">
                      {variantItems.length} combination{variantItems.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {variantItems.length > 0
                    ? `${totalVariantStock} units configured across ${variantItems.length} combinations.`
                    : "Add options like size, colour, or material to sell variations."}
                </p>
              </div>
            </div>

            {variantItems.length > 0 ? (
              <div className="space-y-2.5">
                {/* Variant Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubView("variant-inventory")}
                    className="h-11 rounded-xl bg-[#E8F8EF] hover:bg-[#D5F5E3] text-[#00A859] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#A7F3D0]/60 shadow-2xs"
                  >
                    <Boxes className="w-4 h-4" />
                    <span>Variant inventory</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView("variant-options")}
                    className="h-11 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Layers className="w-4 h-4 text-neutral-500" />
                    <span>Edit options</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Variant Mini Summary Chips */}
                <div className="p-3 rounded-2xl bg-[#FAFAFA] border border-neutral-100 space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">
                    Current combinations
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {variantItems.map((v) => (
                      <span
                        key={v.id || v.title}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs"
                      >
                        <span className="font-bold">{v.title}</span>
                        <span className="text-[#00A859] font-semibold">
                          ({v.stockOnHand} left)
                        </span>
                        {v.priceNaira && (
                          <span className="text-neutral-400 text-[10px]">
                            · ₦{v.priceNaira}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSubView("variant-options")}
                className="w-full h-12 rounded-2xl border border-dashed border-neutral-300 hover:border-[#00A859] bg-white hover:bg-[#E8F8EF]/30 text-[#00A859] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add variants (size, colour, etc.)</span>
              </button>
            )}
          </div>

          {/* 8. Stock Link Row */}
          <div className="border-t border-neutral-100 pt-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-neutral-900">
                Stock · {available} available
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {variantItems.length > 0
                  ? "Managed via Variant Inventory above."
                  : "Use Adjust stock to change units, not this form."}
              </p>
            </div>
            {variantItems.length === 0 && (
              <button
                type="button"
                onClick={onOpenAdjustStock}
                className="p-1 text-[#00A859] hover:text-[#00964E] cursor-pointer transition-transform hover:scale-110"
                title="Adjust stock"
              >
                <PlusCircle className="w-6 h-6 stroke-[2]" />
              </button>
            )}
          </div>

          {/* 9. Optional details link row */}
          <div className="border-t border-neutral-100 pt-3">
            <button
              type="button"
              onClick={() => setSubView("optional")}
              className="w-full flex items-center justify-between text-left group cursor-pointer py-2"
            >
              <div>
                <p className="text-[15px] font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                  Optional details
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Description, cost, SKU, threshold & automatic URL
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-[#00A859] transition-colors flex-shrink-0" />
            </button>
          </div>

          {/* 11. Informational Callout */}
          <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#00A859] stroke-[2.5] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#065F46] leading-relaxed">
              Edits won’t change historic orders. Each order keeps the name, variant, price and cost saved at the time.
            </p>
          </div>

          {/* Save / Recoverable error card */}
          {saveError && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 space-y-2 animate-in fade-in-50">
              <p className="text-xs font-bold text-red-600 leading-snug">
                {saveError}
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer hover:bg-red-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry save</span>
              </button>
            </div>
          )}

          {/* 12. Bottom Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isSaving || Boolean(priceValidationError)}
              onClick={handleSave}
              className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving changes...
                </span>
              ) : (
                "Save changes"
              )}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={onBack}
              className="w-full h-[52px] rounded-2xl border border-neutral-200 text-[#00A859] hover:bg-neutral-50 font-bold text-[15px] flex items-center justify-center transition-colors cursor-pointer"
            >
              Discard changes
            </button>

            {priceValidationError && (
              <p className="text-xs text-red-500 text-center font-medium">
                Fix the selling price before saving. Your other changes stay here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
