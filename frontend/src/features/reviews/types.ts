export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  /** Booking reference this review belongs to. One review per booking. Never shown publicly. */
  reference: string;
  vehicleSlug: string;
  vehicleName: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: ReviewStatus;
}

/** What visitors may see: approved reviews only, without the booking reference. */
export type PublicReview = Omit<Review, "reference" | "status">;

/** Returned when a review link is valid. */
export interface ReviewLinkInfo {
  reference: string;
  vehicleSlug: string;
  vehicleName: string;
  customerName: string;
}

export interface SubmitReviewInput {
  reference: string;
  /** The secret key from the link the shop sent. */
  key: string;
  name: string;
  rating: number;
  comment: string;
}
