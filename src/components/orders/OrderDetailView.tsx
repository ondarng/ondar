"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Lock,
  MessageCircle,
  Link2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  Loader2,
  Truck,
  Package,
  Share2,
  RotateCcw,
  MapPin,
  X,
  AlertCircle,
  Info,
} from "lucide-react";
import { formatToWhatsappNumber, getWhatsappChatUrl } from "@/lib/phone";

export interface OrderItemLine {
  id: string;
  productId: string;
  name: string;
  priceKobo: string;
  quantity: number;
  lineTotal: string;
}

export interface OrderTimelineEvent {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  actor: string;
  note: string | null;
  createdAt: string;
}

export interface OrderDetailData {
  id: string;
  orderNumber: number;
  publicToken: string;
  orderStatus:
    | "AWAITING_PAYMENT"
    | "PAYMENT_SENT"
    | "TO_FULFIL"
    | "READY_FOR_PICKUP"
    | "OUT_FOR_DELIVERY"
    | "COMPLETED"
    | "CANCELLED";
  paymentStatus: "AWAITING_PAYMENT" | "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED";
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerNote: string | null;
  deliveryType: string;
  deliveryFeeKobo: string;
  deliveryState: string | null;
  deliveryArea: string | null;
  deliveryAddress: string | null;
  deliveryInstructions: string | null;
  subtotalKobo: string;
  discountKobo: string;
  processingFeeKobo: string;
  totalKobo: string;
  ondarCutKobo: string;
  paymentRoute: string | null;
  paymentReference: string | null;
  refundedKobo: string;
  source: string;
  flag: string | null;
  flagDetails: string | null;
  privateNote: string | null;
  holdExpiresAt: string | null;
  paymentSentAt: string | null;
  paymentConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lines: OrderItemLine[];
  events: OrderTimelineEvent[];
}

interface OrderDetailViewProps {
  order: OrderDetailData;
  storeSlug: string;
  onBack: () => void;
  onRefresh: () => void;
}

