import { create } from "zustand";
import type { RequestStatus } from "@/features/bookings/types";

interface UiState {
  bookingStatusFilter: "all" | RequestStatus;
  expandedBookingId: string | null;
  setBookingStatusFilter: (filter: "all" | RequestStatus) => void;
  setExpandedBookingId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  bookingStatusFilter: "all",
  expandedBookingId: null,
  setBookingStatusFilter: (bookingStatusFilter) => set({ bookingStatusFilter }),
  setExpandedBookingId: (expandedBookingId) => set({ expandedBookingId }),
}));
