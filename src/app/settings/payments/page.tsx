"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Key,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";

interface PaymentConfig {
  publicKey: string;
  keyLast4: string;
  maskedSecretKey: string;
  ondarSubaccountCode: string;
  feeBearer: "MERCHANT" | "CUSTOMER";
  isLiveMode: boolean;
  isActive: boolean;
  updatedAt?: string;
}

export default function PaymentSettingsPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingFeeBearer, setIsUpdatingFeeBearer] = useState(false);
  const [hasKeys, setHasKeys] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [feeBearer, setFeeBearer] = useState<"MERCHANT" | "CUSTOMER">("MERCHANT");

  // Form inputs
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/paystack`
      : "https://ondar.ng/api/webhooks/paystack";

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/settings/payment-keys");
      const data = await res.json();
      if (res.ok && data.success) {
        setHasKeys(data.hasKeys);
        setConfig(data.config);
        if (data.config?.feeBearer) {
          setFeeBearer(data.config.feeBearer);
        }
      } else {
        setErrorMessage(data.error || "Failed to load payment settings.");
      }
    } catch {
      setErrorMessage("Network error loading payment settings.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateFeeBearer(newBearer: "MERCHANT" | "CUSTOMER") {
    setIsUpdatingFeeBearer(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/settings/payment-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeBearer: newBearer }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeeBearer(newBearer);
        setSuccessMessage(data.message || "Fee setting updated.");
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage(data.error || "Failed to update fee setting.");
      }
    } catch {
      setErrorMessage("Network error updating fee setting.");
    } finally {
      setIsUpdatingFeeBearer(false);
    }
  }

  async function handleSaveKeys(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!publicKey.trim() || !secretKey.trim()) {
      setErrorMessage("Please enter both your Paystack Public Key and Secret Key.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/payment-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey.trim(),
          secretKey: secretKey.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(data.message || "Payment keys saved successfully!");
        setHasKeys(true);
        setConfig(data.config);
        setPublicKey("");
        setSecretKey("");
      } else {
        setErrorMessage(data.error || "Failed to verify or save Paystack keys.");
      }
    } catch {
      setErrorMessage("Network error while connecting Paystack keys.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisconnectKeys() {
    if (
      !window.confirm(
        "Are you sure you want to disconnect your Paystack account? Your storefront will switch back to manual bank transfer orders until you reconnect."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/settings/payment-keys", {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Paystack disconnected. Store switched to bank transfer fallback.");
        setHasKeys(false);
        setConfig(null);
      } else {
        setErrorMessage(data.error || "Failed to disconnect Paystack keys.");
      }
    } catch {
      setErrorMessage("Network error while disconnecting.");
    } finally {
      setIsDeleting(false);
    }
  }

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="w-full max-w-[500px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-900">
            <CreditCard className="w-4 h-4 text-[#00A859]" />
            <span>Paystack Gateway Settings</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="w-full max-w-[500px] mx-auto px-4 pt-5 space-y-5">
        {/* Banner Explaining BYOK Model */}
        <div className="bg-[#E8F8EF] border border-[#A7F3D0] rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00A859] flex-shrink-0" />
            <h2 className="font-bold text-sm text-neutral-900">
              Direct Paystack Settlement (BYOK)
            </h2>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Connect your own Paystack account so payments settle directly into your bank
            account. Ondar acts as your checkout manager and takes an automatic 1% platform fee
            via Paystack split.
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-neutral-400 mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">Loading payment configuration...</p>
          </div>
        ) : hasKeys && config ? (
          /* ============================================================== */
          /* CONNECTED STATE */
          /* ============================================================== */
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Gateway Status</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {config.isLiveMode ? "Live Production Gateway" : "Test Sandbox Gateway"}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#E8F8EF] border border-[#A7F3D0] text-[#00A859] text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse" />
                  Active
                </span>
              </div>

              {/* Public Key Display */}
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Public Key
                </label>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-800 break-all select-all">
                  {config.publicKey}
                </div>
              </div>

              {/* Secret Key Display (Masked & Encrypted) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Secret Key (AES-256 Encrypted)</span>
                  </label>
                  <span className="text-[11px] text-[#00A859] font-semibold">Protected</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-700">
                  {config.maskedSecretKey}
                </div>
              </div>

              {/* Ondar Subaccount Code */}
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Ondar 1% Subaccount Code
                </label>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-700">
                  {config.ondarSubaccountCode}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Registered under your Paystack account. 99% settles to you, 1% software fee to Ondar.
                </p>
              </div>

              {/* Who Pays the Processing Fee (PAY-04 / 4.5) */}
              <div className="pt-2 border-t border-neutral-100 space-y-2.5">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Paystack Processing Fee
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Choose who absorbs the standard Paystack payment gateway fee.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateFeeBearer("MERCHANT")}
                    disabled={isUpdatingFeeBearer}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      feeBearer === "MERCHANT"
                        ? "border-[#00A859] bg-[#E8F8EF] text-[#00A859]"
                        : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                    }`}
                  >
                    <p className="text-xs font-bold">I pay (Default)</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                      You absorb the fee. Customer pays only goods + delivery.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateFeeBearer("CUSTOMER")}
                    disabled={isUpdatingFeeBearer}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      feeBearer === "CUSTOMER"
                        ? "border-[#00A859] bg-[#E8F8EF] text-[#00A859]"
                        : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                    }`}
                  >
                    <p className="text-xs font-bold">My customer pays</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                      Fee is calculated &amp; added transparently at checkout.
                    </p>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 italic">
                  Note: Ondar&apos;s 1% platform fee is always the vendor&apos;s cost and is never passed to customers.
                </p>
              </div>

              {/* Webhook Configuration Guide */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900">
                    Webhook URL (Copy to Paystack)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="text-xs font-bold text-[#00A859] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedWebhook ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-700 break-all">
                  {webhookUrl}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Go to{" "}
                  <a
                    href="https://dashboard.paystack.com/#/settings/developer"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00A859] underline font-semibold"
                  >
                    Paystack Settings &rarr; API Keys & Webhooks
                  </a>{" "}
                  and paste this URL into the <strong>Live Webhook URL</strong> field so order
                  payments automatically update.
                </p>
              </div>

              {/* Disconnect Action */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDisconnectKeys}
                  disabled={isDeleting}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? "Disconnecting..." : "Disconnect Paystack"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasKeys(false)}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Replace keys
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* FORM TO CONNECT KEYS */
          /* ============================================================== */
          <form
            onSubmit={handleSaveKeys}
            className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4"
          >
            <div>
              <h3 className="font-bold text-base text-neutral-900">
                Connect your Paystack Account
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Enter your Paystack API keys from your Paystack developer dashboard. Your keys
                are encrypted with AES-256-GCM.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                Paystack Public Key *
              </label>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-900 block mb-1.5">
                Paystack Secret Key *
              </label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00A859] bg-white"
                required
              />
              <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-neutral-400" />
                <span>Encrypted on submission. Never exposed to browser or third parties.</span>
              </p>
            </div>

            {/* Helper Steps */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
              <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-neutral-500" />
                <span>Where do I find my keys?</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-500 pl-0.5">
                <li>
                  Open your{" "}
                  <a
                    href="https://dashboard.paystack.com/#/settings/developer"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00A859] underline font-semibold inline-flex items-center gap-0.5"
                  >
                    <span>Paystack Dashboard</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>Go to <strong>Settings &rarr; API Keys & Webhooks</strong></li>
                <li>Copy your <strong>Public Key</strong> and <strong>Secret Key</strong></li>
                <li>Paste them above and tap Connect</li>
              </ol>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#00A859] hover:bg-[#008f4c] disabled:bg-neutral-300 text-white font-bold rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying with Paystack...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Verify &amp; Connect Paystack</span>
                </>
              )}
            </button>

            {/* Bank Transfer Fallback Note */}
            <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
              Don&apos;t have Paystack yet? No worries. Your store automatically accepts orders
              via <strong>Direct Bank Transfer</strong> so you can sell immediately.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
