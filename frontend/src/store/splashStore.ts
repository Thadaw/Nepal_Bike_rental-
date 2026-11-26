import { create } from "zustand";

/**
 * loading : splash is showing the logo and the page below is not mounted yet
 * moving  : the logo is travelling to its place in the navbar, the page fades in
 * done    : splash is gone, the navbar logo is visible
 */
export type SplashPhase = "loading" | "moving" | "done";

/** Set to true to show the splash only once per browser tab instead of on every full page load. */
export const SPLASH_ONCE_PER_SESSION = false;
const SEEN_KEY = "nbr-splash-seen";

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (window.location.pathname.startsWith("/admin")) return true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
  if (SPLASH_ONCE_PER_SESSION) {
    try { if (sessionStorage.getItem(SEEN_KEY)) return true; } catch { /* storage blocked: show the splash */ }
  }
  return false;
}

interface SplashState { phase: SplashPhase; setPhase: (phase: SplashPhase) => void }

export const useSplash = create<SplashState>((set) => ({
  phase: shouldSkip() ? "done" : "loading",
  setPhase: (phase) => {
    if (phase === "done" && SPLASH_ONCE_PER_SESSION) {
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    }
    set({ phase });
  },
}));
