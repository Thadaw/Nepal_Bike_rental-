import { create } from "zustand";
import { z } from "zod";
import type { TripType } from "@/types";

export interface BookingDraft {
  vehicleSlug: string;
  startDate: string;
  returnDate: string;
  tripType: TripType;
  destination: string;
  pickupTime: string;
}

export interface BookingFormValues {
  name: string;
  phone: string;
  email?: string;
  vehicleSlug: string;
  startDate: string;
  returnDate: string;
  tripType: TripType;
  destination: string;
  pickupTime?: string;
  message?: string;
  terms: boolean;
}

interface BookingState extends BookingDraft {
  update: (patch: Partial<BookingDraft>) => void;
  reset: () => void;
}

const initial: BookingDraft = { vehicleSlug: "", startDate: "", returnDate: "", tripType: "city", destination: "", pickupTime: "" };

export const useBookingStore = create<BookingState>()((set) => ({
  ...initial,
  update: (patch) => set(patch),
  reset: () => set(initial),
}));
