"use client";

import React, { useState } from "react";
import { X, Check, Calendar } from "lucide-react";

export interface OrderFilterState {
  orderStatus: string[];
  paymentStatus: string[];
  source: string[];
  deliveryType: string[];
  datePlaced: "any" | "today" | "last_7_days" | "custom";
  startDate: string;
  endDate: string;
}

interface OrderFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: OrderFilterState;
  onApply: (newFilters: OrderFilterState) => void;
  filteredCount: number;
}

export function OrderFiltersDrawer({
  isOpen,
  onClose,
  filters: initialFilters,
  onApply,
  filteredCount,
}: OrderFiltersDrawerProps) {
  const [draft, setDraft] = useState<OrderFilterState>(initialFilters);

  if (!isOpen) return null;

  const toggleArrayItem = (list: string[], item: string) => {
    if (list.includes(item)) {
      return list.filter((i) => i !== item);
    }
    return [...list, item];
  };

  const handleReset = () => {
    const empty: OrderFilterState = {
      orderStatus: [],
      paymentStatus: [],
      source: [],
      deliveryType: [],
      datePlaced: "any",
      startDate: "",
      endDate: "",
    };
    setDraft(empty);
  };

  const activeFiltersSummary: string[] = [];
  if (draft.orderStatus.length > 0) {
    activeFiltersSummary.push(`Order: ${draft.orderStatus.map((s) => s.replace(/_/g, " ").toLowerCase()).join(", ")}`);
  }
  if (draft.paymentStatus.length > 0) {
    activeFiltersSummary.push(`Payment: ${draft.paymentStatus.map((s) => s.toLowerCase()).join(", ")}`);
  }
  if (draft.source.length > 0) {
    activeFiltersSummary.push(`Source: ${draft.source.map((s) => s.toLowerCase()).join(", ")}`);
  }
  if (draft.deliveryType.length > 0) {
    activeFiltersSummary.push(`Delivery: ${draft.deliveryType.join(", ")}`);
  }
  if (draft.datePlaced !== "any") {
    activeFiltersSummary.push(`Date: ${draft.datePlaced.replace(/_/g, " ")}`);
  }

  const activeCount =
    draft.orderStatus.length +
    draft.paymentStatus.length +
    draft.source.length +
    draft.deliveryType.length +
    (draft.datePlaced !== "any" ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-neutral-100">
          <div className="w-10"></div>
          <button
            onClick={handleReset}
            className="text-[14px] font-semibold text-[#00A859] hover:underline"
          >
            Reset all filters
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Order Status */}
          <div>
            <h3 className="text-[14px] font-bold text-neutral-900 mb-3">Order status</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "AWAITING_PAYMENT", label: "Awaiting payment" },
                { id: "TO_FULFIL", label: "To fulfil" },
                { id: "READY_FOR_PICKUP", label: "Ready for pickup" },
                { id: "OUT_FOR_DELIVERY", label: "Out for delivery" },
                { id: "COMPLETED", label: "Completed" },
                { id: "CANCELLED", label: "Cancelled" },
              ].map((opt) => {
                const isSelected = draft.orderStatus.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        orderStatus: toggleArrayItem(draft.orderStatus, opt.id),
                      })
                    }
                    className={`px-3 py-2 rounded-xl text-[13px] font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#E6F7EF] border-[#00A859] text-[#00A859]"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* 2. Payment Status */}
          <div>
            <h3 className="text-[14px] font-bold text-neutral-900 mb-3">Payment status</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "AWAITING_PAYMENT", label: "Awaiting payment" },
                { id: "PAID", label: "Paid" },
                { id: "PARTIALLY_REFUNDED", label: "Partially refunded" },
                { id: "REFUNDED", label: "Refunded" },
              ].map((opt) => {
                const isSelected = draft.paymentStatus.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        paymentStatus: toggleArrayItem(draft.paymentStatus, opt.id),
                      })
                    }
                    className={`px-3 py-2 rounded-xl text-[13px] font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#E6F7EF] border-[#00A859] text-[#00A859]"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* 3. Source */}
          <div>
            <h3 className="text-[14px] font-bold text-neutral-900 mb-3">Source</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "STOREFRONT", label: "Storefront" },
                { id: "CUSTOM_CHECKOUT", label: "Custom Checkout" },
                { id: "RECORDED", label: "Recorded" },
              ].map((opt) => {
                const isSelected = draft.source.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        source: toggleArrayItem(draft.source, opt.id),
                      })
                    }
                    className={`px-3.5 py-2 rounded-xl text-[13px] font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#E6F7EF] border-[#00A859] text-[#00A859]"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* 4. Delivery type */}
          <div>
            <h3 className="text-[14px] font-bold text-neutral-900 mb-3">Delivery type</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "delivery", label: "Delivery" },
                { id: "pickup", label: "Pickup" },
              ].map((opt) => {
                const isSelected = draft.deliveryType.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        deliveryType: toggleArrayItem(draft.deliveryType, opt.id),
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#E6F7EF] border-[#00A859] text-[#00A859]"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* 5. Date placed */}
          <div>
            <h3 className="text-[14px] font-bold text-neutral-900 mb-3">Date placed</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { id: "any", label: "Any time" },
                { id: "today", label: "Today" },
                { id: "last_7_days", label: "Last 7 days" },
                { id: "custom", label: "Custom range" },
              ].map((opt) => {
                const isSelected = draft.datePlaced === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        datePlaced: opt.id as any,
                      })
                    }
                    className={`px-3 py-2 rounded-xl text-[13px] font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#E6F7EF] border-[#00A859] text-[#00A859]"
                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Custom range input */}
            {draft.datePlaced === "custom" && (
              <div className="space-y-2 pt-2">
                <label className="text-[12px] font-semibold text-neutral-700">Custom date range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                    className="w-full h-11 px-3 text-[13px] border border-neutral-200 rounded-xl focus:outline-none focus:border-[#00A859]"
                  />
                  <span className="text-neutral-400">to</span>
                  <input
                    type="date"
                    value={draft.endDate}
                    onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                    className="w-full h-11 px-3 text-[13px] border border-neutral-200 rounded-xl focus:outline-none focus:border-[#00A859]"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">Optional. End date must be on or after start date.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer sticky CTAs */}
        <div className="p-6 border-t border-neutral-100 bg-white space-y-3">
          {activeCount > 0 && (
            <p className="text-[12px] text-neutral-500 text-center truncate">
              {activeCount} active filter{activeCount > 1 ? "s" : ""} · {activeFiltersSummary.join(" · ")}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white text-[14px] font-bold rounded-2xl flex items-center justify-center transition-colors shadow-sm"
          >
            Show {filteredCount} order{filteredCount === 1 ? "" : "s"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 border border-neutral-200 text-[#00A859] text-[14px] font-bold rounded-2xl flex items-center justify-center hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
