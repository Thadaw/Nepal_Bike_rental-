import { ApiError } from "@/api/client";
import type { Api } from "@/api/contract";
import { useAdminStore } from "@/store/adminStore";
import { compressImage } from "@/lib/imageUpload";
import { reviewSchema } from "@/features/reviews/schemas";
import type { ReviewLinkInfo } from "@/features/reviews/types";

const state = () => useAdminStore.getState();
const clone = <T>(value: T): T => structuredClone(value);
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Demo version of the server-side checks. A real backend must do the same:
 * the booking exists, is completed, the key matches, and it has no review yet.
 */
function resolveReviewLink(reference: string, key: string): ReviewLinkInfo {
  const booking = state().requests.find((r) => r.id === reference);
  if (!booking || booking.status !== "completed" || !booking.reviewKey || booking.reviewKey !== key) throw new ApiError("This review link is not valid.", 404);
  if (state().reviews.some((r) => r.reference === reference)) throw new ApiError("This rental has already been reviewed.", 409);
  const vehicle = state().vehicles.find((v) => v.slug === booking.vehicleSlug);
  return { reference, vehicleSlug: booking.vehicleSlug, vehicleName: vehicle?.name ?? booking.vehicleSlug, customerName: booking.name };
}

export function blockedFromRequests(requests: { status: string; vehicleSlug: string; startDate: string; returnDate: string }[]): Record<string, { start: string; end: string }[]> {
  const out: Record<string, { start: string; end: string }[]> = {};
  for (const r of requests) {
    if (r.status !== "confirmed" || !r.startDate || !r.returnDate) continue;
    (out[r.vehicleSlug] ??= []).push({ start: r.startDate, end: r.returnDate });
  }
  return out;
}

export const localApi: Api = {
  vehicles: {
    list: async () => clone(state().vehicles),
    get: async (slug) => clone(state().vehicles.find((v) => v.slug === slug) ?? null),
    create: async (input) => {
      state().saveVehicle(clone(input));
      const created = state().vehicles.find((v) => v.slug === input.slug);
      if (!created) throw new ApiError("Vehicle could not be saved", 500);
      return clone(created);
    },
    update: async (slug, patch) => {
      const current = state().vehicles.find((v) => v.slug === slug);
      if (!current) throw new ApiError("Vehicle not found", 404);
      state().saveVehicle(clone({ ...current, ...patch, slug }));
      return clone(state().vehicles.find((v) => v.slug === slug)!);
    },
    remove: async (slug) => {
      state().deleteVehicle(slug);
    },
  },
  destinations: {
    list: async () => clone(state().destinations),
    get: async (slug) => clone(state().destinations.find((d) => d.slug === slug) ?? null),
    create: async (input) => {
      state().saveDestination(clone(input));
      const created = state().destinations.find((d) => d.slug === input.slug);
      if (!created) throw new ApiError("Destination could not be saved", 500);
      return clone(created);
    },
    update: async (slug, patch) => {
      const current = state().destinations.find((d) => d.slug === slug);
      if (!current) throw new ApiError("Destination not found", 404);
      state().saveDestination(clone({ ...current, ...patch, slug }));
      return clone(state().destinations.find((d) => d.slug === slug)!);
    },
    remove: async (slug) => {
      state().deleteDestination(slug);
    },
  },
  pricing: {
    get: async () => clone(state().pricing),
    update: async (input) => {
      state().setPricing(clone(input));
      return clone(state().pricing);
    },
  },
  catalog: {
    reset: async () => {
      state().resetCatalog();
    },
  },
  bookings: {
    list: async () => clone(state().requests),
    create: async (input) => {
      await wait(700);
      const reference = input.reference || `TR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const { reference: _ignored, ...rest } = clone(input);
      void _ignored;
      state().addRequest({ id: reference, ...rest });
      return { reference, status: "awaiting_confirmation" as const };
    },
    updateStatus: async ({ id, status }) => {
      state().setRequestStatus(id, status);
      const updated = state().requests.find((r) => r.id === id);
      if (!updated) throw new ApiError("Booking request not found", 404);
      return clone(updated);
    },
    remove: async (id) => {
      state().deleteRequest(id);
    },
    issueReviewKey: async (id) => {
      const key = state().issueReviewKey(id);
      if (!key) throw new ApiError("Only completed bookings can get a review link.", 400);
      return { key };
    },
  },
  uploads: {
    // Demo only: the photo is stored inside this browser. A real backend returns a file URL instead.
    image: async (file) => ({ url: await compressImage(file) }),
  },
  availability: {
    blockedRanges: async () => blockedFromRequests(state().requests),
  },
  reviews: {
    listPublic: async () =>
      state().reviews
        .filter((r) => r.status === "approved")
        .map(({ reference: _reference, status: _status, ...rest }) => { void _reference; void _status; return clone(rest); }),
    list: async () => clone(state().reviews),
    getLink: async (reference, key) => clone(resolveReviewLink(reference, key)),
    submit: async ({ reference, key, ...fields }) => {
      await wait(500);
      const info = resolveReviewLink(reference, key);
      const parsed = reviewSchema.safeParse(fields);
      if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? "Please check your review.", 400);
      state().addReview({ reference, vehicleSlug: info.vehicleSlug, vehicleName: info.vehicleName, ...parsed.data });
    },
    updateStatus: async ({ id, status }) => {
      state().setReviewStatus(id, status);
      const updated = state().reviews.find((r) => r.id === id);
      if (!updated) throw new ApiError("Review not found", 404);
      return clone(updated);
    },
    remove: async (id) => {
      state().deleteReview(id);
    },
  },
};
