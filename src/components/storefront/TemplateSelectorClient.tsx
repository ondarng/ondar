"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Sparkles, Store, Zap } from "lucide-react";

interface TemplateOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  idealFor: string;
  previewColor: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "default",
    name: "Ondar Minimal",
    tagline: "Clean, light & universal",
    description: "Universal clean layout with category chips, vertical feed, and swift cart drawer. Perfect for fashion, thrift, beauty and lifestyle.",
    badge: "Free · Default",
    idealFor: "Fashion, Accessories, Bags, Beauty",
    previewColor: "bg-[#00A859]",
  },
  {
    id: "fashion",
    name: "Zuri Luxe Fashion",
    tagline: "Editorial portrait grid & refined styling",
    description: "Editorial serif typography, 2-column portrait imagery, circular category stories, in-stock/sold-out badges, and high-fashion boutique aesthetics.",
    badge: "Free · Designer",
    idealFor: "Ready-to-wear, Made-to-order, Nigerian Designers & Tailors",
    previewColor: "bg-neutral-900",
  },
  {
    id: "food",
    name: "Mama's Kitchen & Dining",
    tagline: "Appetizing food menu & culinary styling",
    description: "Warm peach & terracotta theme (#FCE7D2), 1-tap quick add actions, category tabs, quantity steppers, and appetizing culinary presentation.",
    badge: "Free · Kitchen",
    idealFor: "Restaurants, Cloud Kitchens, Caterers, Bakeries & Food Vendors",
    previewColor: "bg-[#BA3C1D]",
  },
  {
    id: "electronics",
    name: "Cyber Tech & Gadgets",
    tagline: "High-density dark grid & spec chips",
    description: "Futuristic dark slate theme (#0F172A) with 2-column tech grid, specification chips, monospace pricing, and dark-mode product detail page.",
    badge: "Free · New",
    idealFor: "Smartphones, Laptops, Audio, Computer Village Vendors",
    previewColor: "bg-[#38BDF8]",
  },
];

interface TemplateSelectorProps {
  currentTemplateId: string;
  storeSlug: string;
}

export function TemplateSelectorClient({ currentTemplateId, storeSlug }: TemplateSelectorProps) {
  const [selected, setSelected] = useState(currentTemplateId);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSelectTemplate = async (templateId: string) => {
    if (isSaving || templateId === selected) return;
    setIsSaving(true);
    setSavedSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(data.profile.templateId);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setSaveError(data.error || "Template selection could not be saved.");
      }
    } catch {
      setSaveError("Template selection could not be saved. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 text-neutral-900">
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <Link
          href="/more"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-[14px] font-bold text-neutral-900">Storefront Templates</span>
        <div className="w-9"></div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00A859]" />
            <h2 className="text-[17px] font-bold text-neutral-900">Choose your store vibe</h2>
          </div>
          <p className="text-[12px] text-neutral-600 leading-relaxed">
            Switching templates instantly updates your storefront layout. Your products, inventory, prices, and orders remain 100% untouched.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-[#EBF3EF] border border-[#C5DFD2] rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
            <Check className="w-5 h-5 text-[#00A859]" />
            <p className="text-[13px] font-bold text-[#005c31]">
              Template updated! Visit your storefront to see it live.
            </p>
          </div>
        )}

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-[13px] font-semibold text-red-700">
            {saveError}
          </div>
        )}

        <div className="space-y-4">
          {TEMPLATES.map((tmpl) => {
            const isCurrent = selected === tmpl.id;
            return (
              <div
                key={tmpl.id}
                className={`bg-white rounded-2xl p-5 border-2 transition-all space-y-3 shadow-sm ${
                  isCurrent
                    ? "border-[#00A859] ring-2 ring-[#00A859]/20"
                    : "border-neutral-200/80 hover:border-neutral-300"
                }`}
              >
                  <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${tmpl.previewColor} shadow-xs`}
                    >
                      {tmpl.id === "electronics" ? (
                        <Zap className="w-5 h-5 fill-white stroke-none" />
                      ) : (
                        <Store className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-neutral-900">{tmpl.name}</h3>
                      <p className="text-[11px] text-neutral-500 font-medium">{tmpl.tagline}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                      isCurrent
                        ? "bg-[#E6F7EF] text-[#00A859]"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {isCurrent ? "✓ Active" : tmpl.badge}
                  </span>
                </div>

                <p className="text-[12px] text-neutral-600 leading-relaxed">{tmpl.description}</p>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Ideal for: <strong className="text-neutral-800">{tmpl.idealFor}</strong></span>
                  <Link
                    href={`/s/${storeSlug}?previewTemplate=${tmpl.id}`}
                    target="_blank"
                    className="text-[#00A859] font-bold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Preview storefront →
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  disabled={isSaving || isCurrent}
                  className="w-full h-10 rounded-xl bg-neutral-900 text-white text-[12px] font-bold transition-colors hover:bg-neutral-700 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-default"
                >
                  {isSaving && !isCurrent ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</span>
                  ) : isCurrent ? "Current template" : "Use this template"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
