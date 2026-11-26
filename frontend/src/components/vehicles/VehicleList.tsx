import type { Vehicle } from "@/types";
import { Stagger } from "@/components/motion/Reveal";
import { VehicleCard } from "./VehicleCard";

/** `unavailable` = slugs that are booked for the dates the visitor searched. */
export function VehicleList({ vehicles, unavailable }: { vehicles: Vehicle[]; unavailable?: Set<string> }) {
  if (!vehicles.length) return <p className="py-16 text-center text-muted-foreground">No vehicles to show in this category yet.</p>;
  return (
    <Stagger key={vehicles.map((v) => v.slug).join()} className="grid gap-6 xl:grid-cols-2">
      {vehicles.map((v) => <VehicleCard key={v.slug} vehicle={v} unavailable={unavailable?.has(v.slug)} />)}
    </Stagger>
  );
}
