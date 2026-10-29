"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Info,
  Loader2,
  X,
} from "lucide-react";

interface CatalogItem {
  id: string;
  name: string;
  priceKobo: string;
  stockOnHand: number;
  stockReserved: number;
}

interface SaleItem {
  productId: string;
  name: string;
  priceKobo: string;
  quantity: number;
  availableStock: number;
}

interface RecordSaleClientProps {
  products: CatalogItem[];
}

export function RecordSaleClient({ products }: RecordSaleClientProps) {
  const router = useRouter();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank transfer");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [alreadyHandedOver, setAlreadyHandedOver] = useState(true);

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no items yet and products exist, prefill first item
  React.useEffect(() => {
    if (products.length > 0 && saleItems.length === 0) {
      const p = products[0];
      const avail = Math.max(0, p.stockOnHand - p.stockReserved);
      setSaleItems([
        {
          productId: p.id,
          name: p.name,
          priceKobo: p.priceKobo,
          quantity: 1,
          availableStock: avail,
        },
      ]);
    }
  }, [products]);

  const updateQuantity = (index: number, delta: number) => {
    setSaleItems((prev) => {
      const next = [...prev];
      const cur = next[index];
      const newQty = Math.max(1, cur.quantity + delta);
      next[index] = { ...cur, quantity: newQty };
      return next;
    });
  };

  const updatePrice = (index: number, nairaStr: string) => {
    setSaleItems((prev) => {
      const next = [...prev];
      const num = Number(nairaStr) || 0;
      next[index] = { ...next[index], priceKobo: (num * 100).toString() };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addCatalogItem = (product: CatalogItem) => {
    const avail = Math.max(0, product.stockOnHand - product.stockReserved);
    setSaleItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        priceKobo: product.priceKobo,
        quantity: 1,
        availableStock: avail,
      },
    ]);
    setIsCatalogModalOpen(false);
  };

  // Calculations
  const totalUnits = saleItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalKobo = saleItems.reduce(
    (acc, i) => acc + BigInt(i.priceKobo) * BigInt(i.quantity),
    BigInt(0)
  );
  const totalNaira = Math.round(Number(totalKobo) / 100);

  const handleSubmit = async () => {
    if (saleItems.length === 0) {
      alert("Please add at least one item to record this sale.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: saleItems,
          customerName,
          customerPhone,
          paymentMethod,
          deliveryType,
          alreadyHandedOver,
        }),
      });

      if (res.ok) {
        router.push("/orders");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to record sale");
      }
    } catch (e) {
      alert("Failed to submit recorded sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 text-neutral-900">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <Link
          href="/orders"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-[14px] font-bold text-neutral-900">Record a sale</span>
        <div className="w-9"></div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 py-4 space-y-4">
        {/* Top Info Banner */}
        <div className="bg-[#EBF3EF] border border-[#C5DFD2] rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#00A859] shrink-0 mt-0.5" />
          <div className="text-[12px] leading-relaxed">
            <span className="font-bold text-[#005c31] block">
              Payment is recorded by you
            </span>
            <span className="text-[#00703c]">
              Use this for money already received outside Ondar. No Paystack, processor fee or Ondar cut.
            </span>
          </div>
        </div>

        {/* 1. Sale Items Card */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-[15px] font-bold text-neutral-900">Sale items</h3>

          <div className="space-y-4">
            {saleItems.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/60 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-[14px] font-bold text-neutral-900">{item.name}</h4>
                    <p className="text-[11px] text-neutral-500">
                      {item.availableStock} available
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-[12px] font-semibold text-[#00A859] hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Quantity
                    </label>
                    <div className="flex items-center border border-neutral-200 rounded-xl bg-white h-11 px-2 justify-between">
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 rounded-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[13px] font-bold text-neutral-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                      Unit price (₦)
                    </label>
                    <input
                      type="number"
                      value={Math.round(Number(item.priceKobo) / 100)}
                      onChange={(e) => updatePrice(idx, e.target.value)}
                      className="w-full h-11 px-3 border border-neutral-200 rounded-xl bg-white text-[13px] font-bold text-neutral-900 focus:outline-none focus:border-[#00A859]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-neutral-200/50 text-[12px]">
                  <span className="text-neutral-500">Line total</span>
                  <span className="font-bold text-neutral-900">
                    ₦{(Math.round(Number(item.priceKobo) / 100) * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCatalogModalOpen(true)}
            className="w-full h-11 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-[13px] font-bold text-neutral-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#00A859]" />
            Add catalog item
          </button>
        </div>

        {/* 2. Customer (Optional) Card */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
          <h3 className="text-[15px] font-bold text-neutral-900">Customer (optional)</h3>

          <div>
            <label className="text-[12px] font-semibold text-neutral-700 block mb-1">Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Bola Martins"
              className="w-full h-11 px-3.5 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-neutral-700 block mb-1">Phone</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0802 555 0163"
              className="w-full h-11 px-3.5 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
            />
          </div>

          <p className="text-[11px] text-neutral-400 italic">
            Leave customer fields blank for a walk-in sale.
          </p>
        </div>

        {/* 3. How were you paid? */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
          <h3 className="text-[14px] font-bold text-neutral-900">How were you paid?</h3>
          <div className="relative">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 border border-neutral-200 rounded-xl text-[13px] bg-white appearance-none focus:outline-none focus:border-[#00A859] font-medium"
            >
              <option value="Bank transfer">Bank transfer</option>
              <option value="Cash">Cash</option>
              <option value="POS">POS</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[11px] text-neutral-400">Options: Bank transfer, Cash, POS, Other.</p>
        </div>

        {/* 4. Fulfilment context */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-neutral-900">Fulfilment context</h3>

          <div>
            <label className="text-[12px] font-semibold text-neutral-700 block mb-1">Delivery type</label>
            <div className="relative">
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as any)}
                className="w-full h-11 px-3.5 pr-10 border border-neutral-200 rounded-xl text-[13px] bg-white appearance-none focus:outline-none focus:border-[#00A859] font-medium"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={alreadyHandedOver}
              onChange={(e) => setAlreadyHandedOver(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-[#00A859] focus:ring-[#00A859]"
            />
            <div className="text-[12px]">
              <span className="font-bold text-neutral-900 block">Already handed to customer</span>
              <span className="text-neutral-500">Records an already collected sale in this example.</span>
            </div>
          </label>
        </div>

        {/* 5. Review Sale Card */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-neutral-900">Review sale</h3>

          <span className="inline-block px-2.5 py-0.5 bg-neutral-100 text-neutral-700 font-medium text-[11px] rounded-md">
            Recorded
          </span>

          <div className="flex justify-between text-[13px] text-neutral-600">
            <span>Items · {totalUnits} unit{totalUnits === 1 ? "" : "s"}</span>
            <span>₦{totalNaira.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-[15px] font-extrabold text-neutral-900 pt-2 border-t border-neutral-100">
            <span>Total received</span>
            <span>₦{totalNaira.toLocaleString()}</span>
          </div>

          <p className="text-[11px] text-neutral-400 italic pt-1">
            Stock commits immediately when you record the sale. Payment will be shown as recorded by merchant.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || saleItems.length === 0}
            className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] disabled:bg-neutral-300 text-white rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Record sale · ₦${totalNaira.toLocaleString()}`
            )}
          </button>

          <Link
            href="/orders"
            className="w-full h-12 border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Catalog Item Selection Drawer */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-[430px] bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-[16px] font-bold text-neutral-900">Select catalog product</h3>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1">
              {products.map((p) => {
                const avail = Math.max(0, p.stockOnHand - p.stockReserved);
                return (
                  <button
                    key={p.id}
                    onClick={() => addCatalogItem(p)}
                    className="w-full p-3 rounded-xl border border-neutral-200 hover:border-[#00A859] text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-[13px] font-bold text-neutral-900">{p.name}</p>
                      <p className="text-[11px] text-neutral-500">{avail} in stock</p>
                    </div>
                    <span className="text-[13px] font-extrabold text-[#00A859]">
                      ₦{Math.round(Number(p.priceKobo) / 100).toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
