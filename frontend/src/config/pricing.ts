import type { DiscountTier, VehicleCategory } from "../types";

export interface PricingConfig {
  currencySymbol: string;
  /** null = pending client confirmation (custom quotation). */
  baseDailyRates: Record<VehicleCategory, number | null>;
  /** Added per day on approved off-road routes for eligible vehicles. */
  offRoadSurchargePerDay: number;
  discountTiers: DiscountTier[];
  /** Set to false to show a "demo values" notice next to discounts. */
  discountsConfirmed: boolean;
  durationPresets: { label: string; days: number }[];
}

export const pricingConfig: PricingConfig = {
  currencySymbol: "रु.",
  baseDailyRates: { scooty: 1000, motorcycle: 1000, car: null, jeep: null },
  offRoadSurchargePerDay: 1000,
  discountTiers: [
    { minDays: 1, percent: 0 },
    { minDays: 7, percent: 5 },
    { minDays: 14, percent: 8 },
    { minDays: 21, percent: 12 },
    { minDays: 30, percent: 18 },
  ],
  discountsConfirmed: true,
  durationPresets: [
    { label: "Daily", days: 1 },
    { label: "Weekly (7 days)", days: 7 },
    { label: "Two weeks (14 days)", days: 14 },
    { label: "Three weeks (21 days)", days: 21 },
    { label: "Monthly (30 days)", days: 30 },
  ],
};
