import type { PricingConfig } from "@/config/pricing";
import type { AdminBookingRequest, BookingRequestResult, CreateBookingInput, RequestStatus, UpdateBookingStatusInput } from "@/features/bookings/types";
import type { PublicReview, Review, ReviewLinkInfo, ReviewStatus, SubmitReviewInput } from "@/features/reviews/types";
import type { BookedRange, Destination, Vehicle } from "@/types";

export interface Api {
  vehicles: {
    list: () => Promise<Vehicle[]>;
    get: (slug: string) => Promise<Vehicle | null>;
    create: (input: Vehicle) => Promise<Vehicle>;
    update: (slug: string, patch: Partial<Vehicle>) => Promise<Vehicle>;
    remove: (slug: string) => Promise<void>;
  };
  destinations: {
    list: () => Promise<Destination[]>;
    get: (slug: string) => Promise<Destination | null>;
    create: (input: Destination) => Promise<Destination>;
    update: (slug: string, patch: Partial<Destination>) => Promise<Destination>;
    remove: (slug: string) => Promise<void>;
  };
  pricing: {
    get: () => Promise<PricingConfig>;
    update: (input: PricingConfig) => Promise<PricingConfig>;
  };
  catalog: {
    reset: () => Promise<void>;
  };
  bookings: {
    list: () => Promise<AdminBookingRequest[]>;
    create: (input: CreateBookingInput) => Promise<BookingRequestResult>;
    updateStatus: (input: UpdateBookingStatusInput) => Promise<AdminBookingRequest>;
    remove: (id: string) => Promise<void>;
    /** Completed bookings only. Returns the secret key for the review link (the same key every time). */
    issueReviewKey: (id: string) => Promise<{ key: string }>;
  };
  uploads: {
    /** Stores one image and returns its public URL. */
    image: (file: File) => Promise<{ url: string }>;
  };
  availability: {
    /** Dates of CONFIRMED bookings per vehicle slug. Dates only, never customer details: this is public. */
    blockedRanges: () => Promise<Record<string, BookedRange[]>>;
  };
  reviews: {
    /** Approved reviews only, without booking references. */
    listPublic: () => Promise<PublicReview[]>;
    /** Admin: every review. */
    list: () => Promise<Review[]>;
    /** Checks a review link. Rejects with 404 (invalid link) or 409 (already reviewed). */
    getLink: (reference: string, key: string) => Promise<ReviewLinkInfo>;
    /** Saves a review as pending. The server must re-check the key, that the booking is completed, and one review per booking. */
    submit: (input: SubmitReviewInput) => Promise<void>;
    updateStatus: (input: { id: string; status: ReviewStatus }) => Promise<Review>;
    remove: (id: string) => Promise<void>;
  };
}

export type { RequestStatus };
