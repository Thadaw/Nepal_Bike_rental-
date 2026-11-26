import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, HardHat } from "lucide-react";
import type { Vehicle } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleBadge } from "./VehicleBadge";
import { AvailabilityNote } from "./AvailabilityNote";
import { Stars } from "@/components/reviews/Stars";
import { usePublicReviews } from "@/features/reviews/hooks";
import { summarize } from "@/features/reviews/summary";
import { StaggerItem } from "@/components/motion/Reveal";
import { getCategory } from "@/data/categories";
import { pricingConfig } from "@/config/pricing";
import { usePricing } from "@/features/pricing/hooks";
import { formatNpr, vehicleDailyRate } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function VehicleCard({ vehicle, unavailable }: { vehicle: Vehicle; unavailable?: boolean }) {
  const { data: pricing } = usePricing();
  const config = pricing ?? pricingConfig;
  const rate = vehicleDailyRate(vehicle, config);
  const { data: allReviews = [] } = usePublicReviews();
  const rating = summarize(allReviews.filter((r) => r.vehicleSlug === vehicle.slug));
  return (
    <StaggerItem>
      <motion.article whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-xl hover:shadow-black/10 sm:flex-row">
        <div className="relative aspect-[16/11] overflow-hidden bg-brand-stone sm:aspect-auto sm:w-[56%]">
          <img
            src={vehicle.images[0].src}
            alt={vehicle.images[0].alt}
            loading="lazy"
            decoding="async"
            className={cn(
              "h-full w-full transition-transform duration-700 ease-out",
              (vehicle.category === "car" || vehicle.category === "jeep") ? "object-cover group-hover:scale-[1.07]" : "object-contain p-2 sm:p-4",
              unavailable && "opacity-50 grayscale",
            )}
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {unavailable && <span className="inline-flex items-center rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white shadow-sm">Booked for your dates</span>}
            <VehicleBadge label={vehicle.badge} />
            {vehicle.isSample && <Badge variant="glass">Sample listing</Badge>}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
          <div>
            <Badge variant="gold">{getCategory(vehicle.category).label}</Badge>
            <h3 className="mt-3 text-xl font-bold">
              <Link to={`/vehicles/${vehicle.slug}`} className="after:absolute after:inset-0 after:content-['']">{vehicle.name}</Link>
            </h3>
            {rating.count > 0 && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Stars rating={rating.average} className="[&_svg]:h-3.5 [&_svg]:w-3.5" /> {rating.average} ({rating.count})</p>}
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {vehicle.keySpecs.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{vehicle.rentalTypes.join(" · ")}</p>
            {(vehicle.category === "motorcycle" || vehicle.category === "scooty") && <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-golddeep"><HardHat className="h-3.5 w-3.5" aria-hidden /> Rider helmet provided free</p>}
            <AvailabilityNote vehicle={vehicle} className="mt-2" />
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{rate === null ? "Price" : "From"}</p>
              <p className="font-heading text-lg font-extrabold">{rate === null ? "On request" : <>{formatNpr(rate, config)}<span className="text-sm font-medium text-muted-foreground">/day</span></>}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {unavailable
                ? <Button size="sm" className="relative z-10" disabled>Not available</Button>
                : <Button asChild size="sm" className="relative z-10"><Link to={`/booking?bike=${vehicle.slug}`}>Book this bike</Link></Button>}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </div>
        </div>
      </motion.article>
    </StaggerItem>
  );
}
