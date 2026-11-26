import { z } from "zod";

const category = z.enum(["scooty", "motorcycle", "car", "jeep"]);

export const vehicleFormSchema = z.object({
  name: z.string().trim().min(2, "Enter a vehicle name."),
  category,
  tagline: z.string().trim(),
  description: z.string().trim(),
  keySpecs: z.string(),
  specs: z.string(),
  rentalTypes: z.string(),
  images: z.string().refine((value) => value.split(/\n/).map((x) => x.trim()).filter(Boolean).length > 0, "Add at least one photo."),
  dailyRate: z.string().refine(
    (value) => value.trim() === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Enter a price of 0 or more, or leave it empty.",
  ),
  priceOnRequest: z.boolean(),
  offRoadEligible: z.boolean(),
  badge: z.string(),
  bookedRanges: z.string().refine((t) => t.split(/\n/).every((l) => !l.trim() || /\d{4}-\d{2}-\d{2}/.test(l)), "Write booked dates as 2026-12-05 to 2026-12-08, one per line."),
  featured: z.boolean(),
  isSample: z.boolean(),
  destinations: z.array(z.string()),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
