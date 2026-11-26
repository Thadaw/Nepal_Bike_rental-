import { useMemo } from "react";
import { useVehicles } from "@/features/vehicles/hooks";
import { useDestinations } from "@/features/destinations/hooks";
import { usePricing } from "@/features/pricing/hooks";
import { calculateQuote, emptyQuote } from "@/lib/pricing";
import { customDestination } from "@/data/destinations";
import { rentalDays } from "@/lib/dates";
import type { TripType } from "@/types";

interface Draft { vehicleSlug: string; startDate: string; returnDate: string; tripType: TripType; destination: string }

export function useRentalQuote(d: Draft) {
  const { vehicleSlug, startDate, returnDate, tripType, destination } = d;
  const { data: vehicles = [] } = useVehicles();
  const { data: destinations = [] } = useDestinations();
  const { data: pricing } = usePricing();
  return useMemo(() => {
    const vehicle = vehicles.find((v) => v.slug === vehicleSlug);
    const dest = tripType === "adventure" && destination
      ? destinations.find((x) => x.slug === destination) ?? (destination === customDestination.slug ? customDestination : null)
      : null;
    const days = rentalDays(startDate, returnDate);
    const quote = vehicle
      ? calculateQuote({ category: vehicle.category, baseDailyRate: vehicle.dailyRateOverride, offRoadEligible: vehicle.offRoadEligible, tripType, destination: dest, days }, pricing)
      : emptyQuote("incomplete", "Select a vehicle to see an estimate.");
    return { vehicle, destination: dest, days, quote };
  }, [vehicleSlug, startDate, returnDate, tripType, destination, vehicles, destinations, pricing]);
}
