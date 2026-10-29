"use client";

import React, { useState } from "react";
import { MapPin, Phone, MessageCircle, X, ShieldCheck } from "lucide-react";

interface StorefrontFooterProps {
  businessName: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  address?: string;
  returnPolicy?: string;
}

export function StorefrontFooter({
  businessName,
  whatsappNumber,
  phoneNumber,
  city = "Lagos",
  state = "Nigeria",
  returnPolicy,
}: StorefrontFooterProps) {
  const [modalType, setModalType] = useState<"info" | "contact" | null>(null);

  const cleanWhatsapp = (whatsappNumber || "").replace(/[^0-9]/g, "");

  return (
    <>
      <footer className="mt-12 pt-6 border-t border-neutral-100 text-center pb-8">
        <div className="flex items-center justify-center gap-6 text-xs font-semibold text-[#00A859]">
          <button
            type="button"
            onClick={() => setModalType("info")}
            className="hover:underline cursor-pointer"
          >
            Store information
          </button>
          <button
            type="button"
            onClick={() => setModalType("contact")}
            className="hover:underline cursor-pointer"
          >
            Contact seller
          </button>
        </div>

        <p className="text-xs text-neutral-400 mt-4 flex items-center justify-center gap-1">
          <span>Powered by</span>
          <span className="font-black text-neutral-900 tracking-tight">
            ondar<span className="text-[#00A859]">.</span>
          </span>
        </p>
      </footer>

      {/* Store Information Modal */}
      {modalType === "info" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-3xl bg-white p-5 space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900">Store information</h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#00A859] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-900">{businessName}</p>
                  <p className="text-neutral-500">
                    {city}, {state}
                  </p>
                </div>
              </div>

              {returnPolicy && (
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <p className="font-bold text-neutral-900 mb-1">Return policy</p>
                  <p className="text-neutral-600 leading-relaxed">{returnPolicy}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-neutral-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#00A859]" />
                <span>Verified Ondar Merchant Store</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalType(null)}
              className="w-full h-11 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {modalType === "contact" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-[430px] rounded-3xl bg-white p-5 space-y-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900">Contact seller</h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Have questions about products, custom orders, or delivery timing? Reach out directly.
            </p>

            <div className="space-y-2.5">
              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                    `Hello ${businessName}, I'm browsing your store on Ondar and have a question.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="w-full h-12 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {phoneNumber}</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setModalType(null)}
              className="w-full h-10 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
