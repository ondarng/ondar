/**
 * Phone number normalization and WhatsApp utility functions
 * Specifically tailored for Nigerian phone formats and international WhatsApp URLs.
 */

/**
 * Normalizes any raw phone input to a clean string of digits suitable for WhatsApp `wa.me/<number>`.
 * WhatsApp strictly requires country code without `+` or leading `0`.
 *
 * Examples:
 * - "0803 123 4567" -> "2348031234567"
 * - "+234 803 123 4567" -> "2348031234567"
 * - "23408031234567" -> "2348031234567"
 * - "803 123 4567" -> "2348031234567"
 * - "07012345678" -> "2347012345678"
 */
export function formatToWhatsappNumber(raw?: string | null): string {
  if (!raw) return "";

  // 1. Remove all non-digit characters
  let digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";

  // 2. Remove leading international double zero (e.g., "00234...")
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // 3. Handle Nigeria-specific prefixes
  // If it starts with 2340... (common mistake: prepending 234 while keeping the 0)
  if (digits.startsWith("2340") && digits.length >= 14) {
    digits = "234" + digits.slice(4);
  }

  // If starts with 0 and is an 11-digit Nigerian number (e.g., 080..., 070..., 090..., 081..., 091...)
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "234" + digits.slice(1);
  }

  // If it has 10 digits and starts with 7, 8, or 9 (Nigerian number without leading zero or country code)
  if (digits.length === 10 && /^[789]/.test(digits)) {
    digits = "234" + digits;
  }

  // If it already starts with 234 and has 13 digits (standard Nigerian international format)
  if (digits.startsWith("234") && digits.length === 13) {
    return digits;
  }

  // If it starts with a leading zero and wasn't caught above, strip it to avoid invalid wa.me country codes
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
    // If it's now 10 digits starting with 7, 8, 9 -> prepend 234
    if (digits.length === 10 && /^[789]/.test(digits)) {
      digits = "234" + digits;
    }
  }

  return digits;
}

/**
 * Cleanly formats a Nigerian or international phone number for visual presentation.
 * Returns "+234 803 123 4567" or similar.
 */
export function formatNigerianDisplayPhone(raw?: string | null): string {
  if (!raw) return "";
  const whatsappDigits = formatToWhatsappNumber(raw);
  if (!whatsappDigits) return raw;

  if (whatsappDigits.startsWith("234") && whatsappDigits.length === 13) {
    const subscriber = whatsappDigits.slice(3); // e.g., 8031234567
    return `+234 ${subscriber.slice(0, 3)} ${subscriber.slice(3, 6)} ${subscriber.slice(6)}`;
  }

  return `+${whatsappDigits}`;
}

/**
 * Validates and normalizes customer phone number at checkout.
 * Returns valid status, error message (if invalid), and normalized representations.
 */
export function validateAndNormalizeCustomerPhone(raw: string): {
  isValid: boolean;
  normalized: string; // "+234 803 123 4567" for display
  whatsappDigits: string; // "2348031234567" for WhatsApp links
  error?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalized: "",
      whatsappDigits: "",
      error: "Please enter your phone number.",
    };
  }

  const whatsapp = formatToWhatsappNumber(trimmed);

  // For Nigerian numbers, standard length is 13 digits starting with 234
  if (whatsapp.startsWith("234")) {
    if (whatsapp.length < 13) {
      return {
        isValid: false,
        normalized: "",
        whatsappDigits: whatsapp,
        error: "Phone number is too short. Please enter a valid 10 or 11-digit phone number.",
      };
    }
    if (whatsapp.length > 13) {
      return {
        isValid: false,
        normalized: "",
        whatsappDigits: whatsapp,
        error: "Phone number has too many digits. Please verify your number.",
      };
    }
    const display = formatNigerianDisplayPhone(whatsapp);
    return {
      isValid: true,
      normalized: display,
      whatsappDigits: whatsapp,
    };
  }

  // Non-Nigerian international numbers: require between 8 and 15 digits
  if (whatsapp.length >= 8 && whatsapp.length <= 15) {
    return {
      isValid: true,
      normalized: `+${whatsapp}`,
      whatsappDigits: whatsapp,
    };
  }

  return {
    isValid: false,
    normalized: "",
    whatsappDigits: whatsapp,
    error: "Please enter a valid phone number with your area or country code.",
  };
}

/**
 * Generates a full WhatsApp deep-link with pre-filled message text.
 */
export function getWhatsappChatUrl(phone?: string | null, message: string = ""): string {
  const cleanPhone = formatToWhatsappNumber(phone);
  if (!cleanPhone) return "#";
  if (!message) return `https://wa.me/${cleanPhone}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
