import * as React from 'react';

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({children}: ThemeProviderProps) {
  // This functionality was removed due to a library incompatibility with React 19.
  return <>{children}</>;
}
