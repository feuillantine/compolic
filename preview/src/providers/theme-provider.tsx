import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export const ThemeProvider = ({
  children,
  defaultTheme = 'light',
  storageKey = 'compolic-preview-theme',
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored === 'dark' || stored === 'light' ? stored : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const applyTheme = useCallback((value: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(value);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  const setTheme = useCallback(
    (value: Theme) => {
      const next = value === 'dark' ? 'dark' : 'light';
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, next);
        }
      } catch {
        // 個人用ツールのため、localStorage未対応環境は無視
      }
      setThemeState(next);
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const contextValue = useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeProviderContext.Provider value={contextValue}>{children}</ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error('useThemeはThemeProvider内でのみ使用してください');
  return context;
};
