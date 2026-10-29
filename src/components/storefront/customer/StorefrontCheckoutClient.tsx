"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Info,
  MessageCircle,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { StorefrontHeader } from "./StorefrontHeader";
import { CartProvider, useCart } from "@/context/StorefrontCartContext";
import { ShippingStateRate } from "@/lib/shipping";
import { ChooseDeliveryAreaModal, DeliveryAreaOption } from "./ChooseDeliveryAreaModal";
import { InteractivePickupMap } from "./InteractivePickupMap";
import { getAllStateNames } from "@/lib/nigeriaData";

interface StorefrontCheckoutProps {
  businessName: string;
  storeSlug: string;
  city?: string;
  state?: string;
  tagline?: string | null;
  pickupAddress?: string | null;
  whatsappNumber?: string;
  phoneNumber?: string;
  deliveryEnabled?: boolean;
  pickupEnabled?: boolean;
  shippingRates?: ShippingStateRate[];
  initialBankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;
  hasPaystack?: boolean;
  feeBearer?: "MERCHANT" | "CUSTOMER";
}

export function StorefrontCheckoutClient(props: StorefrontCheckoutProps) {
  return (
    <CartProvider storeSlug={props.storeSlug}>
      <CheckoutContent {...props} />
    </CartProvider>
  );
}

const LAGOS_AREAS = [
  { name: "Victoria Island", standardFee: 2000, expressFee: 3500 },
  { name: "Lekki Phase 1", standardFee: 2000, expressFee: 3500 },
  { name: "Ikoyi", standardFee: 2000, expressFee: 3500 },
  { name: "Ikeja", standardFee: 2500, expressFee: 4000 },
  { name: "Yaba", standardFee: 2000, expressFee: 3500 },
  { name: "Surulere", standardFee: 2500, expressFee: 4000 },
  { name: "Maryland", standardFee: 2500, expressFee: 4000 },
  { name: "Gbagada", standardFee: 2500, expressFee: 4000 },
  { name: "Magodo", standardFee: 3000, expressFee: 4500 },
  { name: "Ajah", standardFee: 3000, expressFee: 4500 },
];

