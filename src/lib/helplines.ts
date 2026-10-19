/**
 * Crisis support lines shown when someone may be in danger. Every line here is free, confidential and open
 * 24 hours. Verified October 2026; re-check numbers before each release, since services change.
 * Anywhere else, the banner links to findahelpline.com, which covers most countries.
 */
export interface Helpline {
  name: string;
  /** As people would write it locally. */
  phone: string;
  /** Number to put in tel: links. */
  dial: string;
  /** Number for sms: links, when the line also takes texts. */
  text?: string;
  textDisplay?: string;
  url?: string;
}

export interface CountrySupport {
  emergency: string;
  lines: Helpline[];
}

export const HELPLINES: Record<string, CountrySupport> = {
  IN: {
    emergency: '112',
    lines: [{ name: 'Tele-MANAS', phone: '14416', dial: '14416', url: 'https://telemanas.mohfw.gov.in/' }],
  },
  US: {
    emergency: '911',
    lines: [
      { name: '988 Suicide & Crisis Lifeline', phone: '988', dial: '988', text: '988', url: 'https://988lifeline.org/' },
    ],
  },
  CA: {
    emergency: '911',
    lines: [{ name: '9-8-8 Suicide Crisis Helpline', phone: '988', dial: '988', text: '988', url: 'https://988.ca/' }],
  },
  GB: {
    emergency: '999',
    lines: [{ name: 'Samaritans', phone: '116 123', dial: '116123', url: 'https://www.samaritans.org/' }],
  },
  IE: {
    emergency: '112',
    lines: [{ name: 'Samaritans', phone: '116 123', dial: '116123', url: 'https://www.samaritans.org/ireland/' }],
  },
  AU: {
    emergency: '000',
    lines: [
      {
        name: 'Lifeline',
        phone: '13 11 14',
        dial: '131114',
        text: '0477131114',
        textDisplay: '0477 13 11 14',
        url: 'https://www.lifeline.org.au/',
      },
    ],
  },
  ES: {
    emergency: '112',
    lines: [{ name: 'Línea 024', phone: '024', dial: '024' }],
  },
  MX: {
    emergency: '911',
    lines: [{ name: 'Línea de la Vida', phone: '800 911 2000', dial: '8009112000' }],
  },
};

// Time zones say more about where someone is than browser language: many people in India use en-US.
const ZONE_REGION: Record<string, string> = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Europe/London': 'GB',
  'Europe/Belfast': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Madrid': 'ES',
  'Atlantic/Canary': 'ES',
  'Africa/Ceuta': 'ES',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Regina': 'CA',
  'America/Halifax': 'CA',
  'America/St_Johns': 'CA',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Mexico_City': 'MX',
  'America/Monterrey': 'MX',
  'America/Merida': 'MX',
  'America/Cancun': 'MX',
  'America/Chihuahua': 'MX',
  'America/Mazatlan': 'MX',
  'America/Tijuana': 'MX',
};

/** Best guess at the user's country, or null when it isn't one we have lines for. */
export function detectRegion(
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  languages: readonly string[] = navigator.languages ?? [navigator.language],
): string | null {
  const fromZone = timeZone.startsWith('Australia/') ? 'AU' : ZONE_REGION[timeZone];
  if (fromZone) return fromZone;
  for (const language of languages) {
    try {
      const region = new Intl.Locale(language).region;
      if (region && region in HELPLINES) return region;
    } catch {
      // Ignore malformed language tags.
    }
  }
  return null;
}
