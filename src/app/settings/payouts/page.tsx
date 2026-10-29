"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Search,
} from "lucide-react";

interface Bank {
  id: number;
  name: string;
  code: string;
}

interface CurrentAccount {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
}

export default function PayoutSettingsPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState<CurrentAccount | null>(null);

  // Bank list
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankPickerOpen, setIsBankPickerOpen] = useState(false);

  // Form inputs
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [isNameResolved, setIsNameResolved] = useState(false);

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch current account and bank list on load
  useEffect(() => {
    async function loadData() {
      try {
        const [accRes, banksRes] = await Promise.all([
          fetch("/api/settings/payouts"),
          fetch("/api/banks"),
        ]);

        if (accRes.ok) {
          const accData = await accRes.json();
          if (accData.payoutAccount) {
            setCurrentAccount(accData.payoutAccount);
            setAccountNumber(accData.payoutAccount.accountNumber || "");
            setAccountName(accData.payoutAccount.accountName || "");
            setIsNameResolved(true);
          }
        }

        if (banksRes.ok) {
          const bData = await banksRes.json();
          if (Array.isArray(bData.banks)) {
            setBanks(bData.banks);
          }
        }
      } catch (err) {
        console.error("Failed to load payout settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // When banks list loads and we have a current account, match the bank
  useEffect(() => {
    if (banks.length > 0 && currentAccount && !selectedBank) {
      const match =
        banks.find((b) => b.code === currentAccount.bankCode) ||
        banks.find((b) => b.name.toLowerCase() === currentAccount.bankName.toLowerCase());
      if (match) {
        setSelectedBank(match);
      }
    }
  }, [banks, currentAccount, selectedBank]);

  // Handle bank resolution when 10 digits entered or verify clicked
  const handleResolveAccount = async (acct: string, bank: Bank) => {
    if (acct.length !== 10) return;
    setIsResolving(true);
    setResolveError(null);
    setIsNameResolved(false);

    try {
      const res = await fetch("/api/banks/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: acct,
          bankCode: bank.code,
        }),
      });

      const data = await res.json();
      if (res.ok && data.accountName) {
        setAccountName(data.accountName);
        setIsNameResolved(true);
      } else {
        setResolveError(
          data.error || "Could not resolve bank account. Please check the details."
        );
      }
    } catch {
      setResolveError("Network error verifying account with Paystack.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleAccountChange = (val: string) => {
    const digitsOnly = val.replace(/[^0-9]/g, "").slice(0, 10);
    setAccountNumber(digitsOnly);
    setIsNameResolved(false);
    setResolveError(null);
    setSaveSuccess(false);

    if (digitsOnly.length === 10 && selectedBank) {
      handleResolveAccount(digitsOnly, selectedBank);
    }
  };

  const handleSelectBank = (b: Bank) => {
    setSelectedBank(b);
    setIsBankPickerOpen(false);
    setIsNameResolved(false);
    setResolveError(null);
    setSaveSuccess(false);

    if (accountNumber.length === 10) {
      handleResolveAccount(accountNumber, b);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) {
      setSaveError("Please select your bank.");
      return;
    }
    if (accountNumber.length !== 10) {
      setSaveError("Account number must be 10 digits.");
      return;
    }
    if (!accountName.trim()) {
      setSaveError("Account name must be verified before saving.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: selectedBank.name,
          bankCode: selectedBank.code,
          accountNumber,
          accountName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.payoutAccount) {
        setCurrentAccount(data.payoutAccount);
        setSaveSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setSaveError(data.error || "Failed to save bank account.");
      }
    } catch {
      setSaveError("Network error saving bank account.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-neutral-900 pb-20">
      <div className="max-w-[480px] mx-auto px-4 pt-6">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/more"
            className="w-9 h-9 rounded-xl border border-neutral-200 bg-white flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-sm font-black text-neutral-900 tracking-tight">
            Bank Account & Payouts
          </h1>
          <div className="w-9" />
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-neutral-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#00A859]" />
            <p className="text-xs font-medium">Loading bank details...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active Account Status Card */}
            {currentAccount && currentAccount.accountNumber ? (
              <div className="p-4 rounded-2xl bg-white border border-[#00A859]/30 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F8EF] text-[#00A859] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">Verified Settlement Account</p>
                      <p className="text-sm font-extrabold text-neutral-900 mt-0.5">
                        {currentAccount.bankName}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00A859] bg-[#E8F8EF] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Account Name</span>
                    <span className="font-bold text-neutral-800">{currentAccount.accountName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 block text-[10px]">Account Number</span>
                    <span className="font-mono font-bold text-neutral-900 tracking-wider">
                      {currentAccount.accountNumber}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <div className="flex gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">No settlement bank added</p>
                    <p className="mt-0.5 text-amber-700 leading-relaxed">
                      Add your Nigerian bank account below so customers can pay via bank transfer and you receive your sales settlement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSave} className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <ShieldCheck className="w-4 h-4 text-[#00A859]" />
                <h2 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                  {currentAccount ? "Update Bank Account" : "Add Bank Account"}
                </h2>
              </div>

              {/* 1. Bank Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Select Nigerian Bank
                </label>
                <button
                  type="button"
                  onClick={() => setIsBankPickerOpen(true)}
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 flex items-center justify-between text-left text-xs transition-colors cursor-pointer"
                >
                  <span className={selectedBank ? "font-bold text-neutral-900" : "text-neutral-400"}>
                    {selectedBank ? selectedBank.name : "Choose a bank..."}
                  </span>
                  <Building2 className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {/* 2. Account Number */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Account Number (10 digits)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    placeholder="0123456789"
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono font-bold tracking-wider text-neutral-900 focus:outline-none focus:border-[#00A859] transition-colors"
                  />
                  {isResolving && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-neutral-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A859]" />
                      <span className="text-[11px]">Verifying...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Verified Account Name Preview */}
              {isNameResolved && accountName && (
                <div className="p-3 rounded-xl bg-[#E8F8EF] border border-[#00A859]/30 text-xs">
                  <span className="text-[10px] font-bold text-[#00A859] uppercase block tracking-wider">
                    Verified Account Name
                  </span>
                  <p className="font-extrabold text-neutral-900 text-sm mt-0.5">
                    {accountName}
                  </p>
                </div>
              )}

              {/* Error messages */}
              {resolveError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{resolveError}</span>
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-[#E8F8EF] border border-[#00A859]/30 text-[#00A859] text-xs font-bold flex gap-2 items-center">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Bank account saved and verified successfully!</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving || isResolving || !isNameResolved}
                className="w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00924c] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Account...</span>
                  </>
                ) : (
                  <span>Save Bank Account</span>
                )}
              </button>
            </form>

            {/* Bottom link: Back to Home */}
            <div className="pt-4 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}

        {/* Bank Picker Modal */}
        {isBankPickerOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-2xl max-h-[80vh] flex flex-col p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                  Select Your Bank
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBankPickerOpen(false)}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-700"
                >
                  Close
                </button>
              </div>

              {/* Search in Modal */}
              <div className="relative my-3">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Search bank name..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#00A859]"
                />
              </div>

              {/* Bank List */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredBanks.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => handleSelectBank(b)}
                    className="w-full p-3 rounded-xl text-left text-xs font-bold text-neutral-800 hover:bg-[#E8F8EF] hover:text-[#00A859] transition-colors flex items-center justify-between"
                  >
                    <span>{b.name}</span>
                    {selectedBank?.code === b.code && (
                      <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
