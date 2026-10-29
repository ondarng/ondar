"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Info, ArrowRight, Loader2 } from "lucide-react";

interface AbandonedReminderSettingsProps {
  initialEnabled?: boolean;
  businessName?: string;
}

export function AbandonedReminderSettings({
  initialEnabled = true,
  businessName = "Everyday Edit",
}: AbandonedReminderSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 text-neutral-900">
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <Link
          href="/orders"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-[14px] font-bold text-neutral-900">Checkout Reminders</span>
        <div className="w-9"></div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 py-4 space-y-4">
        {/* Main Setting Card */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
          <h2 className="text-[18px] font-bold text-neutral-900">A gentle nudge, once</h2>

          <div className="flex items-center justify-between pt-1">
            <div>
              <h3 className="text-[14px] font-bold text-neutral-900">Remind unpaid customers</h3>
              <p className="text-[11px] text-neutral-500">Storefront checkout only</p>
            </div>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                enabled ? "bg-[#00A859]" : "bg-neutral-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <p className="text-[12px] text-neutral-600 leading-relaxed pt-2 border-t border-neutral-100">
            Send one reminder about 20 minutes after an unpaid Storefront order is placed. The reminder includes a link to resume payment.
          </p>

          <p className="text-[11px] text-neutral-400 italic">
            Switch this off to stop automatic abandoned-checkout reminders.
          </p>
        </div>

        {/* Informational Callout */}
        <div className="bg-neutral-100/80 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
          <div className="text-[12px] leading-relaxed">
            <span className="font-bold text-neutral-900 block">No Custom Checkout reminders</span>
            <span className="text-neutral-600">
              Custom Checkout links never receive this automatic reminder. You can resend their link yourself from the order.
            </span>
          </div>
        </div>

        {/* Customer Message Preview Card */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
          <h3 className="text-[14px] font-bold text-neutral-900">Customer message preview</h3>

          <span className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-md text-[11px] font-medium">
            One reminder · unpaid Storefront
          </span>

          <p className="text-[13px] text-neutral-700 leading-relaxed pt-1">
            Hi! Your {businessName} order is waiting for payment. Pick up where you left off to complete your order.
          </p>

          <div className="pt-2">
            <button
              disabled
              className="w-full h-11 border border-neutral-200 text-[#00A859] rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-not-allowed bg-neutral-50"
            >
              <ArrowRight className="w-4 h-4" />
              Resume payment
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-2xl text-[14px] font-bold flex items-center justify-center transition-colors shadow-sm"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save preference"}
        </button>

        {/* Saved Feedback Preview */}
        {isSaved && (
          <div className="bg-[#EBF3EF] border border-[#C5DFD2] rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#00A859] shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-bold text-[#005c31] block">Preference saved</span>
              <span className="text-[#00703c]">
                {enabled
                  ? "Unpaid Storefront customers will receive one reminder, about 20 minutes after placing an order."
                  : "Reminder switched off. No automatic abandoned-checkout reminders will be sent."}
              </span>
            </div>
          </div>
        )}

        {!enabled && (
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-2">
            <h3 className="text-[14px] font-bold text-neutral-900">When switched off</h3>
            <p className="text-[12px] text-neutral-600 leading-relaxed italic">
              Saved feedback: “Reminder switched off. No automatic abandoned-checkout reminders will be sent.”
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
