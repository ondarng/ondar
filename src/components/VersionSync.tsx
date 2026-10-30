"use client";

import { useEffect } from "react";

export function VersionSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Unregister any stale legacy service workers
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
    }

    // Function to check if server has updated
    const checkVersion = async () => {
      try {
        const res = await fetch(`/api/version?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return;
        const data = await res.json();
        const serverVersion = data?.version;
        if (!serverVersion) return;

        const currentVersion = sessionStorage.getItem("ondar_app_version");
        if (!currentVersion) {
          sessionStorage.setItem("ondar_app_version", serverVersion);
          return;
        }

        if (currentVersion !== serverVersion) {
          console.log("[Ondar] New deployment detected, executing hard refresh:", serverVersion);
          sessionStorage.setItem("ondar_app_version", serverVersion);

          // Clear cache storage if available
          if ("caches" in window) {
            try {
              const names = await caches.keys();
              await Promise.all(names.map((name) => caches.delete(name)));
            } catch {
              // Ignore cache deletion errors
            }
          }

          // Hard reload with cache bypass
          window.location.reload();
        }
      } catch {
        // Network errors silently ignored
      }
    };

    // Check on initial load
    checkVersion();

    // Check whenever tab regains focus or visibility
    const handleSync = () => {
      checkVersion();
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    // Periodic check every 30 seconds
    const interval = setInterval(checkVersion, 30000);

    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
      clearInterval(interval);
    };
  }, []);

  return null;
}
