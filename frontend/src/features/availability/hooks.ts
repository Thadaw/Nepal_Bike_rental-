import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@/api";
import { blockedFromRequests } from "@/api/local";
import { useAdminStore } from "@/store/adminStore";
import { mergeRanges } from "@/lib/availability";
import type { BookedRange, Vehicle } from "@/types";

/** Dates of confirmed bookings, per vehicle. They block the calendar automatically. */
export function useBlockedRanges() {
  return useQuery({
    queryKey: queryKeys.availability.all,
    queryFn: () => api.availability.blockedRanges(),
    placeholderData: () => blockedFromRequests(useAdminStore.getState().requests),
  });
}

/** Every date a vehicle is taken: confirmed bookings plus any dates the shop typed in by hand. */
export function useBookedRanges(vehicle?: Pick<Vehicle, "slug" | "bookedRanges">): BookedRange[] {
  const { data } = useBlockedRanges();
  const slug = vehicle?.slug;
  const manual = vehicle?.bookedRanges;
  return useMemo(() => mergeRanges(manual, slug ? data?.[slug] : undefined), [manual, slug, data]);
}
