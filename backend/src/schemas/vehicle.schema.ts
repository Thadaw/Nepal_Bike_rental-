import { z } from "zod";

const galleryImageSchema = z.object({
  src: z.string().min(1, "Image source is required"),
  alt: z.string().default(""),
});

const vehicleSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string(),
});

const bookedRangeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const vehicleSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  brand: z.string().nullable(),
  modelYear: z.number().int().nullable(),
  category: z.enum(["scooty", "motorcycle", "car", "jeep"]),
  tagline: z.string(),
  description: z.string(),
  keySpecs: z.array(z.string()),
  specs: z.array(vehicleSpecSchema),
  images: z.array(galleryImageSchema),
  rentalTypes: z.array(z.string()),
  offRoadEligible: z.boolean(),
  dailyRateOverride: z.number().nonnegative().nullable().optional(),
  destinations: z.array(z.string()),
  featured: z.boolean(),
  badge: z.string().optional(),
  bookedRanges: z.array(bookedRangeSchema).optional(),
  isSample: z.boolean(),
});

export const updateVehicleSchema = vehicleSchema.partial().omit({
  slug: true,
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
