import { useSyncExternalStore } from "react";
import tokens from "../../tokens.json";
import { hex, KEY } from "./theme-boot";

/** The site-wide look that visitors can change from the navbar. */
export type Theme = { frost: number; primary: string; secondary: string; light: boolean };

/** What the site opens with: clear glass and the kit's own colours. */
export const defaults: Theme = { frost: 1, primary: tokens.color.primary, secondary: tokens.color.secondary, light: false };


/** Saved themes come from the browser's storage, so check them before trusting them. */
function isTheme(value: unknown): value is Theme {
  const t = value as Theme | null;
  return !!t && typeof t.frost === "number" && t.frost >= 1 && t.frost <= 5 && hex.test(t.primary) && hex.test(t.secondary);
}

function load(): Theme {
  if (typeof localStorage === "undefined") return defaults; // on the server
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return isTheme(saved) ? { ...defaults, ...saved, light: saved.light === true } : defaults; // themes saved before the light option have none
  } catch {
    return defaults; // storage blocked or corrupted
  }
}

let theme = load();
const listeners = new Set<() => void>();

/** Changes the theme: writes the CSS variables on <html> (every surface inherits them), saves it, and tells subscribers. */
export function setTheme(patch: Partial<Theme>) {
  theme = { ...theme, ...patch };
  const root = document.documentElement.style;
  root.setProperty("--frost", String(theme.frost));
  root.setProperty("--gl-primary", theme.primary);
  root.setProperty("--gl-secondary", theme.secondary);
  document.documentElement.toggleAttribute("data-theme", theme.light);
  if (theme.light) document.documentElement.dataset.theme = "light";
  try {
    localStorage.setItem(KEY, JSON.stringify(theme));
  } catch {
    // Storage blocked: the theme still applies for this visit.
  }
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The current theme, shared by the navbar controls and anything that describes it (the AI prompt). */
export const useTheme = () => useSyncExternalStore(subscribe, () => theme, () => defaults);
