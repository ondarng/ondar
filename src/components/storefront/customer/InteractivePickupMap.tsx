"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  LocateFixed,
  ShieldCheck,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { getStateData } from "@/lib/nigeriaData";

interface InteractivePickupMapProps {
  businessName: string;
  city: string;
  state: string;
  pickupAddress?: string | null;
  pickupInstructions?: string | null;
  onCustomerLocationChange?: (loc: { lat: number; lng: number }) => void;
}

// Calculate distance between two points in km (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function InteractivePickupMap({
  businessName,
  city,
  state,
  pickupAddress,
  pickupInstructions,
  onCustomerLocationChange,
}: InteractivePickupMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [locationSource, setLocationSource] = useState<"detected" | "manual" | "default">("default");

  // Determine store coordinates from state data or Lagos defaults
  const stateInfo = getStateData(state) || getStateData("Lagos");
  const storeLat = city.toLowerCase().includes("ikeja")
    ? 6.5954
    : city.toLowerCase().includes("lekki")
    ? 6.4474
    : city.toLowerCase().includes("abuja") || state.toLowerCase().includes("abuja")
    ? 9.0765
    : stateInfo?.lat || 6.5244;
  const storeLng = city.toLowerCase().includes("ikeja")
    ? 3.3364
    : city.toLowerCase().includes("lekki")
    ? 3.4723
    : city.toLowerCase().includes("abuja") || state.toLowerCase().includes("abuja")
    ? 7.3986
    : stateInfo?.lng || 3.3792;

  // Initialize customer location slightly offset initially
  const [customerPos, setCustomerPos] = useState<{ lat: number; lng: number }>({
    lat: storeLat - 0.015,
    lng: storeLng + 0.012,
  });

  useEffect(() => {
    const dist = calculateDistance(
      customerPos.lat,
      customerPos.lng,
      storeLat,
      storeLng
    );
    setDistanceKm(dist);
  }, [customerPos, storeLat, storeLng]);

  // Leaflet initialization on client
  useEffect(() => {
    let isMounted = true;

    async function initLeafletMap() {
      if (!mapContainerRef.current) return;
      if (typeof window === "undefined") return;

      const L = await import("leaflet");

      // Inject Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Cleanup prior map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [(storeLat + customerPos.lat) / 2, (storeLng + customerPos.lng) / 2],
        zoom: 13,
        zoomControl: false,
      });
      mapInstanceRef.current = map;

      // Add clean CartoDB / OSM tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Store marker (Green pin with Store Badge)
      const storeHtml = `
        <div style="
          background-color: #00A859;
          color: white;
          padding: 8px 12px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(0,168,89,0.35);
          border: 2px solid white;
          white-space: nowrap;
          transform: translate(-50%, -100%);
        ">
          <span>🏪 ${businessName} Pickup</span>
        </div>
      `;

      const storeIcon = L.divIcon({
        className: "custom-store-pin",
        html: storeHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([storeLat, storeLng], { icon: storeIcon })
        .addTo(map)
        .bindPopup(`<b>${businessName} Pickup Point</b><br/>${city}, ${state}`);

      // Customer marker (Interactive Draggable Blue Pin)
      const customerHtml = `
        <div style="
          background-color: #2563EB;
          color: white;
          padding: 6px 10px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.4);
          border: 2px solid white;
          cursor: grab;
          white-space: nowrap;
          transform: translate(-50%, -100%);
        ">
          <span>📍 Your Location (Move me)</span>
        </div>
      `;

      const customerIcon = L.divIcon({
        className: "custom-customer-pin",
        html: customerHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const customerMarker = L.marker([customerPos.lat, customerPos.lng], {
        icon: customerIcon,
        draggable: true,
      }).addTo(map);

      customerMarkerRef.current = customerMarker;

      // Handle drag
      customerMarker.on("dragend", function (e: any) {
        const newPos = e.target.getLatLng();
        setCustomerPos({ lat: newPos.lat, lng: newPos.lng });
        setLocationSource("manual");
        if (onCustomerLocationChange) {
          onCustomerLocationChange({ lat: newPos.lat, lng: newPos.lng });
        }
      });
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [storeLat, storeLng, businessName, city, state]);

  // Request browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCustomerPos({ lat: userLat, lng: userLng });
        setLocationSource("detected");
        setIsLocating(false);

        if (customerMarkerRef.current) {
          customerMarkerRef.current.setLatLng([userLat, userLng]);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([(storeLat + userLat) / 2, (storeLng + userLng) / 2], 13);
        }
        if (onCustomerLocationChange) {
          onCustomerLocationChange({ lat: userLat, lng: userLng });
        }
      },
      () => {
        setIsLocating(false);
        alert("Please enable location permissions in your browser to detect your current position.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${businessName}, ${city}, ${state}, Nigeria`
  )}`;

  return (
    <div className="space-y-3">
      {/* Map Card */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-xs">
        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className={`w-full transition-all duration-300 ${
            isExpanded ? "h-[360px]" : "h-[220px]"
          }`}
        />

        {/* Floating Top Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-[400]">
          <span className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs text-xs font-bold text-neutral-800 border border-neutral-100">
            <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse" />
            <span>Pickup Hub · {city}</span>
          </span>

          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="p-2 rounded-full bg-white/95 backdrop-blur-md shadow-xs text-neutral-700 hover:text-[#00A859] border border-neutral-100 cursor-pointer transition-colors"
              title="Locate me"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? "animate-spin text-[#00A859]" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full bg-white/95 backdrop-blur-md shadow-xs text-neutral-700 hover:text-neutral-900 border border-neutral-100 cursor-pointer transition-colors"
              title={isExpanded ? "Minimize map" : "Expand map"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Bottom Pin Instruction Pill */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-[400]">
          <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-md flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>👉</span>
              <span>
                {locationSource === "detected"
                  ? "Current location detected! Drag pin if you want to adjust"
                  : "Drag the blue pin to set your exact location"}
              </span>
            </span>
            {distanceKm !== null && (
              <span className="font-bold text-[#34D399] ml-2 flex-shrink-0">
                ~{distanceKm} km
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Distance & Directions Snapshot Card */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Store location
              </span>
              <span className="text-[10px] font-extrabold text-[#00A859] bg-[#E8F8EF] px-2 py-0.5 rounded-full">
                Free pickup
              </span>
            </div>
            <h4 className="text-sm font-black text-neutral-900">
              {businessName} Pickup Point
            </h4>
            <p className="text-xs text-neutral-600 font-medium mt-0.5">
              {city}, {state}
            </p>
          </div>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition-colors cursor-pointer flex-shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-[#00A859]" />
            <span>Directions</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>

        {/* Safe Address Reveal Guarantee */}
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#00A859] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-600 leading-snug">
            <p className="font-bold text-neutral-800">
              Exact street address revealed after payment
            </p>
            <p className="mt-0.5 text-neutral-500">
              {pickupInstructions ||
                "You will receive the complete street address and pickup instructions on your confirmation page and via WhatsApp."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
