import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { useVehicles } from "@/features/vehicles/hooks";
import { sortBikesFirst } from "@/lib/vehicleOrder";

export function FeaturedVehicles() {
  const { data: vehicles = [] } = useVehicles();
  const featured = sortBikesFirst(vehicles.filter((v) => v.featured && v.category !== "car" && v.category !== "jeep"));
  return (
    <section className="container pt-24 md:pt-32">
      <SectionHeading eyebrow="Popular right now" title="Featured bikes" text="Popular rides for Pokhara and the mountains." action={<Button asChild variant="outline"><Link to="/bikes">View all bikes</Link></Button>} />
      <VehicleList vehicles={featured} />
    </section>
  );
}
