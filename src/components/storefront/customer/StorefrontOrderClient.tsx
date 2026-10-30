"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageCircle,
  AlertTriangle,
  Info,
  Loader2,
  Copy,
  Package,
  Truck,
  Building2,
  RefreshCw,
  MapPin,
  ExternalLink,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { CartProvider } from "@/context/StorefrontCartContext";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontFooter } from "./StorefrontFooter";
import {
  formatToWhatsappNumber,
  formatNigerianDisplayPhone,
  getWhatsappChatUrl,
} from "@/lib/phone";

export interface OrderItem {
  id: string;
  name: string;
  priceKobo: string;
  quantity: number;
  lineTotal: string;
}

export interface OrderTimelineEvent {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  actor: string;
  createdAt: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: number;
  publicToken: string;
  orderStatus: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryType: string;
  deliveryFeeKobo: string;
  deliveryArea: string | null;
  deliveryState: string | null;
  deliveryAddress: string | null;
  subtotalKobo: string;
  processingFeeKobo: string;
  totalKobo: string;
  paymentRoute: string | null;
  holdExpiresAt: string | null;
  createdAt: string;
  items: OrderItem[];
  events?: OrderTimelineEvent[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;
}

interface StorefrontOrderClientProps {
  businessName: string;
  storeSlug: string;
  city?: string;
  tagline?: string | null;
  whatsappNumber?: string;
  phoneNumber?: string;
  pickupAddress?: string;
  pickupInstructions?: string;
  initialOrder: OrderDetails;
  referenceFromUrl?: string;
}

export function StorefrontOrderClient(props: StorefrontOrderClientProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <OrderContent {...props} />
    </CartProvider>
  );
}

