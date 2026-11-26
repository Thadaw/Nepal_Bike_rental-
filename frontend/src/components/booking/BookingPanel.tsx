import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, MessageCircle } from "lucide-react";
import type { Vehicle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceBreakdown } from "./PriceBreakdown";
import { DurationChips } from "./DurationChips";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { useBookedRanges } from "@/features/availability/hooks";
import { AvailabilityNote } from "@/components/vehicles/AvailabilityNote";
import { Included } from "@/components/policies/Rules";
import { findClash, formatBookedRange } from "@/lib/availability";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { WhatsAppBookingButton } from "@/components/whatsapp/WhatsAppBookingButton";
import { useVehicles } from "@/features/vehicles/hooks";
import { sortBikesFirst } from "@/lib/vehicleOrder";
import { getCategory } from "@/data/categories";
import { useBookingStore } from "@/store/bookingStore";
import { useRentalQuote } from "@/hooks/useRentalQuote";
import { usePricing } from "@/features/pricing/hooks";
import { addDaysISO, pickupTimes, rentalDays, todayISO } from "@/lib/dates";
import { emptyQuote, formatNpr, vehicleDailyRate } from "@/lib/pricing";
import { pricingConfig } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { shop } from "@/config/shop";
import { bookingCategoryLabel, buildInquiryMessage } from "@/lib/whatsapp";

