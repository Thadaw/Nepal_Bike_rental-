import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Undo2 } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminLayout";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pricingConfig, type PricingConfig } from "@/config/pricing";
import { usePricing, useUpdatePricing } from "@/features/pricing/hooks";
import { pricingFormSchema } from "@/features/pricing/schemas";
import { useUpdateVehicle, useVehicles } from "@/features/vehicles/hooks";
import { getCategory } from "@/data/categories";
import { calculateQuote, formatNpr } from "@/lib/pricing";
import type { Vehicle, VehicleCategory } from "@/types";
import { cn } from "@/lib/utils";

const presetDays = [1, 7, 14, 21, 30];
const categoryOrder: VehicleCategory[] = ["scooty", "motorcycle", "car", "jeep"];

/** What the admin is typing for one vehicle. Empty price + not on request = "use the type default". */
interface PriceDraft { rate: string; onRequest: boolean }

const toDraft = (v: Vehicle): PriceDraft => ({
  rate: typeof v.dailyRateOverride === "number" ? String(v.dailyRateOverride) : "",
  onRequest: v.dailyRateOverride === null,
});
/** number = own price, null = on request, undefined = use the default of its type. */
const toOverride = (d: PriceDraft): number | null | undefined => (d.onRequest ? null : d.rate.trim() === "" ? undefined : Math.max(0, Number(d.rate) || 0));
const sameDraft = (a: PriceDraft, b: PriceDraft) => a.onRequest === b.onRequest && a.rate.trim() === b.rate.trim();

