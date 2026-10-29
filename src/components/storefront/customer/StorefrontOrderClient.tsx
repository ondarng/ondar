"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { CartProvider } from "@/context/StorefrontCartContext";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontFooter } from "./StorefrontFooter";

export interface OrderItem {
  id: string;
  name: string;
  priceKobo: string;
  quantity: number;
  lineTotal: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: number;
  publicToken: string;
  orderStatus: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
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
  const [isPaying, setIsPaying] = useState(false);

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

  const formatNaira = (koboStr: string) => {
    const val = Math.round(Number(koboStr) / 100);
    return `₦${val.toLocaleString()}`;
  };

  const isPaid = order.paymentStatus === "PAID";
  const isAwaitingPayment = order.paymentStatus === "AWAITING_PAYMENT";
  const isOutForDelivery = order.orderStatus === "OUT_FOR_DELIVERY";
  const isCompleted = order.orderStatus === "COMPLETED";
  const isReadyPickup = order.orderStatus === "READY_FOR_PICKUP";

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const whatsappPhone = (whatsappNumber || phoneNumber || "2348000000000").replace(/[^0-9]/g, "");
  const whatsappChatUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hello ${businessName}, I'm inquiring about my order #${order.orderNumber}`
  )}`;

  const handleCompletePayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          storeSlug,
        }),
      });
      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        alert(data.error || "Failed to initialize payment");
        setIsPaying(false);
      }
    } catch (err) {
      alert("Payment initialization error. Please try again.");
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between text-neutral-900">
      <StorefrontHeader businessName={businessName} storeSlug={storeSlug} city={city} subtitle={tagline} />

      <main className="w-full max-w-[430px] mx-auto px-4 py-4 space-y-4">
        {/* Verification banner if just redirected */}
        {isVerifying && (
          <div className="bg-[#EBF3EF] border border-[#C5DFD2] rounded-2xl p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#00A859] animate-spin shrink-0" />
            <p className="text-[13px] font-semibold text-[#005c31]">
              Verifying your payment with Paystack...
            </p>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* SCREEN 14: UNPAID STATE */}
        {/* -------------------------------------------------------- */}
        {isAwaitingPayment && (
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="text-[18px] font-bold text-neutral-900">
              Your order is awaiting payment
            </h2>

            <div className="flex items-center gap-4 text-[12px]">
              <div>
                <span className="text-neutral-400 block mb-0.5 text-[9px] font-semibold uppercase">
                  ORDER
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                  Awaiting payment
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5 text-[9px] font-semibold uppercase">
                  PAYMENT
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                  Awaiting payment
                </span>
              </div>
            </div>

            <p className="text-[12px] text-neutral-600 leading-relaxed">
              Your items are reserved while the payment hold is active. Your order is confirmed only after payment is verified.
            </p>

            <div className="pt-2 border-t border-neutral-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[13px] text-neutral-600 font-medium">Amount to pay</span>
                <span className="text-[18px] font-extrabold text-neutral-900">
                  {formatNaira(order.totalKobo)}
                </span>
              </div>

              <button
                onClick={handleCompletePayment}
                disabled={isPaying}
                className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isPaying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Complete payment
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 italic">
              Resume secure checkout with Paystack. Return here for your payment update.
            </p>
          </div>
        )}

        {/* SCREEN 14: Already paid? callout */}
        {isAwaitingPayment && (
          <div className="bg-neutral-100/80 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-bold text-neutral-900 block">Already paid?</span>
              <span className="text-neutral-600">
                Wait for verification before trying again. This page updates after payment is confirmed.
              </span>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* SCREEN 13: DISPATCHED / PAID / COMPLETED STATE */}
        {/* -------------------------------------------------------- */}
        {isPaid && (
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="text-[18px] font-bold text-neutral-900">
              {isCompleted
                ? "Order completed"
                : isOutForDelivery
                ? "Thanks for your order"
                : isReadyPickup
                ? "Ready for pickup"
                : "Payment confirmed"}
            </h2>

            <div className="flex items-center gap-4 text-[12px]">
              <div>
                <span className="text-neutral-400 block mb-0.5 text-[9px] font-semibold uppercase">
                  ORDER
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                  {order.orderStatus.replace(/_/g, " ").toLowerCase()}
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
              {isCompleted
                ? "Your order has been completed and received. Thank you for shopping with us!"
                : isOutForDelivery
                ? `Your shop marked this order out for delivery.`
                : isReadyPickup
                ? "Your order is ready for collection at the store pickup point."
                : "Your payment has been verified. The merchant is packing your order."}
            </p>
          </div>
        )}

        {/* Delivery Updates Stepper */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-[14px] font-bold text-neutral-900">Delivery updates</h3>

          <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
            {/* Step 1: Placed */}
            <div className="relative">
              <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#00A859] flex items-center justify-center text-white">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <p className="text-[13px] font-bold text-neutral-900">Order placed</p>
              <p className="text-[11px] text-neutral-500">{orderDate}</p>
            </div>

            {/* Step 2: Payment verified */}
            <div className="relative">
              <span
                className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isPaid ? "bg-[#00A859] text-white" : "bg-neutral-200"
                }`}
              >
                {isPaid && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <p className="text-[13px] font-bold text-neutral-900">Payment verified</p>
              <p className="text-[11px] text-neutral-500">
                {isPaid ? "Verified" : "After successful payment verification"}
              </p>
            </div>

            {/* Step 3: Out for delivery */}
            <div className="relative">
              <span
                className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isOutForDelivery || isCompleted || isReadyPickup
                    ? "bg-[#00A859] text-white"
                    : "bg-neutral-200"
                }`}
              >
                {(isOutForDelivery || isCompleted || isReadyPickup) && (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                )}
              </span>
              <p className="text-[13px] font-bold text-neutral-900">
                {order.deliveryType === "pickup" ? "Ready for pickup" : "Out for delivery"}
              </p>
              <p className="text-[11px] text-neutral-500">
                {isOutForDelivery || isReadyPickup || isCompleted ? "Dispatched" : "Not yet"}
              </p>
            </div>

            {/* Step 4: Completed */}
            <div className="relative">
              <span
                className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isCompleted ? "bg-[#00A859] text-white" : "bg-neutral-200"
                }`}
              >
                {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
              <p className="text-[13px] font-bold text-neutral-900">Completed</p>
              <p className="text-[11px] text-neutral-500">{isCompleted ? "Delivered" : "Not yet"}</p>
            </div>
          </div>
        </div>

        {/* Delivery / Pickup Summary */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
          <h3 className="text-[14px] font-bold text-neutral-900">
            {order.deliveryType === "pickup" ? "Pickup details" : "Delivery details"}
          </h3>
          <div className="flex justify-between text-[13px] text-neutral-600">
            <span>Type</span>
            <span className="font-semibold text-neutral-900 capitalize">{order.deliveryType}</span>
          </div>
          {order.deliveryType === "pickup" ? (
            <>
              <div className="flex justify-between text-[13px] text-neutral-600">
                <span>Location</span>
                <span className="font-semibold text-neutral-900">{city}</span>
              </div>
              {isPaid && pickupAddress ? (
                <div className="mt-2 pt-2 border-t border-neutral-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#00A859] mb-1">
                    Pickup Address
                  </p>
                  <p className="text-[13px] font-medium text-neutral-900 leading-relaxed">
                    {pickupAddress}
                  </p>
                  {pickupInstructions && (
                    <p className="text-[11px] text-neutral-500 mt-1 italic">
                      Note: {pickupInstructions}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-neutral-100">
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Full pickup address is revealed here once payment is confirmed.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between text-[13px] text-neutral-600">
              <span>Area</span>
              <span className="font-semibold text-neutral-900">
                {order.deliveryArea ? `${order.deliveryArea}, ${order.deliveryState || "Lagos"}` : "Standard delivery"}
              </span>
            </div>
          )}
        </div>

        {/* Your Order Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-neutral-900">Your order</h3>

          <div className="space-y-3">
            {order.items.map((item) => (
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

          <div className="pt-3 border-t border-neutral-100 space-y-2 text-[13px]">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>{formatNaira(order.subtotalKobo)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery</span>
              <span>{order.deliveryType === "pickup" ? "₦0" : formatNaira(order.deliveryFeeKobo)}</span>
            </div>
            {Number(order.processingFeeKobo) > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Customer-paid fee</span>
                <span>{formatNaira(order.processingFeeKobo)}</span>
              </div>
            )}
            <div className="flex justify-between text-[15px] font-extrabold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>{isPaid ? "Total paid" : "Total"}</span>
              <span>{formatNaira(order.totalKobo)}</span>
            </div>
          </div>
        </div>

        {/* Contact Shop CTA */}
        <a
          href={whatsappChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-2xl text-[14px] font-bold text-[#00A859] flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <MessageCircle className="w-4 h-4 text-[#00A859]" />
          Contact shop
        </a>

        <p className="text-[11px] text-neutral-400 text-center leading-relaxed pb-4">
          Need help with your order? Contact {businessName} for an update.
        </p>
      </main>

      <StorefrontFooter businessName={businessName} />
    </div>
  );
}
