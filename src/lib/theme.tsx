import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { ColorScheme } from './emotions';
import { useMediaQuery, usePersistentState } from './hooks';

export const THEMES = ['system', 'light', 'dark', 'contrast'] as const;
export type Theme = (typeof THEMES)[number];

interface ThemeValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Which emotion palette to draw with. High contrast uses the light palette on a white surface. */
  scheme: ColorScheme;
  highContrast: boolean;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = usePersistentState<Theme>('moodcanvas.theme', 'system', isTheme);
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const scheme: ColorScheme = theme === 'dark' || (theme === 'system' && systemDark) ? 'dark' : 'light';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, scheme, highContrast: theme === 'contrast' }),
    [theme, setTheme, scheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}

export function useColorScheme(): ColorScheme {
  return useTheme().scheme;
}
