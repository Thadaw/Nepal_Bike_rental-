import type { VehicleCategory } from "@/types";

export interface CategoryMeta {
  id: VehicleCategory;
  label: string;
  plural: string;
  path: string;
  image: string;
  blurb: string;
  /** true = a real cut-out photo (transparent background) shown whole; false = a wide scene shown full-bleed. */
  cutout?: boolean;
}

export const categories: CategoryMeta[] = [
  { id: "motorcycle", label: "Motorcycle", plural: "Bikes", path: "/bikes", image: "/images/crossfire-rm-250-dirt-bike.webp", blurb: "Dirt bikes and tourers for Pokhara and the mountains.", cutout: true },
  { id: "scooty", label: "Scooty", plural: "Scooties", path: "/scooty", image: "/images/honda-dio-scooty.webp", blurb: "Easy automatic rides for lakeside streets.", cutout: true },
  { id: "car", label: "Car", plural: "Cars", path: "/cars", image: "/images/suv-scenic.svg", blurb: "Need a car? Cars are available on request. Message us for a quote." },
  { id: "jeep", label: "Jeep", plural: "Jeeps", path: "/jeeps", image: "/images/suv-scenic.svg", blurb: "Jeeps for rough mountain roads, available on request." },
];

export const getCategory = (id: VehicleCategory) => categories.find((c) => c.id === id)!;
