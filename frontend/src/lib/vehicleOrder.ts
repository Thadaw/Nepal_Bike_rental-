import type { Vehicle, VehicleCategory } from "@/types";

const order: Record<VehicleCategory, number> = { motorcycle: 0, scooty: 1, car: 2, jeep: 3 };

/** Bikes first, then scooties, then cars. Keeps the original order inside each group. */
export function sortBikesFirst<T extends Pick<Vehicle, "category">>(list: T[]): T[] {
  return [...list].sort((a, b) => order[a.category] - order[b.category]);
}
