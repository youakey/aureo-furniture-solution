/** US phone helpers — country code +1, 10-digit national number. */

export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Normalize to 10 national digits (strips leading US country code 1 when present). */
export function parseUsNationalDigits(input) {
  let digits = digitsOnly(input);
  if (digits.length === 0) return "";
  // A leading 1 counts as +1 only when the full number includes it (11 digits).
  if (digits.length >= 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/** Display mask: (943) 238-9384 */
export function formatUsPhoneDisplay(nationalDigits) {
  const digits = String(nationalDigits || "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** E.164: +19432389384 */
export function toUsE164(input) {
  const national = parseUsNationalDigits(input);
  return national.length === 10 ? `+1${national}` : null;
}

export function isValidUsPhone(input) {
  return parseUsNationalDigits(input).length === 10;
}

export function usPhoneValidationError(input) {
  const raw = digitsOnly(input);
  const national = parseUsNationalDigits(input);
  if (national.length === 0) return "Phone number is required.";
  if (raw.length > 11) return "US phone numbers have 10 digits after +1.";
  if (raw.length === 11 && !raw.startsWith("1")) return "Enter a valid 10-digit US phone number.";
  if (national.length < 10) return `Enter all 10 digits (${national.length}/10).`;
  return null;
}

export function handleUsPhoneInputChange(raw) {
  return formatUsPhoneDisplay(parseUsNationalDigits(raw));
}
