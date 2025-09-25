/**
 * Phone Authentication Utilities
 * Utility functions for phone number handling and validation
 */

/**
 * Validate phone number format
 * Accepts international format with country code
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return false;
  }

  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // Check if it starts with + and has 10-15 digits after country code
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Format phone number for consistent storage and display
 * Removes all formatting characters except digits and +
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return "";
  }

  // Remove all non-digit characters except +
  return phoneNumber.replace(/[^\d+]/g, "");
};

/**
 * Auto-format phone number as user types
 * Ensures proper country code formatting
 * @param {string} input - User input
 * @returns {string} - Formatted input
 */
export const autoFormatPhoneInput = (input) => {
  if (!input) return "";

  // Remove all non-digit characters except +
  let cleaned = input.replace(/[^\d+]/g, "");

  // Ensure it starts with + if it contains digits
  if (cleaned && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
};

/**
 * Get country code from phone number
 * @param {string} phoneNumber - Full phone number with country code
 * @returns {string} - Country code (e.g., '+1', '+44')
 */
export const getCountryCode = (phoneNumber) => {
  if (!validatePhoneNumber(phoneNumber)) {
    return "";
  }

  const cleaned = formatPhoneNumber(phoneNumber);

  // Common country code patterns
  if (cleaned.startsWith("+1")) return "+1";
  if (cleaned.startsWith("+44")) return "+44";
  if (cleaned.startsWith("+91")) return "+91";
  if (cleaned.startsWith("+33")) return "+33";
  if (cleaned.startsWith("+49")) return "+49";
  if (cleaned.startsWith("+86")) return "+86";
  if (cleaned.startsWith("+81")) return "+81";
  if (cleaned.startsWith("+82")) return "+82";

  // Extract country code (1-4 digits after +)
  const match = cleaned.match(/^\+(\d{1,4})/);
  return match ? `+${match[1]}` : "";
};

/**
 * Get phone number without country code
 * @param {string} phoneNumber - Full phone number with country code
 * @returns {string} - Phone number without country code
 */
export const getPhoneWithoutCountryCode = (phoneNumber) => {
  if (!validatePhoneNumber(phoneNumber)) {
    return "";
  }

  const countryCode = getCountryCode(phoneNumber);
  const cleaned = formatPhoneNumber(phoneNumber);

  return cleaned.replace(countryCode, "");
};

/**
 * Display formatted phone number for UI
 * @param {string} phoneNumber - Phone number to display
 * @returns {string} - User-friendly formatted phone number
 */
export const displayPhoneNumber = (phoneNumber) => {
  if (!validatePhoneNumber(phoneNumber)) {
    return phoneNumber;
  }

  const cleaned = formatPhoneNumber(phoneNumber);

  // Format common country codes for better readability
  if (cleaned.startsWith("+1")) {
    // US/Canada format: +1 (234) 567-8900
    const digits = cleaned.slice(2);
    if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
        6
      )}`;
    }
  }

  if (cleaned.startsWith("+44")) {
    // UK format: +44 20 7946 0958
    const digits = cleaned.slice(3);
    if (digits.length >= 10) {
      return `+44 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(
        6
      )}`;
    }
  }

  if (cleaned.startsWith("+91")) {
    // India format: +91 98765 43210
    const digits = cleaned.slice(3);
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
  }

  // Default format: +CC XXXXXXXXXX
  const countryCode = getCountryCode(cleaned);
  const number = getPhoneWithoutCountryCode(cleaned);

  if (number.length >= 4) {
    return `${countryCode} ${number.slice(0, -4)} ${number.slice(-4)}`;
  }

  return cleaned;
};

/**
 * Mask phone number for privacy
 * Shows only country code and last 4 digits
 * @param {string} phoneNumber - Phone number to mask
 * @returns {string} - Masked phone number
 */
export const maskPhoneNumber = (phoneNumber) => {
  if (!validatePhoneNumber(phoneNumber)) {
    return phoneNumber;
  }

  const countryCode = getCountryCode(phoneNumber);
  const number = getPhoneWithoutCountryCode(phoneNumber);

  if (number.length <= 4) {
    return phoneNumber;
  }

  const maskedDigits = "*".repeat(number.length - 4);
  const lastFour = number.slice(-4);

  return `${countryCode} ${maskedDigits}${lastFour}`;
};

/**
 * Get phone number validation error message
 * @param {string} phoneNumber - Phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
export const getPhoneValidationError = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === "") {
    return "Phone number is required";
  }

  if (!phoneNumber.startsWith("+")) {
    return "Phone number must include country code (e.g., +1234567890)";
  }

  const cleaned = formatPhoneNumber(phoneNumber);

  if (cleaned.length < 8) {
    return "Phone number is too short";
  }

  if (cleaned.length > 16) {
    return "Phone number is too long";
  }

  if (!validatePhoneNumber(cleaned)) {
    return "Please enter a valid phone number with country code";
  }

  return null;
};

/**
 * Common country codes and their details
 */
export const COUNTRY_CODES = {
  "+1": { name: "US/Canada", flag: "🇺🇸", example: "+1 234 567 8900" },
  "+44": { name: "United Kingdom", flag: "🇬🇧", example: "+44 20 7946 0958" },
  "+91": { name: "India", flag: "🇮🇳", example: "+91 98765 43210" },
  "+33": { name: "France", flag: "🇫🇷", example: "+33 1 42 68 53 00" },
  "+49": { name: "Germany", flag: "🇩🇪", example: "+49 30 12345678" },
  "+86": { name: "China", flag: "🇨🇳", example: "+86 138 0013 8000" },
  "+81": { name: "Japan", flag: "🇯🇵", example: "+81 90 1234 5678" },
  "+82": { name: "South Korea", flag: "🇰🇷", example: "+82 10 1234 5678" },
  "+61": { name: "Australia", flag: "🇦🇺", example: "+61 4 1234 5678" },
  "+55": { name: "Brazil", flag: "🇧🇷", example: "+55 11 9 1234 5678" },
};

/**
 * Get example phone number for a country code
 * @param {string} countryCode - Country code (e.g., '+1')
 * @returns {string} - Example phone number
 */
export const getExamplePhoneNumber = (countryCode) => {
  const country = COUNTRY_CODES[countryCode];
  return country ? country.example : "+1 234 567 8900";
};

/**
 * Detect country code from partial input
 * @param {string} input - Partial phone number input
 * @returns {string|null} - Detected country code or null
 */
export const detectCountryCode = (input) => {
  if (!input || !input.startsWith("+")) {
    return null;
  }

  const cleaned = input.replace(/[^\d+]/g, "");

  // Sort by length (longest first) to match longer codes first
  const codes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);

  for (const code of codes) {
    if (cleaned.startsWith(code)) {
      return code;
    }
  }

  return null;
};
