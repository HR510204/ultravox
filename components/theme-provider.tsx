"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isTransitioning: boolean;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  isTransitioning: false,
};

const ThemeProviderContext =
  React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ["dark", "light", "system"].includes(stored)) {
      setTheme(stored);
    }
  }, [storageKey]);

  React.useEffect(() => {
    const root = window.document.documentElement;

    // Add transition classes for smooth theme switching
    root.style.transition =
      "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

    setIsTransitioning(true);

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Reset transition state after animation completes
    const timeoutId = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [theme]);

  const value = {
    theme,
    isTransitioning,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
