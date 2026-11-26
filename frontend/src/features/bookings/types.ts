import type { QuoteStatus } from "@/lib/pricing";
import type { TripType } from "@/types";

export type RequestStatus = "new" | "confirmed" | "declined" | "completed";

export type BookingSource = "website" | "whatsapp";

export interface AdminBookingRequest {
  id: string;
  source?: BookingSource;
  pickupTime?: string;
  createdAt: string;
  status: RequestStatus;
  name: string;
  phone: string;
  email: string;
  vehicleSlug: string;
  startDate: string;
  returnDate: string;
  tripType: TripType;
  destination: string;
  message: string;
  days: number;
  estimateStatus: QuoteStatus;
  estimateTotal: number;
  /** Secret in the review link. Created when the shop first sends the link. Admin only. */
  reviewKey?: string;
  reviewLinkSentAt?: string;
}

export interface CreateBookingInput {
  /** Optional client-generated reference so the same code can appear in a WhatsApp message. */
  reference?: string;
  source?: BookingSource;
  pickupTime?: string;
  name: string;
  phone: string;
  email: string;
  vehicleSlug: string;
  startDate: string;
  returnDate: string;
  tripType: TripType;
  destination: string;
  message: string;
  days: number;
  estimateStatus: QuoteStatus;
  estimateTotal: number;
}

export interface BookingRequestResult {
  reference: string;
  status: "awaiting_confirmation";
}

export interface UpdateBookingStatusInput {
  id: string;
  status: RequestStatus;
}
