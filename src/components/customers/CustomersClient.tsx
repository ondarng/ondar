"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";

export interface CustomerOrderSummary {
  id: string;
  orderNumber: number;
  orderStatus: string;
  paymentStatus: string;
  totalKobo: string;
  createdAt: string;
  deliveryType: string;
  deliveryArea: string | null;
  deliveryState: string | null;
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  totalSpentKobo: string;
  isRepeat: boolean;
  lastOrderAt: string;
  recentOrders: CustomerOrderSummary[];
}

interface CustomersClientProps {
  businessName: string;
  initialCustomers: CustomerItem[];
}

function formatNaira(koboStr: string | number): string {
  const kobo = typeof koboStr === "string" ? parseInt(koboStr, 10) : koboStr;
  if (isNaN(kobo)) return "₦0";
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getInitials(name: string): string {
  if (!name) return "CU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function cleanPhoneForWhatsApp(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export function CustomersClient({ businessName, initialCustomers }: CustomersClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return initialCustomers;
    const q = search.toLowerCase().trim();
    return initialCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [initialCustomers, search]);

  const repeatCount = useMemo(
    () => initialCustomers.filter((c) => c.isRepeat).length,
    [initialCustomers]
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] antialiased text-neutral-900 pb-28">
      <div className="w-full max-w-[440px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 mb-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/more"
              className="p-2 -ml-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-neutral-900 tracking-tight">Customers</h1>
              <p className="text-[11px] text-neutral-500 font-medium">
                {initialCustomers.length} total · {repeatCount} repeat buyers
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#00A859]/10 text-[#00A859] flex items-center justify-center font-bold text-xs">
            <Users className="w-4 h-4" />
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-9.5 pr-4 py-2.5 rounded-xl bg-white border border-neutral-200/90 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Customer List */}
        {filteredCustomers.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-8 text-center mt-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              {search ? "No matching customers" : "No customers yet"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-[260px] mx-auto leading-relaxed">
              {search
                ? `No buyers found matching "${search}". Try searching by phone or name.`
                : "Customer records are automatically created and tracked whenever someone places an order on your storefront."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => {
              const isExpanded = expandedCustomerId === customer.id;
              const waNumber = cleanPhoneForWhatsApp(customer.phone);
              const waMessage = encodeURIComponent(
                `Hello ${customer.name}, thank you for shopping with ${businessName}!`
              );
              const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

              return (
                <div
                  key={customer.id}
                  className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-2xs transition-all hover:border-neutral-300"
                >
                  {/* Card Header */}
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Initials Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-neutral-200/60">
                        {getInitials(customer.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {customer.name}
                          </p>
                          {customer.isRepeat && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F8EF] text-[#00A859]">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Repeat buyer</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-mono text-neutral-500 mt-0.5">
                          {customer.phone}
                        </p>

                        {customer.email && (
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp Click-to-Chat Button */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors flex-shrink-0 flex items-center justify-center"
                      title="Message customer on WhatsApp"
                      aria-label="Message customer on WhatsApp"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-[#25D366]" />
                    </a>
                  </div>

                  {/* Summary Bar */}
                  <div className="px-4 py-2.5 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-500">Total Spent: </span>
                      <span className="font-bold text-neutral-900">
                        {formatNaira(customer.totalSpentKobo)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">
                        {customer.totalOrders} {customer.totalOrders === 1 ? "order" : "orders"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedCustomerId(isExpanded ? null : customer.id)}
                        className="text-xs font-bold text-[#00A859] hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
                      >
                        <span>{isExpanded ? "Hide orders" : "View orders"}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Order History */}
                  {isExpanded && (
                    <div className="p-4 border-t border-neutral-100 bg-white space-y-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                        Order History
                      </p>
                      {customer.recentOrders.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic">No past orders found.</p>
                      ) : (
                        <div className="divide-y divide-neutral-100">
                          {customer.recentOrders.map((ord) => {
                            const isPaid = ord.paymentStatus === "PAID";
                            return (
                              <div
                                key={ord.id}
                                className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-neutral-900">
                                      #{ord.orderNumber}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                        isPaid
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-amber-50 text-amber-700 border border-amber-200"
                                      }`}
                                    >
                                      {ord.paymentStatus}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-400 mt-0.5">
                                    {new Date(ord.createdAt).toLocaleDateString("en-NG", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}{" "}
                                    · {ord.deliveryType}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="font-bold text-neutral-900">
                                    {formatNaira(ord.totalKobo)}
                                  </p>
                                  <Link
                                    href={`/orders?search=${ord.orderNumber}`}
                                    className="text-[10px] font-semibold text-[#00A859] hover:underline"
                                  >
                                    View order &rarr;
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MerchantBottomNav active="more" />
    </div>
  );
}
