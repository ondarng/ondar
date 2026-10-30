"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, MessageCircle, X, ShieldCheck, FileText } from "lucide-react";
import { formatToWhatsappNumber, getWhatsappChatUrl } from "@/lib/phone";

interface StorefrontFooterProps {
  businessName: string;
  storeSlug?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  address?: string;
  returnPolicy?: string;
}

export function StorefrontFooter({
  businessName,
  storeSlug,
  whatsappNumber,
  phoneNumber,
  city = "Lagos",
  state = "Nigeria",
  returnPolicy,
}: StorefrontFooterProps) {
  const [modalType, setModalType] = useState<"info" | "contact" | null>(null);

  const cleanWhatsapp = formatToWhatsappNumber(whatsappNumber || phoneNumber);
  const waUrl = getWhatsappChatUrl(
    cleanWhatsapp,
    `Hello ${businessName}, I'm browsing your store on Ondar and have a question.`
  );

  return (
    <>
      <footer className="mt-12 pt-6 border-t border-neutral-100 text-center pb-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[#00A859]">
          {storeSlug ? (
            <Link
              href={`/s/${storeSlug}/policies`}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Store Policies</span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setModalType("info")}
            className="hover:underline cursor-pointer"
          >
            Store info
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
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
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

              {storeSlug && (
                <div className="pt-1">
                  <Link
                    href={`/s/${storeSlug}/policies`}
                    onClick={() => setModalType(null)}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[#00A859] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Full Store Policies Page →</span>
                  </Link>
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
              className="w-full h-11 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200 cursor-pointer"
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
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
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
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-2xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
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
              className="w-full h-10 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
