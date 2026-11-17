"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    slug: string;
    priceKobo: string;
    imageUrl?: string;
    category?: string | null;
  };
  businessName: string;
  storeSlug: string;
}

export function ProductShareModal({
  isOpen,
  onClose,
  product,
  businessName,
  storeSlug,
}: ProductShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const nairaPrice = (Number(product.priceKobo) / 100).toLocaleString();
  const productPath = `${storeSlug}.ondar.ng/p/${product.slug}`;
  const fullUrl = `https://${productPath}`;
  const shareText = `Check out ${product.name} (₦${nairaPrice}) on ${businessName}: ${fullUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} — ${businessName}`,
          text: `Check out ${product.name} (₦${nairaPrice}) on ${businessName}`,
          url: fullUrl,
        });
        return;
      } catch {
        // User cancelled or share failed
      }
    }
    // Fallback to copy link
    handleCopyLink();
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadCard = async () => {
    setIsGeneratingImage(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = "#F8F8F4";
      ctx.fillRect(0, 0, 1080, 1080);

      // Card frame
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(60, 60, 960, 960, 48);
      ctx.fill();
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Store header
      ctx.fillStyle = "#111827";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(businessName, 120, 160);

      ctx.fillStyle = "#00A859";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(productPath, 120, 205);

      // Draw product image
      if (product.imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // continue if image fails
          img.src = product.imageUrl!;
        });

        if (img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(120, 250, 840, 560, 32);
          ctx.clip();
          ctx.drawImage(img, 120, 250, 840, 560);
          ctx.restore();
        }
      } else {
        // Fallback gray box
        ctx.fillStyle = "#F3F4F6";
        ctx.beginPath();
        ctx.roundRect(120, 250, 840, 560, 32);
        ctx.fill();
      }

      // Product Title
      ctx.fillStyle = "#111827";
      ctx.font = "bold 52px sans-serif";
      const displayTitle = product.name.length > 32 ? product.name.slice(0, 30) + "…" : product.name;
      ctx.fillText(displayTitle, 120, 880);

      // Price Tag Badge
      ctx.fillStyle = "#006B3A";
      ctx.font = "black 56px sans-serif";
      ctx.fillText(`₦${nairaPrice}`, 120, 960);

      // Footer branding
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("Order on ondar.ng", 960, 960);

      // Download triggered
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${product.slug}-ondar-card.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate share card:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-neutral-100 flex flex-col space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006B3A] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900">Share Product</h3>
              <p className="text-[11px] text-neutral-400">Send card to buyers & WhatsApp</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Share Card Preview */}
        <div className="bg-[#FAF9F5] rounded-2xl p-3 border border-neutral-200/70 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-neutral-800">{businessName}</span>
            <span className="text-[#006B3A] font-medium">{storeSlug}.ondar.ng</span>
          </div>

          <div className="aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/50">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs font-medium">
                No product photo
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <p className="text-xs font-bold text-neutral-900 truncate pr-2">
              {product.name}
            </p>
            <p className="text-sm font-black text-[#006B3A] shrink-0">
              ₦{nairaPrice}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* WhatsApp Share Button (Highest conversion in Nigeria) */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Share on WhatsApp (With Card)</span>
          </button>

          {/* Native Share Sheet */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via Phone Apps</span>
          </button>

          {/* Row of Copy & Download */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-9.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isGeneratingImage}
              className="h-9.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              <span>{isGeneratingImage ? "Saving..." : "Save Image"}</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-neutral-400 text-center pt-1">
          When shared, WhatsApp and Instagram automatically generate a full product preview card.
        </p>
      </div>
    </div>
  );
}
