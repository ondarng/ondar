"use client";

import { useEffect, useRef } from "react";

interface StorefrontBeaconProps {
  slug: string;
}

export function StorefrontBeacon({ slug }: StorefrontBeaconProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    try {
      // 1. Get or create persistent anonymous visitor ID
      const STORAGE_KEY = "ondar_vid_v1";
      let visitorId = "";
      try {
        visitorId = localStorage.getItem(STORAGE_KEY) || "";
        if (!visitorId) {
          visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem(STORAGE_KEY, visitorId);
        }
      } catch {
        visitorId = `v_temp_${Math.random().toString(36).substring(2, 9)}`;
      }

      // 2. Identify referrer
      const rawReferrer = typeof document !== "undefined" ? document.referrer : "";
      const path = typeof window !== "undefined" ? window.location.pathname : "/";

      // 3. Dispatch beacon non-blockingly
      const payload = JSON.stringify({
        merchantSlug: slug,
        path,
        referrer: rawReferrer,
        visitorId,
      });

      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([payload], { type: "application/json" });
        const queued = navigator.sendBeacon("/api/analytics/track", blob);
        if (queued) return;
      }

      // Fallback to fetch with keepalive
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently catch tracking errors to protect user experience
      });
    } catch {
      // Silently catch tracking errors
    }
  }, [slug]);

  return null;
}
