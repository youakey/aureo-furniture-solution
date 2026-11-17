/** US ZIP: 5 digits or ZIP+4 (12345-6789). */

export function parseUsZipDigits(input) {
  return String(input || "").replace(/\D/g, "").slice(0, 9);
}

export function formatUsZip(digits) {
  const normalized = String(digits || "").slice(0, 9);
  if (normalized.length <= 5) return normalized;
  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
}

export function isValidUsZip(input) {
  const digits = parseUsZipDigits(input);
  return digits.length === 5 || digits.length === 9;
}

export function usZipValidationError(input) {
  const digits = parseUsZipDigits(input);
  if (digits.length === 0) return "ZIP code is required.";
  if (digits.length < 5) return `Enter at least 5 digits (${digits.length}/5).`;
  if (digits.length > 5 && digits.length < 9) return "ZIP+4 needs 4 digits after the hyphen (12345-6789).";
  return null;
}

export function handleUsZipInputChange(raw) {
  return formatUsZip(parseUsZipDigits(raw));
}

/** Stored value: 12345 or 12345-6789 */
export function normalizeUsZip(input) {
  if (!isValidUsZip(input)) return null;
  return formatUsZip(parseUsZipDigits(input));
}
