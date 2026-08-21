import { createContext, useContext, type PropsWithChildren } from 'react';

import { theme, type BuaTheme } from '@/ui/theme/tokens';

const ThemeContext = createContext<BuaTheme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): BuaTheme {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider.');
  return value;
}
