import type { Vehicle, VehicleCategory } from "@/types";
import type { VehicleFormValues } from "@/features/vehicles/schemas";
import { parseRanges, rangesToText } from "@/lib/availability";

export const defaultImages: Record<VehicleCategory, string[]> = {
  scooty: ["/images/v-city-scooty.svg", "/images/scooty-pokhara.svg"],
  motorcycle: ["/images/v-commuter-bike.svg", "/images/mountain-road-bike.svg"],
  car: ["/images/v-compact-suv.svg", "/images/suv-scenic.svg"],
  jeep: ["/images/suv-scenic.svg", "/images/manang-valley.svg"],
};

export const blankVehicleForm: VehicleFormValues = {
  name: "",
  category: "motorcycle",
  tagline: "",
  description: "",
  keySpecs: "",
  specs: "",
  rentalTypes: "Daily, Weekly, Monthly",
  images: defaultImages.motorcycle.join("\n"),
  dailyRate: "",
  priceOnRequest: false,
  offRoadEligible: false,
  badge: "",
  bookedRanges: "",
  featured: false,
  isSample: false,
  destinations: [],
};

const list = (value: string, separator: RegExp) => value.split(separator).map((x) => x.trim()).filter(Boolean);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function toVehicleForm(vehicle: Vehicle): VehicleFormValues {
  return {
    name: vehicle.name,
    category: vehicle.category,
    tagline: vehicle.tagline,
    description: vehicle.description,
    keySpecs: vehicle.keySpecs.join(", "),
    specs: vehicle.specs.map((s) => `${s.label}: ${s.value}`).join("\n"),
    rentalTypes: vehicle.rentalTypes.join(", "),
    images: vehicle.images.map((i) => i.src).join("\n"),
    dailyRate: typeof vehicle.dailyRateOverride === "number" ? String(vehicle.dailyRateOverride) : "",
    priceOnRequest: vehicle.dailyRateOverride === null,
    offRoadEligible: vehicle.offRoadEligible,
    badge: vehicle.badge ?? "",
    bookedRanges: rangesToText(vehicle.bookedRanges),
    featured: vehicle.featured,
    isSample: vehicle.isSample,
    destinations: vehicle.destinations,
  };
}

export function vehicleFromForm(values: VehicleFormValues, existing: Vehicle | null, vehicles: Vehicle[]): Vehicle {
  let slug = existing?.slug ?? slugify(values.name);
  if (!existing) {
    const base = slug;
    let index = 2;
    while (vehicles.some((v) => v.slug === slug)) slug = `${base}-${index++}`;
  }
  // Own price wins; "price on request" is stored as null; empty falls back to the category default.
  const rate = values.priceOnRequest ? null : values.dailyRate.trim() === "" ? undefined : Number(values.dailyRate);
  return {
    slug,
    name: values.name.trim(),
    brand: existing?.brand ?? null,
    modelYear: existing?.modelYear ?? null,
    category: values.category,
    tagline: values.tagline.trim(),
    description: values.description.trim(),
    keySpecs: list(values.keySpecs, /,/),
    specs: list(values.specs, /\n/).map((line) => {
      const index = line.indexOf(":");
      return index > 0 ? { label: line.slice(0, index).trim(), value: line.slice(index + 1).trim() } : { label: "Detail", value: line };
    }),
    images: list(values.images, /\n/).map((src) => ({ src, alt: values.name.trim() })),
    rentalTypes: list(values.rentalTypes, /,/),
    offRoadEligible: values.offRoadEligible,
    dailyRateOverride: rate,
    destinations: values.destinations,
    badge: values.badge.trim() || undefined,
    bookedRanges: parseRanges(values.bookedRanges),
    featured: values.featured,
    isSample: values.isSample,
  };
}
