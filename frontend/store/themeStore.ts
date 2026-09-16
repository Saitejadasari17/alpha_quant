"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
};

type ThemeActions = {
  setTheme: (theme: Theme) => void;
};

type ThemeStore = ThemeState & ThemeActions;

let state: ThemeStore = {
  theme: "light",
  setTheme: (theme) => {
    setState({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("fwp_theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  },
};

const listeners = new Set<() => void>();

function setState(partial: Partial<ThemeState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initializeTheme() {
  if (typeof window === "undefined") {
    return;
  }

  const stored = localStorage.getItem("fwp_theme");
  const theme = stored === "dark" ? "dark" : "light";
  state.setTheme(theme);
}

export function useThemeStore<T>(selector: (value: ThemeStore) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}