export function OrderDetailView({
  order,
  storeSlug,
  onBack,
  onRefresh,
}: OrderDetailViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [noteText, setNoteText] = useState(order.privateNote || "");
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Screen 12: Edit delivery details view
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [recipientName, setRecipientName] = useState(order.customerName);
  const [recipientPhone, setRecipientPhone] = useState(order.customerPhone);
  const [addressInput, setAddressInput] = useState(order.deliveryAddress || "");
  const [areaInput, setAreaInput] = useState(order.deliveryArea || "Surulere");
  const [instructionsInput, setInstructionsInput] = useState(
    order.deliveryInstructions || ""
  );

  // Screen 10: Record Refund Screen
  const [isRefundScreenOpen, setIsRefundScreenOpen] = useState(false);
  const [refundAmountNaira, setRefundAmountNaira] = useState("7500");
  const [refundReason, setRefundReason] = useState("Customer returned the unused tote");
  const [linkedItems, setLinkedItems] = useState<Record<string, boolean>>({});
  const [restockItems, setRestockItems] = useState<Record<string, boolean>>({});

  // Screen 9: Cancel Order Screen
  const [isCancelScreenOpen, setIsCancelScreenOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Customer no longer needs the order");
  const [returnToStockSelection, setReturnToStockSelection] = useState<Record<string, boolean>>({});

  // Screen 8: Receipt view toggle
  const [showReceiptView, setShowReceiptView] = useState(
    order.orderStatus === "COMPLETED"
  );

  const formatNaira = (koboStr: string) => {
    const val = Math.round(Number(koboStr) / 100);
    return `₦${val.toLocaleString()}`;
  };

  const paymentLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/s/${storeSlug}/order/${order.publicToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareReceipt = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt #${order.orderNumber}`,
          text: `Here is the receipt for order #${order.orderNumber}:`,
          url: paymentLink,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleStatusAction = async (action: string) => {
    if (!confirm(`Are you sure you want to perform this action?`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch (e) {
      alert("Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_NOTE", note: noteText }),
      });
      if (res.ok) {
        setIsEditingNote(false);
        onRefresh();
      }
    } catch (e) {
      alert("Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDeliveryDetails = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EDIT_DELIVERY",
          recipientName,
          recipientPhone,
          deliveryAddress: addressInput,
          deliveryArea: areaInput,
          deliveryInstructions: instructionsInput,
        }),
      });
      if (res.ok) {
        setIsEditingDelivery(false);
        onRefresh();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update delivery details");
      }
    } catch (e) {
      alert("Failed to update delivery details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancelOrder = async () => {
    setIsSubmitting(true);
    try {
      const itemsToRestock = order.lines
        .filter((l) => returnToStockSelection[l.id])
        .map((l) => ({ productId: l.productId, quantity: l.quantity }));

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CANCEL_ORDER",
          cancelReason,
          itemsToRestock,
        }),
      });

      if (res.ok) {
        setIsCancelScreenOpen(false);
        onRefresh();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to cancel order");
      }
    } catch (e) {
      alert("Failed to cancel order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRecordRefund = async () => {
    const kobo = Math.round(Number(refundAmountNaira) * 100);
    if (isNaN(kobo) || kobo <= 0) {
      alert("Please enter a valid refund amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const returnItems = order.lines
        .filter((l) => restockItems[l.id])
        .map((l) => ({ productId: l.productId, quantity: l.quantity }));

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_REFUND",
          refundKobo: kobo,
          reason: refundReason,
          returnItems,
        }),
      });

      if (res.ok) {
        setIsRefundScreenOpen(false);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to record refund");
      }
    } catch (e) {
      alert("Failed to record refund");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp prefilled message
  const whatsappUrl = getWhatsappChatUrl(
    order.customerPhone,
    `Hello ${order.customerName}, regarding your order #${order.orderNumber} on Ondar: ${paymentLink}`
  );

  const isAwaitingPayment = order.paymentStatus === "AWAITING_PAYMENT";
  const isPaid =
    order.paymentStatus === "PAID" ||
    order.paymentStatus === "PARTIALLY_REFUNDED" ||
    order.paymentStatus === "REFUNDED";
  const isCancelled = order.orderStatus === "CANCELLED";
  const isPickup = order.deliveryType === "pickup";

  const orderPlacedDate = new Date(order.createdAt).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }
  );

  const paymentVerifiedTime = order.paymentConfirmedAt
    ? new Date(order.paymentConfirmedAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : orderPlacedDate;

  // Available to refund calculation
  const totalPaidNum = Math.round(Number(order.totalKobo) / 100);
  const alreadyRefundedNum = Math.round(Number(order.refundedKobo) / 100);
  const availableToRefundNum = Math.max(0, totalPaidNum - alreadyRefundedNum);

  // -------------------------------------------------------------
  // SCREEN 12: EDIT DELIVERY DETAILS SCREEN
  // -------------------------------------------------------------
  if (isEditingDelivery) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20 text-neutral-900">
        <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsEditingDelivery(false)}
            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-bold text-neutral-900">Edit delivery details</span>
          <div className="w-9"></div>
        </div>

        <div className="max-w-[430px] mx-auto px-4 py-4 space-y-4">
          <div className="bg-[#EBF3EF] border border-[#C5DFD2] rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#00A859] shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-bold text-[#005c31] block">Available before dispatch only</span>
              <span className="text-[#00703c]">
                This order is To fulfil. Delivery details lock when you mark it Out for delivery.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-neutral-900">Delivery address</h3>
            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-1">Street address</label>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full h-11 px-3.5 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
              />
              <p className="text-[11px] text-neutral-400 mt-1">Required. Include building or house number.</p>
            </div>

            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-1">Area</label>
              <div className="relative">
                <select
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 border border-neutral-200 rounded-xl text-[13px] bg-white appearance-none focus:outline-none focus:border-[#00A859]"
                >
                  <option value="Surulere">Surulere</option>
                  <option value="Yaba">Yaba</option>
                  <option value="Ikeja">Ikeja</option>
                  <option value="Lekki Phase 1">Lekki Phase 1</option>
                  <option value="Victoria Island">Victoria Island</option>
                </select>
                <ChevronRight className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Lagos · Only the area appears on the public order page.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-neutral-900">Delivery contact</h3>
            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-1">Recipient name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full h-11 px-3.5 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-1">Phone number</label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full h-11 px-3.5 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
              />
              <p className="text-[11px] text-neutral-400 mt-1">Use a valid Nigerian number: 11 digits or +234 format.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
            <label className="text-[14px] font-bold text-neutral-900 block">Delivery instructions (optional)</label>
            <textarea
              value={instructionsInput}
              onChange={(e) => setInstructionsInput(e.target.value)}
              rows={3}
              placeholder="e.g. Blue gate, ask for Adaeze. Call on arrival."
              className="w-full p-3.5 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
            />
          </div>

          <p className="text-[11px] text-neutral-400 text-center">
            This changes delivery details only. Placed items, prices and the {formatNaira(order.totalKobo)} order total remain unchanged.
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleSaveDeliveryDetails}
              disabled={isSubmitting}
              className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save delivery details"}
            </button>
            <button
              onClick={() => setIsEditingDelivery(false)}
              className="w-full h-12 border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors"
            >
              Cancel changes
            </button>
          </div>

          <div className="bg-[#EBF3EF] border border-[#C5DFD2] rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00A859] shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-bold text-[#005c31] block">Saved feedback preview</span>
              <span className="text-[#00703c]">
                Delivery details updated. A delivery details changed event is recorded in the order activity.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 10: RECORD REFUND SCREEN
  // -------------------------------------------------------------
  if (isRefundScreenOpen) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20 text-neutral-900">
        <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsRefundScreenOpen(false)}
            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-bold text-neutral-900">Record a refund</span>
          <div className="w-9"></div>
        </div>

        <div className="max-w-[430px] mx-auto px-4 py-4 space-y-4">
          <div className="bg-[#FFF9EA] border border-[#FFE8A3] rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-bold text-amber-900 block">Refund the customer outside Ondar first</span>
              <span className="text-amber-800">
                Ondar only records what you have already refunded. This action does not send money or trigger a Paystack refund.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-neutral-900">Refundable balance</h3>
            <div className="flex justify-between text-[13px] text-neutral-600">
              <span>Payment received</span>
              <span className="font-semibold text-neutral-900">₦{totalPaidNum.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px] text-neutral-600">
              <span>Refunds already recorded</span>
              <span className="font-semibold text-neutral-900">
                {alreadyRefundedNum > 0 ? `₦${alreadyRefundedNum.toLocaleString()}` : "₦0"}
              </span>
            </div>
            <div className="flex justify-between text-[14px] font-extrabold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Available to record</span>
              <span>₦{availableToRefundNum.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-neutral-700 block mb-1">
              Amount already refunded (₦)
            </label>
            <input
              type="number"
              value={refundAmountNaira}
              onChange={(e) => setRefundAmountNaira(e.target.value)}
              className="w-full h-12 px-4 border border-neutral-200 rounded-2xl text-[15px] font-bold focus:outline-none focus:border-[#00A859] bg-white shadow-2xs"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Enter more than ₦0 and no more than ₦{availableToRefundNum.toLocaleString()}.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="text-[14px] font-bold text-neutral-900">Link items (optional)</h3>

            {order.lines.map((line) => {
              const isLinked = !!linkedItems[line.id];
              const isRestocked = !!restockItems[line.id];

              return (
                <div key={line.id} className="space-y-2 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLinked}
                      onChange={(e) =>
                        setLinkedItems({ ...linkedItems, [line.id]: e.target.checked })
                      }
                      className="w-4 h-4 mt-1 rounded text-[#00A859] focus:ring-[#00A859]"
                    />
                    <div>
                      <p className="text-[13px] font-bold text-neutral-900">
                        {line.name} × {line.quantity} · {formatNaira(line.lineTotal)}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {isLinked ? "Linked to this refund" : "Not linked to this refund"}
                      </p>
                    </div>
                  </label>

                  {isLinked && (
                    <label className="flex items-start gap-2.5 pl-6 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRestocked}
                        onChange={(e) =>
                          setRestockItems({ ...restockItems, [line.id]: e.target.checked })
                        }
                        className="w-4 h-4 mt-0.5 rounded text-[#00A859] focus:ring-[#00A859]"
                      />
                      <div>
                        <span className="text-[12px] font-bold text-neutral-900 block">
                          Return {line.quantity} {line.name} to stock
                        </span>
                        <span className="text-[11px] text-neutral-500">Only if it is back and sellable</span>
                      </div>
                    </label>
                  )}
                </div>
              );
            })}

            <p className="text-[11px] text-neutral-400 italic">
              Return-to-stock is chosen per line. Unselected lines stay out of stock.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
            <label className="text-[14px] font-bold text-neutral-900 block">Reason</label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={2}
              className="w-full p-3 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
            />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
            <h3 className="text-[14px] font-bold text-neutral-900">Customer-paid fee · your choice</h3>
            <p className="text-[12px] text-neutral-600 leading-relaxed">
              The original fee was {formatNaira(order.processingFeeKobo)}. This ₦{Number(refundAmountNaira || 0).toLocaleString()} refund does not include it. You decide whether to refund any fee; Ondar does not require it.
            </p>
            <p className="text-[11px] text-neutral-400 italic">
              Include any fee you refunded in the amount above, within the available balance.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleConfirmRecordRefund}
              disabled={isSubmitting}
              className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `Record refund · ₦${Number(refundAmountNaira || 0).toLocaleString()}`
              )}
            </button>
            <button
              onClick={() => setIsRefundScreenOpen(false)}
              className="w-full h-12 border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-neutral-900">After recording · confirmation preview</h3>
            <div className="bg-[#EBF3EF] border border-[#C5DFD2] rounded-xl p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00A859] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-[#005c31] block">
                  ₦{Number(refundAmountNaira || 0).toLocaleString()} refund recorded
                </span>
                <span className="text-[#00703c]">
                  Remaining refundable balance: ₦{(availableToRefundNum - Number(refundAmountNaira || 0)).toLocaleString()}. No money was sent by Ondar.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div>
                <span className="text-neutral-400 block text-[9px] font-semibold uppercase">ORDER</span>
                <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold">Completed</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] font-semibold uppercase">PAYMENT</span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-bold">
                  Partially refunded
                </span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 italic">
              Receipt retains the original {formatNaira(order.totalKobo)} payment and shows the ₦{Number(refundAmountNaira || 0).toLocaleString()} refund separately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 9: THIS CANNOT BE UNDONE (CANCEL PAID ORDER)
  // -------------------------------------------------------------
  if (isCancelScreenOpen) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20 text-neutral-900">
        <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsCancelScreenOpen(false)}
            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-bold text-neutral-900">Cancel order</span>
          <div className="w-9"></div>
        </div>

        <div className="max-w-[430px] mx-auto px-4 py-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
            <h2 className="text-[18px] font-bold text-neutral-900">This cannot be undone</h2>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 font-bold text-[11px] rounded-md">
                {order.orderStatus.replace(/_/g, " ").toLowerCase()}
              </span>
              <span className="px-2.5 py-1 bg-[#E6F7EF] text-[#00A859] font-bold text-[11px] rounded-md">
                {isPaid ? "Paid" : "Awaiting payment"}
              </span>
            </div>
            <p className="text-[12px] text-neutral-600 leading-relaxed">
              Cancelling ends fulfilment. The order will become Cancelled and cannot be reopened.
            </p>

            <div className="bg-[#FFF9EA] border border-[#FFE8A3] rounded-xl p-3.5 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-amber-900 block">No money is transferred</span>
                <span className="text-amber-800">
                  Payment stays Paid unless a refund is separately recorded. Send any refund outside Ondar first.
                </span>
              </div>
            </div>
          </div>

          {/* Selective restock of paid items */}
          {isPaid && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-[14px] font-bold text-neutral-900">Return paid items to stock</h3>
                <p className="text-[12px] text-neutral-500 mt-0.5">
                  Stock was committed when payment was verified. Choose only items that can be sold again.
                </p>
              </div>

              <div className="space-y-3">
                {order.lines.map((l) => {
                  const isChecked = !!returnToStockSelection[l.id];
                  return (
                    <label key={l.id} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setReturnToStockSelection({
                            ...returnToStockSelection,
                            [l.id]: e.target.checked,
                          })
                        }
                        className="w-4 h-4 mt-1 rounded text-[#00A859] focus:ring-[#00A859]"
                      />
                      <div>
                        <p className="text-[13px] font-bold text-neutral-900">
                          Return {l.quantity} {l.name}
                        </p>
                        <p className="text-[11px] text-neutral-500">{l.quantity} units</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <p className="text-[11px] text-neutral-400 italic">
                Unselected items will not be returned to stock.
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
            <label className="text-[14px] font-bold text-neutral-900 block">Reason (optional)</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="e.g. Customer no longer needs the order"
              className="w-full p-3.5 border border-neutral-200 rounded-xl text-[13px] focus:outline-none focus:border-[#00A859]"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleConfirmCancelOrder}
              disabled={isSubmitting}
              className="w-full h-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `Cancel order #${order.orderNumber}`
              )}
            </button>
            <button
              onClick={() => setIsCancelScreenOpen(false)}
              className="w-full h-12 border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors"
            >
              Keep order
            </button>
          </div>

          {/* Unpaid supporting note */}
          {!isPaid && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
              <h3 className="text-[14px] font-bold text-neutral-900">If the order is unpaid</h3>
              <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-medium">
                Supporting confirmation · #{order.orderNumber}
              </span>
              <p className="text-[12px] text-neutral-700 italic">
                "Cancel order #{order.orderNumber}? Its reserved items will be released automatically. No payment has been verified."
              </p>
              <p className="text-[11px] text-neutral-400">
                No paid-item restock choices are shown. Cancellation is still final.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 8: COMPLETED ORDER RECEIPT VIEW
  // -------------------------------------------------------------
  if (showReceiptView) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20 text-neutral-900">
        <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (order.orderStatus !== "COMPLETED") {
                setShowReceiptView(false);
              } else {
                onBack();
              }
            }}
            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-bold text-neutral-900">
            Receipt · #{order.orderNumber}
          </span>
          <div className="w-9"></div>
        </div>

        <div className="max-w-[430px] mx-auto px-4 py-4 space-y-4">
          <div className="bg-[#E6F7EF] border border-[#B3E8CE] rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00A859] shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-bold text-[#005c31] block">Order completed</span>
              <span className="text-[#00703c]">
                {order.customerName} has received {isPickup ? "their pickup" : "their parcel"}. Completed is final; fulfillment cannot be reopened.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
            <div>
              <h2 className="text-[18px] font-bold text-neutral-900">Receipt · #{order.orderNumber}</h2>
              <p className="text-[13px] font-medium text-neutral-600 mt-0.5">
                Customer: {order.customerName}
              </p>
              <p className="text-[11px] text-neutral-400">Placed {orderPlacedDate}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold text-[11px] rounded-md">
                Completed
              </span>
              <span className="px-2.5 py-1 bg-[#E6F7EF] text-[#00A859] font-bold text-[11px] rounded-md">
                Paid
              </span>
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 font-medium text-[11px] rounded-md">
                {order.source === "STOREFRONT"
                  ? "Storefront"
                  : order.source === "CUSTOM_CHECKOUT"
                  ? "Custom Checkout"
                  : "Recorded"}
              </span>
            </div>

            <hr className="border-neutral-100" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-neutral-900">Items</h3>
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
              </div>

              {order.lines.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-[13px]">
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {item.name} × {item.quantity}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {formatNaira(item.priceKobo)} each
                    </p>
                  </div>
                  <span className="font-bold text-neutral-900">{formatNaira(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-neutral-400 italic">
              Items and prices are locked after placement.
            </p>

            <div className="pt-2 border-t border-neutral-100 space-y-2 text-[13px]">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotalKobo)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span>{formatNaira(order.deliveryFeeKobo)}</span>
              </div>
              {Number(order.processingFeeKobo) > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Customer-paid fee</span>
                  <span>{formatNaira(order.processingFeeKobo)}</span>
                </div>
              )}
              <div className="flex justify-between text-[15px] font-extrabold text-neutral-900 pt-2 border-t border-neutral-100">
                <span>Total paid</span>
                <span>{formatNaira(order.totalKobo)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-1">
              <p>Payment verified by {order.paymentRoute || "Paystack"}</p>
              <p>{paymentVerifiedTime} · Reference: {order.paymentReference || `OND-${order.orderNumber}`}</p>
              <p className="font-semibold text-neutral-700">
                Refunds recorded: {formatNaira(order.refundedKobo)}
              </p>
            </div>
          </div>

          <button
            onClick={handleShareReceipt}
            className="w-full h-12 bg-white border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Share2 className="w-4 h-4" />
            {copiedLink ? "Receipt link copied!" : "Share receipt"}
          </button>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="text-[14px] font-bold text-neutral-900">Order activity</h3>
            <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#00A859]">
              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#00A859] flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <p className="text-[13px] font-bold text-neutral-900">Order placed</p>
                <p className="text-[11px] text-neutral-500">{orderPlacedDate}</p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#00A859] flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <p className="text-[13px] font-bold text-neutral-900">Payment verified</p>
                <p className="text-[11px] text-neutral-500">{paymentVerifiedTime}</p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#00A859] flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <p className="text-[13px] font-bold text-neutral-900">
                  {isPickup ? "Prepared for pickup" : "Out for delivery"}
                </p>
                <p className="text-[11px] text-neutral-500">{orderPlacedDate}</p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#00A859] flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <p className="text-[13px] font-bold text-neutral-900">Completed</p>
                <p className="text-[11px] text-neutral-500">{orderPlacedDate}</p>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 italic pt-1">
              Payment is confirmed automatically. Your shop updates fulfilment.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-neutral-900">Need to record a refund?</h3>
            <p className="text-[12px] text-neutral-600 leading-relaxed">
              Refund the customer outside Ondar, then record it. The payment status can change; this order stays Completed.
            </p>
            <button
              onClick={() => setIsRefundScreenOpen(true)}
              className="w-full h-11 border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Record refund
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PRIMARY DETAIL VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-50 pb-20 text-neutral-900">
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-[14px] font-bold text-neutral-900">
          Order #{order.orderNumber}
        </span>
        <div className="w-9"></div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between text-[12px] text-neutral-500">
          <span className="px-2.5 py-1 bg-neutral-200/70 text-neutral-700 rounded-md font-medium text-[11px]">
            {order.source === "STOREFRONT"
              ? "Storefront"
              : order.source === "CUSTOM_CHECKOUT"
              ? "Custom Checkout"
              : "Recorded"}
          </span>
          <span>{orderPlacedDate}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
          <h2 className="text-[18px] font-bold text-neutral-900">
            {isCancelled
              ? "Order Cancelled"
              : isAwaitingPayment
              ? "Waiting for payment"
              : order.orderStatus === "TO_FULFIL"
              ? isPickup
                ? "Prepare for pickup"
                : "Ready to fulfil"
              : order.orderStatus === "READY_FOR_PICKUP"
              ? "Ready for pickup"
              : order.orderStatus === "OUT_FOR_DELIVERY"
              ? "Out for delivery"
              : "Order Completed"}
          </h2>

          <div className="flex items-center gap-4 text-[12px]">
            <div>
              <span className="text-neutral-400 block mb-0.5 text-[10px] font-semibold uppercase">
                ORDER
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  order.orderStatus === "CANCELLED"
                    ? "bg-red-50 text-red-600"
                    : order.orderStatus === "COMPLETED"
                    ? "bg-green-50 text-green-700"
                    : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {order.orderStatus.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5 text-[10px] font-semibold uppercase">
                PAYMENT
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  isPaid ? "bg-[#E6F7EF] text-[#00A859]" : "bg-amber-100 text-amber-900"
                }`}
              >
                {isPaid ? "Paid" : "Awaiting payment"}
              </span>
            </div>
          </div>

          {order.orderStatus === "PAYMENT_SENT" && (
            <div className="p-3.5 rounded-xl bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-xs font-semibold space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                <span>Customer reported bank transfer sent</span>
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Verify receipt of {formatNaira(order.totalKobo)} in your bank account, then tap below to confirm and move order to packaging.
              </p>
            </div>
          )}

          <p className="text-[12px] text-neutral-600 leading-relaxed">
            {isAwaitingPayment
              ? order.orderStatus === "PAYMENT_SENT"
                ? "Customer reported transfer sent. Verify in your bank app, then tap Confirm Payment Received."
                : "Awaiting customer payment. If customer paid directly via bank transfer or outside Paystack, tap Confirm Payment Received."
              : order.orderStatus === "TO_FULFIL"
              ? isPickup
                ? `Payment confirmed! Pack the items before letting ${order.customerName} know the order is ready.`
                : `Payment confirmed! Pack the order, then mark it out for delivery when you hand it to your rider.`
              : order.orderStatus === "READY_FOR_PICKUP"
              ? `The order is ready at your pickup point. Once ${order.customerName} collects it, mark it completed.`
              : order.orderStatus === "OUT_FOR_DELIVERY"
              ? "Parcel is out with your rider. Once delivered, mark it completed."
              : "Order completed."}
          </p>

          {!isCancelled && (
            <div>
              {isAwaitingPayment ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleStatusAction("CONFIRM_PAYMENT")}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] disabled:opacity-60 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Payment Received</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full h-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#00A859]" /> : <Link2 className="w-4 h-4" />}
                    <span>{copiedLink ? "Payment link copied!" : "Resend / copy payment link"}</span>
                  </button>
                </div>
              ) : order.orderStatus === "TO_FULFIL" ? (
                isPickup ? (
                  <button
                    onClick={() => handleStatusAction("MARK_READY_FOR_PICKUP")}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Package className="w-4 h-4" />
                    Mark ready for pickup
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusAction("MARK_OUT_FOR_DELIVERY")}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Truck className="w-4 h-4" />
                    Mark out for delivery
                  </button>
                )
              ) : order.orderStatus === "READY_FOR_PICKUP" ||
                order.orderStatus === "OUT_FOR_DELIVERY" ? (
                <button
                  onClick={() => handleStatusAction("MARK_COMPLETED")}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark completed
                </button>
              ) : null}
            </div>
          )}
        </div>

        {isPaid && (
          <div className="bg-[#E6F7EF] border border-[#B3E8CE] rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00A859] shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-bold text-[#005c31] block">
                {formatNaira(order.totalKobo)} payment verified
              </span>
              <span className="text-[#00703c]">
                {order.paymentRoute || "Paystack"} · {paymentVerifiedTime} · Ref {order.paymentReference || `PAY-${order.orderNumber}`}. Stock committed on verified payment.
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-neutral-900">
            {isPickup ? "Customer & pickup" : "Customer & delivery"}
          </h3>
          <div>
            <h4 className="text-[15px] font-semibold text-neutral-900">{order.customerName}</h4>
            <p className="text-[13px] text-neutral-600 mt-0.5">{order.customerPhone}</p>
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[11px] font-medium capitalize">
              {order.deliveryType}
            </span>

            {isPickup ? (
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-neutral-800">Everyday Edit pickup point</p>
                <p className="text-[12px] text-neutral-500">
                  Mon–Sat, 10am–6pm. Message the customer when ready.
                </p>
              </div>
            ) : (
              <div>
                {order.deliveryAddress ? (
                  <p className="text-[13px] font-medium text-neutral-800">{order.deliveryAddress}</p>
                ) : (
                  <p className="text-[13px] text-neutral-500">Delivery address not provided</p>
                )}
                {order.deliveryArea && (
                  <p className="text-[12px] text-neutral-500 mt-0.5">
                    {order.deliveryArea}, {order.deliveryState}{" "}
                    {order.deliveryInstructions ? `· ${order.deliveryInstructions}` : ""}
                  </p>
                )}
              </div>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 italic pt-1">Private details · visible only to your shop</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-neutral-900">Items</h3>
            <Lock className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="space-y-3">
            {order.lines.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-[13px]">
                <div>
                  <p className="font-semibold text-neutral-900">
                    {item.name} × {item.quantity}
                  </p>
                  <p className="text-[11px] text-neutral-500">{formatNaira(item.priceKobo)} each</p>
                </div>
                <span className="font-bold text-neutral-900">{formatNaira(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-neutral-400 italic">Items and prices are locked after placement.</p>

          <div className="pt-3 border-t border-neutral-100 space-y-2 text-[13px]">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>{formatNaira(order.subtotalKobo)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>{isPickup ? "Pickup" : "Delivery"}</span>
              <span>{isPickup ? "₦0" : formatNaira(order.deliveryFeeKobo)}</span>
            </div>
            {Number(order.processingFeeKobo) > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Customer-paid fee</span>
                <span>{formatNaira(order.processingFeeKobo)}</span>
              </div>
            )}
            <div className="flex justify-between text-[15px] font-extrabold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Total</span>
              <span>{formatNaira(order.totalKobo)}</span>
            </div>
          </div>
        </div>

        {order.privateNote && (
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
            <h3 className="text-[14px] font-bold text-neutral-900">Private note</h3>
            <p className="text-[13px] text-neutral-700 leading-relaxed">{order.privateNote}</p>
            <p className="text-[11px] text-neutral-400 italic">Only your shop can see this.</p>
          </div>
        )}

        {isPickup && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl text-[13px] font-bold text-[#00A859] flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-[#00A859]" />
            WhatsApp order link
          </a>
        )}

        {order.orderStatus === "TO_FULFIL" && isPickup && (
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
            <h3 className="text-[14px] font-bold text-neutral-900">Next state preview</h3>
            <span className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-md text-[11px] font-medium">
              After "Mark ready for pickup"
            </span>
            <div className="flex items-center gap-4 text-[12px] pt-1">
              <div>
                <span className="text-neutral-400 block mb-0.5 text-[9px] font-semibold uppercase">
                  ORDER
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                  Ready for pickup
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5 text-[9px] font-semibold uppercase">
                  PAYMENT
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F7EF] text-[#00A859]">
                  Paid
                </span>
              </div>
            </div>
            <p className="text-[12px] text-neutral-600 leading-relaxed">
              The order is ready at your pickup point. Once {order.customerName} collects it, mark it completed.
            </p>
            <button
              disabled
              className="w-full h-11 bg-[#00A859]/50 text-white rounded-xl text-[13px] font-bold flex items-center justify-center cursor-not-allowed"
            >
              Mark completed
            </button>
            <p className="text-[11px] text-neutral-400 italic">
              Pickup orders never use Out for delivery. Payment remains Paid through both steps.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
          <h3 className="text-[14px] font-bold text-neutral-900 mb-3">More actions</h3>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between py-2.5 text-[13px] font-medium text-neutral-800 hover:text-[#00A859] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-[#00A859]" />
              WhatsApp order link
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </a>

          <button
            onClick={() => setShowReceiptView(true)}
            className="w-full flex items-center justify-between py-2.5 text-[13px] font-medium text-neutral-800 hover:text-[#00A859] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#00A859]" />
              View receipt
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => setIsEditingNote(!isEditingNote)}
            className="w-full flex items-center justify-between py-2.5 text-[13px] font-medium text-neutral-800 hover:text-[#00A859] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <FileEdit className="w-4 h-4 text-[#00A859]" />
              {order.privateNote ? "Edit private note" : "Add private note"}
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          {isEditingNote && (
            <div className="pt-2 pb-3 space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add private note for your store..."
                className="w-full p-3 text-[13px] border border-neutral-200 rounded-xl focus:outline-none focus:border-[#00A859]"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#00A859] text-white rounded-lg text-[12px] font-bold"
                >
                  Save Note
                </button>
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-[12px] font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!isPickup && (
            <button
              onClick={() => setIsEditingDelivery(true)}
              className="w-full flex items-center justify-between py-2.5 text-[13px] font-medium text-neutral-800 hover:text-[#00A859] transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#00A859]" />
                Edit delivery details
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          )}

          <button
            onClick={() => setIsRefundScreenOpen(true)}
            className="w-full flex items-center justify-between py-2.5 text-[13px] font-medium text-neutral-800 hover:text-[#00A859] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#00A859]" />
              Record refund
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          {!isCancelled && (
            <div className="pt-3">
              <button
                onClick={() => setIsCancelScreenOpen(true)}
                disabled={isSubmitting}
                className="w-full h-11 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[13px] font-bold transition-colors"
              >
                Cancel order
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
          Cancellation does not send money back. Refunds are made outside Ondar, then recorded here.
        </p>
      </div>
    </div>
  );
}
