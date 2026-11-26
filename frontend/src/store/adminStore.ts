import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { vehicles } from "@/data/vehicles";
import { destinations } from "@/data/destinations";
import { pricingConfig, type PricingConfig } from "@/config/pricing";
import type { Destination, Vehicle } from "@/types";
import type { AdminBookingRequest, RequestStatus } from "@/features/bookings/types";
import type { Review, ReviewStatus } from "@/features/reviews/types";
import { modernImageSrc } from "@/lib/legacyImages";

export type { AdminBookingRequest, BookingRequestResult, CreateBookingInput, RequestStatus, UpdateBookingStatusInput } from "@/features/bookings/types";

/**
 * FRONTEND-ONLY ADMIN DATA LAYER.
 * Everything is stored in this browser's localStorage so the admin panel can be demonstrated
 * without a backend. Replace the actions below with API calls when the backend exists.
 * On every change the public catalogue modules (vehicles, destinations, pricingConfig) are
 * updated in place, so the public pages show admin edits on their next render.
 */
const seed = {
  vehicles: structuredClone(vehicles) as Vehicle[],
  destinations: structuredClone(destinations) as Destination[],
  pricing: structuredClone(pricingConfig) as PricingConfig,
};

/** Hard-to-guess secret for a review link (128 bits when crypto is available). */
function makeReviewKey(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface AdminState {
  requests: AdminBookingRequest[];
  reviews: Review[];
  vehicles: Vehicle[];
  destinations: Destination[];
  pricing: PricingConfig;
  addRequest: (r: Omit<AdminBookingRequest, "createdAt" | "status">) => void;
  setRequestStatus: (id: string, status: RequestStatus) => void;
  deleteRequest: (id: string) => void;
  /** Returns the booking's review key (creating it once), or null if the booking is not completed. */
  issueReviewKey: (id: string) => string | null;
  addReview: (r: Omit<Review, "id" | "createdAt" | "status">) => void;
  setReviewStatus: (id: string, status: ReviewStatus) => void;
  deleteReview: (id: string) => void;
  saveVehicle: (v: Vehicle) => void;
  deleteVehicle: (slug: string) => void;
  saveDestination: (d: Destination) => void;
  deleteDestination: (slug: string) => void;
  setPricing: (p: PricingConfig) => void;
  resetCatalog: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      requests: [],
      reviews: [],
      ...structuredClone(seed),
      addRequest: (r) => set((s) => ({ requests: [{ ...r, createdAt: new Date().toISOString(), status: "new" as const }, ...s.requests] })),
      setRequestStatus: (id, status) => set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
      deleteRequest: (id) => set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),
      issueReviewKey: (id) => {
        let key = null as string | null;
        set((s) => ({
          requests: s.requests.map((r) => {
            if (r.id !== id || r.status !== "completed") return r;
            key = r.reviewKey ?? makeReviewKey();
            return { ...r, reviewKey: key, reviewLinkSentAt: new Date().toISOString() };
          }),
        }));
        return key;
      },
      addReview: (r) => set((s) => ({ reviews: [{ ...r, id: `rv-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString(), status: "pending" as const }, ...s.reviews] })),
      setReviewStatus: (id, status) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })),
      deleteReview: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),
      saveVehicle: (v) => set((s) => ({ vehicles: s.vehicles.some((x) => x.slug === v.slug) ? s.vehicles.map((x) => (x.slug === v.slug ? v : x)) : [...s.vehicles, v] })),
      deleteVehicle: (slug) => set((s) => ({ vehicles: s.vehicles.filter((x) => x.slug !== slug) })),
      saveDestination: (d) => set((s) => ({ destinations: s.destinations.some((x) => x.slug === d.slug) ? s.destinations.map((x) => (x.slug === d.slug ? d : x)) : [...s.destinations, d] })),
      deleteDestination: (slug) => set((s) => ({
        destinations: s.destinations.filter((x) => x.slug !== slug),
        vehicles: s.vehicles.map((v) => ({ ...v, destinations: v.destinations.filter((x) => x !== slug) })),
      })),
      setPricing: (pricing) => set({ pricing }),
      resetCatalog: () => set(structuredClone(seed)),
    }),
    {
      name: "thadaw-admin-v2",
      version: 12,
      migrate: (persisted) => {
        const saved = persisted as Partial<AdminState> | undefined;
        const savedVehicles = saved?.vehicles ?? [];
        const seedVehicles = structuredClone(seed.vehicles) as Vehicle[];
        const retired = new Set(["commuter-motorcycle", "adventure-motorcycle"]);
        return {
          requests: saved?.requests ?? [],
          reviews: saved?.reviews ?? [],
          vehicles: [
            ...seedVehicles.map((seedVehicle) => {
              const kept = savedVehicles.find((v) => v.slug === seedVehicle.slug);
              // Older saved data has no badge or booked dates yet: fall back to the new defaults.
              const seeded = seedVehicle.description;
              // Drop the old destination wording from saved descriptions.
              if (kept && /Mustang, Manang and Muktinath/.test(kept.description)) kept.description = seeded;
              return kept ? { ...kept, images: kept.images.map((i) => ({ ...i, src: modernImageSrc(i.src) })), badge: kept.badge ?? seedVehicle.badge, bookedRanges: kept.bookedRanges ?? seedVehicle.bookedRanges } : seedVehicle;
            }),
            ...savedVehicles.filter((v) => !retired.has(v.slug) && !seedVehicles.some((s) => s.slug === v.slug)).map((v) => ({ ...v, images: v.images.map((i) => ({ ...i, src: modernImageSrc(i.src) })) })),
          ],
          destinations: saved?.destinations ?? structuredClone(seed.destinations),
          pricing: saved?.pricing ? { ...saved.pricing, baseDailyRates: { ...seed.pricing.baseDailyRates, ...saved.pricing.baseDailyRates } } : structuredClone(seed.pricing),
        };
      },
    },
  ),
);

function sync(s: AdminState) {
  vehicles.splice(0, vehicles.length, ...s.vehicles);
  destinations.splice(0, destinations.length, ...s.destinations);
  Object.assign(pricingConfig, s.pricing);
}
sync(useAdminStore.getState());
useAdminStore.subscribe(sync);

/* ---- Demo authentication. NOT secure: real auth must be done by a backend. ---- */
export const DEMO_PASSWORD = (import.meta.env.VITE_ADMIN_DEMO_PASSWORD as string | undefined) || "thadaw-demo";

interface AuthState { authed: boolean; login: (password: string) => boolean; logout: () => void }
export const useAdminAuth = create<AuthState>()(
  persist(
    (set) => ({
      authed: false,
      login: (p) => { const ok = p === DEMO_PASSWORD; if (ok) set({ authed: true }); return ok; },
      logout: () => set({ authed: false }),
    }),
    { name: "thadaw-admin-auth", storage: createJSONStorage(() => sessionStorage) },
  ),
);
