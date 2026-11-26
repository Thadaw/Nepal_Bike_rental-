import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Select } from "@/components/ui/input";
import { useBookingRequests } from "@/features/bookings/hooks";
import { useVehicles } from "@/features/vehicles/hooks";
import type { AdminBookingRequest } from "@/features/bookings/types";
import { MONTH_NAMES, monthCells, shiftMonth } from "@/lib/calendar";
import { formatDate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

const chip: Record<string, string> = {
  new: "bg-brand-gold/30 text-brand-golddeep",
  confirmed: "bg-emerald-100 text-emerald-900",
  completed: "bg-secondary text-muted-foreground",
};

/** Month view of every booking that is not declined. Click a day to see who has which vehicle. */
export default function AdminCalendar() {
  const { data: requests = [] } = useBookingRequests();
  const { data: vehicles = [] } = useVehicles();
  const today = todayISO();
  const [view, setView] = useState({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 });
  const [vehicle, setVehicle] = useState("all");
  const [day, setDay] = useState(today);
  const vName = (s: string) => vehicles.find((v) => v.slug === s)?.name ?? s;

  const active = useMemo(() => requests.filter((r) => r.status !== "declined" && (vehicle === "all" || r.vehicleSlug === vehicle)), [requests, vehicle]);
  const on = (iso: string): AdminBookingRequest[] => active.filter((r) => iso >= r.startDate && iso <= r.returnDate);
  const selected = on(day);

  return (
    <>
      <AdminTitle title="Booking calendar" text="New, confirmed and completed bookings by day. Declined requests are hidden." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous month" onClick={() => setView((v) => shiftMonth(v.y, v.m, -1))} className="rounded-full p-2 hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
          <p className="w-40 text-center font-heading font-bold" aria-live="polite">{MONTH_NAMES[view.m]} {view.y}</p>
          <button type="button" aria-label="Next month" onClick={() => setView((v) => shiftMonth(v.y, v.m, 1))} className="rounded-full p-2 hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <Select aria-label="Vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="h-9 w-auto min-w-[12rem]">
          <option value="all">All vehicles</option>
          {vehicles.map((v) => <option key={v.slug} value={v.slug}>{v.name}</option>)}
        </Select>
        <span className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-gold/40" /> New</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-200" /> Confirmed</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-secondary" /> Completed</span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b bg-secondary/50 text-center text-xs font-semibold text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <span key={d} className="py-2">{d}</span>)}
          </div>
          <div className="grid grid-cols-7">
            {monthCells(view.y, view.m).map((iso, i) => {
              if (!iso) return <div key={`b${i}`} className="min-h-24 border-b border-r bg-secondary/20" />;
              const list = on(iso);
              return (
                <button key={iso} type="button" onClick={() => setDay(iso)} aria-label={`${formatDate(iso)}, ${list.length} booking${list.length === 1 ? "" : "s"}`} aria-pressed={day === iso}
                  className={cn("min-h-24 border-b border-r p-1.5 text-left align-top hover:bg-secondary/40", day === iso && "bg-brand-gold/10 ring-2 ring-inset ring-brand-charcoal")}>
                  <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", iso === today && "bg-brand-charcoal text-brand-warm")}>{Number(iso.slice(8))}</span>
                  <span className="mt-1 block space-y-0.5">
                    {list.slice(0, 3).map((r) => <span key={r.id} className={cn("block truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight", chip[r.status])}>{vName(r.vehicleSlug)}</span>)}
                    {list.length > 3 && <span className="block text-[10px] text-muted-foreground">+{list.length - 3} more</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mt-6" aria-live="polite">
        <h2 className="text-lg font-bold">{formatDate(day)}</h2>
        {selected.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No bookings on this day.</p> : (
          <ul className="mt-3 space-y-2">
            {selected.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 text-sm">
                <span><strong className="font-heading">{vName(r.vehicleSlug)}</strong> · {r.name} · {r.phone}<br /><span className="text-xs text-muted-foreground">{r.id} · {formatDate(r.startDate)} to {formatDate(r.returnDate)}</span></span>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
