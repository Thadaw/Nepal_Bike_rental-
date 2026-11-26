import { z } from "zod";

export const pricingFormSchema = z.object({
  currencySymbol: z.string().min(1, "Enter a currency symbol."),
  baseDailyRates: z.object({
    scooty: z.number().min(0).nullable(),
    motorcycle: z.number().min(0).nullable(),
    car: z.number().min(0).nullable(),
    jeep: z.number().min(0).nullable(),
  }),
  offRoadSurchargePerDay: z.number().min(0),
  discountTiers: z
    .array(z.object({ minDays: z.number().int().min(1), percent: z.number().min(0).max(100) }))
    .min(1, "Keep at least one discount tier."),
  discountsConfirmed: z.boolean(),
  durationPresets: z.array(z.object({ label: z.string().min(1), days: z.number().int().min(1) })),
});