function CheckoutContent({
  businessName,
  storeSlug,
  city = "Lagos",
  state = "Lagos",
  tagline,
  pickupAddress,
  whatsappNumber,
  phoneNumber,
  deliveryEnabled = true,
  pickupEnabled = true,
  shippingRates = [],
  initialBankDetails,
  hasPaystack = false,
  feeBearer = "MERCHANT",
}: StorefrontCheckoutProps) {
  const router = useRouter();
  const { items, totalCount, subtotalNaira, clearCart } = useCart();

  const hasRealRates = shippingRates && shippingRates.length > 0;
  const isDeliveryAvailable = deliveryEnabled && (!hasRealRates || shippingRates.length > 0);
  const isPickupAvailable = pickupEnabled;

  // Wizard Step: 1 = Delivery details & Customer details (Screen C02), 3 = Review ("One last look"), 4 = Ready to Pay
  const [currentStep, setCurrentStep] = useState<1 | 3 | 4>(1);

  // Customer Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [detailsError, setDetailsError] = useState("");

  // Delivery & Pickup Details
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    !isDeliveryAvailable && isPickupAvailable ? "pickup" : "delivery"
  );
  const [selectedState, setSelectedState] = useState(
    hasRealRates && shippingRates[0] ? shippingRates[0].state : state || "Lagos"
  );
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);

  // Order submission & payment states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<number | null>(null);
  const [createdOrderDate, setCreatedOrderDate] = useState("");
  const [publicToken, setPublicToken] = useState("");
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Payment method & Bank Transfer state
  const [activePaymentMethod, setActivePaymentMethod] = useState<"paystack" | "bank_transfer">(
    hasPaystack ? "paystack" : "bank_transfer"
  );
  const [bankDetails, setBankDetails] = useState(initialBankDetails);
  const [isPaymentSent, setIsPaymentSent] = useState(false);
  const [isClaimingPayment, setIsClaimingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 2-hour stock hold countdown (120 minutes)
  const [secondsRemaining, setSecondsRemaining] = useState(120 * 60);

  useEffect(() => {
    if (currentStep !== 4) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep]);

  const countdownFormatted = useMemo(() => {
    const hours = Math.floor(secondsRemaining / 3600);
    const mins = Math.floor((secondsRemaining % 3600) / 60);
    const secs = secondsRemaining % 60;
    if (hours > 0) {
      return `${hours}h ${mins < 10 ? "0" : ""}${mins}m`;
    }
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, [secondsRemaining]);

  const copyToClipboard = (text: string, fieldKey: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleMarkPaymentSent = async () => {
    if (!createdOrderId) return;
    setIsClaimingPayment(true);
    setPaymentError(null);
    try {
      const res = await fetch(`/api/orders/${createdOrderId}/payment-sent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsPaymentSent(true);
        // Lock hold for 48 hours
        setSecondsRemaining(48 * 3600);
      } else {
        setPaymentError(data.error || "Failed to update payment status.");
      }
    } catch {
      setPaymentError("Network error reporting payment.");
    } finally {
      setIsClaimingPayment(false);
    }
  };

  const availableStates = useMemo(() => {
    return getAllStateNames();
  }, []);

  const deliveryAreaOptions: DeliveryAreaOption[] = useMemo(() => {
    if (hasRealRates) {
      const stateObj = shippingRates.find(
        (s) => s.state.toLowerCase() === selectedState.toLowerCase()
      );
      if (stateObj) {
        const list: DeliveryAreaOption[] = [];

        stateObj.overrides.forEach((o) => {
          list.push({
            name: o.area,
            deliveryName: o.deliveryName,
            feeKobo: o.feeKobo,
            feeNaira: o.feeNaira,
            isFree: o.isFree,
            estimatedDelivery: o.estimatedDelivery,
            isFallback: false,
          });
        });

        list.push({
          name: `Other area in ${stateObj.state}`,
          deliveryName: stateObj.deliveryName,
          feeKobo: stateObj.feeKobo,
          feeNaira: stateObj.feeNaira,
          isFree: stateObj.isFree,
          estimatedDelivery: stateObj.estimatedDelivery,
          isFallback: true,
        });

        return list;
      }

      // If the merchant has configured shipping rates but NOT for this state,
      // do NOT invent fake rates. Return empty so the customer gets the SHP-03 uncovered notice.
      return [];
    }

    return LAGOS_AREAS.map((a) => ({
      name: a.name,
      deliveryName: "Standard delivery",
      feeKobo: a.standardFee * 100,
      feeNaira: a.standardFee,
      isFree: false,
      estimatedDelivery: "1–2 business days",
      isFallback: false,
    }));
  }, [hasRealRates, shippingRates, selectedState]);

  const currentSelectedAreaObj = useMemo(() => {
    if (!selectedArea) return null;
    return (
      deliveryAreaOptions.find(
        (a) => a.name.toLowerCase() === selectedArea.toLowerCase()
      ) || null
    );
  }, [deliveryAreaOptions, selectedArea]);

  const [streetAddress, setStreetAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [shippingOption, setShippingOption] = useState<"standard" | "express">("standard");
  const [deliveryError, setDeliveryError] = useState("");

  // Delivery Pricing
  const deliveryFeeKobo = useMemo(() => {
    if (deliveryType === "pickup") return 0;
    if (!selectedArea || !currentSelectedAreaObj) return 0;
    return currentSelectedAreaObj.isFree ? 0 : currentSelectedAreaObj.feeKobo;
  }, [deliveryType, selectedArea, currentSelectedAreaObj]);

  const subtotalKobo = useMemo(() => {
    return items.reduce((acc, it) => acc + it.priceKobo * it.quantity, 0);
  }, [items]);

  // Paystack processing fee gross-up if customer pays (PAY-04 / 4.5)
  // Only applies when paying with Paystack and vendor chose "CUSTOMER"
  const processingFeeKobo = useMemo(() => {
    if (activePaymentMethod !== "paystack" || feeBearer !== "CUSTOMER") {
      return 0;
    }
    const netNaira = (subtotalKobo + deliveryFeeKobo) / 100;
    if (netNaira <= 0) return 0;
    const gross = netNaira < 2500 ? netNaira / 0.985 : (netNaira + 100) / 0.985;
    let feeNaira = gross - netNaira;
    if (feeNaira > 2000) feeNaira = 2000;
    return Math.round(feeNaira * 100);
  }, [activePaymentMethod, feeBearer, subtotalKobo, deliveryFeeKobo]);

  const totalKobo = subtotalKobo + deliveryFeeKobo + processingFeeKobo;
  const processingFeeFormatted = (processingFeeKobo / 100).toLocaleString("en-NG");
  const deliveryFeeFormatted = (deliveryFeeKobo / 100).toLocaleString("en-NG");
  const totalFormatted = (totalKobo / 100).toLocaleString("en-NG");

  // Phone normalization
  const formattedPhonePreview = useMemo(() => {
    const raw = phone.trim().replace(/\s+/g, "");
    if (!raw) return "+234 803 456 7812";
    if (raw.startsWith("+234")) {
      const rest = raw.slice(4);
      return `+234 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
    }
    if (raw.startsWith("0")) {
      const rest = raw.slice(1);
      return `+234 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
    }
    return `+234 ${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
  }, [phone]);

  // Proceed from Step 1 (C02) to Step 3 Review
  const handleProceedToReview = () => {
    setDetailsError("");
    setDeliveryError("");

    if (deliveryType === "delivery" && !selectedArea) {
      setDeliveryError("Please choose your delivery area.");
      setIsAreaModalOpen(true);
      return;
    }

    if (!fullName.trim()) {
      setDetailsError("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setDetailsError("Please enter your phone number.");
      return;
    }

    if (deliveryType === "delivery" && !streetAddress.trim()) {
      setDeliveryError("Please enter your street address.");
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 Proceed to Place Order & Ready to Pay
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " · " + now.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " WAT";

    setCreatedOrderDate(formattedDate);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug,
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim() || undefined,
          deliveryType,
          deliveryState: deliveryType === "delivery" ? selectedState : undefined,
          deliveryArea: deliveryType === "delivery" ? selectedArea : undefined,
          deliveryAddress: deliveryType === "delivery" ? streetAddress.trim() : undefined,
          deliveryInstructions: deliveryInstructions.trim() || undefined,
          deliveryFeeKobo,
          processingFeeKobo,
          paymentRoute: activePaymentMethod === "paystack" ? "PAYSTACK" : "BANK_TRANSFER",
          customerNote: orderNote.trim() || undefined,
          items: items.map((it) => ({
            productId: it.productId,
            name: it.productName,
            priceKobo: it.priceKobo,
            quantity: it.quantity,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedOrderId(data.orderId || null);
        setCreatedOrderNumber(data.orderNumber || 1048);
        setPublicToken(data.publicToken || "");
        if (data.bankDetails) {
          setBankDetails(data.bankDetails);
        }
      } else {
        const fallbackOrderNum = 1000 + Math.floor(Math.random() * 900);
        setCreatedOrderNumber(fallbackOrderNum);
      }
    } catch {
      const fallbackOrderNum = 1000 + Math.floor(Math.random() * 900);
      setCreatedOrderNumber(fallbackOrderNum);
    } finally {
      setIsSubmitting(false);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePayNow = async () => {
    setIsInitializingPayment(true);
    setPaymentError(null);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createdOrderId,
          orderNumber: createdOrderNumber,
          publicToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setPaymentError(
          data.error || "Unable to open Paystack payment. Please try again."
        );
      }
    } catch {
      setPaymentError("Network error connecting to Paystack gateway.");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const cleanWhatsapp = (whatsappNumber || phoneNumber || "").replace(/[^0-9]/g, "");

  // Pre-filled WhatsApp message with product image, description, order number and price
  const whatsappMessage = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ondar.ng";
    const primaryItem = items[0];
    const productImg = primaryItem?.imageUrl
      ? primaryItem.imageUrl.startsWith("http")
        ? primaryItem.imageUrl
        : `${origin}${primaryItem.imageUrl}`
      : "";

    const itemsSummary = items
      .map(
        (it) =>
          `🛍️ *${it.productName}*\nOption: ${it.variantTitle || "Standard"} | Qty: ${it.quantity}\nPrice: ₦${(
            (it.priceKobo * it.quantity) /
            100
          ).toLocaleString("en-NG")}`
      )
      .join("\n\n");

    return [
      `*Order #OND-${createdOrderNumber || 1048}*`,
      `*Store:* ${businessName}`,
      `*Customer:* ${fullName} (${formattedPhonePreview})`,
      ``,
      itemsSummary,
      productImg ? `\n📸 *Product Image:*\n${productImg}` : "",
      ``,
      `📍 *Fulfillment:* ${
        deliveryType === "delivery"
          ? `Delivery to ${streetAddress ? `${streetAddress}, ` : ""}${selectedArea}, ${selectedState}`
          : `Shop pickup at ${pickupAddress || `${selectedArea}, ${selectedState}`}`
      }`,
      `💰 *Total Amount:* ₦${totalFormatted}`,
      orderNote ? `📝 *Customer Note:* "${orderNote}"` : "",
      ``,
      `Hello ${businessName}, I started this order and would like to chat / negotiate before payment.`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [
    businessName,
    createdOrderNumber,
    items,
    deliveryType,
    streetAddress,
    selectedArea,
    selectedState,
    pickupAddress,
    totalFormatted,
    fullName,
    formattedPhonePreview,
    orderNote,
  ]);

  const handleContinueToWhatsapp = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(whatsappMessage);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3500);
      }
    } catch {
      // Ignore clipboard write restrictions in certain browsers
    }

    const targetUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(targetUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] antialiased text-gray-900 flex flex-col justify-between selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div>
        {/* Storefront Header */}
        <StorefrontHeader
          businessName={businessName}
          storeSlug={storeSlug}
          city={city}
          subtitle={tagline || "Everyday pieces, thoughtfully chosen"}
        />

        <main className="w-full max-w-[440px] mx-auto px-4 pt-3 pb-8">
          {/* ============================================================== */}
          {/* SCREEN 4: AWAITING PAYMENT / READY TO PAY */}
          {/* ============================================================== */}
          {currentStep === 4 ? (
            <div className="space-y-4 animate-in fade-in pt-1">
              {/* Status badge */}
              <div>
                {isPaymentSent ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Payment reported · Awaiting vendor confirmation</span>
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#FEF3C7] text-[#92400E] text-xs font-semibold">
                    Awaiting payment
                  </span>
                )}
              </div>

              {/* Title & Order info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {isPaymentSent ? "Payment reported" : "Your order is ready to pay"}
                </h1>
                <p className="text-xs font-semibold text-gray-700 mt-2">
                  Order #OND-{createdOrderNumber || 1048}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {createdOrderDate || "21 Oct 2026 · 9:41am WAT"}
                </p>
              </div>

              {/* Big Locked Amount Card */}
              <div className="bg-[#F8F9FA] border border-gray-100 rounded-3xl p-5 space-y-1">
                <p className="text-xs text-gray-500 font-medium">Locked amount to pay</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">
                    ₦{totalFormatted}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(totalFormatted.replace(/,/g, ""), "amount")}
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
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#00A859] font-medium pt-1">
                  Includes delivery and processing fee
                </p>
              </div>

              {/* 2-Hour Stock Hold Countdown Card */}
              <div className="bg-[#FEF3C7]/50 border border-[#FDE68A] rounded-2xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#92400E] flex items-center justify-center text-[#92400E] flex-shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-[#92400E]">
                  <p className="font-bold">
                    Stock reserved · {countdownFormatted} remaining
                  </p>
                  <p className="mt-1 leading-relaxed text-[#A16207]">
                    {isPaymentSent
                      ? "Your payment claim has been submitted. Your stock hold is extended for up to 48 hours while the vendor confirms receipt."
                      : "Your items are held for 2 hours while waiting for payment. Transfer the exact amount or tap 'I have sent the payment' to secure your reservation."}
                  </p>
                </div>
              </div>

              {/* Payment Method Switcher (if merchant has Paystack enabled) */}
              {hasPaystack && (
                <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod("paystack")}
                    className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activePaymentMethod === "paystack"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / Paystack</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod("bank_transfer")}
                    className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activePaymentMethod === "bank_transfer"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              )}

              {/* BANK TRANSFER DETAILS CARD */}
              {activePaymentMethod === "bank_transfer" && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#00A859]" />
                      <span>Vendor Bank Account</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#00A859] px-2 py-0.5 rounded-full bg-[#E8F8EF]">
                      Verified by NIBSS
                    </span>
                  </div>

                  {bankDetails ? (
                    <div className="space-y-3">
                      {/* Account Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-neutral-500">
                            Account Number
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(bankDetails.accountNumber, "account")
                            }
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
                          {bankDetails.accountNumber}
                        </p>
                      </div>

                      {/* Bank Name */}
                      <div>
                        <span className="text-xs font-bold text-neutral-500 block mb-0.5">
                          Bank Name
                        </span>
                        <p className="text-sm font-bold text-neutral-900">
                          {bankDetails.bankName}
                        </p>
                      </div>

                      {/* Account Name */}
                      <div>
                        <span className="text-xs font-bold text-neutral-500 block mb-0.5">
                          Account Name
                        </span>
                        <p className="text-sm font-bold text-neutral-900">
                          {bankDetails.accountName}
                        </p>
                      </div>

                      {/* Payment Reference */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-neutral-500 block mb-0.5">
                            Payment Reference
                          </span>
                          <p className="text-xs font-mono font-bold text-neutral-900 select-all">
                            OND-{createdOrderNumber || 1048}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `OND-${createdOrderNumber || 1048}`,
                              "reference"
                            )
                          }
                          className="text-xs font-bold text-[#00A859] flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          {copiedField === "reference" ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy reference</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-neutral-500">
                      Payment details are being configured by the vendor.
                    </div>
                  )}

                  {/* Mandatory PRD Disclaimer */}
                  <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 leading-relaxed italic">
                    Ondar does not hold your payment, pay only to the account shown.
                  </div>
                </div>
              )}

              {/* PAYSTACK NOTICE CARD */}
              {activePaymentMethod === "paystack" && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#00A859]" />
                    <h3 className="font-bold text-sm text-neutral-900">
                      Paystack Secure Checkout
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Pay instantly using your Debit Card, Apple Pay, Bank Transfer, or USSD code.
                    Your payment is settled directly to {businessName}&apos;s verified account.
                  </p>
                </div>
              )}

              {/* Products list card */}
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-gray-200"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={it.imageUrl}
                        alt={it.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                        {it.productName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {it.variantTitle || "Standard"} · Quantity {it.quantity}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        ₦{((it.priceKobo) / 100).toLocaleString("en-NG")} × {it.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact / Delivery Snapshot Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center justify-between text-sm font-bold text-gray-900 mb-1">
                  <span className="text-gray-500 font-normal">Contact</span>
                  <span>{fullName}</span>
                </div>
                <p className="font-medium text-gray-800">{formattedPhonePreview}</p>
                <p>
                  {deliveryType === "delivery"
                    ? `${selectedArea}, ${selectedState} · ${shippingOption === "express" ? "Express delivery" : "Standard delivery"}`
                    : `Shop pickup · ${pickupAddress || `${city}, ${state}`}`}
                </p>
                <p className="text-gray-400">
                  {email ? email : "Email not added"}
                </p>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed pt-1">
                If you leave now, use this order link to return. You won&apos;t need to create another order.
              </p>
            </div>
          ) : (
            <>
              {/* Stepper Progress Pill (C02) */}
              <div className="w-full mt-1 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                  {currentStep === 1 ? "1 · Delivery details" : "2 · Review order"}
                </span>
              </div>

              {/* ============================================================== */}
              {/* STEP 1: DELIVERY & CUSTOMER DETAILS (Screen C02) */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="animate-in fade-in space-y-4">
                  <div>
                    <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                      Checkout
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {businessName} · {totalCount} {totalCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  {/* Delivery vs Pickup Toggle */}
                  {isDeliveryAvailable && isPickupAvailable ? (
                    <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("delivery")}
                        className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          deliveryType === "delivery"
                            ? "bg-white text-neutral-900 shadow-xs"
                            : "text-neutral-500 hover:text-neutral-800"
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        <span>Delivery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType("pickup")}
                        className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          deliveryType === "pickup"
                            ? "bg-white text-neutral-900 shadow-xs"
                            : "text-neutral-500 hover:text-neutral-800"
                        }`}
                      >
                        <Store className="w-4 h-4" />
                        <span>Pickup</span>
                      </button>
                    </div>
                  ) : null}

                  {deliveryError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {deliveryError}
                    </div>
                  )}

                  {detailsError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      {detailsError}
                    </div>
                  )}

                  {!isDeliveryAvailable && !isPickupAvailable ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      This store is currently configuring delivery options. Please contact the merchant directly via WhatsApp.
                    </div>
                  ) : deliveryType === "delivery" ? (
                    /* DELIVERY DETAILS */
                    <div className="space-y-4">
                      {/* State Dropdown */}
                      <div>
                        <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                          State
                        </label>
                        <div className="relative">
                          <select
                            value={selectedState}
                            onChange={(e) => {
                              setSelectedState(e.target.value);
                              setSelectedArea(null);
                            }}
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 bg-white appearance-none focus:outline-none focus:border-[#00A859] cursor-pointer"
                          >
                            {availableStates.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Area Trigger */}
                      <div>
                        <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                          Area
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsAreaModalOpen(true)}
                          className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-left bg-white hover:border-neutral-300 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          {selectedArea && currentSelectedAreaObj ? (
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-bold text-neutral-900 truncate">
                                {currentSelectedAreaObj.name}
                              </p>
                              <p className="text-xs text-neutral-500 mt-0.5 truncate">
                                {currentSelectedAreaObj.deliveryName} · {currentSelectedAreaObj.isFree ? "Free" : `₦${currentSelectedAreaObj.feeNaira.toLocaleString("en-NG")}`} · {currentSelectedAreaObj.estimatedDelivery || "1–2 business days"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400 font-normal">
                              Choose delivery area...
                            </span>
                          )}
                          <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0" />
                        </button>
                      </div>

                      {/* Fee indicator Callout */}
                      {!selectedArea ? (
                        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
                          <Info className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-neutral-600 leading-relaxed">
                            <p className="font-bold text-neutral-800">Your fee will appear here</p>
                            <p className="mt-0.5">
                              We calculate your fee from {businessName}&apos;s rates as soon as you pick an area.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-[#E8F8EF] border border-[#A7F3D0] flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#00A859]">
                              Delivery to {currentSelectedAreaObj?.name}
                            </p>
                            <p className="text-xs text-neutral-600 mt-0.5">
                              {currentSelectedAreaObj?.deliveryName} · {currentSelectedAreaObj?.estimatedDelivery || "1–2 business days"}
                            </p>
                          </div>
                          <span className="text-sm font-black text-neutral-900">
                            {currentSelectedAreaObj?.isFree ? (
                              <span className="text-[#00A859]">Free</span>
                            ) : (
                              `₦${(currentSelectedAreaObj?.feeNaira || 0).toLocaleString("en-NG")}`
                            )}
                          </span>
                        </div>
                      )}

                      {/* Address Fields */}
                      <div>
                        <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                          Delivery address *
                        </label>
                        <input
                          type="text"
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="e.g. 14 Aina Street, Off Allen Avenue"
                          className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-neutral-900">
                            Delivery instructions
                          </label>
                          <span className="text-xs text-neutral-400">Optional</span>
                        </div>
                        <input
                          type="text"
                          value={deliveryInstructions}
                          onChange={(e) => setDeliveryInstructions(e.target.value)}
                          placeholder="e.g. Call when outside, leave at security"
                          className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                        />
                      </div>

                      {/* Customer Details */}
                      <div className="pt-2 border-t border-neutral-100 space-y-3.5">
                        <h3 className="text-sm font-bold text-neutral-900">Your details</h3>

                        <div>
                          <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                            Full name *
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ada Obi"
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                            Phone number *
                          </label>
                          <div className="flex items-center border border-neutral-200 rounded-xl bg-white overflow-hidden focus-within:border-[#00A859]">
                            <span className="px-3 py-3 text-xs font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200 select-none">
                              +234
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="801 234 5678"
                              className="flex-1 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">
                            Used for order updates. Saved as {formattedPhonePreview}.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-neutral-900">Email</label>
                            <span className="text-xs text-neutral-400">Optional</span>
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Add email for your receipt"
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-neutral-900">Order note</label>
                            <span className="text-xs text-neutral-400">Optional</span>
                          </div>
                          <input
                            type="text"
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder={`Anything you'd like ${businessName} to know?`}
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* PICKUP DETAILS */
                    <div className="space-y-4">
                      {/* Interactive Pickup Map with Draggable Customer Location */}
                      <InteractivePickupMap
                        businessName={businessName}
                        city={city}
                        state={state}
                        pickupAddress={pickupAddress}
                      />

                      {/* Customer Details for Pickup */}
                      <div className="space-y-3.5 pt-1">
                        <h3 className="text-sm font-bold text-neutral-900">Your details</h3>

                        <div>
                          <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                            Full name *
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ada Obi"
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                            Phone number *
                          </label>
                          <div className="flex items-center border border-neutral-200 rounded-xl bg-white overflow-hidden focus-within:border-[#00A859]">
                            <span className="px-3 py-3 text-xs font-bold text-neutral-500 bg-neutral-50 border-r border-neutral-200 select-none">
                              +234
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="801 234 5678"
                              className="flex-1 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">
                            Used to contact you when ready. Saved as {formattedPhonePreview}.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-neutral-900">Email</label>
                            <span className="text-xs text-neutral-400">Optional</span>
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Add email for your receipt"
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-neutral-900">Order note</label>
                            <span className="text-xs text-neutral-400">Optional</span>
                          </div>
                          <input
                            type="text"
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder={`Anything you'd like ${businessName} to know?`}
                            className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary Card at Bottom of Step 1 */}
                  <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-2.5 mt-5">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Your order
                    </h4>
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>Items subtotal ({totalCount})</span>
                      <span className="font-bold text-neutral-900">₦{subtotalNaira}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span>{deliveryType === "delivery" ? "Delivery fee" : "Pickup"}</span>
                      <span className="font-bold text-neutral-900">
                        {deliveryType === "delivery"
                          ? selectedArea
                            ? deliveryFeeKobo === 0
                              ? "Free"
                              : `₦${deliveryFeeFormatted}`
                            : "Not selected"
                          : "Free"}
                      </span>
                    </div>
                    <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-sm font-black text-neutral-900">
                      <span>Items total so far</span>
                      <span>
                        ₦{selectedArea || deliveryType === "pickup" ? totalFormatted : subtotalNaira}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 3: REVIEW ORDER ("One last look", Screen media_1792576628573_0e84ba3d.png) */}
              {/* ============================================================== */}
              {currentStep === 3 && (
                <div className="mt-4 animate-in fade-in space-y-4">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    One last look
                  </h1>

                  {/* Product items card */}
                  <div className="space-y-3">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-gray-200"
                      >
                        <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                          <img
                            src={it.imageUrl}
                            alt={it.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                            {it.productName}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {it.variantTitle || "Standard"} · Quantity {it.quantity}
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            ₦{((it.priceKobo) / 100).toLocaleString("en-NG")} × {it.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Contact card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900">Contact</h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-[#00A859] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{fullName}</p>
                    <p className="text-xs text-gray-600">{formattedPhonePreview}</p>
                    <p className="text-xs text-gray-400 pt-0.5">
                      {email ? email : "Email not added"} ·{" "}
                      {orderNote ? `Note: "${orderNote}"` : "No order note"}
                    </p>
                  </div>

                  {/* Delivery / Pickup details card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900">
                        {deliveryType === "delivery" ? "Delivery" : "Pickup"}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-[#00A859] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    {deliveryType === "delivery" ? (
                      <>
                        <p className="text-sm font-medium text-gray-800">
                          {streetAddress}, {selectedArea}, {selectedState}
                        </p>
                        <p className="text-xs text-gray-500">
                          {shippingOption === "express" ? "Express delivery · Next business day" : "Standard delivery · 1–2 business days"}
                        </p>
                        {deliveryInstructions && (
                          <p className="text-xs text-gray-500 pt-0.5">
                            {deliveryInstructions}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-800">
                          {pickupAddress || "24 Adeola Odeku Street"}, {selectedArea}, {selectedState}
                        </p>
                        <p className="text-xs text-gray-500">
                          Shop pickup · Free
                        </p>
                      </>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 text-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Payment summary</h4>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">₦{subtotalNaira}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>{deliveryType === "delivery" ? "Delivery" : "Pickup"}</span>
                      <span className="font-semibold text-gray-900">
                        {deliveryFeeKobo === 0 ? "Free" : `₦${deliveryFeeFormatted}`}
                      </span>
                    </div>
                    {processingFeeKobo > 0 && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Payment processing fee</span>
                        <span className="font-semibold text-gray-900">
                          ₦{processingFeeFormatted}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-base font-bold text-gray-900">
                      <span>Total</span>
                      <span>₦{totalFormatted}</span>
                    </div>
                  </div>

                  {/* Price Lock Guarantee Banner */}
                  <div className="bg-[#E8F8EF] rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-[#00A859] flex items-center justify-center text-[#00A859] font-bold text-xs flex-shrink-0 mt-0.5">
                      i
                    </div>
                    <div className="text-xs text-[#0f5132]">
                      <h4 className="font-bold text-sm text-[#00A859]">
                        Your price locks when you place the order
                      </h4>
                      <p className="mt-1 leading-relaxed">
                        We&apos;ll recheck price and stock first. If anything changed, you&apos;ll review it before confirming. Your item is then held for about 30 minutes to pay.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* STICKY BOTTOM BARS FOR ALL STEPS */}
      {/* ============================================================== */}
      <div className="sticky bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-[440px] mx-auto p-4">
          {/* Step 1 Bottom Bar (Screen C02) */}
          {currentStep === 1 && (
            <div>
              <button
                type="button"
                onClick={
                  deliveryType === "delivery" && !selectedArea
                    ? () => setIsAreaModalOpen(true)
                    : handleProceedToReview
                }
                className="w-full bg-[#00A859] hover:bg-[#008f4c] text-white font-bold rounded-xl py-3.5 flex items-center justify-center text-center cursor-pointer transition-colors"
              >
                {deliveryType === "delivery" && !selectedArea
                  ? "Choose location to continue"
                  : deliveryType === "pickup"
                  ? `Review pickup order · ₦${subtotalNaira}`
                  : `Continue to review · ₦${totalFormatted}`}
              </button>
            </div>
          )}

          {/* Step 3 Bottom Bar ("One last look") */}
          {currentStep === 3 && (
            <>
              <p className="text-sm font-bold text-gray-900 mb-2">
                You&apos;ll pay exactly ₦{totalFormatted}
              </p>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-[#00A859] hover:bg-[#008f4c] disabled:bg-gray-300 text-white font-medium rounded-xl py-3.5 flex items-center justify-center text-center cursor-pointer transition-colors"
              >
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2.5 leading-snug">
                Next: pay securely on Paystack. Placing the order does not mean payment is complete.
              </p>
            </>
          )}

          {/* Step 4 Bottom Bar */}
          {currentStep === 4 && (
            <div className="space-y-2.5">
              {/* Copied notification toast */}
              {copiedToast && (
                <div className="p-2.5 rounded-xl bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-xs font-semibold text-center animate-in fade-in">
                  ✓ Order details copied! Opening WhatsApp...
                </div>
              )}

              {/* Payment error banner if any */}
              {paymentError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center animate-in fade-in">
                  {paymentError}
                </div>
              )}

              {/* If payment reported */}
              {isPaymentSent ? (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Payment Claimed · Awaiting Confirmation</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueToWhatsapp}
                    className="w-full bg-[#00A859] hover:bg-[#008f4c] text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 text-center cursor-pointer transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Send confirmation on WhatsApp</span>
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center">
                    Seller will verify your bank transfer and update the order status.
                  </p>
                </div>
              ) : activePaymentMethod === "bank_transfer" ? (
                /* Bank Transfer Action Buttons */
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleMarkPaymentSent}
                    disabled={isClaimingPayment}
                    className="w-full bg-[#00A859] hover:bg-[#008f4c] disabled:opacity-75 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 text-center cursor-pointer transition-colors shadow-2xs"
                  >
                    {isClaimingPayment ? (
                      <span className="text-sm font-semibold">Updating status...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                        <span>I have sent the payment</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleContinueToWhatsapp}
                    className="w-full bg-[#E8F8EF] hover:bg-[#d4f2e1] text-[#00A859] border border-[#A7F3D0] font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 text-center cursor-pointer transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Continue to WhatsApp</span>
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center">
                    Ondar does not hold your payment, pay only to the account shown.
                  </p>
                </div>
              ) : (
                /* Paystack Action Buttons */
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isInitializingPayment}
                    className="w-full bg-[#00A859] hover:bg-[#008f4c] disabled:opacity-75 text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 text-center cursor-pointer transition-colors shadow-2xs"
                  >
                    {isInitializingPayment ? (
                      <span className="text-sm font-semibold">Connecting to Paystack...</span>
                    ) : (
                      <>
                        <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                        <span>Pay ₦{totalFormatted}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleContinueToWhatsapp}
                    className="w-full bg-[#E8F8EF] hover:bg-[#d4f2e1] text-[#00A859] border border-[#A7F3D0] font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 text-center cursor-pointer transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Continue to WhatsApp</span>
                  </button>

                  <div className="text-center pt-0.5">
                    <p className="text-xs text-gray-400">
                      Continue to Paystack&apos;s secure payment gateway.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-3">
            Checkout powered by ondar
          </p>
        </div>
      </div>
    
      {/* Choose Delivery Area Modal (Screen C03) */}
      <ChooseDeliveryAreaModal
        businessName={businessName}
        state={selectedState}
        availableStates={availableStates}
        onStateChange={(newState) => {
          setSelectedState(newState);
          setSelectedArea(null);
        }}
        options={deliveryAreaOptions}
        currentArea={selectedArea}
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        onConfirm={(option) => {
          setSelectedArea(option.name);
          setIsAreaModalOpen(false);
        }}
      />
    </div>
  );
}