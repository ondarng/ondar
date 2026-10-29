"use client";

import React, { useState, useEffect, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Store,
  Upload,
  Loader2,
  ChevronDown,
  Building2,
  Clock,
  Edit2,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { NIGERIAN_STATES } from "@/lib/constants";
import { getStoreUrls } from "@/lib/urls";



interface BankItem {
  id: number;
  name: string;
  code: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputId = useId();
  const productPhotoInputId = useId();

  // Current Step: 1, 2, 3, 4, or 5
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1 State
  const [businessName, setBusinessName] = useState("Ada's Edit");
  const [slug, setSlug] = useState("adas-edit");
  const [isSlugAvailable, setIsSlugAvailable] = useState(true);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Step 2 State
  const [description, setDescription] = useState(
    "Everyday bags, thoughtfully picked for work, weekends and everything in between."
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("+234 803 456 7890");
  const [city, setCity] = useState("Ikeja");
  const [selectedState, setSelectedState] = useState("Lagos");

  // Step 3 State (First Product)
  const [productName, setProductName] = useState("Everyday canvas tote");
  const [productSlug, setProductSlug] = useState("everyday-tote");
  const [productPhotoPreview, setProductPhotoPreview] = useState<string | null>("/sample-product.png");
  const [productPhotoName, setProductPhotoName] = useState("everyday-tote.jpg");
  const [priceNaira, setPriceNaira] = useState("18,500");
  const [stockQuantity, setStockQuantity] = useState("12");

  // Step 4 State (Payout Account)
  const [banksList, setBanksList] = useState<BankItem[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState("058");
  const [selectedBankName, setSelectedBankName] = useState("Guaranty Trust Bank");
  const [accountNumber, setAccountNumber] = useState("0123456789");
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null);
  const [manualAccountName, setManualAccountName] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [payoutSubStep, setPayoutSubStep] = useState<"input" | "confirm">("input");

  // Step 5 State (Copied feedback)
  const [copiedStore, setCopiedStore] = useState(false);
  const [copiedProduct, setCopiedProduct] = useState(false);

  // Load existing profile and bank list
  useEffect(() => {
    async function loadData() {
      try {
        const [onboardingRes, banksRes] = await Promise.all([
          fetch("/api/onboarding"),
          fetch("/api/banks"),
        ]);

        if (banksRes.ok) {
          const bData = await banksRes.json();
          if (bData.success && Array.isArray(bData.banks)) {
            setBanksList(bData.banks);
            const gtBank = bData.banks.find(
              (b: BankItem) => b.code === "058" || b.name.toLowerCase().includes("guaranty")
            );
            if (gtBank) {
              setSelectedBankCode(gtBank.code);
              setSelectedBankName(gtBank.name);
            }
          }
        }

        if (onboardingRes.ok) {
          const data = await onboardingRes.json();
          if (data.profile) {
            if (data.profile.businessName) setBusinessName(data.profile.businessName);
            if (data.profile.slug) setSlug(data.profile.slug);
            if (data.profile.description) setDescription(data.profile.description);
            if (data.profile.whatsappNumber) setWhatsappNumber(data.profile.whatsappNumber);
            if (data.profile.city) setCity(data.profile.city);
            if (data.profile.state) setSelectedState(data.profile.state);
            if (data.profile.logoUrl) setLogoPreview(data.profile.logoUrl);
          }

          if (data.product) {
            if (data.product.name) setProductName(data.product.name);
            if (data.product.slug) setProductSlug(data.product.slug);
            if (data.product.stockOnHand !== undefined) setStockQuantity(data.product.stockOnHand.toString());
            if (data.product.priceKobo) {
              const naira = Math.round(Number(data.product.priceKobo) / 100);
              setPriceNaira(naira.toLocaleString("en-NG"));
            }
            if (data.product.images && data.product.images.length > 0) {
              setProductPhotoPreview(data.product.images[0].url);
            }
          }

          if (data.payout) {
            if (data.payout.bankCode) setSelectedBankCode(data.payout.bankCode);
            if (data.payout.bankName) setSelectedBankName(data.payout.bankName);
            if (data.payout.accountNumber) setAccountNumber(data.payout.accountNumber);
            if (data.payout.accountName) setResolvedAccountName(data.payout.accountName);
          }

          if (data.step >= 1 && data.step <= 5) {
            setCurrentStep(data.step as 1 | 2 | 3 | 4 | 5);
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding status:", err);
      } finally {
        setIsInitializing(false);
      }
    }
    loadData();
  }, []);

  // Compute initials for logo placeholder (e.g. "Ada's Edit" -> "AE")
  const initials =
    businessName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "OS";

  // Slug auto-generation from business name
  useEffect(() => {
    if (!businessName) return;
    const generatedSlug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setSlug(generatedSlug || "shop");

    setIsCheckingSlug(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(generatedSlug || "shop")}`);
        const data = await res.json();
        setIsSlugAvailable(data.available);
      } catch {
        setIsSlugAvailable(true);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [businessName]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Logo image must be smaller than 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Product Photo Upload
  const handleProductPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Product photo must be smaller than 10 MB.");
        return;
      }
      setProductPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format Price display
  const cleanPriceNumber = priceNaira.replace(/[^0-9]/g, "");
  const formattedPricePreview = cleanPriceNumber
    ? parseInt(cleanPriceNumber, 10).toLocaleString("en-NG")
    : "0";

  // Dynamic store & product URLs (adapts automatically to localhost vs production)
  const activeSlug = slug || "adas-edit";
  const activeProductSlug = productSlug || "everyday-tote";
  const urls = getStoreUrls(activeSlug, activeProductSlug);
  const displayStoreUrl = urls.displayStore;
  const fullStoreUrl = urls.fullStore;
  const displayProductUrl = urls.displayProduct;
  const fullProductUrl = urls.fullProduct;

  // WhatsApp broadcast message
  const whatsappShareText = `Hi! ${businessName || "Ada’s Edit"} is now open 🎉 Shop our ${
    productName || "Everyday canvas tote"
  } for ₦${formattedPricePreview}. Order and pay here:\n\n${fullProductUrl}`;


  const copyToClipboard = async (text: string, type: "store" | "product") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "store") {
        setCopiedStore(true);
        setTimeout(() => setCopiedStore(false), 2000);
      } else {
        setCopiedProduct(true);
        setTimeout(() => setCopiedProduct(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  // Submit Step 1
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!businessName.trim()) {
      setErrorMessage("Please enter a business name.");
      return;
    }

    if (!isSlugAvailable) {
      setErrorMessage("This store URL is already taken. Please choose another name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 1,
          businessName: businessName.trim(),
          slug,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to save business name.");
        return;
      }

      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Step 2
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!whatsappNumber.trim()) {
      setErrorMessage("WhatsApp number is required.");
      return;
    }
    if (!city.trim()) {
      setErrorMessage("City is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 2,
          description,
          logoUrl: logoPreview,
          whatsappNumber,
          city,
          state: selectedState,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to save profile details.");
        return;
      }

      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Step 3 (First Product)
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!productName.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    const rawPrice = cleanPriceNumber;
    if (!rawPrice || parseInt(rawPrice, 10) <= 0) {
      setErrorMessage("Please enter a valid price.");
      return;
    }

    if (!stockQuantity || parseInt(stockQuantity, 10) < 0) {
      setErrorMessage("Please enter a valid stock quantity.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 3,
          name: productName.trim(),
          photoUrl: productPhotoPreview,
          priceNaira: rawPrice,
          stockQuantity,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to publish product.");
        return;
      }

      setCurrentStep(4);
      setPayoutSubStep("input");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4 Sub-step A: Resolve Bank Account via Paystack API
  const handleResolveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanAccount = accountNumber.trim().replace(/[^0-9]/g, "");
    if (cleanAccount.length !== 10) {
      setErrorMessage("Account number must be exactly 10 digits.");
      return;
    }

    setIsResolvingAccount(true);
    try {
      const res = await fetch("/api/banks/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: cleanAccount,
          bankCode: selectedBankCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || "Could not resolve bank account details. Check account number and bank, or enter your name manually below."
        );
        setShowManualInput(true);
        return;
      }

      setResolvedAccountName(data.accountName);
      setPayoutSubStep("confirm");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMessage("Network error verifying account. You can enter your account name manually below.");
      setShowManualInput(true);
    } finally {
      setIsResolvingAccount(false);
    }
  };

  const handleManualNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAccountName.trim()) {
      setErrorMessage("Please enter your official account holder name.");
      return;
    }
    setResolvedAccountName(manualAccountName.trim().toUpperCase());
    setPayoutSubStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 4 Sub-step B: Confirm and Activate Payouts
  const handleConfirmPayout = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 4,
          bankCode: selectedBankCode,
          bankName: selectedBankName,
          accountNumber: accountNumber.trim(),
          accountName: resolvedAccountName || manualAccountName || businessName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to activate payments.");
        return;
      }

      // Transition smoothly into Step 5
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Business name";
      case 2:
        return "Profile basics";
      case 3:
        return "First product";
      case 4:
        return "Payout account";
      case 5:
        return "Share your shop";
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between items-center px-6 py-8 antialiased selection:bg-[#00A859]/20 selection:text-[#00A859]">
      <div className="w-full max-w-[390px] mx-auto flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between pt-2 pb-6">
          <OndarLogo />
          <button
            type="button"
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium py-1 px-2 rounded-lg"
          >
            <HelpCircle className="w-4 h-4 text-neutral-500" />
            <span>Help</span>
          </button>
        </header>

        {/* Stepper Progress Bar */}
        <section className="mb-6">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="font-extrabold text-[#00A859] tracking-wider uppercase text-[11px]">
              STEP {currentStep} OF 5
            </span>
            <span className="text-neutral-500 font-medium">{getStepTitle()}</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                currentStep >= 1 ? "bg-[#00A859]" : "bg-neutral-200"
              }`}
            />
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                currentStep >= 2 ? "bg-[#00A859]" : "bg-neutral-200"
              }`}
            />
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                currentStep >= 3 ? "bg-[#00A859]" : "bg-neutral-200"
              }`}
            />
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                currentStep >= 4 ? "bg-[#00A859]" : "bg-neutral-200"
              }`}
            />
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                currentStep >= 5 ? "bg-[#00A859]" : "bg-neutral-200"
              }`}
            />
          </div>
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: BUSINESS NAME */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="flex flex-col">
            <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900 mb-3">
              What’s your business
              <br />
              called<span className="text-[#00A859]">?</span>
            </h1>

            <p className="text-[14px] leading-relaxed text-neutral-500 font-normal mb-6">
              Let’s get your first product link ready in about 10 minutes. Start with a name customers know.
            </p>

            <div className="mb-5">
              <label htmlFor="businessName" className="block text-sm font-bold text-neutral-900 mb-2">
                Business name
              </label>
              <input
                id="businessName"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ada’s Edit"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-[#FAFAFA] text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm"
              />
              <p className="text-xs text-neutral-500 mt-2 font-normal">
                Your name creates your free Ondar store URL.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Your store URL
              </label>

              <div
                className={`w-full px-4 py-3.5 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${
                  isSlugAvailable
                    ? "bg-[#ECFDF5] border-[#10B981] text-[#065F46]"
                    : "bg-red-50 border-red-300 text-red-700"
                }`}
              >
                <span className="font-bold text-[15px]">{displayStoreUrl}</span>

                {isCheckingSlug ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#059669]" />
                ) : isSlugAvailable ? (
                  <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                ) : (
                  <span className="text-xs font-semibold text-red-600">Taken</span>
                )}
              </div>

              {isSlugAvailable ? (
                <p className="text-xs text-[#059669] font-medium mt-2">Available — this link is yours to use.</p>
              ) : (
                <p className="text-xs text-red-600 font-medium mt-2">
                  This store URL is already taken. Try modifying your business name.
                </p>
              )}

              <p className="text-xs text-neutral-500 mt-1 font-normal">
                Availability is checked instantly as you change your business name.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-start gap-3.5 mb-7">
              <div className="p-1 text-[#059669] mt-0.5">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#065F46]">One shop. One simple link.</h2>
                <p className="text-xs text-[#047857] leading-relaxed mt-1 font-normal">
                  No domain to buy. Your store and product links are included with Ondar.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isSlugAvailable}
              className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-neutral-500 text-center mt-2.5 font-normal">
              Next: add the basics customers need to know.
            </p>

            <div className="mt-8 text-center pb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to account</span>
              </Link>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 2: PROFILE BASICS */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <form onSubmit={handleStep2Submit} className="flex flex-col">
            <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900 mb-3">
              Introduce your shop<span className="text-[#00A859]">.</span>
            </h1>

            <p className="text-[14px] leading-relaxed text-neutral-500 font-normal mb-6">
              A few details help customers know who they’re buying from.
            </p>

            <div className="mb-5">
              <label htmlFor="description" className="block text-sm font-bold text-neutral-900 mb-2">
                Short description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Everyday bags, thoughtfully picked for work, weekends and everything in between."
                className="w-full p-4 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[14px] leading-relaxed placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm resize-none"
              />
              <p className="text-xs text-neutral-500 mt-1.5 font-normal">Keep it short and welcoming.</p>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm font-bold text-neutral-900">Business logo</span>
                <span className="text-xs text-neutral-400 font-normal">(optional)</span>
              </div>

              <input
                id={fileInputId}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <label
                htmlFor={fileInputId}
                className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all flex items-center justify-between cursor-pointer shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#E6F7EF] flex items-center justify-center font-bold text-base text-[#00A859]">
                      {initials}
                    </div>
                  )}

                  <div className="text-left">
                    <p className="text-sm font-bold text-[#00A859] group-hover:underline">Upload logo</p>
                    <p className="text-xs text-neutral-500 mt-0.5">JPG or PNG · up to 5 MB</p>
                  </div>
                </div>

                <div className="text-neutral-400 group-hover:text-neutral-600 transition-colors p-2">
                  <Upload className="w-5 h-5" />
                </div>
              </label>
            </div>

            <div className="mb-5">
              <label htmlFor="whatsappNumber" className="block text-sm font-bold text-neutral-900 mb-2">
                WhatsApp number · required
              </label>
              <input
                id="whatsappNumber"
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+234 803 456 7890"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm"
              />
              <p className="text-xs text-neutral-500 mt-1.5 font-normal leading-relaxed">
                For customer click-to-chat and order notifications. This is not an identity-verification step.
              </p>
            </div>

            <div className="mb-5">
              <label htmlFor="city" className="block text-sm font-bold text-neutral-900 mb-2">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ikeja"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="stateSelect" className="block text-sm font-bold text-neutral-900 mb-2">
                State
              </label>
              <div className="relative">
                <select
                  id="stateSelect"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full appearance-none px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm pr-10 cursor-pointer"
                >
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mb-6 font-normal">You can add more business details after launch.</p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-neutral-500 text-center mt-2.5 font-normal">
              Next: add and publish your first product.
            </p>

            <div className="mt-8 text-center pb-6">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 3: FIRST PRODUCT */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <form onSubmit={handleStep3Submit} className="flex flex-col">
            <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900 mb-3">
              Your first product<span className="text-[#00A859]">.</span>
            </h1>

            <p className="text-[14px] leading-relaxed text-neutral-500 font-normal mb-6">
              Start with one product. Add more to your shop whenever you’re ready.
            </p>

            {/* Product name */}
            <div className="mb-5">
              <label htmlFor="productName" className="block text-sm font-bold text-neutral-900 mb-2">
                Product name
              </label>
              <input
                id="productName"
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Everyday canvas tote"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-[#FAFAFA] text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm"
              />
            </div>

            {/* Photo */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-neutral-900 mb-2">Photo</label>

              <input
                id={productPhotoInputId}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleProductPhotoUpload}
                className="hidden"
              />

              <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-[16/10] relative shadow-sm">
                {productPhotoPreview ? (
                  <img
                    src={productPhotoPreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2.5 px-0.5">
                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                  <ImageIcon className="w-4 h-4 text-[#00A859]" />
                  <span>{productPhotoName}</span>
                </div>
                <label
                  htmlFor={productPhotoInputId}
                  className="text-xs font-bold text-[#00A859] hover:underline cursor-pointer"
                >
                  Change photo
                </label>
              </div>
            </div>

            {/* Price (₦) */}
            <div className="mb-5">
              <label htmlFor="priceInput" className="block text-sm font-bold text-neutral-900 mb-2">
                Price (₦)
              </label>
              <input
                id="priceInput"
                type="text"
                required
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
                placeholder="18,500"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-[#FAFAFA] text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm"
              />
              <p className="text-xs text-neutral-500 mt-1.5 font-normal">
                The price customers will see: ₦{formattedPricePreview}.
              </p>
            </div>

            {/* Stock quantity */}
            <div className="mb-6">
              <label htmlFor="stockInput" className="block text-sm font-bold text-neutral-900 mb-2">
                Stock quantity
              </label>
              <input
                id="stockInput"
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="12"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-[#FAFAFA] text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm"
              />
              <p className="text-xs text-neutral-500 mt-1.5 font-normal">How many are available to buy?</p>
            </div>

            {/* Notification Card */}
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200/60 flex items-start gap-3.5 mb-7">
              <div className="p-1 text-amber-700 mt-0.5">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Publish now. Activate payments next.</h2>
                <p className="text-xs text-neutral-600 leading-relaxed mt-1 font-normal">
                  Publishing makes your storefront live. Customers can browse, but can’t pay until you confirm your payout account.
                </p>
              </div>
            </div>

            {/* Primary CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span>Publish and continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-neutral-500 text-center mt-2.5 font-normal">
              Next: connect the bank account for your payouts.
            </p>

            <div className="mt-8 text-center pb-6">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 4: PAYOUT ACCOUNT */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <div className="flex flex-col">
            {payoutSubStep === "input" ? (
              <form onSubmit={handleResolveAccount} className="flex flex-col">
                <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900 mb-3">
                  Where should your
                  <br />
                  payouts go<span className="text-[#00A859]">?</span>
                </h1>

                <p className="text-[14px] leading-relaxed text-neutral-500 font-normal mb-5">
                  Your shop is live. Connect your bank account so customers can pay for their orders.
                </p>

                {/* Status Badges */}
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Store live</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Payments not active yet</span>
                  </span>
                </div>

                {/* Bank dropdown */}
                <div className="mb-5">
                  <label htmlFor="bankSelect" className="block text-sm font-bold text-neutral-900 mb-2">
                    Bank
                  </label>
                  <div className="relative">
                    <select
                      id="bankSelect"
                      value={selectedBankCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedBankCode(code);
                        const b = banksList.find((item) => item.code === code);
                        if (b) setSelectedBankName(b.name);
                      }}
                      className="w-full appearance-none px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm pr-10 cursor-pointer"
                    >
                      {banksList.length > 0 ? (
                        banksList.map((bank) => (
                          <option key={bank.id || bank.code} value={bank.code}>
                            {bank.name}
                          </option>
                        ))
                      ) : (
                        <option value="058">Guaranty Trust Bank</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Account Number (NUBAN) */}
                <div className="mb-2">
                  <label htmlFor="nubanInput" className="block text-sm font-bold text-neutral-900 mb-2">
                    Account number (NUBAN)
                  </label>
                  <input
                    id="nubanInput"
                    type="text"
                    maxLength={10}
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="0123456789"
                    className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-sm"
                  />
                  <p className="text-xs text-neutral-500 mt-2 font-normal">
                    Enter your 10-digit Nigerian bank account number.
                  </p>
                </div>

                {/* Info Callout Card */}
                <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-start gap-3.5 my-6">
                  <div className="p-1 text-[#059669] mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#065F46]">Let’s check the account name</h2>
                    <p className="text-xs text-[#047857] leading-relaxed mt-1 font-normal">
                      Paystack will resolve the official account-holder name. You’ll review and confirm it before payments are activated.
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={isResolvingAccount}
                  className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isResolvingAccount ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying via Paystack...</span>
                    </>
                  ) : (
                    <>
                      <span>Find account name</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {showManualInput ? (
                  <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left">
                    <label htmlFor="manualNameInput" className="block text-sm font-bold text-neutral-900 mb-1">
                      Account holder name
                    </label>
                    <p className="text-xs text-neutral-500 mb-3">
                      Type your official account name as registered with your bank:
                    </p>
                    <input
                      id="manualNameInput"
                      type="text"
                      value={manualAccountName}
                      onChange={(e) => setManualAccountName(e.target.value)}
                      placeholder="e.g. CALEB ASIEGBU"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm font-bold uppercase placeholder:normal-case placeholder:font-normal placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] mb-3"
                    />
                    <button
                      type="button"
                      onClick={handleManualNameSubmit}
                      className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
                    >
                      Use this account name
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowManualInput(true)}
                      className="text-xs text-[#00A859] font-bold hover:underline"
                    >
                      Or enter account name manually
                    </button>
                  </div>
                )}

                <p className="text-xs text-neutral-500 text-center mt-2.5 font-normal">
                  Entering your account number does not activate payments.
                </p>
                <p className="text-xs text-neutral-400 text-center mt-0.5 font-normal">
                  Next: confirm the name returned by your bank.
                </p>

                <div className="mt-8 text-center pb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(3);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Sub-step B: Confirm Account */
              <div className="flex flex-col">
                <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900 mb-3">
                  Is this your account<span className="text-[#00A859]">?</span>
                </h1>

                <p className="text-[14px] leading-relaxed text-neutral-500 font-normal mb-5">
                  Please review the verified bank account details below before activating payments.
                </p>

                {/* Status Badges */}
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Store live</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Payments not active yet</span>
                  </span>
                </div>

                {/* Resolved Account Card */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-sm mb-4">
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-50 text-[#059669]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-neutral-900">{selectedBankName}</h2>
                      <p className="text-sm text-neutral-500 font-normal mt-0.5">{accountNumber}</p>
                    </div>
                  </div>

                  <hr className="border-t border-neutral-100 my-3" />

                  <div>
                    <span className="text-xs text-neutral-400 font-normal">
                      Official account name
                    </span>
                    <p className="text-base font-black text-neutral-900 tracking-wide mt-1 uppercase">
                      {resolvedAccountName || manualAccountName || businessName}
                    </p>
                  </div>
                </div>

                {/* Change details button */}
                <div className="flex justify-center mb-6">
                  <button
                    type="button"
                    onClick={() => setPayoutSubStep("input")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A859] hover:underline"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Change these details</span>
                  </button>
                </div>

                {/* What you're confirming */}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-neutral-900 mb-2">What you’re confirming</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-3 font-normal">
                    Ondar will create your Paystack payout subaccount for this bank account.
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                    Ondar takes a 1% split on payments. Paystack’s processing fees also apply, so your final payout may be less than 99% of a sale.
                  </p>
                </div>

                {/* Confirmation Green Alert Box */}
                <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-start gap-3.5 mb-7">
                  <div className="p-0.5 text-[#059669] mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-[#065F46]">Your confirmation activates payments</h2>
                    <p className="text-xs text-[#047857] leading-relaxed mt-0.5 font-normal">
                      Confirm that this is the correct account to receive payouts for {businessName || "your shop"}.
                    </p>
                  </div>
                </div>

                {/* CTA Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmPayout}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <span>Confirm and activate payments</span>
                  )}
                </button>

                <p className="text-xs text-neutral-500 text-center mt-2.5 font-normal">
                  Next: share your store and first product links.
                </p>

                <div className="mt-8 text-center pb-6">
                  <button
                    type="button"
                    onClick={() => setPayoutSubStep("input")}
                    className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: SHARE YOUR SHOP (FINAL STEP) */}
        {/* ============================================================== */}
        {currentStep === 5 && (
          <div className="flex flex-col">
            <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900 mb-3">
              You’re open for
              <br />
              business<span className="text-[#00A859]">.</span>
            </h1>

            <p className="text-[14px] leading-relaxed text-neutral-500 font-normal mb-5">
              Your first product is ready to sell. Send your link to the people most likely to love it.
            </p>

            {/* Dual Status Badges: Both Active */}
            <div className="flex items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Store live</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Payments active</span>
              </span>
            </div>

            {/* Summary Product Card */}
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] mb-6">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm mb-3">
                <Store className="w-4 h-4 text-[#00A859]" />
                <span>{businessName || "Ada’s Edit"}</span>
              </div>
              <p className="text-base font-bold text-neutral-900 mb-1">
                {productName || "Everyday canvas tote"}
              </p>
              <p className="text-xs font-medium text-[#00A859]">
                ₦{formattedPricePreview} · {stockQuantity} in stock · Published
              </p>
            </div>

            {/* Copy Store Link Box */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-white mb-4 shadow-xs">
              <p className="text-xs font-bold text-neutral-900 mb-1.5">Your store</p>
              <p className="text-sm font-medium text-[#00A859] mb-3">{displayStoreUrl}</p>
              <button
                type="button"
                onClick={() => copyToClipboard(fullStoreUrl, "store")}
                className="w-full py-3 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                {copiedStore ? (
                  <>
                    <Check className="w-4 h-4 text-[#00A859]" />
                    <span className="text-[#00A859]">Copied!</span>
                  </>
                ) : (
                  <>
                    <span>Copy store link</span>
                    <Copy className="w-4 h-4 text-neutral-400" />
                  </>
                )}
              </button>
            </div>

            {/* Copy Product Link Box */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-white mb-7 shadow-xs">
              <p className="text-xs font-bold text-neutral-900 mb-1.5">Your first product</p>
              <p className="text-sm font-medium text-[#00A859] mb-3">{displayProductUrl}</p>
              <button
                type="button"
                onClick={() => copyToClipboard(fullProductUrl, "product")}
                className="w-full py-3 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                {copiedProduct ? (
                  <>
                    <Check className="w-4 h-4 text-[#00A859]" />
                    <span className="text-[#00A859]">Copied!</span>
                  </>
                ) : (
                  <>
                    <span>Copy product link</span>
                    <Copy className="w-4 h-4 text-neutral-400" />
                  </>
                )}
              </button>
            </div>

            {/* Start with your WhatsApp circle */}
            <div className="mb-6">
              <h2 className="text-base font-bold text-neutral-900 mb-1">Start with your WhatsApp circle</h2>
              <p className="text-xs text-neutral-500 mb-3 font-normal">Your message is ready to send:</p>

              <div className="p-4 rounded-2xl border border-neutral-200 bg-white text-xs leading-relaxed text-neutral-800 shadow-xs mb-4 whitespace-pre-line font-normal">
                {whatsappShareText}
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow active:scale-[0.99]"
              >
                <span>Share to WhatsApp</span>
                <WhatsAppIcon className="w-5 h-5 fill-current" />
              </a>

            </div>

            <p className="text-xs text-neutral-500 text-center mb-6 leading-relaxed font-normal">
              No more setup required. Share with friends and past customers to work towards your first paid order today.
            </p>

            {/* Go to Dashboard CTA */}
            <div className="pb-8">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full py-4 px-6 rounded-2xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-bold text-base flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <span>Go to dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
