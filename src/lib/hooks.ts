import { useCallback, useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * A per-device preference kept in localStorage as JSON. Falls back to memory
 * when storage is blocked, and to `initial` when the stored value is invalid.
 */
export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
  isValid: (value: unknown) => value is T = (value): value is T => value !== undefined,
) {
  const [value, setValue] = useState<T>(() => {
    const fallback = initial instanceof Function ? initial() : initial;
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return fallback;
      const parsed: unknown = JSON.parse(stored);
      return isValid(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  });
  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage unavailable (private mode, blocked site data); keep the in-memory value.
      }
    },
    [key],
  );
  return [value, update] as const;
}

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export function usePersistentFlag(key: string, initial: boolean) {
  return usePersistentState(key, initial, isBoolean);
}
