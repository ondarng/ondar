"use client";

import React, { useState, useRef, useId } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Loader2,
  Sparkles,
  Eye,
  Trash2,
  Palette,
  Type,
  Maximize2,
  RefreshCw,
} from "lucide-react";

interface StorefrontCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBusinessName: string;
  initialDescription?: string | null;
  initialBannerUrl?: string | null;
  initialCity?: string;
  initialState?: string;
  storeSlug?: string;
  onSaved?: (updated: {
    businessName: string;
    description: string;
    bannerUrl: string | null;
  }) => void;
}

const PRESET_BANNERS = [
  {
    id: "terracotta",
    name: "Terracotta Warmth",
    gradient: "from-[#BA3C1D] via-[#D97706] to-[#FCE7D2]",
    tag: "Food & Kitchen",
  },
  {
    id: "editorial",
    name: "Luxe Noir",
    gradient: "from-neutral-950 via-neutral-900 to-neutral-800",
    tag: "Fashion Boutique",
  },
  {
    id: "tech",
    name: "Cyber Slate",
    gradient: "from-[#0F172A] via-[#1E293B] to-[#0284C7]",
    tag: "Gadgets & Tech",
  },
  {
    id: "emerald",
    name: "Ondar Fresh",
    gradient: "from-[#005c31] via-[#00A859] to-[#E8F8EF]",
    tag: "Clean Universal",
  },
];

