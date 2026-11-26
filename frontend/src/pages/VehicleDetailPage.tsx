import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Gallery } from "@/components/vehicles/Gallery";
import { DurationPriceTable } from "@/components/vehicles/DurationPriceTable";
import { BookingPanel } from "@/components/booking/BookingPanel";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { buildInquiryMessage } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleBadge } from "@/components/vehicles/VehicleBadge";
import { AvailabilityNote } from "@/components/vehicles/AvailabilityNote";
import { getCategory } from "@/data/categories";
import { useVehicle } from "@/features/vehicles/hooks";
import { shop } from "@/config/shop";
import { Included, RulesSummary } from "@/components/policies/Rules";
import { VehicleReviews } from "@/components/reviews/VehicleReviews";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import NotFoundPage from "./NotFoundPage";

export default function VehicleDetailPage() {
  const { slug = "" } = useParams();
  const vehicleQuery = useVehicle(slug);
  const vehicle = vehicleQuery.data;
  useDocumentMeta(vehicle ? vehicle.name : "Vehicle not found", vehicle?.tagline);
  if (!vehicle) {
    return vehicleQuery.isPlaceholderData && vehicleQuery.isFetching ? <div className="min-h-[60vh]" aria-busy="true" /> : <NotFoundPage />;
  }
  const cat = getCategory(vehicle.category);

  return (
    <div className="container py-8 pb-28 md:py-12 lg:pb-12">
      <Link to={cat.path} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> {cat.plural}</Link>
      <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-12">
        <div className="min-w-0 space-y-12">
          <Gallery images={vehicle.images} fit={vehicle.category === "motorcycle" ? "contain" : "cover"} />
          <section>
            <div className="flex flex-wrap items-center gap-2"><VehicleBadge label={vehicle.badge} /><Badge variant="gold">{cat.label}</Badge>{vehicle.isSample && <Badge variant="pending">Sample listing</Badge>}</div>
            <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{vehicle.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{vehicle.tagline}</p>
            <AvailabilityNote vehicle={vehicle} className="mt-3 text-sm" />
            <p className="mt-5 max-w-prose leading-relaxed">{vehicle.description}{(vehicle.category === "motorcycle" || vehicle.category === "scooty") && ` ${shop.helmetNote}`}</p>
            <div className="mt-6 rounded-xl border bg-secondary/50 p-4">
              <p className="mb-2 text-sm font-bold">Included with every rental</p>
              <Included category={vehicle.category} className="text-sm" />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
              {vehicle.brand && <div className="bg-card p-4"><dt className="text-xs text-muted-foreground">Brand</dt><dd className="mt-1 font-semibold">{vehicle.brand}</dd></div>}
              {vehicle.modelYear && <div className="bg-card p-4"><dt className="text-xs text-muted-foreground">Model year</dt><dd className="mt-1 font-semibold">{vehicle.modelYear}</dd></div>}
              {vehicle.specs.map((s) => <div key={s.label} className="bg-card p-4"><dt className="text-xs text-muted-foreground">{s.label}</dt><dd className="mt-1 font-semibold">{s.value}</dd></div>)}
            </dl>
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-bold">Rental prices</h2>
            <DurationPriceTable vehicle={vehicle} />
          </section>
          <VehicleReviews vehicleSlug={vehicle.slug} />
          <section>
            <h2 className="text-2xl font-bold">Rental rules</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">Collection and return are only at our shop in Amarsingh Chowk, Pokhara.</p>
            <RulesSummary />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link to="/policies">Read all rental policies</Link></Button>
              <WhatsAppButton message={buildInquiryMessage({ vehicleName: vehicle.name })} label="Ask about this vehicle" variant="outline" />
            </div>
          </section>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start"><BookingPanel vehicle={vehicle} /></div>
      </div>
    </div>
  );
}