function OrderContent({
  businessName,
  storeSlug,
  city = "Lagos",
  tagline,
  whatsappNumber,
  phoneNumber,
  pickupAddress,
  pickupInstructions,
  initialOrder,
  referenceFromUrl,
}: StorefrontOrderClientProps) {
  const [order, setOrder] = useState<OrderDetails>(initialOrder);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isClaimingPayment, setIsClaimingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Function to refresh order from backend
  const refreshOrder = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true);
      try {
        const res = await fetch(`/api/orders/track/${order.publicToken}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.order) {
            setOrder((prev) => ({
              ...prev,
              ...data.order,
              bankDetails: data.order.bankDetails || prev.bankDetails,
            }));
            setLastRefreshedAt(new Date());
          }
        }
      } catch (err) {
        console.error("Failed to refresh order status:", err);
      } finally {
        if (isManual) setIsRefreshing(false);
      }
    },
    [order.publicToken]
  );

  // Auto-poll order status every 12 seconds so customer sees merchant updates in real time
  useEffect(() => {
    // If order is completed or cancelled, no need for rapid polling
    if (order.orderStatus === "COMPLETED" || order.orderStatus === "CANCELLED") {
      return;
    }
    const interval = setInterval(() => {
      refreshOrder(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [order.orderStatus, refreshOrder]);

  // Auto-verify if Paystack redirected back with reference
  useEffect(() => {
    if (referenceFromUrl && order.paymentStatus !== "PAID") {
      setIsVerifying(true);
      fetch(`/api/payments/verify?reference=${encodeURIComponent(referenceFromUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrder((prev) => ({
              ...prev,
              paymentStatus: data.order.paymentStatus || "PAID",
              orderStatus: data.order.orderStatus || prev.orderStatus,
            }));
          }
        })
        .catch((err) => console.error("Verification error:", err))
        .finally(() => setIsVerifying(false));
    }
  }, [referenceFromUrl]);

  const copyToClipboard = (text: string, fieldKey: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleMarkPaymentSent = async () => {
    setIsClaimingPayment(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/payment-sent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicToken: order.publicToken }),
      });
      if (res.ok) {
        setOrder((prev) => ({
          ...prev,
          orderStatus: "PAYMENT_SENT",
        }));
        await refreshOrder(false);
      } else {
        alert("Unable to update payment status. Please try again.");
      }
    } catch {
      alert("Network error reporting payment.");
    } finally {
      setIsClaimingPayment(false);
    }
  };

  const handleCompletePaystackPayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          publicToken: order.publicToken,
        }),
      });
      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        alert(data.error || "Failed to initialize payment");
        setIsPaying(false);
      }
    } catch {
      alert("Payment initialization error. Please try again.");
      setIsPaying(false);
    }
  };

  const formatNaira = (koboStr: string) => {
    const val = Math.round(Number(koboStr) / 100);
    return `₦${val.toLocaleString("en-NG")}`;
  };

  const isPaid = order.paymentStatus === "PAID";
  const isPaymentSent = order.orderStatus === "PAYMENT_SENT";
  const isAwaitingPayment = order.paymentStatus === "AWAITING_PAYMENT" && !isPaymentSent;
  const isPackaging = order.orderStatus === "TO_FULFIL";
  const isReadyPickup = order.orderStatus === "READY_FOR_PICKUP";
  const isOutForDelivery = order.orderStatus === "OUT_FOR_DELIVERY";
  const isCompleted = order.orderStatus === "COMPLETED";
  const isCancelled = order.orderStatus === "CANCELLED";

  const isPickup = order.deliveryType === "pickup";

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const cleanWhatsapp = formatToWhatsappNumber(whatsappNumber || phoneNumber);
  const whatsappChatUrl = getWhatsappChatUrl(
    cleanWhatsapp,
    `Hello ${businessName}, I'm checking on my order #OND-${order.orderNumber}.`
  );

  const displayCustomerPhone = formatNigerianDisplayPhone(order.customerPhone);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between text-neutral-900 antialiased selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div>
        <StorefrontHeader
          businessName={businessName}
          storeSlug={storeSlug}
          city={city}
          subtitle={tagline || "Live order tracking"}
        />

        <main className="w-full max-w-[440px] mx-auto px-4 pt-3 pb-12 space-y-4">
          {/* Top Bar with Live Refresh */}
          <div className="flex items-center justify-between">
            <Link
              href={`/s/${storeSlug}`}
              className="text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              ← Back to store
            </Link>
            <button
              type="button"
              onClick={() => refreshOrder(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3 h-3 text-[#00A859] ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "Updating..." : "Refresh status"}</span>
            </button>
          </div>

          {/* Verification banner if just redirected */}
          {isVerifying && (
            <div className="bg-[#EBF3EF] border border-[#C5DFD2] rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
              <Loader2 className="w-5 h-5 text-[#00A859] animate-spin shrink-0" />
              <p className="text-[13px] font-semibold text-[#005c31]">
                Verifying your payment with Paystack...
              </p>
            </div>
          )}

          {/* ============================================================== */}
          {/* CURRENT HERO STATUS CARD */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">
                Order #OND-{order.orderNumber}
              </span>
              {/* Dynamic Status Badge */}
              {isCompleted ? (
                <span className="px-2.5 py-1 rounded-full bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-[11px] font-bold">
                  ✓ Completed & Delivered
                </span>
              ) : isOutForDelivery ? (
                <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                  <Truck className="w-3 h-3" />
                  <span>Out for delivery</span>
                </span>
              ) : isReadyPickup ? (
                <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                  <Building2 className="w-3 h-3" />
                  <span>Ready for pickup</span>
                </span>
              ) : isPackaging ? (
                <span className="px-2.5 py-1 rounded-full bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-[11px] font-bold flex items-center gap-1 animate-pulse">
                  <Package className="w-3 h-3" />
                  <span>Paid · Packaging items</span>
                </span>
              ) : isPaymentSent ? (
                <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold">
                  Payment reported · Confirming
                </span>
              ) : isCancelled ? (
                <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold">
                  Order Cancelled
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold">
                  Awaiting payment
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">
                {isCompleted
                  ? "Order fulfilled successfully"
                  : isOutForDelivery
                  ? "Your order is on the way!"
                  : isReadyPickup
                  ? "Your order is ready for pickup"
                  : isPackaging
                  ? "Payment confirmed! Packing items"
                  : isPaymentSent
                  ? "Payment claim under review"
                  : "Awaiting payment confirmation"}
              </h1>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                {isCompleted
                  ? "This order has been completed and received. Thank you for shopping with us!"
                  : isOutForDelivery
                  ? "The vendor has handed your order to the dispatch rider. Ensure your phone is reachable."
                  : isReadyPickup
                  ? "Your items have been safely prepared. See the pickup instructions below."
                  : isPackaging
                  ? "The vendor has confirmed your payment and is currently preparing your order."
                  : isPaymentSent
                  ? "Your payment claim was recorded. The seller is verifying their bank account and will advance the tracking immediately."
                  : "Complete your payment or submit your transfer confirmation below to secure your items."}
              </p>
            </div>

            {/* Hold Timer or Last Updated Note */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Placed {orderDate}</span>
              <span className="font-mono">
                Updated {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BANK TRANSFER DETAILS CARD (If awaiting payment) */}
          {/* ============================================================== */}
          {(isAwaitingPayment || isPaymentSent) && order.bankDetails && (
            <div className="bg-white border border-neutral-200 rounded-3xl p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#00A859]" />
                  <span>Vendor Bank Account</span>
                </span>
                <span className="text-[11px] font-bold text-[#00A859] px-2 py-0.5 rounded-full bg-[#E8F8EF]">
                  Verified by NIBSS
                </span>
              </div>

              <div className="space-y-3">
                {/* Account Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-neutral-500">Account Number</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.bankDetails!.accountNumber, "account")}
                      className="text-xs font-bold text-[#00A859] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedField === "account" ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy number</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xl font-black font-mono tracking-wider text-neutral-900 select-all">
                    {order.bankDetails.accountNumber}
                  </p>
                </div>

                {/* Bank Name */}
                <div>
                  <span className="text-xs font-bold text-neutral-500 block mb-0.5">Bank Name</span>
                  <p className="text-sm font-bold text-neutral-900">{order.bankDetails.bankName}</p>
                </div>

                {/* Account Name */}
                <div>
                  <span className="text-xs font-bold text-neutral-500 block mb-0.5">Account Name</span>
                  <p className="text-sm font-bold text-neutral-900">{order.bankDetails.accountName}</p>
                </div>

                {/* Amount to transfer */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-500 block mb-0.5">Amount to Pay</span>
                    <p className="text-base font-black text-neutral-900">
                      {formatNaira(order.totalKobo)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard((Number(order.totalKobo) / 100).toString(), "amount")}
                    className="text-xs font-bold text-[#00A859] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedField === "amount" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy amount</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons for Bank Transfer */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                {!isPaymentSent ? (
                  <button
                    type="button"
                    onClick={handleMarkPaymentSent}
                    disabled={isClaimingPayment}
                    className="w-full h-11 bg-[#00A859] hover:bg-[#008f4c] disabled:opacity-75 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    {isClaimingPayment ? (
                      <span>Updating status...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                        <span>I have sent the payment</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment Reported · Awaiting Merchant Confirmation</span>
                  </div>
                )}

                {order.paymentRoute === "PAYSTACK" && !isPaid && (
                  <button
                    type="button"
                    onClick={handleCompletePaystackPayment}
                    disabled={isPaying}
                    className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isPaying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Pay with Debit Card / Paystack</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* REAL 5-STAGE LIVE TIMELINE STEPPER */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
              Order Timeline & Progress
            </h2>

            <div className="space-y-6 relative pl-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
              {/* STAGE 1: Order Placed */}
              <div className="relative">
                <span className="absolute -left-7 top-0.5 w-6 h-6 rounded-full bg-[#00A859] flex items-center justify-center text-white ring-4 ring-white shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <p className="text-xs font-bold text-neutral-900">Order placed</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{orderDate}</p>
              </div>

              {/* STAGE 2: Payment Confirmation */}
              <div className="relative">
                <span
                  className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-xs ${
                    isPaid
                      ? "bg-[#00A859]"
                      : isPaymentSent
                      ? "bg-amber-500 animate-pulse"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {isPaid ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isPaymentSent ? (
                    <Clock className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  )}
                </span>
                <p className="text-xs font-bold text-neutral-900">
                  {isPaid
                    ? "Payment confirmed & verified"
                    : isPaymentSent
                    ? "Payment reported · Verifying"
                    : "Payment verification"}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {isPaid
                    ? "Payment verified by store"
                    : isPaymentSent
                    ? "Store is verifying bank transfer"
                    : "Waiting for payment"}
                </p>
              </div>

              {/* STAGE 3: Packaging & Preparation */}
              <div className="relative">
                <span
                  className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-xs ${
                    isPackaging
                      ? "bg-[#00A859] animate-pulse"
                      : isReadyPickup || isOutForDelivery || isCompleted
                      ? "bg-[#00A859]"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {isReadyPickup || isOutForDelivery || isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isPackaging ? (
                    <Package className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  )}
                </span>
                <p className="text-xs font-bold text-neutral-900">
                  {isPackaging ? "Packaging in progress" : "Order packaged & prepared"}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {isPackaging
                    ? "Store is packing your items now"
                    : isReadyPickup || isOutForDelivery || isCompleted
                    ? "Items packed and ready"
                    : "Starts after payment verification"}
                </p>
              </div>

              {/* STAGE 4: Out for Delivery or Ready for Pickup */}
              <div className="relative">
                <span
                  className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-xs ${
                    isOutForDelivery || isReadyPickup
                      ? "bg-[#00A859] animate-pulse"
                      : isCompleted
                      ? "bg-[#00A859]"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isOutForDelivery ? (
                    <Truck className="w-3 h-3 stroke-[2.5]" />
                  ) : isReadyPickup ? (
                    <Building2 className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  )}
                </span>
                <p className="text-xs font-bold text-neutral-900">
                  {isPickup ? "Ready for store pickup" : "Out for delivery"}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {isPickup
                    ? isReadyPickup
                      ? "Ready now! Collect at store location"
                      : isCompleted
                      ? "Collected from store"
                      : "Pending packaging completion"
                    : isOutForDelivery
                    ? "Handed to rider · On the way to you"
                    : isCompleted
                    ? "Delivered to address"
                    : "Pending rider dispatch"}
                </p>
              </div>

              {/* STAGE 5: Order Completed */}
              <div className="relative">
                <span
                  className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-xs ${
                    isCompleted ? "bg-[#00A859]" : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  )}
                </span>
                <p className="text-xs font-bold text-neutral-900">Completed & Delivered</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {isCompleted
                    ? "Order completed successfully"
                    : isPickup
                    ? "Marked after pickup collection"
                    : "Marked after safe delivery handoff"}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* DELIVERY OR PICKUP INSTRUCTIONS */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900">
              {isPickup ? "Pickup Details" : "Delivery Details"}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Customer</span>
                <span className="font-semibold text-neutral-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Phone</span>
                <span className="font-semibold text-neutral-900">{displayCustomerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="flex justify-between text-neutral-600">
                  <span>Email</span>
                  <span className="font-semibold text-neutral-900">{order.customerEmail}</span>
                </div>
              )}

              {isPickup ? (
                <>
                  <div className="flex justify-between text-neutral-600">
                    <span>Pickup City</span>
                    <span className="font-semibold text-neutral-900">{city}</span>
                  </div>

                  {isPaid && pickupAddress ? (
                    <div className="mt-2 pt-2.5 border-t border-neutral-100 space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#00A859]">
                        Exact Pickup Address:
                      </p>
                      <p className="text-xs font-medium text-neutral-900 leading-relaxed bg-[#E8F8EF]/40 p-3 rounded-xl border border-[#A7F3D0]/60">
                        {pickupAddress}
                      </p>
                      {pickupInstructions && (
                        <p className="text-[11px] text-neutral-500 italic pt-1">
                          Note: {pickupInstructions}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-500 italic">
                      Full street address is revealed here once payment is confirmed.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Area</span>
                    <span className="font-semibold text-neutral-900">
                      {order.deliveryArea ? `${order.deliveryArea}, ${order.deliveryState || "Lagos"}` : "Standard delivery"}
                    </span>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Street Address</span>
                      <span className="font-semibold text-neutral-900 text-right max-w-[240px]">
                        {order.deliveryAddress}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* ORDER ITEMS & FINANCIAL SUMMARY */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-neutral-900">Order Items</h3>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs">
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

            <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotalKobo)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span>{isPickup ? "₦0 (Pickup)" : formatNaira(order.deliveryFeeKobo)}</span>
              </div>
              {Number(order.processingFeeKobo) > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Processing fee</span>
                  <span>{formatNaira(order.processingFeeKobo)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-100">
                <span>{isPaid ? "Total paid" : "Total to pay"}</span>
                <span>{formatNaira(order.totalKobo)}</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* DIRECT SUPPORT & POLICIES BUTTONS */}
          {/* ============================================================== */}
          <div className="space-y-2.5 pt-1">
            <a
              href={whatsappChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[#00A859] hover:bg-[#008f4c] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Contact Store on WhatsApp</span>
            </a>

            <div className="flex items-center gap-2">
              <Link
                href={`/s/${storeSlug}/policies`}
                className="flex-1 h-11 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#00A859]" />
                <span>Store Policies & Returns</span>
              </Link>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `${typeof window !== "undefined" ? window.location.origin : ""}/s/${storeSlug}/order/${order.publicToken}`,
                    "orderLink"
                  )
                }
                className="h-11 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                {copiedField === "orderLink" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 text-center leading-relaxed pt-2 pb-4">
            Need help with your order? Contact <strong className="text-neutral-700">{businessName}</strong> directly for support.
          </p>
        </main>
      </div>

      <StorefrontFooter
        businessName={businessName}
        storeSlug={storeSlug}
        city={city}
        whatsappNumber={whatsappNumber}
        phoneNumber={phoneNumber}
      />
    </div>
  );
}
