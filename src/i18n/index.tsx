import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { usePersistentState } from '../lib/hooks';
import { en, type Messages } from './en';
import { es } from './es';

export const LOCALES = { en, es } satisfies Record<string, Messages>;
export type Locale = keyof typeof LOCALES;
export type { Messages };

function detectLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && value in LOCALES;
}

interface I18n {
  t: Messages;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [stored, setLocale] = usePersistentState<Locale>('moodcanvas.locale', detectLocale, isLocale);
  const value = useMemo(() => ({ t: LOCALES[stored], locale: stored, setLocale }), [stored, setLocale]);

  useEffect(() => {
    document.documentElement.lang = LOCALES[stored].htmlLang;
  }, [stored]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}

/** Suggested tags are stored by their English id and shown in the user's language. */
export function tagLabel(t: Messages, tag: string): string {
  return t.tags.suggested[tag] ?? tag;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, f);
  }
  return f;
}

export function formatDateTime(iso: string, locale: Locale): string {
  return formatter(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatWeekday(date: Date, locale: Locale, width: 'long' | 'short' = 'long'): string {
  return formatter(locale, { weekday: width }).format(date);
}

export function formatLongDate(date: Date, locale: Locale): string {
  return formatter(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}
