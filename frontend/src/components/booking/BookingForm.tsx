import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, CheckCircle2, ChevronDown, Loader2, MessageCircle } from "lucide-react";
import { bookingSchema, type BookingFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PriceBreakdown } from "./PriceBreakdown";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { WhatsAppHandoff } from "./WhatsAppHandoff";
import { DurationChips } from "./DurationChips";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { WhatToBring } from "./WhatToBring";
import { useBookedRanges } from "@/features/availability/hooks";
import { VehicleBadge } from "@/components/vehicles/VehicleBadge";
import { AvailabilityNote } from "@/components/vehicles/AvailabilityNote";
import { getVehicle } from "@/data/vehicles";
import { findClash, formatBookedRange } from "@/lib/availability";
import { getCategory } from "@/data/categories";
import { useVehicles } from "@/features/vehicles/hooks";
import { usePricing } from "@/features/pricing/hooks";
import { useCreateBookingRequest } from "@/features/bookings/hooks";
import type { BookingRequestResult, CreateBookingInput } from "@/features/bookings/types";
import { useBookingStore } from "@/store/bookingStore";
import { useRentalQuote } from "@/hooks/useRentalQuote";
import { bookingCategoryLabel, buildBookingMessage, buildInquiryMessage } from "@/lib/whatsapp";
import { openWhatsAppWithMessage, type HandoffStatus } from "@/lib/whatsappHandoff";
import { addDaysISO, formatDate, makeReference, pickupTimes, rentalDays, todayISO } from "@/lib/dates";
import { formatNpr, vehicleDailyRate } from "@/lib/pricing";
import { pricingConfig } from "@/config/pricing";
import { shop } from "@/config/shop";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types";

const steps = ["Bike", "Dates", "Your details", "Review"] as const;
const stepFields: (keyof BookingFormValues)[][] = [["vehicleSlug"], ["startDate", "returnDate"], ["name", "phone", "email", "message"], ["terms"]];

function StepCaption({ n }: { n: number }) {
  return <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-golddeep">Step {n} of {steps.length}</p>;
}

function DatesSummary({ start, end, days }: { start: string; end: string; days: number }) {
  const cell = (label: string, value: string) => (
    <div className="rounded-xl border bg-card p-3 text-center"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p><p className={cn("mt-0.5 font-heading text-sm font-bold sm:text-base", !value && "font-normal text-muted-foreground")}>{value || "Choose"}</p></div>
  );
  return (
    <div className="grid grid-cols-3 gap-3" aria-live="polite">
      {cell("Pickup", start ? formatDate(start) : "")}
      {cell("Return", end ? formatDate(end) : "")}
      {cell("Length", days > 0 ? `${days} day${days === 1 ? "" : "s"}` : "")}
    </div>
  );
}

