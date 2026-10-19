import { describe, expect, it } from 'vitest';
import { detectRegion, HELPLINES } from './helplines';

describe('detectRegion', () => {
  it('prefers the time zone over the browser language', () => {
    expect(detectRegion('Asia/Kolkata', ['en-US'])).toBe('IN');
    expect(detectRegion('America/Toronto', ['en-US'])).toBe('CA');
    expect(detectRegion('Australia/Sydney', ['en-GB'])).toBe('AU');
  });

  it('falls back to the language region', () => {
    expect(detectRegion('UTC', ['fr-FR', 'es-MX'])).toBe('MX');
  });

  it('returns null when nothing matches', () => {
    expect(detectRegion('Europe/Paris', ['fr-FR', 'en'])).toBeNull();
    expect(detectRegion('UTC', ['not a tag'])).toBeNull();
  });
});

describe('helplines', () => {
  it('has a dialable number and an emergency number for every country', () => {
    for (const [region, support] of Object.entries(HELPLINES)) {
      expect(support.emergency, region).toMatch(/^\d+$/);
      for (const line of support.lines) {
        expect(line.dial, line.name).toMatch(/^\d+$/);
        expect(line.phone.replace(/\s/g, ''), line.name).toBe(line.dial);
      }
    }
  });
});
