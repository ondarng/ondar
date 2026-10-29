"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Link2,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Share2,
} from "lucide-react";

interface CatalogProductOption {
  id: string;
  name: string;
  priceKobo: string;
  stockOnHand: number;
  stockReserved: number;
}

interface CustomItem {
  productId: string;
  name: string;
  agreedPriceNaira: string;
  quantity: number;
  availableStock: number;
}

interface CustomCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: CatalogProductOption[];
  storeSlug: string;
}

export function CustomCheckoutModal({
  isOpen,
  onClose,
  products,
  storeSlug,
}: CustomCheckoutModalProps) {
  const [selectedItems, setSelectedItems] = useState<CustomItem[]>([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = (prod: CatalogProductOption) => {
    const avail = Math.max(0, prod.stockOnHand - prod.stockReserved);
    if (avail <= 0) {
      alert("This item is out of stock.");
      return;
    }
    const defaultPriceNaira = Math.round(Number(prod.priceKobo) / 100).toString();

    // If already added, increment
    const exists = selectedItems.find((i) => i.productId === prod.id);
    if (exists) {
      setSelectedItems((prev) =>
        prev.map((i) =>
          i.productId === prod.id ? { ...i, quantity: Math.min(avail, i.quantity + 1) } : i
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          agreedPriceNaira: defaultPriceNaira,
          quantity: 1,
          availableStock: avail,
        },
      ]);
    }
  };

  const updateQuantity = (idx: number, delta: number) => {
    setSelectedItems((prev) => {
      const next = [...prev];
      const cur = next[idx];
      const newQty = Math.max(1, Math.min(cur.availableStock, cur.quantity + delta));
      next[idx] = { ...cur, quantity: newQty };
      return next;
    });
  };

  const updateAgreedPrice = (idx: number, priceStr: string) => {
    setSelectedItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], agreedPriceNaira: priceStr };
      return next;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalNaira = selectedItems.reduce(
    (acc, i) => acc + (Number(i.agreedPriceNaira) || 0) * i.quantity,
    0
  );

  const handleGenerateLink = async () => {
    if (selectedItems.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadItems = selectedItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        agreedPriceKobo: (Number(i.agreedPriceNaira) * 100).toString(),
        quantity: i.quantity,
      }));

      const res = await fetch("/api/custom-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          note,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const fullLink = `${window.location.origin}${data.checkoutUrl}`;
        setCreatedUrl(fullLink);
      } else {
        alert(data.error || "Failed to create link");
      }
    } catch (err) {
      alert("Error generating custom link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-neutral-900">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-neutral-900">Create Custom Checkout</h2>
            <p className="text-[11px] text-neutral-500">24-hour stock hold · negotiated price</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {createdUrl ? (
            /* Success State */
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#E6F7EF] text-[#00A859] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-neutral-900">Custom link ready!</h3>
                <p className="text-[12px] text-neutral-500 mt-1">
                  Send this single-use link to your buyer. Stock is reserved for 24 hours.
                </p>
              </div>

              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 text-left space-y-1">
                <p className="text-[11px] font-bold text-neutral-500 uppercase">Checkout URL</p>
                <p className="text-[12px] font-mono text-neutral-800 break-all">{createdUrl}</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopy}
                  className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? "Copied to clipboard!" : "Copy link for WhatsApp"}
                </button>
                <button
                  onClick={() => {
                    setCreatedUrl(null);
                    setSelectedItems([]);
                    setNote("");
                    onClose();
                  }}
                  className="w-full h-12 border border-neutral-200 text-neutral-700 rounded-2xl text-[14px] font-bold hover:bg-neutral-50 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Builder Form */
            <>
              {/* Product selector */}
              <div>
                <label className="text-[12px] font-bold text-neutral-700 block mb-1.5">
                  Select item from inventory
                </label>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const p = products.find((prod) => prod.id === e.target.value);
                      if (p) handleAddItem(p);
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="w-full h-11 px-3.5 border border-neutral-200 rounded-xl text-[13px] bg-white appearance-none focus:outline-none focus:border-[#00A859] font-medium"
                  >
                    <option value="" disabled>
                      + Add product from inventory
                    </option>
                    {products.map((p) => {
                      const avail = Math.max(0, p.stockOnHand - p.stockReserved);
                      return (
                        <option key={p.id} value={p.id} disabled={avail <= 0}>
                          {p.name} ({avail} in stock) · ₦{Math.round(Number(p.priceKobo) / 100).toLocaleString()}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Selected items */}
              {selectedItems.length > 0 && (
                <div className="space-y-3 pt-1">
                  <span className="text-[12px] font-bold text-neutral-700 block">
                    Agreed items & prices
                  </span>
                  {selectedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[13px] font-bold text-neutral-900">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[11px] text-red-500 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div>
                          <span className="text-[10px] text-neutral-500 font-semibold block mb-0.5">
                            Quantity
                          </span>
                          <div className="flex items-center border border-neutral-200 rounded-xl bg-white h-9 px-2 justify-between">
                            <button
                              type="button"
                              onClick={() => updateQuantity(idx, -1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-500"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[12px] font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(idx, 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-500"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 font-semibold block mb-0.5">
                            Agreed price each (₦)
                          </span>
                          <input
                            type="number"
                            value={item.agreedPriceNaira}
                            onChange={(e) => updateAgreedPrice(idx, e.target.value)}
                            className="w-full h-9 px-3 border border-neutral-200 rounded-xl bg-white text-[12px] font-bold focus:outline-none focus:border-[#00A859]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Private negotiation note */}
              <div>
                <label className="text-[12px] font-bold text-neutral-700 block mb-1">
                  Negotiation note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Special bundle discount on Instagram"
                  className="w-full h-11 px-3.5 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
                />
              </div>

              {/* 24h Hold notice */}
              <div className="bg-[#FFF9EA] border border-[#FFE8A3] rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-tight">
                  <strong className="text-amber-900">24-hour stock reservation:</strong> Stock is reserved when link is generated. If unpaid after 24 hours, the hold expires automatically.
                </p>
              </div>

              {/* Total & Action */}
              <div className="pt-2 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-[13px] font-bold text-neutral-600">Total agreed</span>
                <span className="text-[17px] font-extrabold text-neutral-900">
                  ₦{totalNaira.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleGenerateLink}
                disabled={isSubmitting || selectedItems.length === 0}
                className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] disabled:bg-neutral-300 text-white rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Generate Custom Link
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
