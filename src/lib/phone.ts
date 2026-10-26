/**
 * Turns a typed mobile number into the international form SMS services need (+ and digits only), or null when it
 * can't be one. Most people here are in India, so a bare 10-digit number (or one starting with 0) gets +91.
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  let digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    // E.164: a country code and number, 8 to 15 digits in all.
  } else if (trimmed.startsWith('00')) {
    digits = digits.slice(2);
  } else if (/^0?[6-9]\d{9}$/.test(digits)) {
    digits = '91' + digits.slice(-10);
  } else {
    return null;
  }
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
}
