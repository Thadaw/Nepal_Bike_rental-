// Pure pricing logic. No React, no DOM. Relative imports keep this file runnable in tests.
import { pricingConfig, type PricingConfig } from "../config/pricing";
import type { DiscountTier, TripType, VehicleCategory } from "../types";

export interface QuoteDestination {
  name: string;
  offRoad: boolean;
  extraChargePerDay: number;
  customQuoteOnly: boolean;
}

export interface QuoteInput {
  category: VehicleCategory;
  /** Per-vehicle override of the category base rate. */
  baseDailyRate?: number | null;
  offRoadEligible: boolean;
  tripType: TripType;
  destination?: QuoteDestination | null;
  days: number;
}

export type QuoteStatus = "estimate" | "quote" | "incomplete";

export interface Quote {
  status: QuoteStatus;
  days: number;
  baseRate: number;
  offRoadPerDay: number;
  destinationPerDay: number;
  perDay: number;
  originalTotal: number;
  discountPercent: number;
  savings: number;
  finalTotal: number;
  reason?: string;
}

export function emptyQuote(status: QuoteStatus, reason: string, days = 0): Quote {
  return { status, days, baseRate: 0, offRoadPerDay: 0, destinationPerDay: 0, perDay: 0, originalTotal: 0, discountPercent: 0, savings: 0, finalTotal: 0, reason };
}

export function getDiscountPercent(days: number, tiers: DiscountTier[]): number {
  let pct = 0;
  for (const t of [...tiers].sort((a, b) => a.minDays - b.minDays)) if (days >= t.minDays) pct = t.percent;
  return pct;
}

export function calculateQuote(input: QuoteInput, config: PricingConfig = pricingConfig): Quote {
  const days = Math.floor(input.days || 0);
  if (days < 1) return emptyQuote("incomplete", "Choose a start date and a return date to see an estimate.");

  const baseRate = input.baseDailyRate !== undefined ? input.baseDailyRate : config.baseDailyRates[input.category] ?? null;
  if (baseRate === null) return emptyQuote("quote", "This vehicle is priced on request. Send a booking request or message us for a quote.", days);

  let offRoadPerDay = 0;
  let destinationPerDay = 0;
  if (input.tripType === "adventure") {
    const d = input.destination;
    if (!d) return emptyQuote("incomplete", "Select a destination for an adventure trip.", days);
    if (d.customQuoteOnly) return emptyQuote("quote", `${d.name} is priced by custom quotation.`, days);
    if (d.offRoad) {
      if (!input.offRoadEligible) return emptyQuote("quote", "This vehicle is not approved for off-road routes. Ask for a custom quotation.", days);
      offRoadPerDay = config.offRoadSurchargePerDay;
    }
    destinationPerDay = d.extraChargePerDay;
  }

  const perDay = baseRate + offRoadPerDay + destinationPerDay;
  const originalTotal = perDay * days;
  const discountPercent = getDiscountPercent(days, config.discountTiers);
  const savings = Math.round((originalTotal * discountPercent) / 100);
  return { status: "estimate", days, baseRate, offRoadPerDay, destinationPerDay, perDay, originalTotal, discountPercent, savings, finalTotal: originalTotal - savings };
}

/**
 * Daily rate of one vehicle.
 * number = the vehicle's own price, null = price on request, undefined = fall back to the default for its category.
 */
export function vehicleDailyRate(vehicle: { category: VehicleCategory; dailyRateOverride?: number | null }, config: PricingConfig = pricingConfig): number | null {
  return vehicle.dailyRateOverride !== undefined ? vehicle.dailyRateOverride : config.baseDailyRates[vehicle.category] ?? null;
}

export function formatNpr(amount: number, config: PricingConfig = pricingConfig): string {
  return `${config.currencySymbol} ${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Quotes for weekly / two-week / three-week / monthly presets. */
export function presetQuotes(input: Omit<QuoteInput, "days">, config: PricingConfig = pricingConfig) {
  return config.durationPresets.map((p) => ({ ...p, quote: calculateQuote({ ...input, days: p.days }, config) }));
}
