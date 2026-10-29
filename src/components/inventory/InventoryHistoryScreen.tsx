"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Link2,
  Loader2,
  Package,
} from "lucide-react";
import { availableStock } from "@/lib/inventory";
import type { InventoryProduct } from "@/app/inventory/InventoryClient";

interface InventoryHistoryScreenProps {
  product: InventoryProduct;
  merchantName?: string;
  onBack: () => void;
}

interface StockHistoryEvent {
  id: string;
  changeQty: number;
  beforeOnHand: number;
  afterOnHand: number;
  beforeReserved: number;
  afterReserved: number;
  beforeAvailable: number;
  afterAvailable: number;
  reason: string;
  referenceId?: string | null;
  note?: string | null;
  actor?: string | null;
  createdAt: string;
}

export function InventoryHistoryScreen({
  product,
  merchantName = "Ada",
  onBack,
}: InventoryHistoryScreenProps) {
  const [events, setEvents] = useState<StockHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"oldest" | "newest">("oldest");

  const onHand = product.stockOnHand;
  const reserved = product.stockReserved;
  const available = availableStock(onHand, reserved);
  const photoUrl = product.images[0]?.url;

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await fetch(`/api/products/${product.id}/history`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.history)) {
          setEvents(data.history);
        }
      } catch (err) {
        console.error("Failed to load stock history:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [product.id]);

  // If no history events are saved in DB yet, synthesize an initial starting stock record
  const displayedEvents = React.useMemo(() => {
    let list = [...events];
    if (list.length === 0) {
      list = [
        {
          id: "initial-stock-event",
          changeQty: onHand,
          beforeOnHand: 0,
          afterOnHand: onHand,
          beforeReserved: 0,
          afterReserved: reserved,
          beforeAvailable: 0,
          afterAvailable: available,
          reason: "INITIAL_STOCK",
          referenceId: "Starting stock",
          note: "Starting stock",
          actor: `${merchantName} · Product creation`,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    if (sortOrder === "oldest") {
      return [...list].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [events, onHand, reserved, available, merchantName, sortOrder]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const day = d.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, "0");
      const minutes = d.getMinutes().toString().padStart(2, "0");
      return `${day} ${month} ${year} · ${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  };

  const initialStockQty = displayedEvents[0]?.afterOnHand ?? onHand;

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
            Inventory history
          </h1>
        </div>

        {/* Product Mini Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0 flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#E8F8EF] flex items-center justify-center text-[#00A859] font-bold text-xl">
                👕
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-neutral-900 truncate">
              {product.name}
            </h2>
            <p className="text-xs text-neutral-500 truncate mt-0.5">
              {product.sku ? `${product.sku} · ` : ""}
              {product.category || "General"}
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <div className="rounded-2xl p-3.5 bg-[#F4F6F5] text-left">
            <p className="text-xs text-neutral-500 font-medium">On hand</p>
            <p className="text-[26px] font-black text-neutral-900 leading-tight mt-0.5">
              {onHand}
            </p>
          </div>
          <div className="rounded-2xl p-3.5 bg-[#F4F6F5] text-left">
            <p className="text-xs text-neutral-500 font-medium">Reserved</p>
            <p className="text-[26px] font-black text-neutral-900 leading-tight mt-0.5">
              {reserved}
            </p>
          </div>
          <div className="rounded-2xl p-3.5 bg-[#E8F8EF] text-left">
            <p className="text-xs text-[#00A859] font-bold">Available</p>
            <p className="text-[26px] font-black text-[#00A859] leading-tight mt-0.5">
              {available}
            </p>
          </div>
        </div>

        <p className="text-[13px] text-neutral-500 font-normal mb-6">
          Every change, from the first {initialStockQty} units to the {available} available now.
        </p>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "oldest" ? "newest" : "oldest")}
            className="text-sm font-bold text-neutral-900 hover:text-neutral-700 flex items-center gap-1 cursor-pointer"
          >
            <span>All events · {sortOrder === "oldest" ? "oldest first" : "newest first"}</span>
          </button>
          <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
            {displayedEvents.length} event{displayedEvents.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#00A859]" />
            <p className="text-xs font-medium">Loading history...</p>
          </div>
        ) : (
          <div className="space-y-3.5 mb-8">
            {displayedEvents.map((evt) => {
              const isOrderRelated =
                evt.reason === "RESERVE_HOLD" ||
                evt.reason === "COMMIT_SALE" ||
                evt.reason === "RELEASE_HOLD";

              let eventTitle = "Merchant correction";
              let pillText = `${evt.changeQty > 0 ? `+${evt.changeQty}` : evt.changeQty} units`;
              let pillColorClass = evt.changeQty > 0 ? "bg-[#E8F8EF] text-[#00A859]" : "bg-[#FCE7EA] text-[#C2414A]";
              let subtitleDetail = "";

              if (evt.reason === "INITIAL_STOCK") {
                eventTitle = "Initial stock";
                pillText = `+${evt.changeQty} units`;
                pillColorClass = "bg-[#E8F8EF] text-[#00A859]";
                subtitleDetail = `On hand +${evt.changeQty} · available +${evt.changeQty}`;
              } else if (evt.reason === "RESERVE_HOLD") {
                eventTitle = "Reserve";
                pillText = `Hold ${Math.abs(evt.changeQty)}`;
                pillColorClass = "bg-[#E8F8EF] text-[#00A859]";
                subtitleDetail = `Reserved +${Math.abs(evt.changeQty)} · available -${Math.abs(evt.changeQty)}`;
              } else if (evt.reason === "COMMIT_SALE") {
                eventTitle = "Commit";
                pillText = `Deduct ${Math.abs(evt.changeQty)}`;
                pillColorClass = "bg-neutral-100 text-neutral-700";
                subtitleDetail = `On hand -${Math.abs(evt.changeQty)} · reserved -${Math.abs(evt.changeQty)} · available unchanged`;
              } else if (evt.reason === "RELEASE_HOLD") {
                eventTitle = "Release hold";
                pillText = `Release ${Math.abs(evt.changeQty)}`;
                pillColorClass = "bg-[#E8F8EF] text-[#00A859]";
                subtitleDetail = `Reserved -${Math.abs(evt.changeQty)} · available +${Math.abs(evt.changeQty)}`;
              } else if (evt.reason === "MANUAL_RESTOCK") {
                eventTitle = "Restock";
                pillText = `+${evt.changeQty} units`;
                pillColorClass = "bg-[#E8F8EF] text-[#00A859]";
                subtitleDetail = `On hand +${evt.changeQty} · available +${evt.changeQty}`;
              } else {
                eventTitle = "Merchant correction";
                pillText = `${evt.changeQty > 0 ? `+${evt.changeQty}` : evt.changeQty} units`;
                pillColorClass = evt.changeQty > 0 ? "bg-[#E8F8EF] text-[#00A859]" : "bg-[#E8F8EF] text-[#065F46]";
                subtitleDetail = `On hand ${evt.changeQty} · available ${evt.changeQty}`;
              }

              return (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3"
                >
                  {/* Top Row: Icon + Title/Date + Right Pill */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#E8F8EF] flex items-center justify-center flex-shrink-0 text-[#00A859]">
                        {isOrderRelated ? (
                          <Link2 className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Package className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-neutral-900 leading-tight">
                          {eventTitle}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {formatDate(evt.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${pillColorClass}`}
                    >
                      {pillText}
                    </span>
                  </div>

                  {/* Note & Actor */}
                  <div className="text-xs text-neutral-600 pl-10 -mt-1 space-y-0.5">
                    {evt.note && (
                      <p className="font-medium text-neutral-800">{evt.note}</p>
                    )}
                    <p className="text-neutral-400">
                      {evt.actor || (isOrderRelated ? "Orders · Automatic" : `${merchantName} · Merchant adjustment`)}
                    </p>
                  </div>

                  {/* Balance Transition Table */}
                  <div className="border-t border-neutral-100 pt-3">
                    <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-1">
                      ON HAND / RESERVED / AVAILABLE
                    </p>

                    <div className="flex items-center gap-3 text-xs font-bold">
                      <div className="text-neutral-500">
                        <span className="text-[10px] block text-neutral-400 font-normal">Before</span>
                        <span>
                          {evt.beforeOnHand} / {evt.beforeReserved} / {evt.beforeAvailable}
                        </span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-neutral-400" />

                      <div className="text-[#00A859]">
                        <span className="text-[10px] block text-neutral-400 font-normal">After</span>
                        <span>
                          {evt.afterOnHand} / {evt.afterReserved} / {evt.afterAvailable}
                        </span>
                      </div>
                    </div>

                    {subtitleDetail && (
                      <p className="text-[11px] text-neutral-400 mt-1 font-normal">
                        {subtitleDetail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Note */}
        <p className="text-xs text-neutral-400 font-normal leading-relaxed px-1">
          Reserve, Commit and Release are logged automatically by orders. Merchant restocks, corrections and returns appear here too.
        </p>
      </div>
    </div>
  );
}