export function StorefrontCanvasModal({
  isOpen,
  onClose,
  initialBusinessName,
  initialDescription,
  initialBannerUrl,
  initialCity = "Lagos",
  initialState = "Nigeria",
  storeSlug = "shop",
  onSaved,
}: StorefrontCanvasModalProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState(initialBusinessName || "My Store");
  const [description, setDescription] = useState(
    initialDescription || "Everyday pieces, thoughtfully curated for you."
  );
  const [bannerImage, setBannerImage] = useState<string | null>(initialBannerUrl || null);
  const [activeGradient, setActiveGradient] = useState<string | null>(null);

  // Styling controls
  const [badgeText, setBadgeText] = useState("SPECIAL HIGHLIGHT");
  const [textAlign, setTextAlign] = useState<"left" | "center">("left");
  const [overlayDarkness, setOverlayDarkness] = useState<"light" | "medium" | "dark">("medium");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"card" | "banner">("banner");

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Banner image must be under 5 MB.");
      return;
    }
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerImage(e.target?.result as string);
      setActiveGradient(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageFile(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          description: description.trim(),
          logoUrl: bannerImage || undefined,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        if (onSaved) {
          onSaved({
            businessName: businessName.trim(),
            description: description.trim(),
            bannerUrl: bannerImage,
          });
        }
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2500);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Could not save storefront banner.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const overlayClass =
    overlayDarkness === "light"
      ? "bg-black/20"
      : overlayDarkness === "dark"
      ? "bg-black/60"
      : "bg-black/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-[560px] max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8F8EF] text-[#00A859] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 leading-none">
                Storefront Canvas & Banner
              </h2>
              <p className="text-[11px] text-neutral-500 font-normal mt-0.5">
                Upload highlight imagery and edit store announcement text live
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            aria-label="Close canvas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. LIVE CANVAS PREVIEW WINDOW */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                <Eye className="w-3.5 h-3.5 text-[#00A859]" />
                <span>Live Canvas Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMode("banner")}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    previewMode === "banner" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-500"
                  }`}
                >
                  Banner
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("card")}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    previewMode === "card" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-500"
                  }`}
                >
                  Hero Card
                </button>
              </div>
            </div>

            {/* The Canvas Card */}
            <div
              className={`relative w-full rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm transition-all flex flex-col justify-end text-white p-5 ${
                previewMode === "banner" ? "aspect-[16/7]" : "aspect-[16/10]"
              }`}
              style={{
                backgroundColor: "#18181B",
                backgroundImage: bannerImage ? `url(${bannerImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* If using preset gradient instead of photo */}
              {!bannerImage && activeGradient && (
                <div className={`absolute inset-0 bg-gradient-to-tr ${activeGradient}`} />
              )}

              {/* If no image and no gradient: modern neutral geometric backdrop */}
              {!bannerImage && !activeGradient && (
                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 opacity-90" />
              )}

              {/* Darkness Overlay for text readability */}
              <div className={`absolute inset-0 ${overlayClass} backdrop-blur-[0.5px] transition-all`} />

              {/* Content overlay inside canvas */}
              <div
                className={`relative z-10 space-y-1.5 ${
                  textAlign === "center" ? "text-center mx-auto" : "text-left"
                }`}
              >
                {badgeText && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-white border border-white/30">
                    {badgeText}
                  </span>
                )}

                <h3 className="font-serif font-black text-xl sm:text-2xl leading-tight drop-shadow-sm">
                  {businessName || "Your Store Name"}
                </h3>

                <p className="text-xs sm:text-sm text-white/90 line-clamp-2 max-w-[420px] font-medium leading-relaxed drop-shadow-xs">
                  {description || "Add your store tagline or announcement here..."}
                </p>

                <div className="pt-1 flex items-center gap-2 text-[10px] text-white/80 font-mono">
                  <span>{initialCity}, {initialState}</span>
                  <span>·</span>
                  <span className="text-[#00A859] font-bold bg-white/90 px-1.5 py-0.2 rounded text-[9px]">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. IMAGE UPLOAD / MEDIA SELECTION */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-neutral-800">
              Banner or Highlight Image
            </label>

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-200 hover:border-[#00A859] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-[#E8F8EF]/20 group"
            >
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 group-hover:border-[#00A859] flex items-center justify-center text-neutral-500 group-hover:text-[#00A859] transition-colors shadow-2xs">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-neutral-800">
                  Click to upload or drag & drop image
                </p>
                <p className="text-[11px] text-neutral-400">
                  PNG, JPG or WebP up to 5MB (1200×600 recommended)
                </p>
              </div>
            </div>

            {/* Clear or Preset options */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold text-neutral-500">Or use aesthetic preset:</span>
              {bannerImage && (
                <button
                  type="button"
                  onClick={() => {
                    setBannerImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove photo</span>
                </button>
              )}
            </div>

            {/* Gradient Preset Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_BANNERS.map((preset) => {
                const isActive = activeGradient === preset.gradient && !bannerImage;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setBannerImage(null);
                      setActiveGradient(preset.gradient);
                    }}
                    className={`h-9 rounded-xl transition-all cursor-pointer relative overflow-hidden border ${
                      isActive
                        ? "border-[#00A859] ring-2 ring-[#00A859]/30 scale-105"
                        : "border-neutral-200 hover:scale-102"
                    }`}
                    title={preset.name}
                  >
                    <div className={`w-full h-full bg-gradient-to-r ${preset.gradient}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. TEXT & COPY CUSTOMIZATION */}
          <div className="space-y-3.5 pt-1 border-t border-neutral-100">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Store Display Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] transition-all"
                placeholder="e.g. Ada's Edit, Mama's Kitchen"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Announcement & Tagline Text
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] transition-all resize-none"
                placeholder="Write a clear highlight for your customers..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Highlight Tag Badge (Optional)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#00A859] transition-all"
                placeholder="e.g. SPECIAL HIGHLIGHT, NEW ARRIVALS, WEEKEND SPECIAL"
              />
            </div>

            {/* Visual Styling options */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Text Alignment
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTextAlign("left")}
                    className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      textAlign === "left" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-500"
                    }`}
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign("center")}
                    className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      textAlign === "center" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-500"
                    }`}
                  >
                    Center
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Overlay Contrast
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl">
                  {(["light", "medium", "dark"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setOverlayDarkness(lvl)}
                      className={`py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        overlayDarkness === lvl
                          ? "bg-white text-neutral-900 shadow-2xs"
                          : "text-neutral-500"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-[#E8F8EF] border border-[#A7F3D0] text-[#005c31] text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Canvas saved! Your storefront banner has been updated.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <a
              href={`/s/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-colors"
            >
              View Storefront
            </a>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#00A859] hover:bg-[#00924C] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save to Storefront</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