function Field({ label, error, hint, children, htmlFor, required }: { label: string; error?: string; hint?: string; children: React.ReactNode; htmlFor: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}{required && <span className="ml-0.5 text-destructive" aria-hidden> *</span>}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${htmlFor}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Stepper({ step, onGo }: { step: number; onGo: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Booking progress">
      {steps.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <button
              type="button"
              disabled={!done}
              onClick={() => onGo(i)}
              aria-current={current ? "step" : undefined}
              className={cn("flex items-center gap-2 rounded-full text-sm font-semibold", done && "cursor-pointer")}
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border text-xs", done ? "border-brand-charcoal bg-brand-charcoal text-brand-warm" : current ? "border-brand-gold bg-brand-gold text-brand-charcoal" : "text-muted-foreground")}>
                {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn("hidden sm:inline", !current && !done && "text-muted-foreground")}>{label}</span>
            </button>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", done ? "bg-brand-charcoal" : "bg-border")} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function VehicleOption({ vehicle, rate }: { vehicle: Vehicle; rate: number | null }) {
  return (
    <>
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-brand-stone">
        <VehicleBadge label={vehicle.badge} className="absolute left-2 top-2 z-10" />
        <img src={vehicle.images[0].src} alt="" loading="lazy" className={cn("h-full w-full", (vehicle.category === "car" || vehicle.category === "jeep") ? "object-cover" : "object-contain p-1")} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-heading font-bold leading-tight">{vehicle.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{vehicle.keySpecs.slice(0, 2).join(" · ")}</p>
          <AvailabilityNote vehicle={vehicle} className="mt-2" />
        </div>
        <p className="shrink-0 text-right font-heading text-sm font-extrabold">
          {rate === null ? "On request" : <>{formatNpr(rate)}<span className="block text-[11px] font-medium text-muted-foreground">per day</span></>}
        </p>
      </div>
    </>
  );
}

export function BookingForm() {
  const draft = useBookingStore();
  const [params] = useSearchParams();
  // "Book this bike" links carry ?bike=slug and land on dates. A plain visit always starts at bike selection.
  const preselected = getVehicle(params.get("bike") ?? "")?.slug ?? "";
  const [step, setStep] = useState(() => (preselected ? 1 : 0));
  const [result, setResult] = useState<BookingRequestResult | null>(null);
  const [handoff, setHandoff] = useState<{ reference: string; message: string; url: string | null; status: HandoffStatus } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [showCars, setShowCars] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const { data: vehicles = [] } = useVehicles();
  const { data: pricing } = usePricing();
  const createBooking = useCreateBookingRequest();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", email: "", vehicleSlug: preselected || draft.vehicleSlug, startDate: draft.startDate, returnDate: draft.returnDate, tripType: "city", destination: "", pickupTime: draft.pickupTime, message: "", terms: false as unknown as true },
  });
  const { register, control, handleSubmit, watch, setValue, trigger, getValues, formState: { errors } } = form;
  const v = watch();
  const { quote } = useRentalQuote({ ...v, tripType: "city", destination: "" });
  const vehicle = vehicles.find((x) => x.slug === v.vehicleSlug);
  const config = pricing ?? pricingConfig;
  const rateOf = (x: Vehicle) => vehicleDailyRate(x, config);

  const { bikes, scooties, cars, jeeps } = useMemo(() => ({
    bikes: vehicles.filter((x) => x.category === "motorcycle"),
    scooties: vehicles.filter((x) => x.category === "scooty"),
    cars: vehicles.filter((x) => x.category === "car"),
    jeeps: vehicles.filter((x) => x.category === "jeep"),
  }), [vehicles]);

  const days = rentalDays(v.startDate, v.returnDate);
  const bookedRanges = useBookedRanges(vehicle);
  const clash = vehicle ? findClash(v.startDate, v.returnDate, bookedRanges) : null;

  // Keep a selected car visible even when the car list is collapsed.
  useEffect(() => { if (vehicle?.category === "car" || vehicle?.category === "jeep") setShowCars(true); }, [vehicle?.category]);

  const goTo = (i: number) => {
    setStep(i);
    setSubmitError("");
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const next = async () => {
    if (step === 1 && clash) return;
    if (await trigger(stepFields[step])) goTo(step + 1);
  };
  const buildPayload = (values: BookingFormValues, extra: Partial<CreateBookingInput>): CreateBookingInput => ({
    name: values.name, phone: values.phone, email: values.email ?? "", vehicleSlug: values.vehicleSlug,
    startDate: values.startDate, returnDate: values.returnDate, tripType: "city", destination: "",
    pickupTime: values.pickupTime ?? "", message: values.message ?? "", days: quote.days, estimateStatus: quote.status, estimateTotal: quote.finalTotal, ...extra,
  });

  const sendWebsite = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      setResult(await createBooking.mutateAsync(buildPayload(values, { source: "website", reference: makeReference() })));
      draft.reset();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again or use WhatsApp.");
    }
  });

  // WhatsApp must open synchronously inside the click, so validation is synchronous here.
  const sendWhatsApp = () => {
    setSubmitError("");
    const parsed = bookingSchema.safeParse(getValues());
    if (!parsed.success) {
      void trigger();
      const first = parsed.error.issues[0]?.path[0] as keyof BookingFormValues | undefined;
      const target = stepFields.findIndex((f) => first && f.includes(first));
      if (target >= 0) goTo(target);
      return;
    }
    const values = parsed.data;
    const reference = makeReference();
    const message = buildBookingMessage({
      vehicleName: vehicle?.name ?? "", category: bookingCategoryLabel(vehicle?.category), customerName: values.name, phone: values.phone,
      startDate: values.startDate, returnDate: values.returnDate, tripType: "city", days: quote.days,
      destinationName: "", extraMessage: values.message, quote, reference, pickupTime: values.pickupTime,
    });
    const opened = openWhatsAppWithMessage(message);
    // Save a copy so the shop sees the request in the admin list too.
    createBooking.mutate(buildPayload(values, { source: "whatsapp", reference }));
    setHandoff({ reference, message, ...opened });
    draft.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (handoff) return <WhatsAppHandoff {...handoff} onBack={() => setHandoff(null)} />;

  if (result) {
    const followUp = buildInquiryMessage({ vehicleName: vehicle?.name, startDate: v.startDate, returnDate: v.returnDate, quote, reference: result.reference });
    return (
      <div className="rounded-2xl border bg-card p-8 text-center sm:p-10" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-3xl font-bold">Request sent</h2>
        <p className="mt-2 text-muted-foreground">Your reference <strong className="font-heading text-foreground">{result.reference}</strong></p>
        <ol className="mx-auto mt-6 max-w-md space-y-3 text-left text-sm">
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold/25 text-xs font-bold text-brand-golddeep">1</span><span className="pt-0.5">The shop checks the bike for your dates.</span></li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold/25 text-xs font-bold text-brand-golddeep">2</span><span className="pt-0.5">They contact you on the phone number you gave to confirm.</span></li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold/25 text-xs font-bold text-brand-golddeep">3</span><span className="pt-0.5">Visit Amarsingh Chowk, Pokhara to collect your bike.</span></li>
        </ol>
        <p className="mx-auto mt-6 max-w-md rounded-lg bg-brand-gold/15 p-4 text-sm">Not a confirmed reservation yet. {shop.collectionNotice}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <WhatsAppButton message={followUp} label="Message the shop on WhatsApp" />
          <Button asChild variant="outline"><Link to="/">Back to home</Link></Button>
        </div>
      </div>
    );
  }

  const invalid = (n: keyof BookingFormValues) => (errors[n] ? true : undefined);
  const renderGroup = (title: string, list: Vehicle[]) => list.length > 0 && (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((x) => (
          <label key={x.slug} className="cursor-pointer">
            <input type="radio" value={x.slug} className="peer sr-only" {...register("vehicleSlug")} />
            <div className="h-full rounded-xl border bg-card p-3 transition peer-checked:border-brand-charcoal peer-checked:ring-2 peer-checked:ring-brand-gold peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:border-foreground/50">
              <VehicleOption vehicle={x} rate={rateOf(x)} />
              <span className={cn("mt-3 flex items-center justify-center gap-1.5 rounded-full border py-2 text-sm font-semibold transition", v.vehicleSlug === x.slug ? "border-brand-charcoal bg-brand-charcoal text-brand-warm" : "text-foreground")}>
                {v.vehicleSlug === x.slug ? <><Check className="h-4 w-4" aria-hidden /> Selected</> : "Select"}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const review: [string, string, number][] = [
    ["Bike", vehicle ? `${vehicle.name} (${getCategory(vehicle.category).label})` : "-", 0],
    ["Dates", v.startDate && v.returnDate ? `${formatDate(v.startDate)} to ${formatDate(v.returnDate)} · ${days} day${days === 1 ? "" : "s"}` : "-", 1],
    ["Pickup time", v.pickupTime || "To be agreed with the shop", 1],
    ["Name", v.name || "-", 2],
    ["Phone", v.phone || "-", 2],
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div ref={topRef} className="scroll-mt-24 space-y-5">
        <div className="rounded-2xl border bg-card p-4 sm:p-5"><Stepper step={step} onGo={goTo} /></div>

        <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6 rounded-2xl border bg-card p-5 sm:p-8" aria-label="Booking form">
          {step === 0 && (
            <section className="space-y-6">
              <div>
                <StepCaption n={1} />
                <h2 className="text-2xl font-bold">Which bike do you want?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Prices are per day. Longer rentals get a discount, shown before you send.</p>
              </div>
              {renderGroup("Bikes", bikes)}
              {renderGroup("Scooties", scooties)}
              {(cars.length > 0 || jeeps.length > 0) && (
                <div>
                  <button type="button" onClick={() => setShowCars((s) => !s)} aria-expanded={showCars} className="flex w-full items-center justify-between rounded-xl border border-dashed px-4 py-3 text-left text-sm font-semibold">
                    Looking for a car or jeep instead? <ChevronDown className={cn("h-4 w-4 transition-transform", showCars && "rotate-180")} aria-hidden />
                  </button>
                  {showCars && <div className="mt-4 space-y-6">{renderGroup("Cars", cars)}{renderGroup("Jeeps", jeeps)}</div>}
                </div>
              )}
              {errors.vehicleSlug && <p role="alert" className="text-sm text-destructive">{errors.vehicleSlug.message}</p>}
            </section>
          )}

          {step === 1 && (
            <section className="space-y-6">
              <div>
                <StepCaption n={2} />
                <h2 className="text-2xl font-bold">When do you need it?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Tap your pickup day on the calendar, then your return day.</p>
                {vehicle && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"><span className="font-semibold">{vehicle.name}</span><AvailabilityNote vehicle={vehicle} /></p>
                )}
              </div>
              <DatesSummary start={v.startDate} end={v.returnDate} days={days} />
              <AvailabilityCalendar ranges={bookedRanges} start={v.startDate} end={v.returnDate} onSelect={(s0, r0) => { setValue("startDate", s0, { shouldValidate: true }); setValue("returnDate", r0, { shouldValidate: !!r0 }); }} />
              {clash && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{vehicle?.name} is already booked {formatBookedRange(clash)}. Please choose other dates or another bike.</span>
                </p>
              )}
              <div>
                <p className="mb-2 text-sm font-medium">Quick pick: how many days?</p>
                <DurationChips startDate={v.startDate} returnDate={v.returnDate} onPick={(s0, r0) => { setValue("startDate", s0, { shouldValidate: true }); setValue("returnDate", r0, { shouldValidate: true }); }} />
              </div>
              <fieldset className="rounded-xl border p-4">
                <legend className="px-1 text-sm font-medium">Or type the dates</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Pickup date" htmlFor="startDate" required error={errors.startDate?.message}>
                    <Input id="startDate" type="date" min={todayISO()} aria-invalid={invalid("startDate")} {...register("startDate")} />
                  </Field>
                  <Field label="Return date" htmlFor="returnDate" required error={errors.returnDate?.message}>
                    <Input id="returnDate" type="date" min={v.startDate ? addDaysISO(v.startDate, 1) : todayISO()} aria-invalid={invalid("returnDate")} {...register("returnDate")} />
                  </Field>
                  <Field label="Pickup time" htmlFor="pickupTime" hint="Optional. The shop confirms it.">
                    <Select id="pickupTime" {...register("pickupTime")}>
                      <option value="">Not sure yet</option>
                      {pickupTimes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </Field>
                </div>
              </fieldset>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6">
              <div>
                <StepCaption n={3} />
                <h2 className="text-2xl font-bold">Who is riding?</h2>
                <p className="mt-1 text-sm text-muted-foreground">The shop uses these details to confirm your booking.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
                  <Input id="name" autoComplete="name" placeholder="As on your ID or license" aria-invalid={invalid("name")} {...register("name")} />
                </Field>
                <Field label="Phone / WhatsApp" htmlFor="phone" required error={errors.phone?.message} hint="We reply on this number.">
                  <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+977 98XXXXXXXX" aria-invalid={invalid("phone")} {...register("phone")} />
                </Field>
              </div>
              <Field label="Email (optional)" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" aria-invalid={invalid("email")} {...register("email")} />
              </Field>
              <Field label="Route plans or questions (optional)" htmlFor="message" error={errors.message?.message}>
                <Textarea id="message" rows={3} placeholder="Where do you plan to ride? Helmet size, experience, questions..." {...register("message")} />
              </Field>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-6">
              <div>
                <StepCaption n={4} />
                <h2 className="text-2xl font-bold">Check and send</h2>
                <p className="mt-1 text-sm text-muted-foreground">Choose how you want to send your booking request.</p>
              </div>
              <dl className="divide-y rounded-xl border">
                {review.map(([label, value, target]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 p-3.5 text-sm">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="flex items-baseline gap-3 text-right font-semibold">{value}<button type="button" onClick={() => goTo(target)} className="text-xs font-normal underline underline-offset-4">Edit</button></dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="text-sm font-bold">What happens next</p>
                <ol className="mt-2 space-y-2 text-sm">
                  {["The shop confirms your request on WhatsApp or by phone.", "Come to the shop with your ID and driving licence, and pay the advance.", "Return the vehicle and pay the remaining amount."].map((t, n) => (
                    <li key={n} className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gold text-[11px] font-bold text-brand-charcoal">{n + 1}</span><span>{t}</span></li>
                  ))}
                </ol>
              </div>
              <p role="note" className="rounded-lg border border-dashed p-3 text-xs leading-relaxed text-muted-foreground">{shop.collectionNotice}</p>
              <div>
                <div className="flex items-start gap-3">
                  <Controller control={control} name="terms" render={({ field }) => (
                    <Checkbox id="terms" checked={field.value === true} onCheckedChange={(c) => field.onChange(c === true)} aria-invalid={invalid("terms")} />
                  )} />
                  <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">I understand this is a booking request, not a confirmed reservation. I will bring my ID and a valid driving licence, collect and return at the Pokhara shop, and I accept the <Link to="/policies" target="_blank" className="font-medium underline underline-offset-4">rental policies</Link>.</Label>
                </div>
                {errors.terms && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.terms.message}</p>}
              </div>
              {submitError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="button" size="lg" onClick={() => void sendWebsite()} disabled={createBooking.isPending || !!clash}>
                  {createBooking.isPending ? <><Loader2 className="animate-spin" /> Sending</> : "Send request on website"}
                </Button>
                <Button type="button" size="lg" variant="whatsapp" onClick={sendWhatsApp} disabled={createBooking.isPending || !!clash}>
                  <MessageCircle aria-hidden /> Send via WhatsApp
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">WhatsApp opens with everything already typed. You only press Send.</p>
            </section>
          )}

          <div className="flex items-center justify-between gap-3 border-t pt-5">
            {step > 0 ? <Button type="button" variant="ghost" onClick={() => goTo(step - 1)}>Back</Button> : <span />}
            {step < steps.length - 1 && <Button type="button" size="lg" onClick={() => void next()}>Continue</Button>}
          </div>
        </form>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24" aria-label="Estimate summary">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold">Your estimate</h2>
          <p className="mt-1 text-sm text-muted-foreground">{vehicle ? vehicle.name : "No bike selected yet"}{days > 0 && ` · ${days} day${days === 1 ? "" : "s"}`}</p>
          <PriceBreakdown quote={quote} className="mt-4" />
          <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">Payment: an advance when you take the vehicle, the rest when you return it.</p>
        </div>
        <WhatToBring />
        <p className="rounded-lg border border-dashed border-brand-golddeep/50 bg-brand-gold/10 px-3.5 py-2.5 text-xs leading-relaxed text-brand-golddeep">{shop.bookingStatusNotice}</p>
      </aside>
    </div>
  );
}
