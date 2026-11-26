import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CategoryFilter } from "@/components/vehicles/CategoryFilter";
import { DateFilterBar } from "@/components/vehicles/DateFilterBar";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { getCategory } from "@/data/categories";
import { useBlockedRanges } from "@/features/availability/hooks";
import { useVehicles } from "@/features/vehicles/hooks";
import { findClash, mergeRanges } from "@/lib/availability";
import { sortBikesFirst } from "@/lib/vehicleOrder";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { buildInquiryMessage } from "@/lib/whatsapp";
import { useBookingStore } from "@/store/bookingStore";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { Button } from "@/components/ui/button";
import type { VehicleCategory } from "@/types";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default function VehiclesPage({ category }: { category?: VehicleCategory }) {
  const { data: vehicles = [] } = useVehicles();
  const { data: blocked = {} } = useBlockedRanges();
  const [params, setParams] = useSearchParams();
  const update = useBookingStore((s) => s.update);

  // Dates come from the home page search or from this page's own date bar, and live in the URL.
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const datesOn = ISO.test(from) && ISO.test(to) && to > from;
  const showBooked = params.get("booked") === "1";
  useEffect(() => { if (datesOn) update({ startDate: from, returnDate: to }); }, [datesOn, from, to, update]);

  const list = category ? vehicles.filter((v) => v.category === category) : sortBikesFirst(vehicles);
  const isFree = (v: (typeof list)[number]) => !findClash(from, to, mergeRanges(v.bookedRanges, blocked[v.slug]));
  const taken = new Set(datesOn ? list.filter((v) => !isFree(v)).map((v) => v.slug) : []);
  const free = list.length - taken.size;
  const shown = datesOn && !showBooked ? list.filter((v) => !taken.has(v.slug)) : list;

  const meta = category ? getCategory(category) : null;
  const title = meta ? `${meta.plural} for rent` : "All bikes, scooties and cars";
  useDocumentMeta(title, meta ? `${meta.plural} for rent in Pokhara, Nepal. ${meta.blurb}` : "Browse bikes and scooties for rent in Pokhara, Nepal. Cars available on request.");

  const setDates = (f: string, t: string) => setParams((p) => { const n = new URLSearchParams(p); n.set("from", f); n.set("to", t); return n; }, { replace: true });
  const clearDates = () => setParams((p) => { const n = new URLSearchParams(p); ["from", "to", "booked"].forEach((k) => n.delete(k)); return n; }, { replace: true });
  const toggleBooked = (on: boolean) => setParams((p) => { const n = new URLSearchParams(p); if (on) n.set("booked", "1"); else n.delete("booked"); return n; }, { replace: true });

  const onRequestOnly = (category === "car" || category === "jeep") && list.length === 0;

  return (
    <div className="container py-12 md:py-16">
      <h1 className="text-4xl font-extrabold md:text-6xl">{title}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">{meta ? meta.blurb : "Bikes and scooties first, with cars on request. All collected from our shop in Pokhara."}</p>
      <div className="mt-8"><DateFilterBar from={from} to={to} active={datesOn} total={list.length} free={free} showBooked={showBooked} onApply={setDates} onClear={clearDates} onToggleBooked={toggleBooked} /></div>
      <p className="mt-6 text-sm font-semibold text-brand-golddeep">{datesOn ? "Pick a bike. Your dates are already filled in." : "Step 1: pick your bike. You choose your dates next."}</p>
      <div className="mt-4"><CategoryFilter /></div>
      <div className="mt-8">
        {onRequestOnly ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="font-heading text-lg font-bold">{meta?.plural} are available on request</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">No {meta?.plural.toLowerCase()} are listed online yet. Message the shop with your dates and we will quote you.</p>
            <div className="mt-5 flex justify-center"><WhatsAppButton message={buildInquiryMessage({ vehicleName: meta?.label })} label={`Ask about a ${meta?.label.toLowerCase()}`} /></div>
          </div>
        ) : datesOn && shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center" role="status">
            <p className="font-heading text-lg font-bold">Nothing is free on those dates</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Every {meta ? meta.label.toLowerCase() : "vehicle"} here is booked for your dates. Try nearby dates, or message the shop and we will help you find a ride.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => toggleBooked(true)}>Show booked {meta ? meta.plural.toLowerCase() : "vehicles"} anyway</Button>
              <WhatsAppButton message={buildInquiryMessage({ startDate: from, returnDate: to })} label="Ask the shop" />
            </div>
          </div>
        ) : <VehicleList vehicles={shown} unavailable={taken} />}
      </div>
    </div>
  );
}
