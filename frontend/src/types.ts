export type VehicleCategory = "scooty" | "motorcycle" | "car" | "jeep";
export type TripType = "city" | "adventure";

/** A block of dates the bike is already taken, both days inclusive (YYYY-MM-DD). */
export interface BookedRange { start: string; end: string }

export interface GalleryImage { src: string; alt: string }
export interface VehicleSpec { label: string; value: string }

export interface Vehicle {
  slug: string;
  name: string;
  brand: string | null;
  modelYear: number | null;
  category: VehicleCategory;
  tagline: string;
  description: string;
  keySpecs: string[];
  specs: VehicleSpec[];
  images: GalleryImage[];
  rentalTypes: string[];
  offRoadEligible: boolean;
  /** Overrides the category base rate. `undefined` = use category rate from pricing config. */
  dailyRateOverride?: number | null;
  destinations: string[];
  featured: boolean;
  /** Optional card badge, e.g. "Most Popular". */
  badge?: string;
  /** Dates the bike is already booked, shown on the card so customers avoid them. */
  bookedRanges?: BookedRange[];
  /** Sample listings are NOT real fleet vehicles. Replace before production. */
  isSample: boolean;
}

export interface Destination {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  gallery: GalleryImage[];
  description: string;
  experience: string;
  eligibleCategories: VehicleCategory[];
  routeInfo: string[];
  offRoad: boolean;
  extraChargePerDay: number;
  customQuoteOnly: boolean;
  confirmed: boolean;
}

export interface DiscountTier { minDays: number; percent: number }