export default function AdminPricing() {
  const pricingQuery = usePricing();
  const { data: pricingData, isPlaceholderData } = pricingQuery;
  const { data: vehicles = [] } = useVehicles();
  const updatePricing = useUpdatePricing();
  const updateVehicle = useUpdateVehicle();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  /** Unsaved price edits, keyed by vehicle slug. A vehicle that is not in here shows its saved price. */
  const [drafts, setDrafts] = useState<Record<string, PriceDraft>>({});
  const [pv, setPv] = useState({ slug: "", days: 7 });
  const form = useForm<PricingConfig>({ resolver: zodResolver(pricingFormSchema), defaultValues: structuredClone(pricingData ?? pricingConfig) });
  const { control, handleSubmit, watch, reset, formState: { isSubmitting, isDirty } } = form;
  const { fields: tierFields, append, remove } = useFieldArray({ control, name: "discountTiers" });
  const hydrated = useRef(false);
  const values = watch();

  useEffect(() => {
    if (!hydrated.current && !isPlaceholderData && pricingData) {
      hydrated.current = true;
      reset(structuredClone(pricingData));
    }
  }, [pricingData, isPlaceholderData, reset]);

  const tiers = [...values.discountTiers].sort((a, b) => a.minDays - b.minDays);
  const dupDays = new Set(tiers.map((t) => t.minDays)).size !== tiers.length;
  const rangeLabel = (minDays: number) => {
    const i = tiers.findIndex((t) => t.minDays === minDays);
    const next = tiers[i + 1];
    return next ? `${minDays}${next.minDays - 1 > minDays ? `-${next.minDays - 1}` : ""} days` : `${minDays}+ days`;
  };

  const draftOf = (v: Vehicle): PriceDraft => drafts[v.slug] ?? toDraft(v);
  /** Per-day price a vehicle charges with the current (unsaved) edits. null = on request. */
  const rateOf = (v: Vehicle): number | null => {
    const own = toOverride(draftOf(v));
    return own !== undefined ? own : values.baseDailyRates[v.category] ?? null;
  };
  const changedVehicles = vehicles.filter((v) => drafts[v.slug] && !sameDraft(drafts[v.slug], toDraft(v)));
  const hasUnsaved = isDirty || changedVehicles.length > 0;

  const setDraft = (v: Vehicle, patch: Partial<PriceDraft>) => {
    setDrafts((d) => ({ ...d, [v.slug]: { ...(d[v.slug] ?? toDraft(v)), ...patch } }));
    setSaved(false);
  };

  const previewVehicle = vehicles.find((v) => v.slug === pv.slug) ?? vehicles[0];
  const preview = previewVehicle
    ? calculateQuote({ category: previewVehicle.category, baseDailyRate: toOverride(draftOf(previewVehicle)), offRoadEligible: false, tripType: "city", destination: null, days: pv.days }, values)
    : null;

  const onSubmit = handleSubmit(async (data) => {
    const savedConfig = { ...data, discountTiers: [...data.discountTiers].sort((a, b) => a.minDays - b.minDays) };
    setSaved(false);
    setSaveError("");
    try {
      await updatePricing.mutateAsync(savedConfig);
      await Promise.all(changedVehicles.map((v) => updateVehicle.mutateAsync({ slug: v.slug, patch: { dailyRateOverride: toOverride(draftOf(v)) } })));
      reset(structuredClone(savedConfig));
      setDrafts({});
      setSaved(true);
    } catch {
      setSaveError("Some prices could not be saved. Check your connection and press Save pricing again.");
    }
  });

  const touch = () => setSaved(false);
  const groups = categoryOrder.map((c) => ({ category: c, items: vehicles.filter((v) => v.category === c) })).filter((g) => g.items.length > 0);

  return (
    <>
      <AdminTitle
        title="Pricing"
        text="Set the daily price of each vehicle, plus the long-rental discounts. The preview uses your unsaved changes."
        action={
          <div className="flex items-center gap-3">
            {hasUnsaved && <span className="text-xs font-semibold text-brand-golddeep">Unsaved changes</span>}
            <Button type="submit" form="pricing-form" disabled={updatePricing.isPending || updateVehicle.isPending || isSubmitting || dupDays || !hasUnsaved}>Save pricing</Button>
          </div>
        }
      />
      {saveError && <p role="alert" className="mb-6 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">{saveError}</p>}
      {saved && !hasUnsaved && <p role="status" className="mb-6 rounded-lg bg-emerald-100 px-4 py-2 text-sm text-emerald-800">Pricing saved. The website now shows the new prices.</p>}
      <form id="pricing-form" onSubmit={onSubmit} noValidate>
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-bold">Fallback rate by type (NPR per day)</h2>
              <p className="mt-1 text-sm text-muted-foreground">Only used by a vehicle that has no price of its own (set below, or in <Link to="/admin/vehicles" className="underline underline-offset-4">Vehicles</Link>). New vehicles start with this price.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(["scooty", "motorcycle", "car", "jeep"] as const).map((c) => (
                  <div key={c} className="space-y-1.5"><Label htmlFor={`r-${c}`}>{getCategory(c).label}</Label>
                    <Controller control={control} name={`baseDailyRates.${c}`} render={({ field }) => (
                      <Input id={`r-${c}`} ref={field.ref} type="number" min={0} placeholder="On request" value={field.value ?? ""} onBlur={field.onBlur} onChange={(e) => { field.onChange(e.target.value.trim() === "" ? null : Math.max(0, Number(e.target.value) || 0)); touch(); }} />
                    )} />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Leave a box empty for "on request": those vehicles show a custom quotation instead of a price.</p>
            </section>

            <section className="rounded-2xl border bg-card p-6" aria-labelledby="vp-h">
              <h2 id="vp-h" className="text-lg font-bold">Price of each vehicle</h2>
              <p className="mt-1 text-sm text-muted-foreground">Every vehicle has its own price per day. Leave a box empty to use the fallback rate of its type, or tick "On request" to show a custom quotation instead of a price.</p>
              {groups.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No vehicles yet. Add one in Vehicles to set its price.</p>}
              <div className="mt-5 space-y-6">
                {groups.map((g) => (
                  <div key={g.category}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{getCategory(g.category).plural} <span className="font-medium normal-case tracking-normal">· fallback {values.baseDailyRates[g.category] == null ? "on request" : `${formatNpr(values.baseDailyRates[g.category] as number, values)} per day`}</span></h3>
                    <ul className="divide-y rounded-xl border">
                      {g.items.map((v) => {
                        const d = draftOf(v);
                        const own = toOverride(d);
                        const rate = rateOf(v);
                        const changed = changedVehicles.some((x) => x.slug === v.slug);
                        const status = d.onRequest ? "Price on request" : own === undefined ? "Uses type fallback" : "Own price";
                        const fallback = values.baseDailyRates[v.category];
                        return (
                          <li key={v.slug} className={cn("flex flex-wrap items-center gap-x-4 gap-y-3 p-3 sm:flex-nowrap", changed && "bg-brand-gold/10")}>
                            <div className="flex min-w-0 flex-1 items-center gap-3 basis-full sm:basis-auto">
                              <img src={v.images[0]?.src} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-lg bg-secondary object-contain" />
                              <div className="min-w-0">
                                <p className="truncate font-heading text-sm font-semibold">{v.name}</p>
                                <p className="text-xs text-muted-foreground">{status}{rate !== null ? ` · ${formatNpr(rate, values)} per day` : ""}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{values.currencySymbol}</span>
                                <Input
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  aria-label={`Price per day for ${v.name}`}
                                  className="w-36 pl-9"
                                  disabled={d.onRequest}
                                  placeholder={fallback == null ? "On request" : String(fallback)}
                                  value={d.onRequest ? "" : d.rate}
                                  onChange={(e) => setDraft(v, { rate: e.target.value, onRequest: false })}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">/ day</span>
                            </div>
                            <label className="flex items-center gap-2 text-xs">
                              <Checkbox checked={d.onRequest} onCheckedChange={(c) => setDraft(v, { onRequest: c === true, rate: c === true ? "" : d.rate })} aria-label={`${v.name}: price on request`} /> On request
                            </label>
                            <Button type="button" variant="ghost" size="icon" aria-label={`Use the type fallback price for ${v.name}`} title="Use the type fallback price" disabled={own === undefined} onClick={() => setDraft(v, { rate: "", onRequest: false })}><Undo2 /></Button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-bold">Long-rental discounts</h2>
              <p className="mt-1 text-sm text-muted-foreground">A discount applies from its start day until the next tier begins.</p>
              <div className="mt-4 space-y-3">
                {tierFields.map((tier, i) => {
                  const minDays = values.discountTiers?.[i]?.minDays ?? tier.minDays;
                  const pct = values.discountTiers?.[i]?.percent ?? tier.percent;
                  const base = values.baseDailyRates.motorcycle;
                  return (
                    <div key={tier.id} className="flex flex-wrap items-end gap-3 rounded-xl border p-3">
                      <div className="space-y-1.5"><Label htmlFor={`t-d-${i}`}>From (days)</Label>
                        <Controller control={control} name={`discountTiers.${i}.minDays`} render={({ field }) => (
                          <Input id={`t-d-${i}`} ref={field.ref} type="number" min={1} className="w-28" value={field.value} onBlur={field.onBlur} onChange={(e) => { field.onChange(Math.max(1, Number(e.target.value) || 1)); touch(); }} />
                        )} />
                      </div>
                      <div className="space-y-1.5"><Label htmlFor={`t-p-${i}`}>Discount (%)</Label>
                        <Controller control={control} name={`discountTiers.${i}.percent`} render={({ field }) => (
                          <Input id={`t-p-${i}`} ref={field.ref} type="number" min={0} max={100} className="w-28" value={field.value} onBlur={field.onBlur} onChange={(e) => { field.onChange(Math.min(100, Math.max(0, Number(e.target.value) || 0))); touch(); }} />
                        )} />
                      </div>
                      <p className="min-w-[10rem] flex-1 pb-2 text-xs text-muted-foreground">
                        <strong className="text-foreground">{rangeLabel(minDays)}</strong>
                        {base != null && <> · bike about {formatNpr(Math.round(base * (1 - pct / 100)), values)}/day</>}
                      </p>
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove tier" disabled={tierFields.length <= 1} onClick={() => { remove(i); touch(); }}><Trash2 /></Button>
                    </div>
                  );
                })}
                {dupDays && <p role="alert" className="text-xs text-destructive">Two tiers start on the same day. Change one before saving.</p>}
                <Button type="button" variant="outline" size="sm" onClick={() => { append({ minDays: (tiers.at(-1)?.minDays ?? 0) + 7, percent: 0 }); touch(); }}><Plus /> Add tier</Button>
              </div>
              <Controller control={control} name="discountsConfirmed" render={({ field }) => (
                <label className="mt-6 flex items-center gap-2 text-sm"><Checkbox checked={field.value} onCheckedChange={(c) => { field.onChange(c === true); touch(); }} /> Discounts are final (turn off to show a "demo values" notice on the website)</label>
              )} />
            </section>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6 xl:sticky xl:top-6">
            <h2 className="text-lg font-bold">Price preview</h2>
            <div className="space-y-1.5"><Label htmlFor="pv-v">Vehicle</Label>
              <Select id="pv-v" value={previewVehicle?.slug ?? ""} onChange={(e) => setPv({ ...pv, slug: e.target.value })}>
                {vehicles.map((v) => <option key={v.slug} value={v.slug}>{v.name}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="pv-d">Rental length (days)</Label>
              <div className="mt-1.5 flex flex-wrap gap-2" role="group" aria-label="Quick lengths">
                {presetDays.map((d) => (
                  <button key={d} type="button" aria-pressed={pv.days === d} onClick={() => setPv({ ...pv, days: d })} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", pv.days === d ? "border-brand-charcoal bg-brand-charcoal text-brand-warm" : "hover:border-foreground")}>{d}</button>
                ))}
              </div>
              <Input id="pv-d" type="number" min={1} className="mt-2" value={pv.days} onChange={(e) => setPv({ ...pv, days: Math.max(1, Number(e.target.value) || 1) })} />
            </div>
            {preview ? <PriceBreakdown quote={preview} /> : <p className="text-sm text-muted-foreground">Add a vehicle to preview its price.</p>}
          </aside>
        </div>
      </form>
    </>
  );
}
