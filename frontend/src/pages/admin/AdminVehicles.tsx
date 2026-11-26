import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminLayout";
import { ImageManager } from "@/components/admin/ImageManager";
import { AvailabilityNote } from "@/components/vehicles/AvailabilityNote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteVehicle, useSaveVehicle, useVehicles } from "@/features/vehicles/hooks";
import { blankVehicleForm, defaultImages, toVehicleForm, vehicleFromForm } from "@/features/vehicles/form";
import { vehicleFormSchema, type VehicleFormValues } from "@/features/vehicles/schemas";
import { getCategory } from "@/data/categories";
import { vehicleBadges } from "@/data/badges";
import { usePricing } from "@/features/pricing/hooks";
import { pricingConfig } from "@/config/pricing";
import { formatNpr, vehicleDailyRate } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Vehicle, VehicleCategory } from "@/types";

const categoryFilters: ("all" | VehicleCategory)[] = ["all", "motorcycle", "scooty", "car", "jeep"];

function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border p-4 sm:p-5">
      <legend className="px-2 font-heading text-sm font-bold">{title}</legend>
      {hint && <p className="-mt-1 mb-4 text-xs text-muted-foreground">{hint}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Err({ message }: { message?: string }) {
  return message ? <p role="alert" className="text-xs text-destructive">{message}</p> : null;
}

export default function AdminVehicles() {
  const { data: vehiclesData = [] } = useVehicles();
  const { data: pricing } = usePricing();
  const priceConfig = pricing ?? pricingConfig;
  const saveVehicle = useSaveVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof categoryFilters)[number]>("all");
  const form = useForm<VehicleFormValues>({ resolver: zodResolver(vehicleFormSchema), defaultValues: structuredClone(blankVehicleForm) });
  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = form;

  const watchedCategory = watch("category");
  const watchedOnRequest = watch("priceOnRequest");
  const defaultRate = priceConfig.baseDailyRates[watchedCategory];

  const q = query.trim().toLowerCase();
  const rows = vehiclesData.filter((v) => (cat === "all" || v.category === cat) && (!q || v.name.toLowerCase().includes(q)));
  const busy = saveVehicle.isPending || deleteVehicle.isPending;

  const openEditor = (v: Vehicle | "new") => {
    setEditing(v);
    reset(v === "new" ? structuredClone(blankVehicleForm) : toVehicleForm(v));
    saveVehicle.reset();
  };
  const duplicate = (v: Vehicle) => {
    setEditing("new");
    reset({ ...toVehicleForm(v), name: `${v.name} (copy)`, featured: false, isSample: false, bookedRanges: "" });
    saveVehicle.reset();
  };
  const toggleFeatured = (v: Vehicle) => saveVehicle.mutate({ vehicle: { ...v, featured: !v.featured }, isNew: false });

  const onSubmit = handleSubmit((values) => {
    const existing = editing !== "new" ? editing : null;
    saveVehicle.mutate(
      { vehicle: vehicleFromForm(values, existing, vehiclesData), isNew: existing === null },
      { onSuccess: () => setEditing(null) },
    );
  });

  return (
    <>
      <AdminTitle title="Vehicles" text="Photos, prices, badges and blocked dates for every bike, scooty and car. Changes appear on the public site straight away." action={<Button onClick={() => openEditor("new")}><Plus /> Add vehicle</Button>} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vehicles" aria-label="Search vehicles" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by type">
          {categoryFilters.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", cat === c ? "border-brand-charcoal bg-brand-charcoal text-brand-warm" : "hover:border-foreground")}>
              {c === "all" ? `All (${vehiclesData.length})` : `${getCategory(c).plural} (${vehiclesData.filter((v) => v.category === c).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-secondary/60"><tr>{["Vehicle", "Type", "Daily price", "Availability", "Home page", ""].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((v) => {
              const r = vehicleDailyRate(v, priceConfig);
              return (
                <tr key={v.slug} className="border-t align-middle">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={v.images[0]?.src} alt="" className="h-14 w-24 shrink-0 rounded-md bg-brand-stone object-contain" />
                      <span className="min-w-0">
                        <strong className="block font-heading">{v.name}</strong>
                        <span className="mt-1 flex flex-wrap gap-1.5">
                          {v.badge && <Badge variant="gold">{v.badge}</Badge>}
                          {v.isSample && <Badge variant="pending">Sample</Badge>}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="p-3">{getCategory(v.category).label}</td>
                  <td className="p-3">{r === null ? <span className="text-muted-foreground">On request</span> : <><strong className="font-heading">{formatNpr(r, priceConfig)}</strong><span className="block text-xs text-muted-foreground">{v.dailyRateOverride === undefined ? "type default" : "own price"}</span></>}</td>
                  <td className="p-3"><AvailabilityNote vehicle={v} /></td>
                  <td className="p-3">
                    <button type="button" onClick={() => toggleFeatured(v)} disabled={busy} aria-pressed={v.featured} aria-label={`${v.featured ? "Remove" : "Add"} ${v.name} ${v.featured ? "from" : "to"} the home page`} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition", v.featured ? "border-brand-gold bg-brand-gold/20 text-brand-golddeep" : "text-muted-foreground hover:border-foreground")}>
                      <Star className={cn("h-3.5 w-3.5", v.featured && "fill-current")} aria-hidden /> {v.featured ? "Featured" : "Not featured"}
                    </button>
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${v.name}`} onClick={() => openEditor(v)}><Pencil /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Duplicate ${v.name}`} onClick={() => duplicate(v)}><Copy /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${v.name}`} disabled={busy} onClick={() => { if (window.confirm(`Delete ${v.name}?`)) deleteVehicle.mutate(v.slug); }}><Trash2 /></Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No vehicles match.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl bg-card p-6 text-foreground">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div>
              <DialogTitle className="text-xl font-bold">{editing === "new" ? "Add vehicle" : "Edit vehicle"}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">Fill in each section, then save. The vehicle shows on the website straight away.</DialogDescription>
            </div>

            <FormSection title="Basics">
              <div className="space-y-1.5"><Label htmlFor="v-name">Name</Label><Input id="v-name" {...register("name")} /><Err message={errors.name?.message} /></div>
              <div className="space-y-1.5"><Label htmlFor="v-cat">Type</Label>
                <Controller control={control} name="category" render={({ field }) => (
                  <Select id="v-cat" ref={field.ref} value={field.value} onBlur={field.onBlur} onChange={(e) => {
                    const c = e.target.value as VehicleCategory;
                    field.onChange(c);
                    if (editing === "new") setValue("images", defaultImages[c].join("\n"));
                  }}>
                    <option value="scooty">Scooty</option><option value="motorcycle">Motorcycle</option><option value="car">Car</option><option value="jeep">Jeep</option>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="v-tag">Short tagline</Label><Input id="v-tag" placeholder="One line shown under the name" {...register("tagline")} /><Err message={errors.tagline?.message} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="v-desc">Description</Label><Textarea id="v-desc" rows={4} {...register("description")} /><Err message={errors.description?.message} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="v-key">Key specs (comma separated, 3 is ideal)</Label><Input id="v-key" placeholder="350cc, Manual, Petrol" {...register("keySpecs")} /><Err message={errors.keySpecs?.message} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="v-specs">Full specifications (one per line as Label: value)</Label><Textarea id="v-specs" rows={4} placeholder={"Engine: 349cc\nTransmission: 5-speed"} {...register("specs")} /><Err message={errors.specs?.message} /></div>
            </FormSection>

            <FormSection title="Photos" hint="The first photo is the main one on cards and the bike page.">
              <div className="space-y-1.5 sm:col-span-2"><Controller control={control} name="images" render={({ field }) => <ImageManager value={field.value} onChange={field.onChange} />} /><Err message={errors.images?.message} /></div>
            </FormSection>

            <FormSection title="Price and rental types">
              <div className="space-y-1.5">
                <Label htmlFor="v-rate">Daily price (NPR)</Label>
                <Input id="v-rate" inputMode="numeric" disabled={watchedOnRequest} placeholder={defaultRate === null ? "Type default: on request" : `Empty = type default (${formatNpr(defaultRate, priceConfig)})`} {...register("dailyRate")} />
                <Err message={errors.dailyRate?.message} />
                <Controller control={control} name="priceOnRequest" render={({ field }) => (
                  <label className="flex items-center gap-2 pt-1 text-xs"><Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} /> Price on request (customers get a quotation)</label>
                )} />
              </div>
              <div className="space-y-1.5"><Label htmlFor="v-rt">Rental types (comma separated)</Label><Input id="v-rt" placeholder="Daily, Weekly, Monthly" {...register("rentalTypes")} /><Err message={errors.rentalTypes?.message} /></div>
            </FormSection>

            <FormSection title="Badge and availability">
              <div className="space-y-1.5"><Label htmlFor="v-badge">Card badge</Label><Select id="v-badge" {...register("badge")}><option value="">No badge</option>{vehicleBadges.map((b) => <option key={b} value={b}>{b}</option>)}</Select></div>
              <div className="flex flex-col justify-end gap-2.5 pb-1">
                <Controller control={control} name="featured" render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} /> Show on the home page</label>
                )} />
                <Controller control={control} name="isSample" render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} /> Mark as sample listing</label>
                )} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="v-booked">Extra blocked dates (one per line, like 2026-12-05 to 2026-12-08)</Label>
                <Textarea id="v-booked" rows={3} placeholder="Repairs, or bookings made in person. Shown as 'Booked 5-8 Dec'. Past dates hide on their own." {...register("bookedRanges")} />
                <p className="text-xs text-muted-foreground">Confirmed website bookings block their dates automatically, so you do not need to type those.</p>
                <Err message={errors.bookedRanges?.message} />
              </div>
            </FormSection>

            {saveVehicle.error && <p role="alert" className="text-sm text-destructive">{saveVehicle.error.message}</p>}
            <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t bg-card px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={saveVehicle.isPending || isSubmitting}>Save vehicle</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
