"use client";

import React, { useState, useEffect, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OndarLogo } from "@/components/OndarLogo";
import { NIGERIAN_STATES } from "@/lib/constants";
import {
  HelpCircle,
  Store,
  Upload,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown,
  CheckCircle2,
  Palette,
} from "lucide-react";
import { StorefrontCanvasModal } from "@/components/storefront/StorefrontCanvasModal";

export default function BusinessProfileSettingsPage() {
  const router = useRouter();
  const logoInputId = useId();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);

  // Profile Form States
  const [businessName, setBusinessName] = useState("Ada's Edit");
  const [slug, setSlug] = useState("adas-edit");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState(
    "Everyday bags, thoughtfully picked for work, weekends and everything in between."
  );

  // Customer Contact
  const [whatsappNumber, setWhatsappNumber] = useState("+234 803 456 7890");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [publicEmail, setPublicEmail] = useState("ada@adasedit.com");

  // Social Links
  const [instagram, setInstagram] = useState("instagram.com/adas.edit");
  const [tiktok, setTiktok] = useState("");

  // Business Location
  const [city, setCity] = useState("Ikeja");
  const [selectedState, setSelectedState] = useState("Lagos");
  const [address, setAddress] = useState("14 Allen Avenue, Ikeja, Lagos");

  // Return policy
  const [returnPolicy, setReturnPolicy] = useState(
    "Returns accepted within 7 days of delivery. Items must be unused and in their original condition. Message us on WhatsApp to arrange a return. Return delivery is paid by the customer unless the item is faulty."
  );

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/settings/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            if (p.businessName) setBusinessName(p.businessName);
            if (p.slug) setSlug(p.slug);
            if (p.logoUrl) setLogoPreview(p.logoUrl);
            if (p.description) setDescription(p.description);
            if (p.whatsappNumber) setWhatsappNumber(p.whatsappNumber);
            if (p.secondaryPhone) setSecondaryPhone(p.secondaryPhone);
            if (p.publicEmail) setPublicEmail(p.publicEmail);
            if (p.instagram) setInstagram(p.instagram);
            if (p.tiktok) setTiktok(p.tiktok);
            if (p.city) setCity(p.city);
            if (p.state) setSelectedState(p.state);
            if (p.address) setAddress(p.address);
            if (p.returnPolicy) setReturnPolicy(p.returnPolicy);
          }
        }
      } catch (err) {
        console.error("Failed to load business profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          description,
          logoUrl: logoPreview,
          whatsappNumber,
          secondaryPhone,
          publicEmail,
          instagram,
          tiktok,
          city,
          state: selectedState,
          address,
          returnPolicy,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to update profile.");
        return;
      }

      setSuccessMessage("Changes saved successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials =
    businessName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "OS";

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between items-center px-6 py-8 antialiased selection:bg-[#00A859]/20 selection:text-[#00A859] pb-16">
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

        {/* Title & Subtitle */}
        <div className="mb-5">
          <h1 className="text-[34px] leading-[1.12] font-black tracking-tight text-neutral-900 mb-2">
            Business profile<span className="text-[#00A859]">.</span>
          </h1>
          <p className="text-[13px] leading-relaxed text-neutral-500 font-normal">
            Make {businessName || "Ada's Edit"} feel like you. These details are optional after launch and won’t hold up your sales.
          </p>
        </div>

        {/* Green Notification Banner */}
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 flex items-start gap-3.5 mb-7">
          <div className="p-1 text-[#059669] mt-0.5">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#065F46]">Your shop is already open</h2>
            <p className="text-xs text-[#047857] leading-relaxed mt-0.5 font-normal">
              Edit your public profile whenever you like. You can keep selling while you do.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col">
          {/* SECTION 1: About your business */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-neutral-900 mb-4">About your business</h2>

            {/* Business name */}
            <div className="mb-2">
              <label htmlFor="businessNameInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                Business name
              </label>
              <input
                id="businessNameInput"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ada's Edit"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
              <p className="text-[11px] text-neutral-400 mt-1.5 font-normal">
                Store URL: {slug}.ondar.ng
              </p>
            </div>

            {/* Business logo */}
            <div className="mt-4 mb-5">
              <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                Business logo <span className="text-neutral-400 font-normal">(optional)</span>
              </label>

              <input
                id={logoInputId}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <label
                htmlFor={logoInputId}
                className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all flex items-center justify-between cursor-pointer shadow-xs group"
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

              <button
                type="button"
                onClick={() => setIsCanvasModalOpen(true)}
                className="mt-2 w-full py-2.5 px-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Palette className="w-3.5 h-3.5 text-[#00A859]" />
                <span>Customize in Visual Banner Canvas</span>
              </button>
            </div>

            {/* Short description */}
            <div>
              <label htmlFor="descriptionInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                Short description
              </label>
              <textarea
                id="descriptionInput"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Everyday bags, thoughtfully picked for work, weekends and everything in between."
                className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[14px] leading-relaxed placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: Customer contact */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-neutral-900 mb-4">Customer contact</h2>

            {/* WhatsApp number */}
            <div className="mb-4">
              <label htmlFor="whatsappInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                WhatsApp number
              </label>
              <input
                id="whatsappInput"
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+234 803 456 7890"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
              <p className="text-[11px] text-neutral-400 mt-1 font-normal">
                For customer click-to-chat and order notifications.
              </p>
            </div>

            {/* Secondary phone (optional) */}
            <div className="mb-4">
              <label htmlFor="secondaryPhoneInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                Secondary phone <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                id="secondaryPhoneInput"
                type="tel"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="Add another contact number"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
            </div>

            {/* Public business email (optional) */}
            <div>
              <label htmlFor="publicEmailInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                Public business email <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                id="publicEmailInput"
                type="email"
                value={publicEmail}
                onChange={(e) => setPublicEmail(e.target.value)}
                placeholder="ada@adasedit.com"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
              <p className="text-[11px] text-neutral-400 mt-1 font-normal">
                Shown to customers on your shop.
              </p>
            </div>
          </div>

          {/* SECTION 3: Social links */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-neutral-900 mb-1">Social links</h2>
            <p className="text-xs text-neutral-400 mb-4 font-normal">
              Optional — help customers find you elsewhere.
            </p>

            {/* Instagram */}
            <div className="mb-4">
              <label htmlFor="igInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                Instagram
              </label>
              <input
                id="igInput"
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="instagram.com/adas.edit"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
            </div>

            {/* TikTok */}
            <div>
              <label htmlFor="tiktokInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                TikTok
              </label>
              <input
                id="tiktokInput"
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="Add your TikTok profile URL"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
            </div>
          </div>

          {/* SECTION 4: Business location */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-neutral-900 mb-1">Business location</h2>
            <p className="text-xs text-neutral-400 mb-4 font-normal">
              One location for your shop.
            </p>

            {/* City */}
            <div className="mb-4">
              <label htmlFor="citySettingsInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                City
              </label>
              <input
                id="citySettingsInput"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ikeja"
                className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs"
              />
            </div>

            {/* State */}
            <div className="mb-4">
              <label htmlFor="stateSettingsSelect" className="block text-xs font-bold text-neutral-900 mb-1.5">
                State
              </label>
              <div className="relative">
                <select
                  id="stateSettingsSelect"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full appearance-none px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs pr-10 cursor-pointer"
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

            {/* Pickup address (optional) */}
            <div>
              <label htmlFor="addressSettingsInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
                Pickup address <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="addressSettingsInput"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="14 Allen Avenue, Ikeja, Lagos"
                className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[14px] leading-relaxed placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs resize-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1 font-normal leading-relaxed">
                Your pickup address is revealed to customers only after payment. It is not shown publicly on your storefront.
              </p>
            </div>
          </div>

          {/* SECTION 5: Delivery coverage */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-neutral-900 mb-3">Delivery coverage</h2>

            <div className="p-4 rounded-2xl border border-neutral-200 bg-[#FAFAFA] mb-3">
              <span className="text-[10px] font-black tracking-wider text-neutral-400 uppercase">
                FROM SHIPPING SETTINGS · READ ONLY
              </span>
              <p className="text-sm font-bold text-neutral-900 mt-1">Lagos - Ikeja, Yaba and Lekki</p>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Coverage updates automatically from Shipping. You don’t need to enter it here again.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3.5 px-4 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>Manage in Shipping</span>
              <ArrowRight className="w-4 h-4 text-neutral-500" />
            </Link>
          </div>

          {/* SECTION 6: Returns */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-neutral-900 mb-2">Returns</h2>
            <label htmlFor="returnPolicyInput" className="block text-xs font-bold text-neutral-900 mb-1.5">
              Return policy <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="returnPolicyInput"
              rows={4}
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-[13px] leading-relaxed placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-xs resize-none"
            />
          </div>

          {/* Save Changes Primary CTA */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving changes...</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>

          {/* Back to Home link */}
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </form>
      </div>

      {/* Storefront Canvas & Banner Editor Modal */}
      <StorefrontCanvasModal
        isOpen={isCanvasModalOpen}
        onClose={() => setIsCanvasModalOpen(false)}
        initialBusinessName={businessName}
        initialDescription={description}
        initialBannerUrl={logoPreview}
        initialCity={city}
        initialState={selectedState}
        storeSlug={slug}
        onSaved={({ businessName: bName, description: bDesc, bannerUrl: bBanner }) => {
          setBusinessName(bName);
          setDescription(bDesc);
          if (bBanner) setLogoPreview(bBanner);
        }}
      />
    </main>
  );
}
