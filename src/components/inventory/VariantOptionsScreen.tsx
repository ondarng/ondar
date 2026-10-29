"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Check,
  Info,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { VariantInventoryScreen } from "./VariantInventoryScreen";

export interface OptionGroup {
  id: string;
  name: string;
  values: string[];
}

export interface VariantItem {
  id: string;
  title: string;
  options: Record<string, string>;
  stockOnHand: number;
  sku?: string;
  priceNaira?: string;
  costNaira?: string;
  imageUrl?: string;
}

interface VariantOptionsScreenProps {
  productName: string;
  productPhoto?: string | null;
  sku?: string;
  category?: string;
  basePriceNaira?: string;
  baseCostNaira?: string;
  startingStock?: string;
  initialGroups?: OptionGroup[];
  onBack: () => void;
  onSave: (groups: OptionGroup[], combinations: VariantItem[]) => void;
}

export function VariantOptionsScreen({
  productName,
  productPhoto,
  sku,
  category,
  basePriceNaira = "",
  baseCostNaira = "",
  startingStock = "0",
  initialGroups = [],
  onBack,
  onSave,
}: VariantOptionsScreenProps) {
  const [groups, setGroups] = useState<OptionGroup[]>(initialGroups);
  const [addingValueForId, setAddingValueForId] = useState<string | null>(null);
  const [newValueInput, setNewValueInput] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [isAddingNewOption, setIsAddingNewOption] = useState(false);
  const [newOptionTitle, setNewOptionTitle] = useState("");

  // Sub-step: "config" | "inventory"
  const [step, setStep] = useState<"config" | "inventory">("config");

  // Variant inventory overrides state
  const [variantOverrides, setVariantOverrides] = useState<
    Record<string, { stock: string; sku: string; price: string }>
  >({});

  // Compute cartesian product combinations
  const combinations = useMemo(() => {
    const validGroups = groups.filter((g) => g.values.length > 0);
    if (validGroups.length === 0) return [];

    let current: { title: string; options: Record<string, string> }[] = [
      { title: "", options: {} },
    ];

    for (const group of validGroups) {
      const next: { title: string; options: Record<string, string> }[] = [];
      for (const item of current) {
        for (const val of group.values) {
          const newTitle = item.title ? `${item.title} / ${val}` : val;
          next.push({
            title: newTitle,
            options: { ...item.options, [group.name]: val },
          });
        }
      }
      current = next;
    }

    return current;
  }, [groups]);

  // Remove a value from a group
  const removeValue = (groupId: string, valToRemove: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, values: g.values.filter((v) => v !== valToRemove) }
          : g
      )
    );
  };

  // Add a value to a group
  const addValue = (groupId: string) => {
    if (!newValueInput.trim()) {
      setAddingValueForId(null);
      return;
    }
    const clean = newValueInput.trim();
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId && !g.values.includes(clean)
          ? { ...g, values: [...g.values, clean] }
          : g
      )
    );
    setNewValueInput("");
    setAddingValueForId(null);
  };

  // Add a brand new option group
  const handleAddNewOption = () => {
    if (!newOptionTitle.trim()) {
      setIsAddingNewOption(false);
      return;
    }
    const newGroup: OptionGroup = {
      id: Date.now().toString(),
      name: newOptionTitle.trim(),
      values: [],
    };
    setGroups((prev) => [...prev, newGroup]);
    setNewOptionTitle("");
    setIsAddingNewOption(false);
    setAddingValueForId(newGroup.id);
  };

  const handleAddPresetGroup = (presetName: string) => {
    const existing = groups.find((g) => g.name.toLowerCase() === presetName.toLowerCase());
    if (existing) {
      setAddingValueForId(existing.id);
      return;
    }
    const newGroup: OptionGroup = {
      id: Date.now().toString(),
      name: presetName,
      values: [],
    };
    setGroups((prev) => [...prev, newGroup]);
    setAddingValueForId(newGroup.id);
  };

  // Save renamed group
  const handleSaveGroupName = (groupId: string) => {
    if (!editingGroupName.trim()) {
      setEditingGroupId(null);
      return;
    }
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, name: editingGroupName.trim() } : g
      )
    );
    setEditingGroupId(null);
  };

  const handleFinish = () => {
    const defaultStock = parseInt(startingStock || "0", 10) || 0;
    const finalVariants: VariantItem[] = combinations.map((combo, idx) => {
      const comboCode = combo.title.replace(/[\s/]+/g, "-").toUpperCase();
      const defaultSku = sku ? `${sku}-${comboCode}` : comboCode;
      const override = variantOverrides[combo.title] || {
        stock: String(defaultStock),
        sku: defaultSku,
        price: "",
      };
      return {
        id: `var-${idx}`,
        title: combo.title,
        options: combo.options,
        stockOnHand: parseInt(override.stock, 10) || 0,
        sku: override.sku,
        priceNaira: override.price || undefined,
      };
    });

    onSave(groups, finalVariants);
    onBack();
  };

  if (step === "inventory") {
    const defaultStock = parseInt(startingStock || "0", 10) || 0;
    const variantList: VariantItem[] = combinations.map((combo, idx) => {
      const existing = variantOverrides[combo.title];
      const comboCode = combo.title.replace(/[\s/]+/g, "-").toUpperCase();
      const defaultSku = sku ? `${sku}-${comboCode}` : comboCode;
      return {
        id: `var-${idx}`,
        title: combo.title,
        options: combo.options,
        stockOnHand: existing ? parseInt(existing.stock, 10) || 0 : defaultStock,
        sku: existing?.sku || defaultSku,
        priceNaira: existing?.price || undefined,
      };
    });

    return (
      <VariantInventoryScreen
        productName={productName || "Product"}
        productPhoto={productPhoto}
        sku={sku}
        category={category}
        basePriceNaira={basePriceNaira}
        baseCostNaira={baseCostNaira}
        variants={variantList}
        onBack={() => setStep("config")}
        onOptions={() => setStep("config")}
        onSave={(updatedVariants) => {
          onSave(groups, updatedVariants);
          onBack();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white antialiased text-neutral-900 pb-16">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <h1 className="text-[20px] font-black tracking-tight text-neutral-900">
            Variant options
          </h1>
        </div>

        {/* Product Summary Header Banner */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 flex items-center justify-center">
            {productPhoto ? (
              <img
                src={productPhoto}
                alt="Product"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#E8F8EF] flex items-center justify-center text-[#00A859] font-bold text-lg">
                👕
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-neutral-900 truncate">
              {productName || "Product"}
            </h2>
            <p className="text-xs text-neutral-500 truncate mt-0.5">
              {sku ? `${sku} · ` : ""}
              {combinations.length} variant{combinations.length === 1 ? "" : "s"}
              {category ? ` · ${category}` : ""}
            </p>
          </div>
        </div>

        {/* Info Callout Box */}
        <div className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-4 flex items-start gap-3 mb-6">
          <div className="w-5 h-5 rounded-full bg-[#00A859] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#065F46] leading-tight mb-1">
              Each combination has its own stock
            </p>
            <p className="text-[13px] text-[#065F46] leading-snug font-normal">
              Stock is held on variants, not entered again on the parent product. Your existing variant balances stay with each combination.
            </p>
          </div>
        </div>

        {/* Option Groups Cards or Empty State */}
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-[#F9FAFB] p-5 text-center mb-6">
            <p className="text-sm font-bold text-neutral-800 mb-1">
              No variant options added yet
            </p>
            <p className="text-xs text-neutral-500 mb-4 max-w-[280px] mx-auto">
              Choose an option type to start, or create your own custom option below:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["Size", "Colour", "Material", "Style"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPresetGroup(preset)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-[#00A859] hover:border-[#00A859] hover:bg-[#F0FAF5] transition-all cursor-pointer shadow-2xs"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3"
            >
              {/* Option Title Row */}
              <div className="flex items-center justify-between">
                {editingGroupId === group.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      autoFocus
                      value={editingGroupName}
                      onChange={(e) => setEditingGroupName(e.target.value)}
                      placeholder="Option name"
                      className="w-full h-9 px-3 rounded-lg border border-neutral-300 text-sm font-bold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveGroupName(group.id)}
                      className="p-1.5 rounded-lg bg-[#00A859] text-white"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[15px] font-bold text-neutral-900">
                    {group.name}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingGroupId(group.id);
                    setEditingGroupName(group.name);
                  }}
                  className="p-1 text-[#00A859] hover:text-[#00964E] transition-colors cursor-pointer"
                  title="Edit option name"
                >
                  <Pencil className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Values Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {group.values.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4F6F5] text-sm font-semibold text-neutral-800"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => removeValue(group.id, val)}
                      className="text-neutral-400 hover:text-neutral-800 transition-colors p-0.5 cursor-pointer"
                      aria-label={`Remove ${val}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Value Input / Trigger */}
              {addingValueForId === group.id ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    autoFocus
                    value={newValueInput}
                    onChange={(e) => setNewValueInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addValue(group.id);
                      }
                    }}
                    placeholder="e.g. XL or Red"
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-300 text-sm font-medium outline-none focus:border-[#00A859]"
                  />
                  <button
                    type="button"
                    onClick={() => addValue(group.id)}
                    className="px-3.5 h-10 rounded-xl bg-[#00A859] text-white text-xs font-bold flex items-center justify-center cursor-pointer flex-shrink-0"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingValueForId(null);
                      setNewValueInput("");
                    }}
                    className="p-2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAddingValueForId(group.id);
                    setNewValueInput("");
                  }}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#00A859] hover:text-[#00964E] cursor-pointer pt-1 transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add value</span>
                </button>
              )}
            </div>
          ))}
        </div>
        )}

        {/* Add Another Option Button / Input */}
        {isAddingNewOption ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3 mb-6">
            <p className="text-xs font-bold text-neutral-700">Option Name</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={newOptionTitle}
                onChange={(e) => setNewOptionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewOption();
                  }
                }}
                placeholder="e.g. Material or Fit"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 text-sm font-medium outline-none focus:border-[#00A859]"
              />
              <button
                type="button"
                onClick={handleAddNewOption}
                className="px-4 h-11 rounded-xl bg-[#00A859] text-white text-xs font-bold cursor-pointer flex-shrink-0"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNewOption(false)}
                className="p-2 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingNewOption(true)}
            className="w-full h-[52px] rounded-2xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-[#00A859] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all mb-6 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add another option</span>
          </button>
        )}

        {/* Generated Combinations Section */}
        <div className="border-t border-neutral-100 pt-5 mb-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-bold text-neutral-900">
              Generated combinations
            </h3>
            <span className="text-xs font-bold text-[#00A859] bg-[#E8F8EF] px-2.5 py-0.5 rounded-md">
              {combinations.length} variant{combinations.length === 1 ? "" : "s"}
            </span>
          </div>

          {combinations.length === 0 ? (
            <p className="text-xs text-neutral-400 py-3">
              Add at least one value to generate combinations.
            </p>
          ) : (
            <div className="space-y-2.5">
              {combinations.map((c) => (
                <div key={c.title} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00A859] stroke-[3] flex-shrink-0" />
                  <span className="text-sm font-medium text-neutral-800">
                    {c.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-neutral-500 font-normal mt-4 leading-relaxed">
            Set stock, SKU and optional price, cost or photo overrides for each combination next.
          </p>
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-2">
          <button
            type="button"
            disabled={combinations.length === 0}
            onClick={() => setStep("inventory")}
            className="w-full h-[52px] rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-[15px] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            Continue to variant inventory
          </button>
        </div>
      </div>
    </div>
  );
}
