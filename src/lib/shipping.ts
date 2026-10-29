export interface ShippingOverride {
  id: string;
  parentId: string;
  state: string;
  area: string;
  deliveryName: string;
  isFree: boolean;
  feeKobo: number;
  feeNaira: number;
  estimatedDelivery?: string | null;
}

export interface ShippingStateRate {
  id: string;
  state: string;
  deliveryName: string;
  isFree: boolean;
  feeKobo: number;
  feeNaira: number;
  estimatedDelivery?: string | null;
  overrides: ShippingOverride[];
}

export interface ShippingConfig {
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  businessLocation: {
    city: string;
    state: string;
    address?: string | null;
  };
  stateRates: ShippingStateRate[];
  coveragePreview: string;
}

export const POPULAR_STATE_AREAS: Record<string, string[]> = {
  Lagos: [
    "Ikeja",
    "Lekki Phase 1",
    "Victoria Island",
    "Ikoyi",
    "Yaba",
    "Surulere",
    "Maryland",
    "Gbagada",
    "Magodo",
    "Ajah",
    "Chevron",
    "Sangotedo",
    "Ikate",
    "Osapa London",
    "Oniru",
    "Marina / Lagos Island",
    "Opebi",
    "Allen Avenue",
    "Alausa",
    "Ogba",
    "Agege",
    "Festac",
    "Ogudu",
    "Anthony Village",
    "Ilupeju",
    "Oshodi",
    "Ikorodu",
    "Badagry",
    "Epe",
    "Egbeda",
    "Alimosho",
  ],
  "FCT - Abuja": [
    "Wuse 2",
    "Maitama",
    "Garki",
    "Asokoro",
    "Gwarinpa",
    "Jabi",
    "Utako",
    "Central Business District",
    "Guzape",
    "Lugbe",
    "Kubwa",
    "Apo",
    "Mabushi",
    "Lokogoma",
    "Life Camp",
  ],
  Rivers: [
    "Old GRA",
    "New GRA",
    "Peter Odili Road",
    "Trans Amadi",
    "D-Line",
    "Rumuola",
    "Ada George",
    "Woji",
    "Choba",
    "Eleme",
  ],
  Oyo: [
    "Bodija",
    "Ring Road",
    "Dugbe",
    "Jericho",
    "Oluyole",
    "Samonda",
    "Agodi GRA",
    "Akobo",
    "UI / Agbowo",
    "Iwo Road",
  ],
  Ogun: [
    "Abeokuta",
    "Sagamu",
    "Ijebu Ode",
    "Arepo",
    "Magboro",
    "Mowe / Ibafo",
    "Ota",
  ],
};

/**
 * Generates natural English summary for storefront coverage preview matching design screenshots:
 * e.g. "Delivery across Lagos. Free in Ikeja; fees apply in other areas. Free pickup in Ikeja, Lagos."
 */
export function generateCoveragePreview(
  deliveryEnabled: boolean,
  pickupEnabled: boolean,
  stateRates: ShippingStateRate[],
  city: string = "Ikeja",
  state: string = "Lagos"
): string {
  if (!deliveryEnabled && !pickupEnabled) {
    return "No delivery or pickup configured yet. Your storefront won't accept orders until a location is added.";
  }

  const parts: string[] = [];

  if (deliveryEnabled && stateRates.length > 0) {
    const stateNames = stateRates.map((s) => s.state);
    const stateSummary =
      stateNames.length === 1
        ? `Delivery across ${stateNames[0]}.`
        : `Delivery across ${stateNames.slice(0, 2).join(", ")}${stateNames.length > 2 ? ` and ${stateNames.length - 2} other states` : ""}.`;

    // Check free area overrides
    const freeAreas: string[] = [];
    stateRates.forEach((s) => {
      s.overrides.forEach((o) => {
        if (o.isFree) {
          freeAreas.push(o.area);
        }
      });
    });

    let overrideSentence = "";
    if (freeAreas.length > 0) {
      overrideSentence = ` Free in ${freeAreas.join(", ")}; fees apply in other areas.`;
    }

    parts.push(`${stateSummary}${overrideSentence}`);
  } else if (deliveryEnabled && stateRates.length === 0) {
    parts.push("Delivery is turned on, but no states have been added yet.");
  }

  if (pickupEnabled) {
    const pickupLocation = city && state ? `${city}, ${state}` : city || state || "store location";
    parts.push(`Free pickup in ${pickupLocation}.`);
  }

  return parts.join(" ") || "No delivery available yet.";
}