export function BookingPanel({ vehicle }: { vehicle: Vehicle }) {
  const navigate = useNavigate();
  const draft = useBookingStore();
  const { update } = draft;
  const [waOpen, setWaOpen] = useState(false);
  const { data: allVehicles = [] } = useVehicles();
  const sorted = sortBikesFirst(allVehicles);
  const groups = ["motorcycle", "scooty", "car", "jeep"] as const;
  const { data: pricing } = usePricing();
  const config = pricing ?? pricingConfig;
  const rate = vehicleDailyRate(vehicle, config);

  // Bind the shared draft to this vehicle; clear a destination the vehicle does not offer.
  useEffect(() => {
    if (draft.vehicleSlug !== vehicle.slug) update({ vehicleSlug: vehicle.slug, tripType: "city", destination: "" });
  }, [vehicle.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const { quote } = useRentalQuote({ ...draft, vehicleSlug: vehicle.slug, tripType: "city", destination: "" });
  const invalidReturn = !!draft.startDate && !!draft.returnDate && draft.returnDate <= draft.startDate;
  const activeQuote = invalidReturn ? emptyQuote("incomplete", "Return date must be after the start date.") : quote;
  const days = rentalDays(draft.startDate, draft.returnDate);
  const today = todayISO();
  const bookedRanges = useBookedRanges(vehicle);
  const clash = findClash(draft.startDate, draft.returnDate, bookedRanges);
  const message = buildInquiryMessage({ vehicleName: vehicle.name, startDate: draft.startDate, returnDate: draft.returnDate, quote: activeQuote });
  const noun = vehicle.category === "car" ? "car" : vehicle.category === "jeep" ? "jeep" : "bike";

  return (
    <>
      <aside id="booking-panel" aria-label="Booking panel" className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5">
        {/* Price header */}
        <div className="bg-brand-charcoal p-5 text-brand-warm sm:p-6">
          <p className="text-xs uppercase tracking-wider text-brand-gold">{rate === null ? "Price" : "Rent from"}</p>
          <p className="mt-1 font-heading text-3xl font-extrabold">
            {rate === null ? "On request" : <>{formatNpr(rate, config)}<span className="text-base font-medium text-brand-warm/60"> / day</span></>}
          </p>
          <p className="mt-1 text-sm text-brand-warm/70">{vehicle.name}</p>
        </div>

        <div className="border-b bg-secondary/50 px-5 py-3 sm:px-6"><Included category={vehicle.category} /></div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Choose / change vehicle */}
          <div className="space-y-1.5">
            <Label htmlFor="bp-vehicle">Your {noun}</Label>
            <Select id="bp-vehicle" value={vehicle.slug} onChange={(e) => navigate(`/vehicles/${e.target.value}`)}>
              {groups.map((g) => {
                const list = sorted.filter((x) => x.category === g);
                return list.length > 0 && (
                  <optgroup key={g} label={getCategory(g).plural}>
                    {list.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
                  </optgroup>
                );
              })}
            </Select>
            <p className="text-xs text-muted-foreground">Pick a different one and your dates stay.</p>
          </div>

          {/* 1. Dates */}
          <section aria-labelledby="bp-when">
            <h2 id="bp-when" className="mb-3 flex items-center gap-2 text-sm font-bold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-xs text-brand-charcoal">1</span> When do you need it?</h2>
            <AvailabilityCalendar ranges={bookedRanges} start={draft.startDate} end={draft.returnDate} onSelect={(s, r) => update({ startDate: s, returnDate: r })} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bp-start">Pickup date</Label>
                <Input id="bp-start" type="date" min={today} value={draft.startDate} onChange={(e) => update({ startDate: e.target.value, returnDate: draft.returnDate && draft.returnDate <= e.target.value ? "" : draft.returnDate })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bp-return">Return date</Label>
                <Input id="bp-return" type="date" min={draft.startDate ? addDaysISO(draft.startDate, 1) : today} value={draft.returnDate} aria-invalid={invalidReturn || undefined} onChange={(e) => update({ returnDate: e.target.value })} />
              </div>
            </div>
            <div className="mt-3"><DurationChips compact startDate={draft.startDate} returnDate={draft.returnDate} onPick={(s, r) => update({ startDate: s, returnDate: r })} /></div>
            <div className="mt-3 space-y-1.5">
              <Label htmlFor="bp-time">Pickup time <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Select id="bp-time" value={draft.pickupTime} onChange={(e) => update({ pickupTime: e.target.value })}>
                <option value="">Not sure yet</option>
                {pickupTimes.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            {invalidReturn && <p role="alert" className="mt-2 text-xs text-destructive">Return date must be after the pickup date.</p>}
            <AvailabilityNote vehicle={vehicle} className="mt-3" />
            {clash && (
              <p role="alert" className="mt-2 flex items-start gap-1.5 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden /> Booked {formatBookedRange(clash)}. Pick other dates or another {noun}.
              </p>
            )}
          </section>

          {/* 2. Price */}
          <section aria-labelledby="bp-price">
            <h2 id="bp-price" className="mb-3 flex items-center gap-2 text-sm font-bold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-xs text-brand-charcoal">2</span> Your price{days > 0 && !invalidReturn ? ` for ${days} day${days === 1 ? "" : "s"}` : ""}</h2>
            <PriceBreakdown quote={activeQuote} />
          </section>

          {/* Actions */}
          <div className="space-y-3">
            <Button size="lg" className="w-full" disabled={invalidReturn || !!clash} onClick={() => navigate(`/booking?bike=${vehicle.slug}`)}>Book now</Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            {!waOpen ? (
              <Button type="button" variant="whatsapp" size="lg" className="w-full" onClick={() => setWaOpen(true)}><MessageCircle aria-hidden /> Book via WhatsApp</Button>
            ) : (
              <div className="rounded-xl border bg-secondary/40 p-3">
                <p className="mb-3 text-xs text-muted-foreground">Add your name and number. WhatsApp opens with your booking already typed.</p>
                <WhatsAppBookingButton
                  vehicleName={vehicle.name}
                  vehicleSlug={vehicle.slug}
                  category={bookingCategoryLabel(vehicle.category)}
                  startDate={draft.startDate}
                  returnDate={draft.returnDate}
                  tripType="city"
                  days={activeQuote.days}
                  destinationName=""
                  quote={activeQuote}
                  disabled={!!clash}
                  label="Open WhatsApp"
                />
              </div>
            )}
            <div className="text-center"><WhatsAppButton message={message} size="sm" variant="ghost" label="Just ask a question" /></div>
          </div>
          <p className="rounded-lg bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground"><strong className="font-semibold text-foreground">How payment works:</strong> an advance when you take the vehicle, the rest when you return it. <Link to="/policies" className="underline underline-offset-4">Rental policies</Link></p>
          <p className="text-xs leading-relaxed text-muted-foreground">{shop.bookingStatusNotice}</p>
        </div>
      </aside>

      {/* Mobile bar: price always in reach, one tap to the booking panel */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t bg-background/95 px-5 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-[11px] text-muted-foreground">{rate === null ? "Price" : `${noun[0].toUpperCase()}${noun.slice(1)} from`}</p>
          <p className="font-heading text-lg font-extrabold leading-none">{rate === null ? "On request" : <>{formatNpr(rate, config)}<span className="text-xs font-medium text-muted-foreground"> /day</span></>}</p>
        </div>
        <Button onClick={() => document.getElementById("booking-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Book now</Button>
      </div>
    </>
  );
}
