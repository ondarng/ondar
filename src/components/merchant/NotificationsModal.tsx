"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  AlertTriangle,
  AlertCircle,
  Package,
  ShoppingBag,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export interface MerchantAlert {
  id: string;
  type: "order_to_fulfil" | "bank_transfer_pending" | "flag" | "low_stock" | "system";
  title: string;
  description: string;
  timestamp: string;
  link: string;
  severity: "info" | "warning" | "danger" | "success";
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [alerts, setAlerts] = useState<MerchantAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
        }
      })
      .catch((err) => console.error("Error loading notifications:", err))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E8F8EF] text-[#00A859] flex items-center justify-center">
              <Bell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900 tracking-tight">
                Store Alerts
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                {alerts.length} action items
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 my-1 pr-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#00A859]" />
              <p className="text-xs">Checking store alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2.5 text-neutral-400">
                <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-xs font-bold text-neutral-900">All caught up!</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                No orders need attention and stock levels look good.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isDanger = alert.severity === "danger";
              const isWarning = alert.severity === "warning";
              const isSuccess = alert.severity === "success";

              const badgeBg = isDanger
                ? "bg-red-50 border-red-200 text-red-700"
                : isWarning
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : isSuccess
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-blue-50 border-blue-200 text-blue-700";

              return (
                <Link
                  key={alert.id}
                  href={alert.link}
                  onClick={onClose}
                  className={`block p-3 rounded-2xl border transition-all hover:scale-[1.01] ${badgeBg}`}
                >
                  <div className="flex items-start gap-2.5">
                    {isDanger ? (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    ) : isSuccess ? (
                      <ShoppingBag className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Package className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-900 leading-snug">
                        {alert.title}
                      </p>
                      <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[10px] text-neutral-400">
                        <span>
                          {new Date(alert.timestamp).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="font-bold text-neutral-800 flex items-center gap-0.5">
                          <span>Take action</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
