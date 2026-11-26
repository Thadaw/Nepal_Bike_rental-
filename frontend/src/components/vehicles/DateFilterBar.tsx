import { useEffect, useState } from "react";
import { CalendarSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { addDaysISO, formatDate, rentalDays, todayISO } from "@/lib/dates";

interface Props {
  from: string;
  to: string;
  active: boolean;
  total: number;
  free: number;
  showBooked: boolean;
  onApply: (from: string, to: string) => void;
  onClear: () => void;
  onToggleBooked: (on: boolean) => void;
}

const field = "mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30";

/** Pick dates here and the list below shows only the bikes that are free on those days. */
export function DateFilterBar({ from, to, active, total, free, showBooked, onApply, onClear, onToggleBooked }: Props) {
  const [s, setS] = useState(from);
  const [e, setE] = useState(to);
  useEffect(() => { setS(from); setE(to); }, [from, to]);
  const today = todayISO();
  const bad = !!s && !!e && e <= s;
  const ready = !!s && !!e && !bad;

  return (
    <section aria-label="Check availability for your dates" className="rounded-2xl border bg-card p-4 sm:p-5">
      <form onSubmit={(ev) => { ev.preventDefault(); if (ready) onApply(s, e); }} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-xs font-medium text-muted-foreground">Pickup date
          <input type="date" min={today} value={s} onChange={(ev) => { setS(ev.target.value); if (e && e <= ev.target.value) setE(""); }} className={field} />
        </label>
        <label className="block text-xs font-medium text-muted-foreground">Return date
          <input type="date" min={s ? addDaysISO(s, 1) : today} value={e} onChange={(ev) => setE(ev.target.value)} aria-invalid={bad || undefined} className={field} />
        </label>
        <Button type="submit" className="h-11" disabled={!ready}><CalendarSearch aria-hidden /> {active ? "Update dates" : "Check availability"}</Button>
      </form>
      {bad && <p role="alert" className="mt-2 text-xs text-destructive">The return date must be after the pickup date.</p>}

      {active ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-4" aria-live="polite">
          <p className="text-sm">
            <strong className="font-heading">{free} of {total}</strong> free from <strong>{formatDate(from)}</strong> to <strong>{formatDate(to)}</strong>
            <span className="text-muted-foreground"> ({rentalDays(from, to)} day{rentalDays(from, to) === 1 ? "" : "s"})</span>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {free < total && (
              <label className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={showBooked} onCheckedChange={(c) => onToggleBooked(c === true)} /> Also show booked</label>
            )}
            <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"><X className="h-3.5 w-3.5" aria-hidden /> Clear dates</button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Optional. Choose your dates to see only the bikes that are free.</p>
      )}
    </section>
  );
}
