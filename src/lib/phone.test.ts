import { describe, expect, it } from 'vitest';
import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('keeps numbers typed with a country code, dropping spaces and dashes', () => {
    expect(normalizePhone('+91 98765 43210')).toBe('+919876543210');
    expect(normalizePhone('+1 (415) 555-0123')).toBe('+14155550123');
    expect(normalizePhone('0044 7700 900123')).toBe('+447700900123');
  });

  it('treats a bare Indian mobile number as +91', () => {
    expect(normalizePhone('9876543210')).toBe('+919876543210');
    expect(normalizePhone('09876543210')).toBe('+919876543210');
  });

  it('rejects what can’t be a mobile number', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone('+0 123 456 789')).toBeNull();
    expect(normalizePhone('5551234567')).toBeNull();
  });
});
